import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, useModules, getApiLink, SuccessNotice } from 'zyra';
import { __ } from '@wordpress/i18n';

const ContactInformation = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
    const settings = appLocalizer.settings_databases_value['store-capability']?.edit_store_info_activation || [];
    const { modules } = useModules();

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
            <div className="form-group-wrapper">
                <div className="form-group">
                    <label htmlFor="phone">{__('Phone', 'multivendorx')}</label>
                    <BasicInput
                        name="phone"
                        value={formData.phone}
                        wrapperClass="setting-form-input"
                        descClass="settings-metabox-description"
                        onChange={handleChange}
                        readOnly={settings.includes('store_contact')}
                    />
                </div>
            </div>

            <div className="form-group-wrapper">
                <div className="form-group">
                    <label htmlFor="email">{__('Email / Additional Email', 'multivendorx')}</label>
                    <BasicInput
                        type="email"
                        name="email"
                        wrapperClass="setting-form-input"
                        descClass="settings-metabox-description"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={settings.includes('store_contact')}
                    />
                </div>
            </div>

            {modules.includes('live-chat') && (
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="live_chat">{__('Live Chat (Enable, WhatsApp, etc.)', 'multivendorx')}</label>
                        <BasicInput
                            name="live_chat"
                            wrapperClass="setting-form-input"
                            descClass="settings-metabox-description"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ContactInformation;
