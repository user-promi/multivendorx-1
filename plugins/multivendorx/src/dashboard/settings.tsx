import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';
import GeneralSettings from './settings/general';
import Appearance from './settings/Appearance';
import SocialMedia from './settings/SocialMedia';
import ContactInformation from './settings/ContactInformation';
import BusinessAddress from './settings/BusinessAddress';
import Withdrawl from './withdrawl';
import Privacy from './settings/Privacy';
import Verification from './settings/Verification';

const settings = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
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
    const [activeTab, setActiveTab] = useState("general");
    const settingTabs = [
        { id: "general", label: "General", icon: "tools", content: <GeneralSettings /> },
        { id: "appearance", label: "Appearance", icon: "appearance", content: <Appearance /> },
        { id: "business-address", label: "Business Address", icon: "form-address", content: <BusinessAddress /> },
        { id: "contact-information", label: "Contact Information", icon: "form-phone", content: <ContactInformation /> },
        { id: "social-media", label: "Social Media", icon: "cohort", content: <SocialMedia /> },
        { id: "payout", label: "Payout", icon: "tools", content: <Withdrawl /> },
        { id: "privacy", label: "Privacy", icon: "security", content: <Privacy /> },
        {
            id: "seo-visibility", label: "SEO & visibility", icon: "bulk-action", content:
                <>
                    <div className="card-wrapper">
                        <div className="card-content">
                            <div className="card-title">SEO & Visibility</div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Meta Title</label>
                                    <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Description</label>
                                    <TextArea
                                        name="content"
                                        inputClass="textarea-input"
                                        // value={formData.content}
                                        // onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Keywords</label>
                                    <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Tracking ID</label>
                                    <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
        },
        {
            id: "Shipping", label: "Shipping", icon: "cart", content:
                <>
                    <div className="card-wrapper">
                        <div className="card-content">
                            <div className="card-title">Shipping & Delivery</div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Shipping Zones</label>
                                    <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Shipping Methods</label>
                                    <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Delivery Preferences</label>
                                    <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
        },
        { id: "verification", label: "Verification", icon: "tools", content: <Verification /> },

    ];
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

            <div className="settings-tab-wrapper">
                <div className="left-side">
                    {settingTabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`title ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <p><i className={`adminlib-${tab.icon}`}></i>{tab.label}</p>
                        </div>
                    ))}
                </div>
                <div className="content">
                    {settingTabs.map(
                        (tab) =>
                            activeTab === tab.id && (
                                <div key={tab.id} className="tab-panel">
                                    {tab.content}
                                </div>
                            )
                    )}
                </div>
            </div>
        </>
    );
};

export default settings;
