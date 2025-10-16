import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, SuccessNotice, getApiLink, Tabs } from 'zyra';
import GeneralSettings from './settings/general';
import Appearance from './settings/Appearance';
import SocialMedia from './settings/SocialMedia';
import ContactInformation from './settings/ContactInformation';
import BusinessAddress from './settings/BusinessAddress';
import Withdrawl from './withdrawl';
import Privacy from './settings/Privacy';
import Verification from './settings/Verification';
import ShippingDelivery from './settings/ShippingDelivery';
import LiveChat from './settings/LiveChat';

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

    // const [activeTab, setActiveTab] = useState("general");

    // const settingTabs = [
    //     { id: "general", label: "General", icon: "tools", content: <GeneralSettings /> },
    //     { id: "appearance", label: "Appearance", icon: "appearance", content: <Appearance /> },
    //     { id: "business-address", label: "Business Address", icon: "form-address", content: <BusinessAddress /> },
    //     { id: "contact-information", label: "Contact Information", icon: "form-phone", content: <ContactInformation /> },
    //     { id: "social-media", label: "Social Media", icon: "cohort", content: <SocialMedia /> },


    //     { id: "payout", label: "Payout", icon: "tools", content: <Withdrawl /> },

    //     { id: "privacy", label: "Privacy", icon: "security", content: <Privacy /> },
    //     {
    //         id: "seo-visibility", label: "SEO & visibility", icon: "bulk-action", content:
    //             <>
    //                 <div className="card-wrapper">
    //                     <div className="card-content">
    //                         <div className="card-title">SEO & Visibility</div>
    //                         <div className="form-group-wrapper">
    //                             <div className="form-group">
    //                                 <label htmlFor="product-name">Meta Title</label>
    //                                 <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
    //                             </div>
    //                         </div>

    //                         <div className="form-group-wrapper">
    //                             <div className="form-group">
    //                                 <label htmlFor="product-name">Description</label>
    //                                 <TextArea
    //                                     name="content"
    //                                     inputClass="textarea-input"
    //                                     // value={formData.content}
    //                                     // onChange={handleChange}
    //                                 />
    //                             </div>
    //                         </div>
    //                         <div className="form-group-wrapper">
    //                             <div className="form-group">
    //                                 <label htmlFor="product-name">Keywords</label>
    //                                 <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
    //                             </div>
    //                         </div>
    //                         <div className="form-group-wrapper">
    //                             <div className="form-group">
    //                                 <label htmlFor="product-name">Tracking ID</label>
    //                                 <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </>
    //     },
    //     // {
    //     //     id: "Shipping", label: "Shipping", icon: "cart", content:
    //     //         <>
    //     //             <div className="card-wrapper">
    //     //                 <div className="card-content">
    //     //                     <div className="card-title">Shipping & Delivery</div>
    //     //                     <div className="form-group-wrapper">
    //     //                         <div className="form-group">
    //     //                             <label htmlFor="product-name">Shipping Zones</label>
    //     //                             <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
    //     //                         </div>
    //     //                     </div>

    //     //                     <div className="form-group-wrapper">
    //     //                         <div className="form-group">
    //     //                             <label htmlFor="product-name">Shipping Methods</label>
    //     //                             <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
    //     //                         </div>
    //     //                     </div>
    //     //                     <div className="form-group-wrapper">
    //     //                         <div className="form-group">
    //     //                             <label htmlFor="product-name">Delivery Preferences</label>
    //     //                             <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
    //     //                         </div>
    //     //                     </div>
    //     //                 </div>
    //     //             </div>
    //     //         </>
    //     // },
    //     { id: "shipping", label: "Shipping & Delivery", icon: "tools", content: <ShippingDelivery /> },
    //     { id: "verification", label: "Verification", icon: "tools", content: <Verification /> },
    //     { id: "livechat", label: "Livechat", icon: "tools", content: <Livechat /> },
    // ];
    // return (
    //     <>
    //         {successMsg && (
    //             <>
    //                 <div className="admin-notice-wrapper">
    //                     <i className="admin-font adminlib-icon-yes"></i>
    //                     <div className="notice-details">
    //                         <div className="title">Great!</div>
    //                         <div className="desc">{successMsg}</div>
    //                     </div>
    //                 </div>
    //             </>
    //         )}

    //         <div className="settings-tab-wrapper">
    //             <div className="left-side">
    //                 {settingTabs.map((tab) => (
    //                     <div
    //                         key={tab.id}
    //                         className={`title ${activeTab === tab.id ? "active" : ""}`}
    //                         onClick={() => setActiveTab(tab.id)}
    //                     >
    //                         <p><i className={`adminlib-${tab.icon}`}></i>{tab.label}</p>
    //                     </div>
    //                 ))}
    //             </div>
    //             <div className="content">
    //                 {settingTabs.map(
    //                     (tab) =>
    //                         activeTab === tab.id && (
    //                             <div key={tab.id} className="tab-panel">
    //                                 {tab.content}
    //                             </div>
    //                         )
    //                 )}
    //             </div>
    //         </div>
    //     </>
    // );

    const SimpleLink = ({ to, children, onClick, className }: any) => (
        <a href={to} onClick={onClick} className={className}>
            {children}
        </a>
    );

    const getCurrentTabFromUrl = () => {
        const hash = window.location.hash.replace(/^#/, "");
        const hashParams = new URLSearchParams(hash);
        return hashParams.get("subtab") || "general";
    };

    const [currentTab, setCurrentTab] = useState(getCurrentTabFromUrl());

    useEffect(() => {
        const handleHashChange = () => setCurrentTab(getCurrentTabFromUrl());
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // Build hash URL for a given tab
    const prepareUrl = (tabId: string) => `#subtab=${tabId}`;

    const tabData = [
        {
            type: 'file',
            content: {
                id: 'general',
                name: 'General',
                desc: 'general',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'appearance',
                name: 'Appearance',
                desc: 'appearance',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'business-address',
                name: 'Business Address',
                desc: 'business-address',
                hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'file',
            content: {
                id: 'contact-information',
                name: 'Contact Information',
                desc: 'contact-information',
                hideTabHeader: true,
                icon: 'form-phone',
            },
        },
        {
            type: 'file',
            content: {
                id: 'social-media',
                name: 'Social Media',
                desc: 'social-media',
                hideTabHeader: true,
                icon: 'cohort',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payout',
                name: 'Payout',
                desc: 'payout',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'privacy',
                name: 'Privacy',
                desc: 'privacy',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'shipping',
                name: 'Shipping',
                desc: 'shipping',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'verification',
                name: 'Verification',
                desc: 'verification',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'livechat',
                name: 'Livechat',
                desc: 'livechat',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'general':
                return <GeneralSettings/>;
            case 'appearance':
                return <Appearance/>;
            case 'business-address':
                return <BusinessAddress/>;
            case 'contact-information':
                return <ContactInformation/>;
            case 'social-media':
                return <SocialMedia/>;
            case 'payout':
                return <Withdrawl/>;
            case 'privacy':
                return <Privacy/>;
            case 'shipping':
                return <ShippingDelivery/>;
            case 'verification':
                return <Verification/>;
            case 'livechat':
                return <Livechat/>;
            default:
                return <div></div>;
        }
    };
    return (
        <>
            <Tabs
                tabData={tabData}
                currentTab={currentTab}
                getForm={getForm}
                prepareUrl={prepareUrl}
                appLocalizer={appLocalizer}
                settingName="Settings"
                supprot={[]} 
                Link={SimpleLink}
            />
        </>
    );
};

export default settings;
