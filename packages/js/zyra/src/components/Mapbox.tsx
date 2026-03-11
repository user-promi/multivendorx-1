import { useEffect, useRef, useState } from 'react';
import { FieldComponent } from './types';

interface Store {
    id: number;
    store_name: string;
    address_1?: string;
    location_lat?: string;
    location_lng?: string;
}

interface MapboxProps {
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

export const MapboxUI = ({
    apiKey,
    locationLat,
    locationLng,
    isUserLocation,
    onLocationUpdate,
    placeholderSearch,
}: MapboxProps) => {

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const sessionToken = useRef(Math.random().toString(36).slice(2));

    const [loaded, setLoaded] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const parseCoordinates = (lat: string, lng: string) => ({
        lat: parseFloat(lat) || 40.7128,
        lng: parseFloat(lng) || -74.006,
    });

    const extractAddress = (feature: any) => {
        const context = feature.properties?.context || {};

        return {
            address: feature.properties?.full_address,
            city: context.locality?.name || context.place?.name,
            state: context.region?.name,
            country: context.country?.country_code,
            zip: context.postcode?.name,
        };
    };

    const updateLocation = (lat: number, lng: number, feature?: any) => {

        mapRef.current?.setCenter([lng, lat]);
        markerRef.current?.setLngLat([lng, lat]);
        mapRef.current?.setZoom(17);

        const addr = feature ? extractAddress(feature) : {};

        onLocationUpdate({
            location_address: addr.address || '',
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...addr,
        });
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        const res = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${apiKey}`
        );

        const data = await res.json();
        const feature = data.features?.[0];

        if (feature) {
            const [lng2, lat2] = feature.geometry.coordinates;
            updateLocation(lat2, lng2, feature);
        }
    };

    useEffect(() => {
        if (window.mapboxgl) {
            setLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.js';
        script.onload = () => setLoaded(true);

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.css';

        document.head.appendChild(script);
        document.head.appendChild(css);
    }, []);

    useEffect(() => {
        if (!loaded || !containerRef.current) return;

        const { lat, lng } = parseCoordinates(locationLat, locationLng);

        window.mapboxgl.accessToken = apiKey;

        const map = new window.mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/standard',
            center: [lng, lat],
            zoom: locationLat ? 15 : 10,
            attributionControl: false,
        });

        map.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

        const marker = new window.mapboxgl.Marker({
            draggable: true,
            color: isUserLocation ? '#1E90FF' : '#4264FB',
        })
            .setLngLat([lng, lat])
            .addTo(map);

        marker.on('dragend', () => {
            const { lat, lng } = marker.getLngLat();
            reverseGeocode(lat, lng);
        });

        map.on('click', (e: any) => {
            reverseGeocode(e.lngLat.lat, e.lngLat.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;

        return () => map.remove();
    }, [loaded, apiKey, locationLat, locationLng, isUserLocation]);

    const fetchSuggestions = async (text: string) => {
        if (!text) {
            setSuggestions([]);
            return;
        }

        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(text)}&access_token=${apiKey}&session_token=${sessionToken.current}`
        );

        const data = await res.json();
        setSuggestions(data.suggestions || []);
    };

    const selectSuggestion = async (suggestion: any) => {

        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${apiKey}&session_token=${sessionToken.current}`
        );

        const data = await res.json();
        const feature = data.features?.[0];

        if (!feature) return;

        const [lng, lat] = feature.geometry.coordinates;

        updateLocation(lat, lng, feature);

        setQuery(feature.properties.full_address);
        setSuggestions([]);
    };

    return (
        <div style={{ position: 'relative' }}>

            <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 5,
                width: 260,
                background: '#fff',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>

                <input
                    value={query}
                    placeholder={placeholderSearch}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        fetchSuggestions(e.target.value);
                    }}
                />

                {suggestions.map((s) => (
                    <div
                        key={s.mapbox_id}
                        onClick={() => selectSuggestion(s)}
                    >
                        {s.name}
                    </div>
                ))}

            </div>

            <div
                ref={containerRef}
                style={{ height: 400 }}
            />

        </div>
    );
};

const Mapbox: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <MapboxUI
            apiKey={field.apiKey}
            locationAddress={value?.location_address || ''}
            locationLat={value?.location_lat || ''}
            locationLng={value?.location_lng || ''}
            isUserLocation={field.isUserLocation}
            onLocationUpdate={onChange}
            placeholderSearch={field.placeholderSearch || 'Search location'}
            stores={null}
        />
    ),
};

export default Mapbox;
