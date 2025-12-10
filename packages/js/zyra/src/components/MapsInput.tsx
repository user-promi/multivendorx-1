/**
 * External dependencies
 */
import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Types
interface MapsInputProps {
    wrapperClass?: string;
    containerId?: string;
    containerClass?: string;
    Lat?: number;
    Lng?: number;
    proSetting: boolean;
    descClass?: string;
    description?: string;
    mapboxApi:string;
}

const MapsInput: React.FC<MapsInputProps> = (props) => {
    const [Lat, setLat] = useState<number>(props.Lat || 22.5726);
    const [Lng, setLng] = useState<number>(props.Lng || 88.3639);

    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const searchTimeout = useRef<any>(null);

    useEffect(() => {
        if (mapRef.current) return; // Prevent duplicate initialization
        if (typeof window === "undefined") return;

        // Initialize Leaflet Map
        const map = L.map(props.containerId || "maps-container").setView([Lat, Lng], 12);
        mapRef.current = map;

        // Mapbox Tile Layer (fully interactive)
        L.tileLayer(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${props.mapboxApi}`,
            {
                tileSize: 512,
                zoomOffset: -1,
                maxZoom: 19,
            }
        ).addTo(map);

        // Marker
        const marker = L.marker([Lat, Lng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Update Lat/Lng on drag
        marker.on("dragend", () => {
            const pos = marker.getLatLng();
            setLat(pos.lat);
            setLng(pos.lng);
        });

        // Click to move marker
        map.on("click", (e: any) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            marker.setLatLng([lat, lng]);
            setLat(lat);
            setLng(lng);
        });
    }, []);

    // Update marker when props or state change
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng([Lat, Lng]);
        }
        if (mapRef.current) {
            mapRef.current.setView([Lat, Lng]);
        }
    }, [Lat, Lng]);

    // Geocoding Search Handler (Mapbox REST API)
    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        if (!query) return;

        // Debounce user input
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                query
            )}.json?access_token=${props.mapboxApi}`;

            const res = await fetch(url);
            const data = await res.json();

            const center = data.features?.[0]?.center;
            if (!center) return;

            const [lng, lat] = center;

            setLat(lat);
            setLng(lng);
        }, 400);
    };

    return (
        <div className={props.wrapperClass}>
            {/* Search Input (replaces mapbox-geocoder) */}
            <input
                type="text"
                placeholder="Search location…"
                onChange={handleSearch}
                style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                }}
            />

            {/* Map Container */}
            <div
                id={props.containerId || "maps-container"}
                className={props.containerClass || "maps-container"}
                style={{ width: "100%", height: "300px" }}
            ></div>

            {props.description && (
                <p
                    className={props.descClass}
                    dangerouslySetInnerHTML={{ __html: props.description }}
                ></p>
            )}
        </div>
    );
};

export default MapsInput;
