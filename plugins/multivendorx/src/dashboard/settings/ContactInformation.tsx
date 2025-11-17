import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink, SuccessNotice } from 'zyra';

const ContactInformation = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
    const settings = appLocalizer.settings_databases_value['store-capability']?.edit_store_info_activation || [];

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
            <SuccessNotice message={successMsg} />
            <div className="card-wrapper">
                <div className="card-content">
                    {/* <div className="card-title">Contact & Communication </div> */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Phone</label>
                            <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} readOnly={settings.includes('store_contact') ? true : false} />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Email / Additional Email</label>
                            <BasicInput type="email" name="email" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.email} onChange={handleChange} readOnly={settings.includes('store_contact') ? true : false} />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Live Chat (Enable, WhatsApp, etc.)</label>
                            <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactInformation;
