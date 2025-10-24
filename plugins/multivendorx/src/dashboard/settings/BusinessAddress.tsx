import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BasicInput, getApiLink, SelectInput } from 'zyra';

declare global {
    interface Window {
        google: any;
        mapboxgl: any;
        MapboxGeocoder: any;
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
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
    const appLocalizer = (window as any).appLocalizer;

    const [addressData, setAddressData] = useState({
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

    // Load initial data
    useEffect(() => {
        if (!id) {
            console.error('No store ID found');
            setErrorMsg('No store ID available');
            setLoading(false);
            return;
        }
    
        const loadStoreData = async () => {
            try {
                const endpoint = getApiLink(appLocalizer, `store/${id}`); // Use main store endpoint
                console.log('Fetching from endpoint:', endpoint);
    
                const res = await axios.get(endpoint, {
                    headers: {
                        'X-WP-Nonce': appLocalizer.nonce
                    }
                });
                
                console.log('Store data loaded successfully:', res.data);
                const data = res.data || {};

                // Use the same structure as admin side
                const formattedData = {
                    location_address: data.location_address || data.address || '',
                    location_lat: data.location_lat || '',
                    location_lng: data.location_lng || '',
                    address: data.address || data.location_address || '',
                    city: data.city || '',
                    state: data.state || '',
                    country: data.country || '',
                    zip: data.zip || '',
                    timezone: data.timezone || ''
                };

                setAddressData(formattedData);
                setFormData(data); // Also set formData for country/state management
                
                // Fetch states if country is already set
                if (data.country) {
                    fetchStatesByCountry(data.country);
                }
                
                setLoading(false);
            } catch (error: any) {
                console.error('Error loading store data:', error);
                setErrorMsg('Failed to load store data');
                setLoading(false);
                // Initialize with empty structure
                setAddressData({
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
            loadGoogleMapsScript();
        } else if (mapProvider === 'mapbox_api_set' && !mapboxLoaded) {
            loadMapboxScript();
        }
    }, [mapProvider, googleLoaded, mapboxLoaded]);

    // Fetch states when country changes
    useEffect(() => {
        if (formData.country) {
            fetchStatesByCountry(formData.country);
        }
    }, [formData.country]);

    const fetchStatesByCountry = (countryCode: string) => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `states/${countryCode}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            setStateOptions(res.data || []);
        })
    };

    // Handle country select change (from old code)
    const handleCountryChange = (newValue: any) => {
        if (!newValue || Array.isArray(newValue)) return;
        
        const updatedAddressData = { 
            ...addressData, 
            country: newValue.value, 
            state: '' // reset state when country changes
        };
        
        const updatedFormData = { 
            ...formData, 
            country: newValue.value, 
            state: '' 
        };
        
        setAddressData(updatedAddressData);
        setFormData(updatedFormData);
        autoSave(updatedAddressData);
        fetchStatesByCountry(newValue.value);
    };

    // Handle state select change (from old code)
    const handleStateChange = (newValue: any) => {
        if (!newValue || Array.isArray(newValue)) return;
        
        const updatedAddressData = { 
            ...addressData, 
            state: newValue.value 
        };
        
        const updatedFormData = { 
            ...formData, 
            state: newValue.value 
        };
        
        setAddressData(updatedAddressData);
        setFormData(updatedFormData);
        autoSave(updatedAddressData);
    };

    const loadMapboxScript = () => {
        const mapboxGlScript = document.createElement('script');
        mapboxGlScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js';
        mapboxGlScript.async = true;
        document.head.appendChild(mapboxGlScript);

        const mapboxGlCss = document.createElement('link');
        mapboxGlCss.href = 'https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css';
        mapboxGlCss.rel = 'stylesheet';
        document.head.appendChild(mapboxGlCss);

        const mapboxGeocoderScript = document.createElement('script');
        mapboxGeocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.min.js';
        mapboxGeocoderScript.async = true;
        document.head.appendChild(mapboxGeocoderScript);

        const mapboxGeocoderCss = document.createElement('link');
        mapboxGeocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.css';
        mapboxGeocoderCss.rel = 'stylesheet';
        document.head.appendChild(mapboxGeocoderCss);

        mapboxGlScript.onload = () => {
            setMapboxLoaded(true);
        };

        mapboxGlScript.onerror = (error) => {
            setErrorMsg('Failed to load Mapbox. Please check your internet connection.');
        };
    };

    const loadGoogleMapsScript = () => {
        if (window.google) {
            setGoogleLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setGoogleLoaded(true);
        };

        script.onerror = (error) => {
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
    }, [loading, mapProvider, googleLoaded, mapboxLoaded, addressData]);

    const initializeGoogleMap = () => {
        if (!window.google || !autocompleteInputRef.current) return;

        const initialLat = parseFloat(addressData.location_lat) || 40.7128;
        const initialLng = parseFloat(addressData.location_lng) || -74.0060;

        const mapInstance = new window.google.maps.Map(document.getElementById('location-map'), {
            center: { lat: initialLat, lng: initialLng },
            zoom: addressData.location_lat ? 15 : 10,
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
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
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
        if (!(window as any).mapboxgl || !autocompleteInputRef.current) return;
    
        const geocoderContainer = document.getElementById('location-autocomplete-container');
        if (geocoderContainer) {
            geocoderContainer.innerHTML = '';
        }
        (window as any).mapboxgl.accessToken = apiKey;

        const initialLat = parseFloat(addressData.location_lat) || 40.7128;
        const initialLng = parseFloat(addressData.location_lng) || -74.0060;

        const mapInstance = new (window as any).mapboxgl.Map({
            container: 'location-map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [initialLng, initialLat],
            zoom: addressData.location_lat ? 15 : 10,
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

        if (geocoderContainer) {
            geocoderContainer.appendChild(geocoder.onAdd(mapInstance));
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
        } else {
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

        const newAddressData = {
            location_address: formatted_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...addressComponents,
        };

        // Ensure both address fields are populated
        if (!newAddressData.address && formatted_address) {
            newAddressData.address = formatted_address;
        }

        // Also update formData for country/state
        const newFormData = {
            ...formData,
            ...newAddressData
        };

        setAddressData(newAddressData);
        setFormData(newFormData);
        
        // Fetch states if country is set
        if (newAddressData.country) {
            fetchStatesByCountry(newAddressData.country);
        }
        
        autoSave(newAddressData);
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
        } else {
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

    const extractAddressComponents = (place: any, provider: 'google' | 'mapbox') => {
        const components: any = {};

        if (provider === 'google') {
            if (place.address_components) {
                let streetNumber = '';
                let route = '';
                let streetAddress = '';

                place.address_components.forEach((component: any) => {
                    const types = component.types;
                    
                    if (types.includes('street_number')) {
                        streetNumber = component.long_name;
                    } else if (types.includes('route')) {
                        route = component.long_name;
                    } else if (types.includes('locality')) {
                        components.city = component.long_name;
                    } else if (types.includes('administrative_area_level_1')) {
                        components.state = component.short_name || component.long_name;
                    } else if (types.includes('country')) {
                        components.country = component.long_name;
                    } else if (types.includes('postal_code')) {
                        components.zip = component.long_name;
                    }
                });

                // Build street address (same logic as admin side)
                if (streetNumber && route) {
                    streetAddress = `${streetNumber} ${route}`;
                } else if (route) {
                    streetAddress = route;
                } else if (streetNumber) {
                    streetAddress = streetNumber;
                }

                components.address = streetAddress.trim();
            }
        } else {
            // Mapbox address extraction (same logic as admin side)
            if (place.properties) {
                components.address = place.properties.address || '';
            }
            
            if (place.context) {
                place.context.forEach((component: any) => {
                    const idParts = component.id.split('.');
                    const type = idParts[0];
                    
                    if (type === 'postcode') {
                        components.zip = component.text;
                    } else if (type === 'place') {
                        components.city = component.text;
                    } else if (type === 'region') {
                        components.state = component.text;
                    } else if (type === 'country') {
                        components.country = component.text;
                    }
                });
            }
        }

        return components;
    };

    const handleChange = (name: string, value: string) => {
        const newAddressData = {
            ...addressData,
            [name]: value
        };
        setAddressData(newAddressData);
        autoSave(newAddressData);
    };

    // Update your autoSave function:
    const autoSave = (updatedData: any) => {
        const saveData = {
            ...updatedData,
            location_address: updatedData.location_address || updatedData.address || '',
            address: updatedData.address || updatedData.location_address || ''
        };
    
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`), // Use main store endpoint
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: saveData,
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        }).catch((error) => {
            console.error('Save error:', error);
            setErrorMsg('Failed to save store data');
        });
    };

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

                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="location-autocomplete">Search Location *</label>
                        <div id="location-autocomplete-container">
                            <input
                                ref={autocompleteInputRef}
                                id="location-autocomplete"
                                type="text"
                                className="setting-form-input"
                                placeholder="Search your business address..."
                                defaultValue={addressData.location_address}
                            />
                        </div>
                        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                            Type your business name or address and select from suggestions
                        </small>
                    </div>
                </div>

                {/* Map Display */}
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

                {/* Address Field */}
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="location_address">Address *</label>
                        <BasicInput 
                            name="location_address"
                            value={addressData.location_address} 
                            wrapperClass="setting-form-input" 
                            descClass="settings-metabox-description" 
                            onChange={(e) => handleChange('location_address', e.target.value)} 
                        />
                        {!addressData.location_address && (
                            <small style={{ color: 'orange', marginTop: '5px', display: 'block' }}>
                                Address is required. Please select a location from the map or search.
                            </small>
                        )}
                    </div>
                </div>

                {/* Address Components */}
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <BasicInput 
                            name="city"
                            value={addressData.city} 
                            wrapperClass="setting-form-input" 
                            descClass="settings-metabox-description" 
                            onChange={(e) => handleChange('city', e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="zip">Zip Code</label>
                        <BasicInput 
                            name="zip"
                            value={addressData.zip} 
                            wrapperClass="setting-form-input" 
                            descClass="settings-metabox-description" 
                            onChange={(e) => handleChange('zip', e.target.value)} 
                        />
                    </div>
                </div>

                {/* Country and State Select Inputs (from old code) */}
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <SelectInput
                            name="country"
                            value={addressData.country}
                            options={appLocalizer.country_list || []}
                            type="single-select"
                            onChange={handleCountryChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state">State</label>
                        <SelectInput
                            name="state"
                            value={addressData.state}
                            options={stateOptions}
                            type="single-select"
                            onChange={handleStateChange}
                        />
                    </div>
                </div>

                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="timezone">Timezone</label>
                        <BasicInput 
                            name="timezone"
                            value={addressData.timezone} 
                            wrapperClass="setting-form-input" 
                            descClass="settings-metabox-description" 
                            onChange={(e) => handleChange('timezone', e.target.value)} 
                        />
                    </div>
                </div>

                {/* Hidden coordinates */}
                <input type="hidden" name="location_lat" value={addressData.location_lat} />
                <input type="hidden" name="location_lng" value={addressData.location_lng} />
            </div>
        </div>
    );
};

export default BusinessAddress;