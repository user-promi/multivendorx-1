/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Analytics, ButtonInputUI, Card, Column, Container, ItemListUI, Notice, SettingsNavigator } from 'zyra';
import Counter from '@/services/Counter';

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
    const overviewData = [
                        {
                            id: 'total_order_amount',
                            label: __('Total Products', 'multivendorx'),
                            count: 24,
                            icon: 'order',
                        },
                        {
                            id: 'facilitator_fee',
                            label: __('Issues Found', 'multivendorx'),
                            count: 5,
                            icon: 'facilitator',
                            module: 'facilitator',
                        },
                        {
                            id: 'gateway_fee',
                            label: __('Compliant', 'multivendorx'),
                            count: 20,
                            icon: 'credit-card',
                            condition: false,
                        }
                    ];
    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'product-compliance':
                return (
                    <Container>
                        <Column row>
                            <Card
                                title={__('Product Images & Descriptions', 'multivendorx')}
                                // desc={__('Each product listing must have at least one clear image and an accurate description matching the actual item being sold.', 'multivendorx')}
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
                                title={__('Product Authenticity Certificates', 'multivendorx')}>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Nike Air Max — Authenticity Certificate', 'multivendorx'),
                                            desc: __(
                                                'Brand: Nike · Added Mar 12, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge green">
                                                        {__('Verified', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('Nike Air Max — Authenticity Certificate', 'multivendorx'),
                                            desc: __(
                                                'Brand: Nike · Added Mar 12, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge red">
                                                        {__('Missing', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Upload', 'multivendorx'),
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                    ]}
                                />
                            </Card>
                        </Column>

                        <Column row>
                            <Card
                                title={__('Safety Certifications', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge yellow">{__('Not Uploaded', 'multivendorx')}</span>
                                    </>
                                }>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Safety / Quality Certification', 'multivendorx'),
                                            desc: __(
                                                'e.g. CE, BIS, ISO, FDA — PDF or image, max 10MB',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Optional', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>

                            <Card
                                title={__('Product Abuse Reporting', 'multivendorx')}>
                                <ItemListUI
                                    className="badge-list"
                                    items={[
                                        { title: __('Counterfeit / Fake item', 'multivendorx') },
                                        { title: __('Incorrect description', 'multivendorx') },
                                        { title: __('Prohibited category', 'multivendorx') },
                                        { title: __('Offensive content', 'multivendorx') },
                                        { title: __('Misleading images', 'multivendorx') },
                                    ]} />
                            </Card>
                        </Column>
                    </Container>
                );
            case 'tax-compliance':
                return (
                    <Container>
                        <Column grid={6}>
                            <Card
                                title={__('Bank Account Details', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge yellow">{__('Pending Verification', 'multivendorx')}</span>
                                    </>}>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Cancelled Cheque / Bank Statement', 'multivendorx'),
                                            desc: __(
                                                'Must show your name, account number, and IFSC / routing code',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge green">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>
                            <Card
                                title={__('Business Registration', 'multivendorx')}>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Business Registration Certificate', 'multivendorx'),
                                            desc: __(
                                                'biz_registration_2024.pdf · Uploaded Mar 9, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge green">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>

                        </Column>

                        <Column grid={6}>
                            <Card
                                title={__('Tax Identification Documents ', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge blue">{__('Under Review', 'multivendorx')}</span>
                                    </>
                                }>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('PAN Card', 'multivendorx'),
                                            desc: __(
                                                'pan_arjun_kumar.pdf · Uploaded Mar 8, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Optional', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('GST Registration Certificate', 'multivendorx'),
                                            desc: __(
                                                'gst_cert_2024.pdf · Uploaded Mar 9',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('VAT / TIN / EIN', 'multivendorx'),
                                            desc: __(
                                                'Only if applicable in your region',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Optional', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>
<div>  </div>
                        </Column>
                    </Container>
                );
            case 'my-products':
                return (
                    <Analytics
						cols={3}
						data={overviewData.map((item, idx) => ({
							icon: item.icon,
							iconClass: `admin-color${idx + 2}`,
							number: item.count,
							text: __(item.label, 'multivendorx'),
						}))}
					/>
                );
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
