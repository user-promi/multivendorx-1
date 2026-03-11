import { useEffect, useRef, useState } from 'react';
import { FieldComponent } from './types';

interface Store {
    id: number;
    store_name: string;
    address_1?: string;
    location_lat?: string;
    location_lng?: string;
}

interface MapProviderProps {
    apiKey: string;
    locationAddress: string;
    locationLat: string;
    locationLng: string;
    isUserLocation?: boolean;
    onLocationUpdate: (data: any) => void;
    placeholderSearch: string;
    stores: { data: Store[] } | null;
    mapProvider: string;
    mapboxStyle?: string;
}

// Google Maps Provider
const googleProvider = {
    loadScript: (apiKey: string) => new Promise<void>((resolve) => {
        if (window.google?.maps) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.onload = () => resolve();
        document.head.appendChild(script);
    }),

    createMap: (container: HTMLElement, lat: number, lng: number, zoom: number) =>
        new window.google.maps.Map(container, {
            center: { lat, lng },
            zoom,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
        }),

    createMarker: (map: any, lat: number, lng: number, isUserLocation?: boolean) =>
        new window.google.maps.Marker({
            map,
            draggable: true,
            position: { lat, lng },
            ...(isUserLocation && { icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' })
        }),

    setupSearch: (input: HTMLInputElement, onSelect: (place: any) => void) => {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
            types: ['establishment', 'geocode'],
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        });
        autocomplete.addListener('place_changed', () => onSelect(autocomplete.getPlace()));
    },

    onDragEnd: (marker: any, callback: (lat: number, lng: number) => void) => {
        marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            callback(pos.lat(), pos.lng());
        });
    },

    onMapClick: (map: any, callback: (lat: number, lng: number) => void) => {
        map.addListener('click', (e: any) => {
            if (e.latLng) callback(e.latLng.lat(), e.latLng.lng());
        });
    },

    reverseGeocode: async (lat: number, lng: number): Promise<any> => {
        return new Promise((resolve) => {
            new window.google.maps.Geocoder().geocode(
                { location: { lat, lng } },
                (results, status) => {
                    resolve(status === 'OK' && results?.[0] ? results[0] : null);
                }
            );
        });
    },

    extractAddress: (result: any) => {
        if (!result) return {};

        const components: any = {};
        const addressParts: string[] = [];

        result.address_components?.forEach((component: any) => {
            const type = component.types[0];
            if (type === 'street_number' || type === 'route') {
                addressParts[type === 'street_number' ? 0 : 1] = component.long_name;
            } else if (type === 'locality' || type === 'administrative_area_level_1') {
                components[type === 'locality' ? 'city' : 'state'] = component.long_name;
            } else if (type === 'country') {
                components.country = component.short_name;
            } else if (type === 'postal_code') {
                components.zip = component.long_name;
            }
        });

        const streetAddress = addressParts.filter(Boolean).join(' ');
        return {
            address: streetAddress || result.formatted_address,
            city: components.city,
            state: components.state,
            country: components.country,
            zip: components.zip,
            location_address: result.formatted_address
        };
    },

    setLocation: (map: any, marker: any, lat: number, lng: number) => {
        map.setCenter({ lat, lng });
        marker.setPosition({ lat, lng });
        map.setZoom(17);
    },

    addStoreMarkers: (map: any, stores: Store[]) => {
        const bounds = new window.google.maps.LatLngBounds();
        stores.forEach(store => {
            if (!store.location_lat || !store.location_lng) return;
            const position = { lat: parseFloat(store.location_lat), lng: parseFloat(store.location_lng) };
            new window.google.maps.Marker({ map, position, title: store.store_name });
            bounds.extend(position);
        });
        if (stores.length) map.fitBounds(bounds);
    },

    getSearchProps: () => ({
        defaultValue: true,
        value: undefined,
        onChange: undefined
    })
};

// Mapbox Provider
const mapboxProvider = {
    loadScript: (apiKey: string) => new Promise<void>((resolve) => {
        if (window.mapboxgl) {
            window.mapboxgl.accessToken = apiKey;
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.js';
        script.onload = () => {
            window.mapboxgl.accessToken = apiKey;
            resolve();
        };
        document.head.appendChild(script);

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.css';
        document.head.appendChild(css);
    }),

    createMap: (container: HTMLElement, lat: number, lng: number, zoom: number) =>
        new window.mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/standard',
            center: [lng, lat],
            zoom,
            attributionControl: false,
        }),

    createMarker: (map: any, lat: number, lng: number, isUserLocation?: boolean) =>
        new window.mapboxgl.Marker({
            draggable: true,
            color: isUserLocation ? '#1E90FF' : '#4264FB',
        }).setLngLat([lng, lat]).addTo(map),

    onDragEnd: (marker: any, callback: (lat: number, lng: number) => void) => {
        marker.on('dragend', () => {
            const { lat, lng } = marker.getLngLat();
            callback(lat, lng);
        });
    },

    onMapClick: (map: any, callback: (lat: number, lng: number) => void) => {
        map.on('click', (e: any) => {
            callback(e.lngLat.lat, e.lngLat.lng);
        });
    },

    reverseGeocode: async (lat: number, lng: number): Promise<any> => {
        const res = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${window.mapboxgl.accessToken}`
        );
        const data = await res.json();
        return data.features?.[0];
    },

    extractAddress: (result: any) => {
        if (!result) return {};

        const context = result.properties?.context || {};
        return {
            address: result.properties?.full_address || result.place_name,
            city: context.locality?.name || context.place?.name,
            state: context.region?.name,
            country: context.country?.country_code,
            zip: context.postcode?.name,
            location_address: result.properties?.full_address || result.place_name
        };
    },

    setLocation: (map: any, marker: any, lat: number, lng: number) => {
        map.setCenter([lng, lat]);
        marker.setLngLat([lng, lat]);
        map.setZoom(17);
    },

    addStoreMarkers: (map: any, stores: Store[]) => {
        stores.forEach(store => {
            if (!store.location_lat || !store.location_lng) return;
            new window.mapboxgl.Marker({ color: '#FF0000' })
                .setLngLat([parseFloat(store.location_lng), parseFloat(store.location_lat)])
                .setPopup(new window.mapboxgl.Popup().setHTML(`<strong>${store.store_name}</strong>`))
                .addTo(map);
        });
    },

    getSearchProps: () => ({
        defaultValue: undefined,
        value: true,
        onChange: true
    })
};

// Main Component
export const MapProviderUI = ({
    apiKey,
    locationAddress,
    locationLat,
    locationLng,
    isUserLocation,
    onLocationUpdate,
    placeholderSearch,
    stores,
    mapProvider,
}: MapProviderProps) => {

    const [loaded, setLoaded] = useState(false);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const provider = mapProvider === 'google_map' ? googleProvider : mapboxProvider;
    const sessionToken = useRef(Math.random().toString(36).slice(2)).current;

    const { lat, lng } = {
        lat: parseFloat(locationLat) || 40.7128,
        lng: parseFloat(locationLng) || -74.006
    };

    // Load script
    useEffect(() => {
        provider.loadScript(apiKey).then(() => setLoaded(true));
    }, [apiKey, mapProvider]);

    // Initialize map
    useEffect(() => {
        if (!loaded || !containerRef.current) return;

        const mapInstance = provider.createMap(containerRef.current, lat, lng, locationLat ? 15 : 10);
        const markerInstance = provider.createMarker(mapInstance, lat, lng, isUserLocation);

        // Setup event listeners
        provider.onDragEnd(markerInstance, async (lat, lng) => {
            const result = await provider.reverseGeocode(lat, lng);
            if (result) updateLocation(lat, lng, result);
        });

        provider.onMapClick(mapInstance, async (lat, lng) => {
            const result = await provider.reverseGeocode(lat, lng);
            if (result) updateLocation(lat, lng, result);
        });

        // Setup search for Google Maps
        if (inputRef.current && mapProvider === 'google_map') {
            provider.setupSearch(inputRef.current, (place) => {
                if (place.geometry?.location) {
                    // Use the refs directly instead of state
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    if (mapRef.current && markerRef.current) {
                        mapRef.current.setCenter({ lat, lng });
                        markerRef.current.setPosition({ lat, lng });
                        mapRef.current.setZoom(17);
                    }

                    const addressData = provider.extractAddress(place);
                    onLocationUpdate({
                        ...addressData,
                        location_lat: lat.toString(),
                        location_lng: lng.toString()
                    });
                }
            });
        }

        // Add store markers
        if (stores?.data?.length) {
            provider.addStoreMarkers(mapInstance, stores.data);
        }

        setMap(mapInstance);
        setMarker(markerInstance);

        return () => mapProvider === 'mapbox' && mapInstance?.remove();
    }, [loaded, lat, lng, locationLat, mapProvider, isUserLocation]);

    const updateLocation = (lat: number, lng: number, result: any) => {
        if (mapRef.current && markerRef.current) {
            provider.setLocation(mapRef.current, markerRef.current, lat, lng);
        }

        const addressData = provider.extractAddress(result);
        onLocationUpdate({
            ...addressData,
            location_lat: lat.toString(),
            location_lng: lng.toString()
        });

        if (mapProvider === 'mapbox' && result) {
            setQuery(result.properties?.full_address || result.place_name);
        }
    };

    // Mapbox search handlers
    const handleMapboxSearch = async (text: string) => {
        if (text.length < 3) {
            setSuggestions([]);
            return;
        }

        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(text)}&access_token=${apiKey}&session_token=${sessionToken}`
        );
        const data = await res.json();
        setSuggestions(data.suggestions || []);
    };

    const selectMapboxSuggestion = async (suggestion: any) => {
        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${apiKey}&session_token=${sessionToken}`
        );
        const data = await res.json();
        const feature = data.features?.[0];

        if (feature) {
            const [lng, lat] = feature.geometry.coordinates;
            updateLocation(lat, lng, feature);
            setSuggestions([]);
        }
    };

    const searchProps = provider.getSearchProps();

    return (
        <div style={{ position: 'relative' }}>
            {/* Search Input */}
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, width: 260 }}>
                <input
                    ref={inputRef}
                    type="text"
                    className="basic-input"
                    placeholder={placeholderSearch}
                    defaultValue={searchProps.defaultValue ? locationAddress : undefined}
                    value={searchProps.value ? query : undefined}
                    onChange={searchProps.onChange ?
                        (e) => { setQuery(e.target.value); handleMapboxSearch(e.target.value); } :
                        undefined
                    }
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                />

                {/* Mapbox Suggestions */}
                {mapProvider === 'mapbox' && suggestions.length > 0 && (
                    <ul style={{
                        position: 'absolute', background: 'white', border: '1px solid #ddd',
                        listStyle: 'none', margin: 0, padding: 0, maxHeight: 200, overflowY: 'auto', width: '100%'
                    }}>
                        {suggestions.map((s) => (
                            <li key={s.mapbox_id} onClick={() => selectMapboxSuggestion(s)}
                                style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                {s.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map Container */}
            <div ref={containerRef} style={{ height: 400, width: '100%' }} />
        </div>
    );
};

// Field Component Registration
const MapProvider: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <MapProviderUI
            apiKey={field.apiKey}
            locationAddress={value?.location_address || ''}
            locationLat={value?.location_lat || ''}
            locationLng={value?.location_lng || ''}
            isUserLocation={field.isUserLocation}
            onLocationUpdate={onChange}
            placeholderSearch={field.placeholderSearch || 'Search for a location'}
            stores={field.stores || null}
            mapProvider={field.type}
        />
    ),
};

export default MapProvider;