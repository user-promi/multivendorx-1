import { useEffect, useRef, useState } from 'react';
import { FieldComponent } from './fieldUtils';

/* ---------------- TYPES ---------------- */

interface Store {
    id: number;
    store_name: string;
    location_lat?: string;
    location_lng?: string;
}

interface MapProviderProps {
    apiKey: string;
    locationAddress: string;
    locationLat: string;
    locationLng: string;
    isUserLocation?: boolean;
    onLocationUpdate: ( data: {
        location_address: string;
        location_lat: string;
        location_lng: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
    } ) => void;
    placeholderSearch: string;
    stores: { data: Store[] } | null;
    mapProvider: string;
}

const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.006 };

/* ---------------- GOOGLE ADAPTER ---------------- */

const googleAdapter = {
    async loadScript( apiKey: string ) {
        if ( window.google?.maps ) {
            return;
        }

        if ( document.getElementById( 'google-map-script' ) ) {
            return;
        }

        const script = document.createElement( 'script' );
        script.id = 'google-map-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${ apiKey }&libraries=places`;
        script.async = true;
        script.defer = true;

        document.head.appendChild( script );

        await new Promise( ( res ) => ( script.onload = res ) );
    },

    createMap(
        container: HTMLElement,
        lat: number,
        lng: number,
        zoom: number
    ) {
        return new window.google.maps.Map( container, {
            center: { lat, lng },
            zoom,
        } );
    },

    createMarker( map: any, lat: number, lng: number, isUser?: boolean ) {
        return new window.google.maps.Marker( {
            map,
            position: { lat, lng },
            draggable: true,
            ...( isUser && {
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            } ),
        } );
    },

    onDragEnd( marker: any, cb: any ) {
        marker.addListener( 'dragend', () => {
            const p = marker.getPosition();
            cb( p.lat(), p.lng() );
        } );
    },

    onMapClick( map: any, cb: any ) {
        map.addListener( 'click', ( e: any ) =>
            cb( e.latLng.lat(), e.latLng.lng() )
        );
    },

    async reverseGeocode( lat: number, lng: number ) {
        return new Promise( ( resolve ) => {
            new window.google.maps.Geocoder().geocode(
                { location: { lat, lng } },
                ( r: any, s: any ) => resolve( s === 'OK' ? r[ 0 ] : null )
            );
        } );
    },

    extractAddress( result: any ) {
        if ( ! result ) {
            return {};
        }

        const components: any = {};

        result.address_components?.forEach( ( c: any ) => {
            if ( c.types.includes( 'locality' ) ) {
                components.city = c.long_name;
            }
            if ( c.types.includes( 'administrative_area_level_1' ) ) {
                components.state = c.long_name;
            }
            if ( c.types.includes( 'country' ) ) {
                components.country = c.short_name;
            }
            if ( c.types.includes( 'postal_code' ) ) {
                components.zip = c.long_name;
            }
        } );

        return {
            address: result.formatted_address,
            city: components.city,
            state: components.state,
            country: components.country,
            zip: components.zip,
            location_address: result.formatted_address,
        };
    },
};

/* ---------------- MAPBOX ADAPTER ---------------- */

const mapboxAdapter = {
    async loadScript( apiKey: string ) {
        if ( window.mapboxgl ) {
            window.mapboxgl.accessToken = apiKey;
            return;
        }

        const script = document.createElement( 'script' );
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.js';

        document.head.appendChild( script );

        await new Promise( ( r ) => ( script.onload = r ) );

        window.mapboxgl.accessToken = apiKey;

        const css = document.createElement( 'link' );
        css.rel = 'stylesheet';
        css.href = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.css';

        document.head.appendChild( css );
    },

    createMap(
        container: HTMLElement,
        lat: number,
        lng: number,
        zoom: number
    ) {
        return new window.mapboxgl.Map( {
            container,
            style: 'mapbox://styles/mapbox/standard',
            center: [ lng, lat ],
            zoom,
        } );
    },

    createMarker( map: any, lat: number, lng: number ) {
        return new window.mapboxgl.Marker( { draggable: true } )
            .setLngLat( [ lng, lat ] )
            .addTo( map );
    },

    onDragEnd( marker: any, cb: any ) {
        marker.on( 'dragend', () => {
            const { lat, lng } = marker.getLngLat();
            cb( lat, lng );
        } );
    },

    onMapClick( map: any, cb: any ) {
        map.on( 'click', ( e: any ) => cb( e.lngLat.lat, e.lngLat.lng ) );
    },

    async reverseGeocode( lat: number, lng: number ) {
        const res = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${ lng }&latitude=${ lat }&access_token=${ window.mapboxgl.accessToken }`
        );

        const data = await res.json();
        return data.features?.[ 0 ];
    },

    extractAddress( result: any ) {
        if ( ! result ) {
            return {};
        }

        const ctx = result.properties?.context || {};
        const address =
            result.properties?.full_address || result.place_name || '';

        return {
            address,
            city: ctx.place?.name,
            state: ctx.region?.name,
            country: ctx.country?.country_code,
            zip: ctx.postcode?.name,
            location_address: address,
        };
    },
};

/* ---------------- PROVIDER REGISTRY ---------------- */

const PROVIDERS: any = {
    google_map: googleAdapter,
    mapbox: mapboxAdapter,
};

/* ---------------- MAIN COMPONENT ---------------- */

export const MapProviderUI = ( {
    apiKey,
    locationLat,
    locationLng,
    mapProvider,
    onLocationUpdate,
    placeholderSearch,
    stores,
}: MapProviderProps ) => {
    const provider = PROVIDERS[ mapProvider ] || googleAdapter;

    const containerRef = useRef< HTMLDivElement >( null );
    const mapRef = useRef< any >( null );
    const markerRef = useRef< any >( null );
    const inputRef = useRef< HTMLInputElement >( null );

    const debounceRef = useRef< any >( null );

    const [ query, setQuery ] = useState( '' );
    const [ suggestions, setSuggestions ] = useState< any[] >( [] );
    const [ googleLoaded, setGoogleLoaded ] = useState( false );

    const lat = locationLat ? parseFloat( locationLat ) : DEFAULT_LOCATION.lat;
    const lng = locationLng ? parseFloat( locationLng ) : DEFAULT_LOCATION.lng;

    /* -------- UPDATE LOCATION -------- */

    const updateLocation = async ( lat: number, lng: number ) => {
        const result = await provider.reverseGeocode( lat, lng );

        const address = provider.extractAddress( result );

        onLocationUpdate( {
            ...address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
        } );
    };

    /* -------- MAP INIT -------- */

    useEffect( () => {
        if ( ! containerRef.current ) {
            return;
        }

        const init = async () => {
            await provider.loadScript( apiKey );
            if ( mapProvider === 'google_map' ) {
                setGoogleLoaded( true );
            }

            const map = provider.createMap(
                containerRef.current!,
                lat,
                lng,
                12
            );
            const marker = provider.createMarker( map, lat, lng );

            mapRef.current = map;
            markerRef.current = marker;

            provider.onDragEnd( marker, updateLocation );
            provider.onMapClick( map, updateLocation );

            /* store markers */

            stores?.data?.forEach( ( s ) => {
                if ( ! s.location_lat || ! s.location_lng ) {
                    return;
                }

                provider.createMarker(
                    map,
                    parseFloat( s.location_lat ),
                    parseFloat( s.location_lng )
                );
            } );
        };

        init();
    }, [] );

    useEffect( () => {
        if ( ! mapRef.current || ! markerRef.current ) {
            return;
        }

        const lat = parseFloat( locationLat );
        const lng = parseFloat( locationLng );

        if ( ! lat || ! lng ) {
            return;
        }

        if ( mapProvider === 'google_map' ) {
            mapRef.current.setCenter( { lat, lng } );
            markerRef.current.setPosition( { lat, lng } );
        } else if ( mapProvider === 'mapbox' ) {
            mapRef.current.setCenter( [ lng, lat ] );
            markerRef.current.setLngLat( [ lng, lat ] );
        }
    }, [ locationLat, locationLng ] );

    useEffect( () => {
        if ( mapProvider !== 'google_map' ) {
            return;
        }
        if ( ! googleLoaded ) {
            return;
        }
        if ( ! inputRef.current ) {
            return;
        }

        const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
                types: [ 'geocode' ],
                fields: [
                    'formatted_address',
                    'geometry',
                    'address_components',
                    'name',
                ],
            }
        );

        autocomplete.addListener( 'place_changed', () => {
            const place = autocomplete.getPlace();

            if ( ! place.geometry?.location ) {
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            if ( mapRef.current && markerRef.current ) {
                mapRef.current.setCenter( { lat, lng } );
                markerRef.current.setPosition( { lat, lng } );
                mapRef.current.setZoom( 17 );
            }

            const address = googleAdapter.extractAddress( place );

            onLocationUpdate( {
                ...address,
                location_lat: lat.toString(),
                location_lng: lng.toString(),
            } );
        } );
    }, [ mapProvider, googleLoaded ] );

    /* -------- MAPBOX SEARCH -------- */

    const sessionToken = useRef(
        Math.random().toString( 36 ).substring( 2 )
    ).current;

    const handleMapboxSearch = ( text: string ) => {
        clearTimeout( debounceRef.current );

        debounceRef.current = setTimeout( async () => {
            const res = await fetch(
                `https://api.mapbox.com/search/searchbox/v1/suggest?q=${ encodeURIComponent(
                    text
                ) }&access_token=${ apiKey }&session_token=${ sessionToken }`
            );

            const data = await res.json();

            setSuggestions( data.suggestions || [] );
        }, 300 );
    };

    const selectMapboxSuggestion = async ( suggestion: any ) => {
        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/retrieve/${ suggestion.mapbox_id }?access_token=${ apiKey }&session_token=${ sessionToken }`
        );

        const data = await res.json();

        const feature = data.features?.[ 0 ];

        if ( ! feature ) {
            return;
        }

        const [ lng, lat ] = feature.geometry.coordinates;

        if ( mapRef.current && markerRef.current ) {
            markerRef.current.setLngLat( [ lng, lat ] );
            mapRef.current.setCenter( [ lng, lat ] );
            mapRef.current.setZoom( 17 );
        }

        updateLocation( lat, lng );

        setSuggestions( [] );
        setQuery( feature.properties?.full_address || suggestion.name );
    };

    return (
        <div className="map-wrapper">
            <div className="input-field">
                <input
                    ref={ inputRef }
                    defaultValue={ query }
                    placeholder={ placeholderSearch }
                    className="basic-input"
                    onChange={ ( e ) => {
                        setQuery( e.target.value );
                        if ( mapProvider === 'mapbox' ) {
                            handleMapboxSearch( e.target.value );
                        }
                    } }
                />

                { suggestions.length > 0 && (
                    <ul>
                        { suggestions.map( ( s ) => (
                            <li
                                key={ s.mapbox_id }
                                onClick={ () => selectMapboxSuggestion( s ) }
                            >
                                { s.name }
                            </li>
                        ) ) }
                    </ul>
                ) }
            </div>

            <div ref={ containerRef } className="map" />
        </div>
    );
};

/* ---------------- FIELD REGISTRATION ---------------- */

const MapProvider: FieldComponent = {
    render: ( { field, value, onChange } ) => (
        <MapProviderUI
            apiKey={ field.apiKey }
            locationAddress={ value?.location_address || '' }
            locationLat={ value?.location_lat || '' }
            locationLng={ value?.location_lng || '' }
            isUserLocation={ field.isUserLocation }
            onLocationUpdate={ onChange }
            placeholderSearch={ field.placeholderSearch || 'Search location' }
            stores={ field.stores || null }
            mapProvider={ field.type }
        />
    ),
};

export default MapProvider;
