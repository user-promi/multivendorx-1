import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

declare global {
  interface Window {
    google: any;
  }
}

const BusinessAddress = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [autocomplete, setAutocomplete] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData((prev) => ({ ...prev, ...data }));
            })
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

    // Initialize Google Maps and Autocomplete
    useEffect(() => {
        if (!window.google) {
            loadGoogleMapsScript();
        } else {
            initializeAutocompleteAndMap();
        }
    }, []);

    const loadGoogleMapsScript = () => {
        const apiKey = appLocalizer.google_maps_api_key; // Make sure to pass this from WordPress
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeAutocompleteAndMap;
        document.head.appendChild(script);
    };

    const initializeAutocompleteAndMap = () => {
        // Initialize Autocomplete
        const autocompleteInput = document.getElementById('location-autocomplete') as HTMLInputElement;
        if (autocompleteInput && window.google) {
            const autocompleteInstance = new window.google.maps.places.Autocomplete(autocompleteInput, {
                types: ['establishment', 'geocode'],
                fields: ['address_components', 'geometry', 'name', 'formatted_address']
            });

            autocompleteInstance.addListener('place_changed', () => {
                const place = autocompleteInstance.getPlace();
                if (place.geometry) {
                    handlePlaceSelect(place);
                }
            });

            setAutocomplete(autocompleteInstance);
        }

        // Initialize Map
        const mapElement = document.getElementById('location-map');
        if (mapElement) {
            const mapInstance = new window.google.maps.Map(mapElement, {
                center: { lat: 40.7128, lng: -74.0060 }, // Default to New York
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
            });

            const markerInstance = new window.google.maps.Marker({
                map: mapInstance,
                draggable: true,
            });

            markerInstance.addListener('dragend', () => {
                const position = markerInstance.getPosition();
                if (position) {
                    reverseGeocode(position.lat(), position.lng());
                }
            });

            setMap(mapInstance);
            setMarker(markerInstance);
        }
    };

    const handlePlaceSelect = (place: any) => {
        const location = place.geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        // Update map
        if (map && marker) {
            map.setCenter({ lat, lng });
            map.setZoom(17);
            marker.setPosition({ lat, lng });

            // Extract address components
            const addressComponents = extractAddressComponents(place);
            
            const updated = { 
                ...formData, 
                location_address: place.formatted_address,
                location_lat: lat.toString(),
                location_lng: lng.toString(),
                ...addressComponents
            };
            
            setFormData(updated);
            autoSave(updated);
        }
    };

    const reverseGeocode = (lat: number, lng: number) => {
        if (!window.google) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
                const addressComponents = extractAddressComponents(results[0]);
                const updated = {
                    ...formData,
                    location_address: results[0].formatted_address,
                    location_lat: lat.toString(),
                    location_lng: lng.toString(),
                    ...addressComponents
                };
                setFormData(updated);
                autoSave(updated);
            }
        });
    };

    const extractAddressComponents = (place: any) => {
        const components: { [key: string]: string } = {};
        
        place.address_components.forEach((component: any) => {
            const types = component.types;
            if (types.includes('street_number')) {
                components.address_line1 = component.long_name;
            } else if (types.includes('route')) {
                components.address_line1 = (components.address_line1 || '') + ' ' + component.long_name;
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

    const autoSave = (updatedData: { [key: string]: string }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        })
    };

    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-title">Business Address & Location</div>
                    
                    {/* Location Search with Autocomplete */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="location-autocomplete">Search Location</label>
                            <input
                                id="location-autocomplete"
                                type="text"
                                className="setting-form-input"
                                placeholder="Start typing your business address..."
                                defaultValue={formData.location_address}
                            />
                            <p className="settings-metabox-description">
                                Start typing your business name or address to search
                            </p>
                        </div>
                    </div>

                    {/* Map Display */}
                    <div className="form-group-wrapper">
                        <div className="form-group" style={{ width: '100%' }}>
                            <label>Location Map</label>
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
                            <p className="settings-metabox-description">
                                Drag the marker to adjust your exact location
                            </p>
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <BasicInput 
                                name="address" 
                                value={formData.address} 
                                wrapperClass="setting-form-input" 
                                descClass="settings-metabox-description" 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <BasicInput 
                                name="city" 
                                value={formData.city} 
                                wrapperClass="setting-form-input" 
                                descClass="settings-metabox-description" 
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <BasicInput 
                                name="state" 
                                value={formData.state} 
                                wrapperClass="setting-form-input" 
                                descClass="settings-metabox-description" 
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="country">Country</label>
                            <BasicInput 
                                name="country" 
                                value={formData.country} 
                                wrapperClass="setting-form-input" 
                                descClass="settings-metabox-description" 
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="zip">Zip</label>
                            <BasicInput 
                                name="zip" 
                                value={formData.zip} 
                                wrapperClass="setting-form-input" 
                                descClass="settings-metabox-description" 
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="timezone">Timezone</label>
                            <BasicInput 
                                name="timezone" 
                                value={formData.timezone} 
                                wrapperClass="setting-form-input" 
                                descClass="settings-metabox-description" 
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    {/* Hidden fields for coordinates */}
                    <input type="hidden" name="location_lat" value={formData.location_lat} />
                    <input type="hidden" name="location_lng" value={formData.location_lng} />
                    
                </div>
            </div>
        </>
    );
};

export default BusinessAddress;