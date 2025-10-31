import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, getApiLink, SuccessNotice, SelectInput, useModules } from 'zyra';

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

interface EmailBadge {
    id: number;
    email: string;
    isValid: boolean;
}

const StoreSettings = ({ id }: { id: string | null }) => {
    const [formData, setFormData] = useState<FormData>({});
    const [emailBadges, setEmailBadges] = useState<EmailBadge[]>([]);
    const [newEmailValue, setNewEmailValue] = useState('');
    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Map states
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
    const [mapboxLoaded, setMapboxLoaded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const [mapProvider, setMapProvider] = useState('');
    const [apiKey, setApiKey] = useState('');
    const appLocalizer = (window as any).appLocalizer;
    const { modules } = useModules.getState();


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

    // Initialize email badges from form data
    useEffect(() => {
        if (formData.email) {
            // Parse existing emails - handle both comma-separated and newline-separated
            const emailString = formData.email;
            const emails = emailString.split(/[,\n]/)
                .map(email => email.trim())
                .filter(email => email !== '');

            const badges = emails.map((email, index) => ({
                id: index + 1,
                email: email,
                isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            }));

            setEmailBadges(badges);
        } else {
            setEmailBadges([]);
        }
    }, [formData.email]);

    // Load store data
    useEffect(() => {
        if (!id || !appLocalizer) {
            console.error('Missing store ID or appLocalizer');
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

                // Set all form data
                setFormData((prev) => ({ ...prev, ...data }));

                // Set address-specific data
                setAddressData({
                    location_address: data.location_address || data.address || '',
                    location_lat: data.location_lat || '',
                    location_lng: data.location_lng || '',
                    address: data.address || data.location_address || '',
                    city: data.city || '',
                    state: data.state || '',
                    country: data.country || '',
                    zip: data.zip || '',
                    timezone: data.timezone || ''
                });

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

    // Add email function
    const addEmail = () => {
        if (!newEmailValue.trim()) return;

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailValue.trim());

        if (!isValidEmail) {
            setErrorMsg("Invalid email format");
            return;
        }

        const newBadge: EmailBadge = {
            id: Math.max(...emailBadges.map(b => b.id), 0) + 1,
            email: newEmailValue.trim(),
            isValid: true
        };

        const updatedBadges = [...emailBadges, newBadge];
        setEmailBadges(updatedBadges);

        // Update form data with newline-separated emails
        const emailString = updatedBadges.map(badge => badge.email).join('\n');
        const updatedFormData = { ...formData, email: emailString };
        setFormData(updatedFormData);

        setNewEmailValue('');
        setErrorMsg(null);
        autoSave(updatedFormData);
    };

    // Remove email function
    const removeEmail = (id: number) => {
        const updatedBadges = emailBadges.filter(badge => badge.id !== id);
        setEmailBadges(updatedBadges);

        // Update form data
        const emailString = updatedBadges.map(badge => badge.email).join('\n');
        const updatedFormData = { ...formData, email: emailString };
        setFormData(updatedFormData);

        autoSave(updatedFormData);
    };

    // Handle Enter key in email input
    const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEmail();
        }
    };

    // Email Badge Component
    const EmailBadge: React.FC<{ badge: EmailBadge; onRemove: (id: number) => void }> = ({ badge, onRemove }) => {
        return (
            <div className={`admin-badge ${badge.isValid ? 'green' : 'red'}`}>
                <i className="adminlib-mail"></i>
                <span>{badge.email}</span>
                <i
                    className="adminlib-close remove-btn"
                    onClick={() => onRemove(badge.id)}
                // style={{ cursor: 'pointer', marginLeft: '8px' }}
                ></i>
            </div>
        );
    };

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

        // Update both address data and form data
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

        setAddressData(newAddressData);

        // Merge with existing form data
        const updatedFormData = {
            ...formData,
            ...newAddressData
        };

        setFormData(updatedFormData);
        autoSave(updatedFormData);
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

                // Build street address
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
        }

        return components;
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        const newAddressData = {
            ...addressData,
            [name]: value
        };

        setAddressData(newAddressData);

        // Also update formData to maintain consistency
        const updatedFormData = {
            ...formData,
            [name]: value
        };

        setFormData(updatedFormData);
        autoSave(updatedFormData);
    };

    // Handle country select change (from old code)
    const handleCountryChange = (newValue: any) => {
        if (!newValue || Array.isArray(newValue)) return;

        const updated = {
            ...formData,
            country: newValue.value,
            state: '' // reset state when country changes
        };

        setFormData(updated);
        autoSave(updated);
        fetchStatesByCountry(newValue.value);
    };

    // Handle state select change (from old code)
    const handleStateChange = (newValue: any) => {
        if (!newValue || Array.isArray(newValue)) return;

        const updated = {
            ...formData,
            state: newValue.value
        };

        setFormData(updated);
        autoSave(updated);
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

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     const { name, value } = e.target;
    //     const updated = { ...formData, [name]: value };
    //     setFormData(updated);

    //     // if (name === "email") {
    //     //     const emails = value.split(',').map(email => email.trim());

    //     //     // Allow empty field (when user is deleting)
    //     //     if (value === '' || emails.length === 0) {
    //     //         updated.email = '';
    //     //         autoSave(updated);
    //     //         setErrorMsg(null);
    //     //         return;
    //     //     }

    //     //     const isValidEmail = emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    //     //     if (isValidEmail && emails.length > 0) {
    //     //         // Update the email field with the validated comma-separated emails
    //     //         updated.email = emails.join(', ');
    //     //         autoSave(updated);
    //     //         setErrorMsg(null);
    //     //     } else {
    //     //         setErrorMsg("Invalid email format. Please enter valid email(s) separated by commas.");
    //     //     }
    //     // }
    //     if (name === "email") {
    //         const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    //         if (isValidEmail) {
    //             autoSave(updated);
    //             setErrorMsg(null);
    //         } else {
    //             setErrorMsg("Invalid email");
    //         }
    //     } 
    //     else if (name === "phone") {
    //         // ✅ Basic international phone pattern: allows +, spaces, hyphens, and digits (7–15 length)
    //         const isValidPhone = /^\+?[0-9\s\-]{7,15}$/.test(value);
    //         if (isValidPhone) {
    //             autoSave(updated);
    //             setErrorMsg(null);
    //         } else {
    //             setErrorMsg("Invalid phone number");
    //         }
    //     } else {
    //         autoSave(updated);
    //     }

    // };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);

        if (name === "phone") {
            const isValidPhone = /^\+?[0-9\s\-]{7,15}$/.test(value);
            if (isValidPhone) {
                autoSave(updated);
                setErrorMsg(null);
            } else {
                setErrorMsg("Invalid phone number");
            }
        } else if (name !== "email") { // Skip auto-save for email as we handle it separately
            autoSave(updated);
        }
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

    // Then update your autoSave function:
    const autoSave = (updatedData: any) => {
        // Format email data for backend
        const formattedData = { ...updatedData };

        if (formattedData.email && typeof formattedData.email === 'string') {
            // Convert newline-separated emails to array for backend
            formattedData.emails = formattedData.email
                .split('\n')
                .map((email: string) => email.trim())
                .filter((email: string) => email !== '');
        }

        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: formattedData,
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        }).catch((error) => {
            console.error('Save error:', error);
        });
    };

    return (
        <>
            <SuccessNotice message={successMsg} />
            <div className="container-wrapper ">
                <div className="card-wrapper w-65">

                    {/* <div className="card-content">
                        <div className="card-title">
                            Basic Details
                        </div>

                        {errorMsg && <p className="error-text" style={{ color: "red", marginTop: "5px" }}>{errorMsg}</p>}

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Name</label>
                                <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Slug</label>
                                <BasicInput
                                    name="slug"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                                <p>Your Site Url : {appLocalizer.store_page_url + '/' + formData.slug}</p>
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <TextArea name="description" wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    usePlainText={false}
                                    tinymceApiKey={appLocalizer.settings_databases_value['marketplace-settings']['tinymce_api_section'] ?? ''}
                                />
                            </div>
                        </div>
                    </div> */}

                    <div className="card-content">
                        <div className="card-title">
                            Contact Information
                        </div>


                        {/* Updated Email Section */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="store-email">Store Email(s)</label>
                                <div className="email-input-container">
                                    <div className="email-badges-container" >
                                        {emailBadges.map(badge => (
                                            <EmailBadge
                                                key={badge.id}
                                                badge={badge}
                                                onRemove={removeEmail}
                                            />
                                        ))}
                                    </div>
                                    <div className="drawer-add-recipient" >
                                        <input
                                            ref={emailInputRef}
                                            type="email"
                                            className="basic-input"
                                            placeholder="Enter email and press Enter"
                                            value={newEmailValue}
                                            onChange={(e) => setNewEmailValue(e.target.value)}
                                            onKeyPress={handleEmailKeyPress}
                                        />
                                        <button
                                            className="admin-btn btn-purple"
                                            onClick={addEmail}
                                            type="button"
                                        >
                                            <i className="adminlib-plus-circle-o"></i>
                                            Add
                                        </button>
                                    </div>
                                </div>
                                {errorMsg && <p className="invalid-feedback">{errorMsg}</p>}
                                <div className="settings-metabox-description">
                                    Add multiple email addresses. Press Enter or click Add after each email.
                                </div>
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Phone</label>
                                <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                        </div>

                        {/* Hidden coordinates */}
                        <input type="hidden" name="location_lat" value={addressData.location_lat} />
                        <input type="hidden" name="location_lng" value={addressData.location_lng} />
                    </div>

                    <div className="card-content">
                        <div className="card-title">
                            Communication Address
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="location_address">Address *</label>
                                <BasicInput
                                    name="location_address"
                                    value={addressData.location_address}
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    onChange={handleAddressChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <BasicInput
                                    name="city"
                                    value={addressData.city}
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="zip">Zip Code</label>
                                <BasicInput
                                    name="zip"
                                    value={addressData.zip}
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    onChange={handleAddressChange}
                                />
                            </div>
                        </div>

                        {/* Country and State Select Inputs (from old code) */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Country</label>
                                <SelectInput
                                    name="country"
                                    value={formData.country}
                                    options={appLocalizer.country_list || []}
                                    type="single-select"
                                    onChange={handleCountryChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="product-name">State</label>
                                <SelectInput
                                    name="state"
                                    value={formData.state}
                                    options={stateOptions}
                                    type="single-select"
                                    onChange={handleStateChange}
                                />
                            </div>
                        </div>

                        {modules.includes('geo-location') &&
                            <div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="store-location-autocomplete">Search Location</label>
                                        <div id="store-location-autocomplete-container">
                                            <input
                                                ref={autocompleteInputRef}
                                                id="store-location-autocomplete"
                                                type="text"
                                                className="setting-form-input"
                                                placeholder="Search your store address..."
                                                defaultValue={addressData.location_address}
                                            />
                                        </div>
                                    </div>
                                </div>
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
                                    {/* Hidden coordinates */}
                                    <input type="hidden" name="location_lat" value={addressData.location_lat} />
                                    <input type="hidden" name="location_lng" value={addressData.location_lng} />
                                </div>
                            </div>
                        }
                        {/* Map Display */}
                        <div className="form-group-wrapper">
                            {/* <div className="form-group">
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
							</div> */}
                            {/* Hidden coordinates */}
                            {/* <input type="hidden" name="location_lat" value={addressData.location_lat} />
                            <input type="hidden" name="location_lng" value={addressData.location_lng} /> */}
                        </div>
                    </div>
                </div>

                <div className="card-wrapper w-35">
                    <div className="card-content">
                        <div className="card-title">
                            Status
                        </div>

                        {/* Updated Email Section */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="store-email">Status</label>
                                <select
                                    // value={data.status}
                                    // onChange={(e) => setData({ ...data, status: e.target.value })}
                                    className="basic-select"
                                >
                                    <option value="Approved">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Disapproved">Disapproved</option>
                                </select>
                                <div className="settings-metabox-description">
                                    Add multiple email addresses. Press Enter or click Add after each email.
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="card-content">
                        <div className="card-title">Social information</div>
                        {/* Facebook */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="facebook"><i className="adminlib-facebook-fill"></i> Facebook</label>
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
                                <label htmlFor="twitter"><i className="adminlib-twitter"></i> X</label>
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
                                <label htmlFor="linkedin"><i className="adminlib-linkedin-border"></i> LinkedIn</label>
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
                                <label htmlFor="youtube"><i className="adminlib-youtube"></i> YouTube</label>
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