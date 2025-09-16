import { useState } from 'react';
import './storeRegistration.scss';
import { FormViewer, getApiLink } from 'zyra';
import axios from 'axios';

const RegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const formData = registrationForm;

    const onSubmit = (submittedFormData: Record<string, any>) => {
        setLoading(true);
    
        // Map form field keys to backend expected keys
        const mappedData: Record<string, any> = {};
    
        // Core fields
        if (submittedFormData['name']) mappedData['name'] = submittedFormData['name'];
        if (submittedFormData['description'] || submittedFormData['description'])
            mappedData['description'] = submittedFormData['description'] || submittedFormData['description'];
    
        // Optional: slug, who_created (if coming from form)
        if (submittedFormData['slug']) mappedData['slug'] = submittedFormData['slug'];
    
        // Other fields as meta
        Object.keys(submittedFormData).forEach((key) => {
            if (!['name', 'description', 'slug'].includes(key)) {
                mappedData[key] = submittedFormData[key];
            }
        });
        console.log(formData)
        // Send to API
        axios({
            method: 'POST',
            url: getApiLink(registrationForm, 'store'),
            headers: { 'X-WP-Nonce': registrationForm.nonce, "registrations": 'registrations'},
            data: {
                formData: mappedData,
            },
        })
        .then((response) => {
            console.log('Store created:', response.data);
            if ( response.data.redirect !== '' ) {
                window.location.href = response.data.redirect;
            }
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error creating store:', error);
            setLoading(false);
        });
    };
    

    return (
        <div className="enquiry-form-modal">
            {loading && (
                <section className="loader-wrapper">
                    <div className="loader-item">
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                    </div>
                </section>
            )}
            <div className="modal-wrapper">
                <div>{registrationForm.content_before_form}</div>

                <FormViewer
                    formFields={formData.settings}
                    onSubmit={onSubmit}
                />
                <div>{registrationForm.content_after_form}</div>
                {toast && (
                    <div className="admin-notice-display-title">
                        <i className="admin-font adminlib-icon-yes"></i>
                        {responseMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationForm;
