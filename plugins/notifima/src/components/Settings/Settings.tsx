// /* global appLocalizer */
import Brand from '../../assets/images/brand-logo.png';
import BrandSmall from '../../assets/images/brand-icon.png';
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';
// Context
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
// Services
import { getTemplateData } from '../../services/templateService';
// Utils
import {
    getAvailableSettings,
    getSettingById,
    SettingContent,
    Support,
    AdminForm,
    Banner,
    Tabs,
} from 'zyra';
import { useModules } from '../../contexts/ModuleContext';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

// Types
type SettingItem = Record< string, any >;

interface SettingsProps {
    id: string;
}

interface Products {
    title: string;
    description: string;
}

const supportLink = [
    {
        title: __( 'Get in touch with Support', 'notifima' ),
        icon: 'adminlib-mail',
        description: __(
            'Reach out to the support team for assistance or guidance.',
            'notifima'
        ),
        link: 'https://notifima.com/contact-us/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima',
    },
    {
        title: __( 'Explore Documentation', 'notifima' ),
        icon: 'adminlib-submission-message',
        description: __(
            'Understand the plugin and its settings.',
            'notifima'
        ),
        link: 'https://notifima.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima',
    },
    {
        title: __( 'Contribute Here', 'notifima' ),
        icon: 'adminlib-support',
        description: __( 'Participate in product enhancement.', 'notifima' ),
        link: 'https://github.com/multivendorx/multivendorx/issues/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima',
    },
];

const products: Products[] = [
    {
        title: __( 'Double Opt-In', 'notifima' ),
        description: __(
            'Experience the power of Double Opt-In for our Stock Alert Form - Guaranteed precision in every notification!',
            'notifima'
        ),
    },
    {
        title: __( 'Your Subscription Hub', 'notifima' ),
        description: __(
            'Subscription Dashboard - Easily monitor and download lists of out-of-stock subscribers for seamless management.',
            'notifima'
        ),
    },
    {
        title: __( 'Mailchimp Bridge', 'notifima' ),
        description: __(
            'Seamlessly link WooCommerce out-of-stock subscriptions with Mailchimp for effective marketing.',
            'notifima'
        ),
    },
    {
        title: __( 'Unsubscribe Notifications', 'notifima' ),
        description: __(
            'User-Initiated Unsubscribe from In-Stock Notifications.',
            'notifima'
        ),
    },
    {
        title: __( 'Ban Spam Emails', 'notifima' ),
        description: __(
            'Email and Domain Blacklist for Spam Prevention.',
            'notifima'
        ),
    },
];

const faqs = [
    {
        question: __(
            'Why am I not receiving any emails when a customer subscribes for an out-of-stock product?',
            'notifima'
        ),
        answer: __(
            'Please install a plugin like Email Log and perform a test subscription.',
            'notifima'
        ),
        open: true,
    },
    {
        question: __(
            'Why is the out-of-stock form not appearing?',
            'notifima'
        ),
        answer: __(
            'There might be a theme conflict issue. To troubleshoot, switch to a default theme like Twenty Twenty-Four and check if the form appears.',
            'notifima'
        ),
        open: false,
    },
    {
        question: __(
            'Does Product Stock Manager & Notifier support product variations?',
            'notifima'
        ),
        answer: __(
            'Yes, product variations are fully supported and editable from the Inventory Manager. Product Stock Manager & Notifier handles variable products with ease and uses an expandable feature to make managing variations clear and straightforward.',
            'notifima'
        ),
        open: false,
    },
    {
        question: __(
            'Do you support Google reCaptcha for the out-of-stock form?',
            'notifima'
        ),
        answer: __(
            'Yes, <a href="https://notifima.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" target="_blank">Product Stock Manager & Notifier Pro</a> has support for reCaptcha.',
            'notifima'
        ),
        open: false,
    },
];

const Settings: React.FC< SettingsProps > = () => {
    const settingsArray: SettingItem[] = getAvailableSettings(
        getTemplateData(),
        []
    );
    const location = new URLSearchParams( useLocation().hash.substring( 1 ) );

    const getBanner = () => {
        return (
            <Banner
                products={ products }
                isPro={ appLocalizer.khali_dabba }
                proUrl={ appLocalizer.pro_url }
                tag="Why Premium"
                buttonText="View Pricing"
            />
        );
    };
    // Render the dynamic form
    const GetForm = ( currentTab: string | null ): JSX.Element | null => {
        // get the setting context
        const { setting, settingName, setSetting, updateSetting } =
            useSetting();
        const { modules } = useModules();

        if ( ! currentTab ) return null;
        const settingModal = getSettingById( settingsArray as any, currentTab );

        // Ensure settings context is initialized
        if ( settingName !== currentTab ) {
            setSetting(
                currentTab,
                appLocalizer.settings_databases_value[ currentTab ] || {}
            );
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect( () => {
            if ( settingName === currentTab ) {
                appLocalizer.settings_databases_value[ settingName ] = setting;
            }
        }, [ setting, settingName, currentTab ] );

        // Special component
        if ( currentTab === 'faq' ) {
            return (
                <Support
                    title="Thank you for using Product Stock Manager & Notifier for WooCommerce"
                    subTitle="We want to help you enjoy a wonderful experience with all of our products."
                    url="https://www.youtube.com/embed/cgfeZH5z2dM?si=3zjG13RDOSiX2m1b"
                    faqData={ faqs }
                />
            );
        }

        return (
            <>
                { settingName === currentTab ? (
                    <AdminForm
                        settings={ settingModal as SettingContent }
                        proSetting={ appLocalizer.pro_settings_list }
                        setting={ setting }
                        updateSetting={ updateSetting }
                        appLocalizer={ appLocalizer }
                        modules={ modules }
                        Popup={ ShowProPopup }
                    />
                ) : (
                    <>Loading...</>
                ) }
            </>
        );
    };

    return (
        <SettingProvider>
            <Tabs
                tabData={ settingsArray as any }
                currentTab={ location.get( 'subtab' ) as string }
                getForm={ GetForm }
                BannerSection={ getBanner }
                prepareUrl={ ( subTab: string ) =>
                    `?page=notifima#&tab=settings&subtab=${ subTab }`
                }
                appLocalizer={ appLocalizer }
                brandImg={ Brand }
                smallbrandImg={ BrandSmall }
                supprot={ supportLink }
                Link={ Link }
            />
        </SettingProvider>
    );
};

export default Settings;
