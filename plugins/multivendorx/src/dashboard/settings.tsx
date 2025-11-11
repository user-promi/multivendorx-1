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
import DeactivateRequest from './settings/DeactivateRequest';

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
        {
            type: 'file',
            content: {
                id: 'deactivate',
                name: 'Deactivated Request',
                desc: 'Deactivated Request',
                hideTabHeader: true,
                icon: 'tools',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'general':
                return <GeneralSettings />;
            case 'appearance':
                return <Appearance />;
            case 'business-address':
                return <BusinessAddress />;
            case 'contact-information':
                return <ContactInformation />;
            case 'social-media':
                return <SocialMedia />;
            case 'payout':
                return <Withdrawl />;
            case 'privacy':
                return <Privacy />;
            case 'shipping':
                return <ShippingDelivery />;
            case 'verification':
                return <Verification />;
            case 'livechat':
                return <LiveChat/>;
            case 'deactivate':
                return <DeactivateRequest/>;
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
                submenuRender={true} />
        </>
    );
};

export default settings;