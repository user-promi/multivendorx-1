// /* global appLocalizer */
import React, { useEffect, useState, JSX } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SettingProvider, useSetting } from '../../../contexts/SettingContext';
import { getTemplateData } from '../../../services/templateService';
import {
    getAvailableSettings,
    getSettingById,
    AdminForm,
    Tabs,
    useModules,
} from 'zyra';

// Types
type SettingItem = Record<string, any>;

const StoreStatus: React.FC = () => {
    const location = new URLSearchParams(useLocation().hash.substring(1));
    const initialTab = location.get('tabId') || 'pending-approval';

    const settingsArray: SettingItem[] = getAvailableSettings(
        getTemplateData('storeStatus'),
        []
    );

    const tabData = [
        {
            type: 'heading',
            name: 'Activation Flow',
        },
        {
            type: 'file',
            content: {
                id: 'pending-approval',
                name: 'Pending Approval',
                desc: 'Stores awaiting admin review',
                // hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'rejected',
                name: 'Rejected',
                desc: 'Applications needing revision',
                // hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'permanently-rejected',
                name: 'Permanently Rejected',
                desc: 'Permanently denied applications.',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'heading',
            name: 'Post-Activation Flow',
        },
        {
            type: 'file',
            content: {
                id: 'active',
                name: 'Active',
                desc: 'Fully operational stores.',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'file',
            content: {
                id: 'under-review',
                name: 'Under Review',
                desc: 'Temporary compliance check.',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'file',
            content: {
                id: 'suspended',
                name: 'Suspended',
                desc: 'Policy violation enforcement',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'file',
            content: {
                id: 'deactivated',
                name: 'Deactivated',
                desc: 'Permanently closed',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
    ];

    const GetForm = (currentTab: string | null): JSX.Element | null => {
        const { setting, settingName, setSetting, updateSetting } = useSetting();
        const { modules } = useModules();
        const [storeTabSetting, setStoreTabSetting] = useState<any>(null);

        if (!currentTab) return null;

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
                    prepareUrl={ ( tabid: string ) =>
                        `?page=multivendorx#&tab=settings&subtab=store-status-control&tabId=${ tabid }`}
                    appLocalizer={appLocalizer}
                    settingName="Settings"
                    supprot={[]}
                    Link={Link}
                    submenuRender={true}
                />
            </div>
        </SettingProvider>
    );
};

export default StoreStatus;
