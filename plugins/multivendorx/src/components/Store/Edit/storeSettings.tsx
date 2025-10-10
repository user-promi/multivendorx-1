import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

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

const StoreSettings = ({ id }: { id: string | null }) => {
    const [formData, setFormData] = useState<FormData>({});
    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    // Map states
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
    const [mapboxLoaded, setMapboxLoaded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const [mapProvider, setMapProvider] = useState('');
    const [apiKey, setApiKey] = useState('');
    const appLocalizer = (window as any).appLocalizer;

    // Log function for debugging
    const log = (message: string, data?: any) => {
        console.log(`[StoreSettings] ${message}`, data || '');
    };

    // Get map provider and API key
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

    // Load store data
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData((prev) => ({ ...prev, ...data }));
                setImagePreviews({
                    image: data.image || '',
                    banner: data.banner || '',
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error loading store data:', error);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (formData.country) {
            fetchStatesByCountry(formData.country);
        }
    }, [formData.country]);

    // Load map scripts based on provider
    useEffect(() => {
        if (mapProvider === 'google_map_set' && !googleLoaded) {
            log('Loading Google Maps script...');
            loadGoogleMapsScript();
        } else if (mapProvider === 'mapbox_api_set' && !mapboxLoaded) {
            log('Loading Mapbox script...');
            loadMapboxScript();
        }
    }, [mapProvider, googleLoaded, mapboxLoaded]);

    // Initialize map when data and scripts are loaded
    useEffect(() => {
        if (!loading && mapProvider) {
            if (mapProvider === 'google_map_set' && googleLoaded) {
                initializeGoogleMap();
            } else if (mapProvider === 'mapbox_api_set' && mapboxLoaded) {
                initializeMapboxMap();
            }
        }
    }, [loading, mapProvider, googleLoaded, mapboxLoaded, formData.country, formData.location_lat, formData.location_lng]);

    const loadMapboxScript = () => {
        if ((window as any).mapboxgl) {
            setMapboxLoaded(true);
            return;
        }

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
            log('Mapbox script loaded successfully');
            setMapboxLoaded(true);
        };

        mapboxGlScript.onerror = (error) => {
            log('Error loading Mapbox script:', error);
        };
    };

    const loadGoogleMapsScript = () => {
        if (window.google && window.google.maps) {
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
        };

        document.head.appendChild(script);
    };

    const initializeGoogleMap = () => {
        log('Initializing Google Map...');
        
        // Add safety check for google.maps availability
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
            log('Google Maps not fully loaded yet, retrying...');
            setTimeout(() => initializeGoogleMap(), 100);
            return;
        }

        if (!autocompleteInputRef.current) {
            log('Autocomplete input ref not available');
            return;
        }

        const initialLat = parseFloat(formData.location_lat) || 40.7128;
        const initialLng = parseFloat(formData.location_lng) || -74.0060;

        try {
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
            log('Google Map initialized successfully');
        } catch (error) {
            log('Error initializing Google Map:', error);
        }
    };

    const initializeMapboxMap = () => {
        log('Initializing Mapbox Map...');
        if (!(window as any).mapboxgl || !autocompleteInputRef.current) return;
    
        // Clear any existing geocoder first
        const geocoderContainer = document.getElementById('store-location-autocomplete-container');
        if (geocoderContainer) {
            geocoderContainer.innerHTML = ''; // Clear previous geocoder
        }
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

        // Add the geocoder to the container
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

        const updated = {
            ...formData,
            location_address: formatted_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...addressComponents,
        };

        // Ensure address field is never empty
        if (!updated.address || updated.address.trim() === '') {
            // Use the formatted address as fallback
            updated.address = formatted_address;
        }

        setFormData(updated);
        autoSave(updated);
    };

    const reverseGeocode = (provider: 'google' | 'mapbox', lat: number, lng: number) => {
        if (provider === 'google') {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
                if (status === 'OK' && results[0]) {
                    handlePlaceSelect(results[0], 'google');
                }
            });
        } else {
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.features && data.features.length > 0) {
                        handlePlaceSelect(data.features[0], 'mapbox');
                    }
                })
        }
    };

    const extractAddressComponents = (place: any, provider: 'google' | 'mapbox'): FormData => {
        const components: FormData = {};

        if (provider === 'google') {
            if (place.address_components) {
                let streetNumber = '';
                let route = '';
                let address = '';

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
                    } else if (types.includes('postal_code_suffix')) {
                        if (components.zip) {
                            components.zip += '-' + component.long_name;
                        }
                    }
                });

                // Build complete address
                if (streetNumber && route) {
                    address = `${streetNumber} ${route}`;
                } else if (route) {
                    address = route;
                } else if (streetNumber) {
                    address = streetNumber;
                } else {
                    // If no street address found, use the formatted address
                    address = place.formatted_address || '';
                }

                components.address = address.trim();

                // If still no address, try to extract from name for establishments
                if (!components.address && place.name && place.formatted_address) {
                    const nameIndex = place.formatted_address.indexOf(place.name);
                    if (nameIndex !== -1) {
                        components.address = place.formatted_address.substring(nameIndex + place.name.length).trim().replace(/^,\s*/, '');
                    } else {
                        components.address = place.formatted_address;
                    }
                }
            }
        } else {
            // Mapbox address extraction
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

            // If address is still empty, try to construct it from available data
            if (!components.address && place.text && place.properties) {
                components.address = `${place.text}${place.properties.address ? ', ' + place.properties.address : ''}`;
            }

            // Final fallback - use the first part of the place name
            if (!components.address && place.place_name) {
                const parts = place.place_name.split(',');
                components.address = parts[0]?.trim() || place.place_name;
            }
        }

        return components;
    };

    const fetchStatesByCountry = (countryCode: string) => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `states/${countryCode}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            setStateOptions(res.data || []);
        })
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const runUploader = (key: string) => {
        const frame = (window as any).wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: false,
        });

        frame.on('select', function () {
            const attachment = frame.state().get('selection').first().toJSON();
            const updated = { ...formData, [key]: attachment.url };

            setFormData(updated);
            setImagePreviews((prev) => ({ ...prev, [key]: attachment.url }));
            autoSave(updated);
        });

        frame.open();
    };

    // Add this function near the top of your StoreSettings component
	const synchronizeAddressData = (formData: any) => {
		const synchronized = { ...formData };
		
		// Ensure address is always populated from location_address if empty
		if ((!synchronized.address || synchronized.address.trim() === '') && synchronized.location_address) {
			synchronized.address = synchronized.location_address;
		}
		
		// Ensure location_address is set if we have coordinates but no location_address
		if ((synchronized.location_lat && synchronized.location_lng) && !synchronized.location_address) {
			synchronized.location_address = synchronized.address || 'Location set';
		}
		
		return synchronized;
	};

	// Then update your autoSave function:
	const autoSave = (updatedData: any) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
			}
		}).catch((error) => {
			console.error('Save error:', error);
			setErrorMsg('Failed to save store data');
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
        <>
            {successMsg && (
                <>
                    <div className="admin-notice-wrapper">
                        <i className="admin-font adminlib-icon-yes"></i>
                        <div className="notice-details">
                            <div className="title">Great!</div>
                            <div className="desc">{successMsg}</div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Debug Info - You can remove this in production */}
            <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '15px', borderRadius: '4px', fontSize: '12px' }}>
                <div>Debug Info:</div>
                <div>Store ID: {id}</div>
                <div>Map Provider: {mapProvider}</div>
                <div>Google Maps: {googleLoaded ? 'Loaded' : 'Loading...'}</div>
                <div>Mapbox: {mapboxLoaded ? 'Loaded' : 'Loading...'}</div>
                <div>Map: {map ? 'Initialized' : 'Not initialized'}</div>
                <div>Address: {formData.address || 'N/A'}</div>
            </div>
            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="card-title">
                            Store information
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Name</label>
                                <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Slug</label>
                                <BasicInput name="slug" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.slug} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Email</label>
                                <BasicInput type="email" name="email" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="card-title">
                            Description
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <TextArea name="description" wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description" value={formData.description} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="card-title">
                            Location & Map
                        </div>

                        {/* Location Search */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="store-location-autocomplete">Search Location</label>
                                <div id="store-location-autocomplete-container">
                                    <input
                                        ref={autocompleteInputRef}
                                        id="store-location-autocomplete"
                                        type="text"
                                        className="setting-form-input"
                                        placeholder="Start typing your store address..."
                                        defaultValue={formData.location_address}
                                    />
                                </div>
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    Type your store name or address and select from suggestions
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

                        {/* Hidden coordinates */}
                        <input type="hidden" name="location_lat" value={formData.location_lat || ''} />
                        <input type="hidden" name="location_lng" value={formData.location_lng || ''} />
                        <input type="hidden" name="location_address" value={formData.location_address || ''} />
                    </div>

                    <div className="card-content">
                        <div className="card-title">
                            Basic information
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Phone</label>
                                <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Address *</label>
								<BasicInput 
									name="location_address"  // Change from "address" to "location_address"
									value={formData.location_address} 
									wrapperClass="setting-form-input" 
									descClass="settings-metabox-description" 
									onChange={handleChange} 
								/>
								{!formData.location_address && (
									<small style={{ color: 'orange', marginTop: '5px', display: 'block' }}>
										Address is required. Please select a location from the map or search.
									</small>
								)}
							</div>
						</div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">City</label>
                                <BasicInput name="city" value={formData.city} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="product-name">Zip Code</label>
                                <BasicInput name="zip" value={formData.zip} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Country</label>
                                <SelectInput
                                    name="country"
                                    value={formData.country}
                                    options={appLocalizer.country_list || []}
                                    type="single-select"
                                    onChange={(newValue: any) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, country: newValue.value, state: '' };
                                        setFormData(updated);
                                        autoSave(updated);
                                        fetchStatesByCountry(newValue.value);
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="product-name">State</label>
                                <SelectInput
                                    name="state"
                                    value={formData.state}
                                    options={stateOptions}
                                    type="single-select"
                                    onChange={(newValue: { value: any; }) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, state: newValue.value };
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-wrapper width-35">
                    <div className="card-content">
                        <div className="card-title">
                            Store Media
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Profile Image</label>
                                <FileInput
                                    value={formData.image}
                                    inputClass="form-input"
                                    name="image"
                                    type="hidden"
                                    onButtonClick={() => runUploader('image')}
                                    imageWidth={75}
                                    imageHeight={75}
                                    openUploader="Upload Image"
                                    imageSrc={imagePreviews.image}
                                    buttonClass="admin-btn btn-purple"
                                    descClass="settings-metabox-description"
                                    onRemove={() => {
                                        const updated = { ...formData, image: '' };
                                        setFormData(updated);
                                        setImagePreviews((prev) => ({ ...prev, image: '' }));
                                        autoSave(updated);
                                    }}
                                    onReplace={() => runUploader('image')}
                                />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Banner Image</label>
                                <FileInput
                                    value={formData.banner}
                                    inputClass="form-input"
                                    name="banner"
                                    type="hidden"
                                    onButtonClick={() => runUploader('banner')}
                                    imageWidth={75}
                                    imageHeight={75}
                                    openUploader="Upload Image"
                                    imageSrc={imagePreviews.banner}
                                    buttonClass="admin-btn btn-purple"
                                    descClass="settings-metabox-description"
                                    onRemove={() => {
                                        const updated = { ...formData, banner: '' };
                                        setFormData(updated);
                                        setImagePreviews((prev) => ({ ...prev, banner: '' }));
                                        autoSave(updated);
                                    }}
                                    onReplace={() => runUploader('banner')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="card-title">Social information</div>
                        {/* Facebook */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="facebook"><i className="adminlib-supervised-user-circle"></i> Facebook</label>
                                <BasicInput
                                    name="facebook"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* x */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="twitter"><i className="adminlib-supervised-user-circle"></i> X</label>
                                <BasicInput
                                    name="twitter"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="linkedin"><i className="adminlib-supervised-user-circle"></i> LinkedIn</label>
                                <BasicInput
                                    name="linkedin"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* YouTube */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="youtube"><i className="adminlib-supervised-user-circle"></i> YouTube</label>
                                <BasicInput
                                    name="youtube"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.youtube}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Instagram */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="instagram"><i className="adminlib-supervised-user-circle"></i> Instagram</label>
                                <BasicInput
                                    name="instagram"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StoreSettings;

function setErrorMsg(arg0: string) {
	throw new Error('Function not implemented.');
}
