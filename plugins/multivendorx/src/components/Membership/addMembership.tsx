import { Link, useLocation } from 'react-router-dom';

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
    AdminForm,
    Tabs,
    useModules
} from 'zyra';

// Types
type SettingItem = Record< string, any >;

interface SettingsProps {
    id: string;
}


const Memberships = () => {
    const settingsArray: SettingItem[] = getAvailableSettings(
        getTemplateData('membership'),
        []
    );
    const location = new URLSearchParams( useLocation().hash.substring( 1 ) );
    // const location = useLocation();
    // const hash = location.hash.replace(/^#/, '');

    // const hashParams = new URLSearchParams(hash);
    // const currentTab = hashParams.get('subtab') || 'payment-membership-message';

    // const prepareUrl = (tabId: string) => `?page=multivendorx#&tab=memberships&subtab=${tabId}`;

    const tabData = [
        {
            type: 'file',
            content: {
                id: 'payment-membership-message',
                name: 'Message/ Mails',
                desc: 'PayPal MassPay lets you pay out a large number of affiliates very easily and quickly.',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-membership-design',
                name: 'Design Template',
                desc: 'PayPal Payout makes it easy for you to pay multiple sellers at the sametime.',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-membership-subscribers',
                name: 'Subscribers',
                desc: 'Connect to vendors stripe account and make hassle-free transfers as scheduled.',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-membership-plans',
                name: 'Plans',
                desc: 'Connect to vendors stripe account and make hassle-free transfers as scheduled',
                icon: 'adminlib-credit-card',
            },
        },
    ];

    // const getForm = (tabId: string) => {
    //     switch (tabId) {z
    //         case 'payment-membership-message':
    //             return <MessageAndMail id=''/>;
    //         case 'payment-membership-design':
    //             return <h1>design</h1>;
    //         case 'payment-membership-subscribers':
    //             return <h1>Subscriber</h1>;
    //         case 'payment-membership-plans':
    //             return <h1>Plans</h1>;
    //         default:
    //             return <div></div>;
    //     }
    // };

    const GetForm = (currentTab: string | null): JSX.Element | null => {
        // get the setting context
        const { setting, settingName, setSetting, updateSetting } =
            useSetting();
        const { modules } = useModules();

        if ( ! currentTab ) return null;
        const settingModal = getSettingById( settingsArray as any, currentTab );
        const [storeTabSetting, setStoreTabSetting] = React.useState<any>(null);

        // Ensure settings context is initialized
        if ( settingName !== currentTab ) {
            setSetting(
                currentTab,
                appLocalizer.settings_databases_value[ currentTab ] || {}
            );
        }

        useEffect(() => {
            if (settingName === currentTab) {
                appLocalizer.settings_databases_value[settingName] = setting;
            }

        }, [setting, settingName, currentTab]);

        return settingName === currentTab ? (
            <AdminForm
                settings={settingModal as any}
                proSetting={appLocalizer.pro_settings_list}
                setting={setting}
                updateSetting={updateSetting}
                appLocalizer={appLocalizer}
                modules={modules}
                storeTabSetting={storeTabSetting}
            />
        ) : (
            <>Loading...</>
        );
    };

    return (
        <>
        <SettingProvider>
           
                <Tabs
                    tabData={ settingsArray as any }
                    currentTab={ location.get( 'subtab' ) as string }
                    getForm={ GetForm }
                    prepareUrl={ ( subTab: string ) =>
                        `?page=multivendorx#&tab=memberships&subtab=${ subTab }`
                    }
                    appLocalizer={ appLocalizer }
                    supprot={[]}
                    Link={ Link }
                    settingName={'Memberships'}
                />
          
        </SettingProvider>
            {/* <Tabs
                tabData={tabData}
                currentTab={currentTab}
                getForm={getForm}
                prepareUrl={prepareUrl}
                appLocalizer={appLocalizer}
                Link={Link}
                settingName={'Memberships'}
            /> */}
        </>
    );
};

export default Memberships;
