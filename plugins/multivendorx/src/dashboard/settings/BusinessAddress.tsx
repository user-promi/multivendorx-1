import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

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
    const autocompleteInputRef = useRef<HTMLInputElement>(null);

    // Log function
    const log = (message: string, data?: any) => {
        console.log(`[BusinessAddress] ${message}`, data || '');
    };

    // Load initial data
    useEffect(() => {
        if (!id) {
            log('No store ID found');
            setErrorMsg('No store ID available');
            setLoading(false);
            return;
        }

        log('Loading store data for ID:', id);
        
        // Test if REST API is working
        const testAPI = async () => {
            try {
                log('Testing if REST API is available...');
                // Try the main REST API endpoint
                const response = await axios.get('/?wp-json/');
                log('REST API is available');
                
                // Check if our specific endpoint exists
                const routes = response.data.routes || {};
                const ourRoute = Object.keys(routes).find(route => 
                    route.includes('/multivendorx/store/')
                );
                
                if (ourRoute) {
                    log('Our route found:', ourRoute);
                } else {
                    log('Our route not found in REST API');
                    setErrorMsg('Geolocation API endpoint not registered. Please contact administrator.');
                }
            } catch (error) {
                log('REST API test failed:', error);
                setErrorMsg('WordPress REST API is not accessible. Please check your permalink settings.');
            }
        };

        testAPI();

        // Load store data with proper error handling
        axios.get(`/?wp-json/multivendorx/store/${id}`)
            .then((res) => {
                log('Store data loaded successfully:', res.data);
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
            })
            .catch((error) => {
                log('Error loading store data:', error);
                
                let errorMessage = 'Failed to load store data';
                if (error.response?.status === 404) {
                    errorMessage = `Store data endpoint not found (404). Please ensure the geolocation feature is properly installed.`;
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
            });
    }, [id]);

    // Load Google Maps script immediately (don't wait for store data)
    useEffect(() => {
        if (!googleLoaded) {
            log('Loading Google Maps script...');
            loadGoogleMapsScript();
        }
    }, [googleLoaded]);

    // Initialize map when Google is loaded
    useEffect(() => {
        initializeMap();
    }, [googleLoaded, loading, formData]);

    const loadGoogleMapsScript = () => {
        if (window.google) {
            log('Google Maps already loaded');
            setGoogleLoaded(true);
            return;
        }

        const api_key = 'AIzaSyAEUy5ZtNn9Q8EmTp09h_MP7te3_IRkKwc';
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${api_key}&libraries=places&loading=async`;
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

    const initializeMap = () => {
        log('Initializing map and autocomplete...');

        if (!window.google) {
            log('Google Maps API not available');
            return;
        }

        // Initialize Autocomplete
        if (autocompleteInputRef.current) {
            log('Initializing autocomplete');
            try {
                const autocomplete = new window.google.maps.places.Autocomplete(
                    autocompleteInputRef.current, 
                    { 
                        types: ['establishment', 'geocode'],
                        fields: ['address_components', 'formatted_address', 'geometry']
                    }
                );

                autocomplete.addListener('place_changed', () => {
                    log('Place changed in autocomplete');
                    const place = autocomplete.getPlace();
                    log('Selected place:', place);
                    
                    if (place.geometry) {
                        handlePlaceSelect(place);
                    } else {
                        log('Place has no geometry');
                        setErrorMsg('Selected place has no location data');
                    }
                });
                
                log('Autocomplete initialized successfully');
            } catch (error) {
                log('Error initializing autocomplete:', error);
                setErrorMsg('Failed to initialize address search');
            }
        }

        // Initialize Map
        const mapElement = document.getElementById('location-map');
        if (mapElement) {
            log('Initializing map');
            try {
                const initialLat = parseFloat(formData.location_lat) || 40.7128;
                const initialLng = parseFloat(formData.location_lng) || -74.0060;
                
                log(`Map center: ${initialLat}, ${initialLng}`);
                
                const mapInstance = new window.google.maps.Map(mapElement, {
                    center: { lat: initialLat, lng: initialLng },
                    zoom: formData.location_lat ? 15 : 10,
                });

                const markerInstance = new window.google.maps.Marker({
                    map: mapInstance,
                    draggable: true,
                    position: { lat: initialLat, lng: initialLng }
                });

                markerInstance.addListener('dragend', () => {
                    const position = markerInstance.getPosition();
                    log('Marker dragged to:', { lat: position.lat(), lng: position.lng() });
                    reverseGeocode(position.lat(), position.lng());
                });

                // Add click listener to map
                mapInstance.addListener('click', (event: any) => {
                    log('Map clicked at:', event.latLng);
                    reverseGeocode(event.latLng.lat(), event.latLng.lng());
                });

                setMap(mapInstance);
                setMarker(markerInstance);
                log('Map and marker initialized successfully');
            } catch (error) {
                log('Error initializing map:', error);
                setErrorMsg('Failed to initialize map');
            }
        }
    };

    const handlePlaceSelect = (place: any) => {
        log('Handling place select:', place);
        
        const location = place.geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        log(`Selected location: ${lat}, ${lng}`);

        // Update map
        if (map && marker) {
            map.setCenter({ lat, lng });
            map.setZoom(17);
            marker.setPosition({ lat, lng });
            log('Map and marker updated');
        }

        // Update form data
        const addressComponents = extractAddressComponents(place);
        log('Extracted address components:', addressComponents);
        
        const updated = { 
            ...formData, 
            location_address: place.formatted_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...addressComponents
        };
        
        log('Updated form data:', updated);
        setFormData(updated);
        autoSave(updated);
    };

    const reverseGeocode = (lat: number, lng: number) => {
        log(`Reverse geocoding: ${lat}, ${lng}`);
        
        if (!window.google) {
            log('Google Maps not available for reverse geocoding');
            return;
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            log(`Reverse geocode status: ${status}`);
            
            if (status === 'OK' && results[0]) {
                log('Reverse geocode successful:', results[0]);
                const addressComponents = extractAddressComponents(results[0]);
                const updated = {
                    ...formData,
                    location_address: results[0].formatted_address,
                    location_lat: lat.toString(),
                    location_lng: lng.toString(),
                    ...addressComponents
                };
                log('Updated data from reverse geocode:', updated);
                setFormData(updated);
                autoSave(updated);
                setErrorMsg(null);
            } else {
                log('Reverse geocode failed with status:', status);
                setErrorMsg('Failed to get address for this location');
            }
        });
    };

    const extractAddressComponents = (place: any) => {
        log('Extracting address components from:', place);
        const components: FormData = {};
        
        if (place.address_components) {
            place.address_components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('street_number')) {
                    components.address = component.long_name;
                } else if (types.includes('route')) {
                    components.address = (components.address || '') + ' ' + component.long_name;
                } else if (types.includes('locality')) {
                    components.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    components.state = component.long_name;
                } else if (types.includes('country')) {
                    components.country = component.long_name;
                } else if (types.includes('postal_code')) {
                    components.zip = component.long_name;
                }
            });
        }

        log('Extracted components:', components);
        return components;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        log(`Input change: ${name} = ${value}`);
        
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const autoSave = (updatedData: FormData) => {
        log('Auto-saving data:', updatedData);
        
        axios.put(`/?wp-json/multivendorx/store/${id}`, updatedData, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
        })
        .then((res) => {
            log('Auto-save successful:', res.data);
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
                setErrorMsg(null);
                setTimeout(() => {
                    setSuccessMsg(null);
                    log('Success message cleared');
                }, 3000);
            }
        })
        .catch((error) => {
            log('Auto-save error:', error);
            
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
                    <div className="success-message" style={{color: 'green', marginBottom: '15px', padding: '10px', background: '#f0fff0', border: '1px solid green' }}>
                        {successMsg}
                    </div>
                )}
                
                {errorMsg && (
                    <div className="error-message" style={{color: 'red', marginBottom: '15px', padding: '10px', background: '#fff0f0', border: '1px solid red' }}>
                        {errorMsg}
                    </div>
                )}
                
                {/* Debug Info */}
                <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '15px', borderRadius: '4px', fontSize: '12px' }}>
                    <div>Debug Info:</div>
                    <div>Store ID: {id}</div>
                    <div>Lat: {formData.location_lat || 'N/A'}</div>
                    <div>Lng: {formData.location_lng || 'N/A'}</div>
                    <div>Google Maps: {googleLoaded ? 'Loaded' : 'Loading...'}</div>
                    <div>Map: {map ? 'Initialized' : 'Not initialized'}</div>
                    <div>API Endpoint: /?wp-json/multivendorx/store/{id}</div>
                </div>

                {/* Location Search */}
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="location-autocomplete">Search Location *</label>
                        <input
                            ref={autocompleteInputRef}
                            id="location-autocomplete"
                            type="text"
                            className="setting-form-input"
                            placeholder="Start typing your business address..."
                            defaultValue={formData.location_address}
                        />
                        <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
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
                        <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                            Click on the map or drag the marker to set your exact location
                        </small>
                    </div>
                </div>

                {/* Address Fields */}
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