// /* global appLocalizer */
import React, { useEffect, useState, JSX } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
import { getTemplateData } from '../../services/templateService';
import {
    getAvailableSettings,
    getSettingById,
    AdminForm,
    Tabs,
    useModules,
} from 'zyra';

// Types
type SettingItem = Record<string, any>;

const MultivendorxProFeatures: React.FC = () => {
    const location = new URLSearchParams(useLocation().hash.substring(1));
    const initialTab = location.get('tabId') || 'product-types';

    const settingsArray: SettingItem[] = getAvailableSettings(
        getTemplateData('membership'),
        []
    );

    const tabData = [
        {
            type: 'file',
            content: {
                id: 'product-types',
                name: 'Product Types',
                desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
                // hideTabHeader: true,
                icon: 'pending',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store-management-tools',
                name: 'Store Management Tools',
                desc: 'The store application has been rejected. Sellers can view the rejection reason and resubmit their application after addressing the issues.',
                // hideTabHeader: true,
                icon: 'rejecte',
            },
        },
        {
            type: 'file',
            content: {
                id: 'sales-marketing',
                name: 'Sales & Marketing',
                desc: 'The store application has been permanently rejected. Sellers can view their dashboard in read-only mode but cannot make changes or reapply without admin intervention.',
                // hideTabHeader: true,
                icon: 'rejected',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-gateways',
                name: 'Payment Gateways',
                desc: 'The store is active and fully operational. Stores have complete access to manage products, process orders, receive payouts, and configure all store settings.',
                // hideTabHeader: true,
                icon: 'active',
            },
        },
        {
            type: 'file',
            content: {
                id: 'communication-documents',
                name: 'Communication & Documents',
                desc: 'The store is under review due to compliance concerns. Selling is paused, payouts are held, and new product uploads are restricted until the review is complete.',
                // hideTabHeader: true,
                icon: 'under-review',
            },
        },
        {
            type: 'file',
            content: {
                id: 'third-party-integrations',
                name: 'Third-Party Integrations',
                desc: 'The store has been suspended due to policy violations. Products are hidden, payouts are frozen, and selling is disabled. Sellers can appeal through support.',
                // hideTabHeader: true,
                icon: 'error',
            },
        },
    ];

    const GetForm = (currentTab: string | null): JSX.Element | null => {
        const { setting, settingName, setSetting, updateSetting } =
            useSetting();
        const { modules } = useModules();
        const [storeTabSetting, setStoreTabSetting] = useState<any>(null);

        if (!currentTab) {
            return null;
        }

        const settingModal = getSettingById(settingsArray as any, currentTab);

        // Initialize settings for current tab
        if (settingName !== currentTab) {
            setSetting(
                currentTab,
                appLocalizer.settings_databases_value[currentTab] || {}
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
        <SettingProvider>
            <div className="horizontal-tabs">
                <Tabs
                    tabData={tabData as any}
                    currentTab={initialTab}
                    getForm={GetForm}
                    prepareUrl={(tabid: string) =>
                        `?page=multivendorx#&tab=memberships&subtab=multivendorx-pro-features&tabId=${tabid}`
                    }
                    appLocalizer={appLocalizer}
                    settingName="Settings"
                    supprot={[]}
                    Link={Link}
                    submenuRender={true}
                    menuIcon={true}
                />
            </div>
        </SettingProvider>
    );
};

export default MultivendorxProFeatures;