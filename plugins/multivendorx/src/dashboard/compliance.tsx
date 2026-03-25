/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Card, Column, Container, Notice, SettingsNavigator } from 'zyra';

const Compliance = (React.FC = () => {
    const SimpleLink = ({ to, children, onClick, className }) => (
        <a href={to} onClick={onClick} className={className}>
            {children}
        </a>
    );

    const getCurrentTabFromUrl = () => {
        const hash = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hash);
        return hashParams.get('subtab') || 'product-compliance';
    };

    const [currentTab, setCurrentTab] = useState(getCurrentTabFromUrl());

    useEffect(() => {
        const handleHashChange = () => setCurrentTab(getCurrentTabFromUrl());
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Build hash URL for a given tab
    const prepareUrl = (tabId: string) => `#subtab=${tabId}`;

    const settingContent = [
         {
            type: 'file',
            content: {
                id: 'product-compliance',
                headerTitle: __('Product Compliance', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'tax-compliance',
                headerTitle: __('Tax Compliance ', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'my-products',
                headerTitle: __('My Products ', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'announcement',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'product-compliance':
                return (
                    <Container>
                        <Column grid={6}>
                            <Card 
                                title={__('Product Images & Descriptions', 'multivendorx')} 
                                desc={__('Each product listing must have at least one clear image and an accurate description matching the actual item being sold.', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge red">Incomplete</span>
                                    </>
                                }
                            >
                                <Notice
                                    type="info"
                                    displayPosition="notice"
                                    message={__('3 of your products are missing descriptions or have low-quality images. Fix them to avoid listing suspension.', 'multivendorx')}
                                />
                            </Card>
                            <Card 
                                title={__('Product Authenticity Certificates', 'multivendorx')} 
                                desc={__('Each product listing must have at least one clear image and an accurate description matching the actual item being sold.', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge red">Incomplete</span>
                                    </>
                                }
                            >
                                <Notice
                                    type="info"
                                    displayPosition="notice"
                                    message={__('3 of your products are missing descriptions or have low-quality images. Fix them to avoid listing suspension.', 'multivendorx')}
                                />
                            </Card>
                        </Column>

                        <Column grid={6}>
                            <Card 
                            title={__('Product Authenticity Certificates', 'multivendorx')} 
                                desc={__('Each product listing must have at least one clear image and an accurate description matching the actual item being sold.', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge red">Incomplete</span>
                                    </>
                                }>

                            </Card>
                        </Column>
                    </Container>
                );
            case 'tax-compliance':
               return "lldldaaaald";
            case 'my-products':
                return "lldafffldld";
            default:
                return <div></div>;
        }
    };
    return (
        <>
            <SettingsNavigator
                settingContent={settingContent}
                currentSetting={currentTab}
                getForm={getForm}
                prepareUrl={prepareUrl}
                menuIcon={true}
                appLocalizer={appLocalizer}
                settingName="Compliance"
                variant={'compact'}
                Link={SimpleLink}
            />
        </>
    );
});

export default Compliance;
