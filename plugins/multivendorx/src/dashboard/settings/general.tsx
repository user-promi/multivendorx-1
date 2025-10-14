import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, SuccessNotice, getApiLink } from 'zyra';

const GeneralSettings = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);

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

    const fetchStatesByCountry = (countryCode: string) => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `states/${countryCode}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            setStateOptions(res.data || []);
        });
    };

    //Fixed: Corrected name and dynamic binding
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const autoSave = (updatedData: { [key: string]: any }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data?.success) {
                setSuccessMsg('Store saved successfully!');
            }
        });
    };

    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="settings-metabox-note">
                        <i className="adminlib-info"></i>
                        <p>Confirm that you have access to johndoe@gmail.com in sender email settings.</p>
                    </div>
                    <div className="card-title">
                        Basic information
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="store-name">Name</label>
                            {/* ✅ Fixed: Correct field name */}
                            <BasicInput
                                name="name"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.name || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="store-slug">Slug</label>
                            {/* ✅ Fixed: Correct field name */}
                            <BasicInput
                                name="slug"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.slug || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="store-description">Description</label>
                            <TextArea
                                name="description"
                                inputClass="textarea-input"
                                value={formData.description || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="message-to-buyer">Message to Buyers</label>
                            {/* ✅ Fixed: Correct field name */}
                            <BasicInput
                                name="messageToBuyer"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.messageToBuyer || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <SuccessNotice message={successMsg} />
                </div>
            </div>
        </>
    );
};

export default GeneralSettings;
