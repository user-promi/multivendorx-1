import { useEffect, useRef, useState } from 'react';
import { FieldComponent } from './types';

interface GoogleMapProps {
    apiKey: string;
    locationAddress: string;
    locationLat: string;
    locationLng: string;
    isUserLocation?: boolean;
    onLocationUpdate: (data: {
        location_address: string;
        location_lat: string;
        location_lng: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
    }) => void;
    placeholderSearch: string;
    stores: { data: Store[] } | null;
}

interface Store {
    id: number;
    store_name: string;
    address_1?: string;
    location_lat?: string;
    location_lng?: string;
}

export const GoogleMapUI = ({
    apiKey,
    locationAddress,
    locationLat,
    locationLng,
    isUserLocation,
    onLocationUpdate,
    placeholderSearch,
    stores,
}: GoogleMapProps) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);

    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Simplified coordinate parser
    const parseCoordinates = (lat: string, lng: string) => ({
        lat: parseFloat(lat) || 40.7128,
        lng: parseFloat(lng) || -74.006
    });

    // Simplified address extraction with object mapping
    const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
        const components: Record<string, string> = {};
        const addressParts: string[] = [];

        const typeMap: Record<string, string> = {
            'street_number': 'streetNumber',
            'route': 'route',
            'locality': 'city',
            'sublocality': 'city',
            'sublocality_level_1': 'city',
            'administrative_area_level_2': 'city',
            'postal_town': 'city',
            'administrative_area_level_1': 'state',
            'country': 'country',
            'postal_code': 'zip'
        };

        place.address_components?.forEach(component => {
            const type = component.types.find(t => typeMap[t]);
            if (type) {
                if (type === 'street_number' || type === 'route') {
                    addressParts[type === 'street_number' ? 0 : 1] = component.long_name;
                } else {
                    const key = typeMap[type];
                    if (key === 'city') {
                        if (!components.city || type === 'locality') {
                            components.city = component.long_name;
                        }
                    } else {
                        components[key] =
                            type === 'administrative_area_level_1' || type === 'country'
                                ? component.short_name
                                : component.long_name;
                    }
                }
            }
        });

        // Build address from parts
        const streetAddress = [addressParts[0], addressParts[1]].filter(Boolean).join(' ');
        if (streetAddress) components.address = streetAddress;

        return components;
    };

    // Unified location update handler
    const updateLocation = (lat: number, lng: number, place?: google.maps.places.PlaceResult) => {
        if (map && marker) {
            map.setCenter({ lat, lng });
            marker.setPosition({ lat, lng });
            map.setZoom(17);
        }

        const addressComponents = place ? extractAddressComponents(place) : {};
        const formatted_address = place?.formatted_address || '';

        onLocationUpdate({
            location_address: formatted_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            address: addressComponents.address || formatted_address,
            city: addressComponents.city,
            state: addressComponents.state,
            country: addressComponents.country,
            zip: addressComponents.zip
        });
    };

    // Reverse geocode with simplified callback
    const reverseGeocode = (lat: number, lng: number) => {
        new window.google.maps.Geocoder().geocode(
            { location: { lat, lng } },
            (results, status) => {
                if (status === 'OK' && results?.[0]) {
                    updateLocation(lat, lng, results[0]);
                }
            }
        );
    };

    // Load Google Maps script
    useEffect(() => {
        if (window.google?.maps) {
            setGoogleLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => setGoogleLoaded(true);
        script.onerror = (error) => console.error('Google Maps failed to load:', error);
        document.head.appendChild(script);

        return () => script.remove();
    }, [apiKey]);

    // Initialize map
    useEffect(() => {
        if (!googleLoaded || !autocompleteInputRef.current || !mapContainerRef.current) return;

        const { lat: initialLat, lng: initialLng } = parseCoordinates(locationLat, locationLng);

        try {
            const mapInstance = new window.google.maps.Map(mapContainerRef.current, {
                center: { lat: initialLat, lng: initialLng },
                zoom: locationLat ? 15 : 10,
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true,
                zoomControl: true,
            });

            const markerInstance = new window.google.maps.Marker({
                map: mapInstance,
                draggable: true,
                position: { lat: initialLat, lng: initialLng },
                title: 'Store Location',
                ...(isUserLocation && { icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' })
            });

            // Event listeners
            markerInstance.addListener('dragend', () => {
                const pos = markerInstance.getPosition();
                if (pos) reverseGeocode(pos.lat(), pos.lng());
            });

            mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (e.latLng) reverseGeocode(e.latLng.lat(), e.latLng.lng());
            });

            // Autocomplete
            new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
                types: ['establishment', 'geocode'],
                fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            }).addListener('place_changed', function (this: google.maps.places.Autocomplete) {
                const place = this.getPlace();
                if (place.geometry?.location) {
                    updateLocation(place.geometry.location.lat(), place.geometry.location.lng(), place);
                }
            });

            setMap(mapInstance);
            setMarker(markerInstance);
        } catch (err) {
            console.error('Map initialization error:', err);
        }
    }, [googleLoaded, locationLat, locationLng, isUserLocation]);

    // Handle store markers
    useEffect(() => {
        if (!map || !stores?.data?.length) return;

        const markers: google.maps.Marker[] = [];
        const bounds = new google.maps.LatLngBounds();

        stores.data.forEach(store => {
            if (!store.location_lat || !store.location_lng) return;

            const position = {
                lat: parseFloat(store.location_lat),
                lng: parseFloat(store.location_lng)
            };

            const marker = new google.maps.Marker({ map, position, title: store.store_name });

            const infoWindow = new google.maps.InfoWindow({
                content: `<strong>${store.store_name}</strong><br/>${store.address_1 || ''}`
            }).open(map, marker);

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            markers.push(marker);
            bounds.extend(position);
        });

        if (markers.length) map.fitBounds(bounds);
        return () => markers.forEach(m => m.setMap(null));
    }, [map, stores]);

    return (
        <div className="map-wrapper">
            <input
                ref={autocompleteInputRef}
                type="text"
                className="basic-input"
                placeholder={placeholderSearch}
                defaultValue={locationAddress}
            />
            <div
                ref={mapContainerRef}
                id="location-map"
                style={{ height: '400px', width: '100%' }}
            />
        </div>
    );
};

const GoogleMap: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <GoogleMapUI
            apiKey={field.apiKey}
            locationAddress={value?.location_address || ''}
            locationLat={value?.location_lat || ''}
            locationLng={value?.location_lng || ''}
            isUserLocation={field.isUserLocation}
            onLocationUpdate={onChange}
            placeholderSearch={field.placeholderSearch || 'Search for a location'}
            stores={field.stores || null}
        />
    ),
};

export default GoogleMap;
