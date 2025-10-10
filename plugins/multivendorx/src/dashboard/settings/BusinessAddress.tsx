import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';

declare global {
    interface Window {
        google: any;
    }
}

interface FormData {
    [key: string]: string;
}

const BusinessAddress = () => {
    const id = (window as any).appLocalizer?.store_id;
    const [formData, setFormData] = useState<FormData>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
    const [mapboxLoaded, setMapboxLoaded] = useState<boolean>(false);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const [mapProvider, setMapProvider] = useState('');
    const [apiKey, setApiKey] = useState('');
    const appLocalizer = (window as any).appLocalizer;
    // Get REST API base URL
    useEffect(() => {
        if (appLocalizer) {
            setMapProvider(appLocalizer.map_providor);
            if (appLocalizer.map_providor === 'google_map_set') {
                setApiKey(appLocalizer.google_api_key);
            } else {
                setApiKey(appLocalizer.mapbox_api_key);
            }
        }
    }, []);
    // Fetch total count separately
    const fetchTotalCount = async () => {
        try {
            const res = await axios.get(getApiLink(appLocalizer, "geolocation"), {
                params: { store_id: appLocalizer.store_id, count: true },
                headers: { "X-WP-Nonce": appLocalizer.nonce },
            });
            console.log("Total count response:", res.data);
        } catch (err) {
            console.error("Failed to fetch total count:", err);
            // This is not critical, so don't show error to user
        }
    };
    
    useEffect(() => {
        fetchTotalCount(); // separate API for count
    }, []);

    // Log function
    const log = (message: string, data?: any) => {
        console.log(`[BusinessAddress] ${message}`, data || '');
    };

    // Load initial data
    useEffect(() => {
        if (!id) {
            console.error('No store ID found');
            setErrorMsg('No store ID available');
            setLoading(false);
            return;
        }

        console.log('Loading store data for ID:', id);

        // Load store data using the same pattern as Q&A
        const loadStoreData = async () => {
            try {
                // Use the same pattern as Q&A: getApiLink(appLocalizer, "endpoint")
                const endpoint = getApiLink(appLocalizer, `geolocation/store/${id}`);
                console.log('Fetching from endpoint:', endpoint);

                const res = await axios.get(endpoint, {
                    headers: {
                        'X-WP-Nonce': appLocalizer.nonce
                    }
                });
                
                console.log('Store data loaded successfully:', res.data);
                const data = res.data || {};

                // Ensure we have proper data structure
                const formattedData = {
                    location_address: data.location_address || '',
                    location_lat: data.location_lat || '',
                    location_lng: data.location_lng || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    country: data.country || '',
                    zip: data.zip || '',
                    timezone: data.timezone || ''
                };

                setFormData(formattedData);
                setLoading(false);
            } catch (error: any) {
                console.error('Error loading store data:', error);

                let errorMessage = 'Failed to load store data';
                if (error.response?.status === 404) {
                    errorMessage = `Geolocation endpoint not found (404). Please ensure the geolocation feature is properly installed.`;
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Request timeout. Please try again.';
                } else {
                    errorMessage = `Failed to load store data: ${error.message}`;
                }

                setErrorMsg(errorMessage);
                setLoading(false);

                // Set empty form data to allow map initialization
                setFormData({
                    location_address: '',
                    location_lat: '',
                    location_lng: '',
                    address: '',
                    city: '',
                    state: '',
                    country: '',
                    zip: '',
                    timezone: ''
                });
            }
        };

        loadStoreData();
    }, [id]);

    // Load map scripts based on provider
    useEffect(() => {
        if (mapProvider === 'google_map_set' && !googleLoaded) {
            console.log('Loading Google Maps script...');
            loadGoogleMapsScript();
        } else if (mapProvider === 'mapbox_api_set' && !mapboxLoaded) {
            console.log('Loading Mapbox script...');
            loadMapboxScript();
        }
    }, [mapProvider, googleLoaded, mapboxLoaded]);

    const loadMapboxScript = () => {
        // Add Mapbox GL JS
        const mapboxGlScript = document.createElement('script');
        mapboxGlScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js';
        mapboxGlScript.async = true;
        document.head.appendChild(mapboxGlScript);

        // Add Mapbox GL CSS
        const mapboxGlCss = document.createElement('link');
        mapboxGlCss.href = 'https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css';
        mapboxGlCss.rel = 'stylesheet';
        document.head.appendChild(mapboxGlCss);

        // Add Mapbox Geocoder JS
        const mapboxGeocoderScript = document.createElement('script');
        mapboxGeocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.min.js';
        mapboxGeocoderScript.async = true;
        document.head.appendChild(mapboxGeocoderScript);

        // Add Mapbox Geocoder CSS
        const mapboxGeocoderCss = document.createElement('link');
        mapboxGeocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.css';
        mapboxGeocoderCss.rel = 'stylesheet';
        document.head.appendChild(mapboxGeocoderCss);

        mapboxGlScript.onload = () => {
            log('Mapbox script loaded successfully');
            setMapboxLoaded(true);
        };

        mapboxGlScript.onerror = (error) => {
            log('Error loading Mapbox script:', error);
            setErrorMsg('Failed to load Mapbox. Please check your internet connection.');
        };
    };

    const loadGoogleMapsScript = () => {
        if (window.google) {
            log('Google Maps already loaded');
            setGoogleLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            log('Google Maps script loaded successfully');
            setGoogleLoaded(true);
        };

        script.onerror = (error) => {
            log('Error loading Google Maps script:', error);
            setErrorMsg('Failed to load Google Maps. Please check your internet connection.');
        };

        document.head.appendChild(script);
    };

    useEffect(() => {
        if (!loading && mapProvider) {
            if (mapProvider === 'google_map_set' && googleLoaded) {
                initializeGoogleMap();
            } else if (mapProvider === 'mapbox_api_set' && mapboxLoaded) {
                initializeMapboxMap();
            }
        }
    }, [loading, mapProvider, googleLoaded, mapboxLoaded]);

    const initializeGoogleMap = () => {
        log('Initializing Google Map...');
        if (!window.google || !autocompleteInputRef.current) return;

        const initialLat = parseFloat(formData.location_lat) || 40.7128;
        const initialLng = parseFloat(formData.location_lng) || -74.0060;

        const mapInstance = new window.google.maps.Map(document.getElementById('location-map'), {
            center: { lat: initialLat, lng: initialLng },
            zoom: formData.location_lat ? 15 : 10,
        });

        const markerInstance = new window.google.maps.Marker({
            map: mapInstance,
            draggable: true,
            position: { lat: initialLat, lng: initialLng },
        });

        markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            reverseGeocode('google', position.lat(), position.lng());
        });

        mapInstance.addListener('click', (event: any) => {
            reverseGeocode('google', event.latLng.lat(), event.latLng.lng());
        });

        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
            types: ['establishment', 'geocode'],
            fields: ['address_components', 'formatted_address', 'geometry'],
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                handlePlaceSelect(place, 'google');
            }
        });

        setMap(mapInstance);
        setMarker(markerInstance);
    };

    const initializeMapboxMap = () => {
        log('Initializing Mapbox Map...');
        if (!(window as any).mapboxgl || !autocompleteInputRef.current) return;

        (window as any).mapboxgl.accessToken = apiKey;

        const initialLat = parseFloat(formData.location_lat) || 40.7128;
        const initialLng = parseFloat(formData.location_lng) || -74.0060;

        const mapInstance = new (window as any).mapboxgl.Map({
            container: 'location-map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [initialLng, initialLat],
            zoom: formData.location_lat ? 15 : 10,
        });

        const markerInstance = new (window as any).mapboxgl.Marker({ draggable: true })
            .setLngLat([initialLng, initialLat])
            .addTo(mapInstance);

        markerInstance.on('dragend', () => {
            const lngLat = markerInstance.getLngLat();
            reverseGeocode('mapbox', lngLat.lat, lngLat.lng);
        });

        mapInstance.on('click', (event: any) => {
            reverseGeocode('mapbox', event.lngLat.lat, event.lngLat.lng);
        });

        const geocoder = new (window as any).MapboxGeocoder({
            accessToken: apiKey,
            mapboxgl: (window as any).mapboxgl,
            marker: false,
        });

        geocoder.on('result', (e: any) => {
            handlePlaceSelect(e.result, 'mapbox');
        });

        // Replace the input with the geocoder
        const geocoderContainer = document.getElementById('location-autocomplete-container');
        if (geocoderContainer) {
            geocoderContainer.appendChild(geocoder.onAdd(mapInstance));
            // Hide the original input
            if (autocompleteInputRef.current) {
                autocompleteInputRef.current.style.display = 'none';
            }
        }

        setMap(mapInstance);
        setMarker(markerInstance);
    };

    const handlePlaceSelect = (place: any, provider: 'google' | 'mapbox') => {
        let lat, lng, formatted_address, addressComponents;

        if (provider === 'google') {
            const location = place.geometry.location;
            lat = location.lat();
            lng = location.lng();
            formatted_address = place.formatted_address;
            addressComponents = extractAddressComponents(place, 'google');
        } else { // mapbox
            lng = place.center[0];
            lat = place.center[1];
            formatted_address = place.place_name;
            addressComponents = extractAddressComponents(place, 'mapbox');
        }

        if (map && marker) {
            if (provider === 'google') {
                map.setCenter({ lat, lng });
                marker.setPosition({ lat, lng });
            } else {
                map.setCenter([lng, lat]);
                marker.setLngLat([lng, lat]);
            }
            map.setZoom(17);
        }

        const updated = {
            ...formData,
            location_address: formatted_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...addressComponents,
        };

        setFormData(updated);
        autoSave(updated);
    };

    const reverseGeocode = (provider: 'google' | 'mapbox', lat: number, lng: number) => {
        if (provider === 'google') {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
                if (status === 'OK' && results[0]) {
                    handlePlaceSelect(results[0], 'google');
                } else {
                    setErrorMsg('Failed to get address for this location');
                }
            });
        } else { // mapbox
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.features && data.features.length > 0) {
                        handlePlaceSelect(data.features[0], 'mapbox');
                    } else {
                        setErrorMsg('Failed to get address for this location');
                    }
                })
                .catch(() => setErrorMsg('Reverse geocoding request failed'));
        }
    };

    const extractAddressComponents = (place: any, provider: 'google' | 'mapbox'): FormData => {
        const components: FormData = {};

        if (provider === 'google') {
            if (place.address_components) {
                place.address_components.forEach((component: any) => {
                    const types = component.types;
                    if (types.includes('street_number')) components.address = component.long_name;
                    else if (types.includes('route')) components.address = (components.address || '') + ' ' + component.long_name;
                    else if (types.includes('locality')) components.city = component.long_name;
                    else if (types.includes('administrative_area_level_1')) components.state = component.long_name;
                    else if (types.includes('country')) components.country = component.long_name;
                    else if (types.includes('postal_code')) components.zip = component.long_name;
                });
            }
        } else { // mapbox
            if (place.context) {
                place.context.forEach((component: any) => {
                    const types = component.id.split('.');
                    if (types.includes('postcode')) components.zip = component.text;
                    else if (types.includes('place')) components.city = component.text;
                    else if (types.includes('region')) components.state = component.text;
                    else if (types.includes('country')) components.country = component.text;
                });
            }
            if (place.properties) {
                components.address = place.properties.address || '';
            }
        }
        return components;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        console.log(`Input change: ${name} = ${value}`);

        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const autoSave = (updatedData: FormData) => {
        console.log('Auto-saving data:', updatedData);

        // Use the same pattern as Q&A: getApiLink(appLocalizer, "endpoint")
        const endpoint = getApiLink(appLocalizer, `geolocation/store/${id}`);

        axios.put(endpoint, updatedData, {
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': appLocalizer.nonce
            },
            timeout: 10000
        })
            .then((res) => {
                console.log('Auto-save successful:', res.data);
                if (res.data.success) {
                    setSuccessMsg('Store saved successfully!');
                    setErrorMsg(null);
                    setTimeout(() => {
                        setSuccessMsg(null);
                        console.log('Success message cleared');
                    }, 3000);
                }
            })
            .catch((error) => {
                console.error('Auto-save error:', error);

                let errorMessage = 'Failed to save store data';
                if (error.response?.status === 404) {
                    errorMessage = 'Save endpoint not found. Data saved locally but not on server.';
                } else if (error.response?.status === 405) {
                    errorMessage = 'Save method not allowed. Please contact administrator.';
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Save request timeout. Data saved locally but may not be on server.';
                } else {
                    errorMessage = `Failed to save: ${error.message}`;
                }

                setErrorMsg(errorMessage);
            });
    };

    if (loading) {
        return (
            <div className="card-wrapper">
                <div className="card-content">
                    <div>Loading store data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-wrapper">
            <div className="card-content">
                <div className="card-title">Business Address & Location</div>

                {successMsg && (
                    <div className="success-message" style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#f0fff0', border: '1px solid green' }}>
                        {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#fff0f0', border: '1px solid red' }}>
                        {errorMsg}
                    </div>
                )}

                {/* Debug Info */}
                <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '15px', borderRadius: '4px', fontSize: '12px' }}>
                    <div>Debug Info:</div>
                    <div>Store ID: {id}</div>
                    <div>API Endpoint: {getApiLink(appLocalizer, `geolocation/store/${id}`)}</div>
                    <div>Lat: {formData.location_lat || 'N/A'}</div>
                    <div>Lng: {formData.location_lng || 'N/A'}</div>
                    <div>Google Maps: {googleLoaded ? 'Loaded' : 'Loading...'}</div>
                    <div>Map: {map ? 'Initialized' : 'Not initialized'}</div>
                </div>

                {/* Your existing JSX remains the same... */}
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="location-autocomplete">Search Location *</label>
                        <div id="location-autocomplete-container">
                            <input
                                ref={autocompleteInputRef}
                                id="location-autocomplete"
                                type="text"
                                className="setting-form-input"
                                placeholder="Start typing your business address..."
                                defaultValue={formData.location_address}
                            />
                        </div>
                        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                            Type your business name or address and select from suggestions
                        </small>
                    </div>
                </div>

                {/* Map Display and other form fields remain the same... */}
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label>Location Map *</label>
                        <div
                            id="location-map"
                            style={{
                                height: '300px',
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                marginTop: '8px'
                            }}
                        ></div>
                        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                            Click on the map or drag the marker to set your exact location
                        </small>
                    </div>
                </div>

                {/* Address fields remain the same... */}
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            className="setting-form-input"
                            onChange={handleChange}
                            placeholder="Street address"
                        />
                    </div>
                </div>

                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            className="setting-form-input"
                            onChange={handleChange}
                            placeholder="City"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state || ''}
                            className="setting-form-input"
                            onChange={handleChange}
                            placeholder="State"
                        />
                    </div>
                </div>

                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country || ''}
                            className="setting-form-input"
                            onChange={handleChange}
                            placeholder="Country"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="zip">Zip</label>
                        <input
                            type="text"
                            name="zip"
                            value={formData.zip || ''}
                            className="setting-form-input"
                            onChange={handleChange}
                            placeholder="Zip code"
                        />
                    </div>
                </div>

                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="timezone">Timezone</label>
                        <input
                            type="text"
                            name="timezone"
                            value={formData.timezone || ''}
                            className="setting-form-input"
                            onChange={handleChange}
                            placeholder="Timezone"
                        />
                    </div>
                </div>

                {/* Hidden coordinates */}
                <input type="hidden" name="location_lat" value={formData.location_lat || ''} />
                <input type="hidden" name="location_lng" value={formData.location_lng || ''} />
            </div>
        </div>
    );
};

export default BusinessAddress;