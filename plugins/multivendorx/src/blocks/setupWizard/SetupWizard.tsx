import React, { useState, useRef } from 'react';
import './SetupWizard.scss';
import 'zyra/build/index.css';
import { PaymentTabsComponent } from 'zyra';
import { __ } from '@wordpress/i18n';
import img from '../../assets/images/mvx-brand-logo.png';

interface Step {
    title: string;
    description?: string;
    completed: boolean;
    actionText: string;
}

interface Section {
    title: string;
    steps: Step[];
}

const sectionsData: Section[] = [
    {
        title: 'Set Up The Basics',
        steps: [
            { title: 'Set Site Title & Tagline', description: 'Give your site a name and tagline.', completed: true, actionText: 'Set Up' },
            { title: 'Review Admin Email', description: 'Ensure your admin email is correct.', completed: false, actionText: 'Review' },
        ],
    },
];

const SetupWizard: React.FC = () => {
    const [sections, setSections] = useState<Section[]>(sectionsData);
    const [expandedSection, setExpandedSection] = useState<number | null>(0);

    // Required state for PaymentTabsComponent
    const [value, setValue] = useState({});
    const settingChanged = useRef(false);

    // NEW: Wizard step control
    const [currentStep, setCurrentStep] = useState(0);

    const appLocalizer = (window as any).appLocalizer;

    const inputField = {
        key: "payment_gateway",
        proSetting: true,
        apiLink: "/wp-json/payments/v1/settings",
        moduleEnabled: "yes",
        dependentSetting: "",
        dependentPlugin: "",
        modal: ["paypal", "stripe", "razorpay"],
        buttonEnable: true,
    };

    const isProSetting = (pro: boolean) => pro === true;

    const methods = [
        // {
        //     id: "welcome",
        //     label: "Welcome to the MultivendorX family!",
        //     icon: "adminlib-advertise-product",
        //     desc: `Thank you for choosing MultiVendorX!`,
        //     countBtn: true,
        //     isWizardMode: true,
        //     openForm: true,
        //     formFields: [
        //         {
        //             key: 'description',
        //             type: 'description',
        //             des: '<div>Thank you for choosing MultiVendorX! This quick setup wizard will help you configure the basic settings and have your marketplace ready in no time. It’s completely optional and shouldn’t take longer than five minutes.</div>',
        //         },
        //         {
        //             key: 'wizardButtons',
        //             type: 'buttons',
        //             options: [
        //                 { label: "Not right now", action: "skip", btnClass: "admin-btn btn-outline" },
        //                 { label: "Let's go!", action: "next", btnClass: "admin-btn btn-purple" }
        //             ]
        //         },
        //     ],
        // },

        {
            id: "store_setup",
            label: "Configure Your Store",
            icon: "adminlib-storefront",
            desc: 'Configure basic settings for vendor stores.',
            countBtn: true,
            isWizardMode: true,
            formFields: [
                {
                    key: 'store_url',
                    type: 'text',
                    label: 'Store URL',
                    placeholder: `Define vendor store URL`,
                },
                {
                    key: 'multi_vendor_products',
                    type: 'checkbox',
                    label: 'Single Product Multiple Vendors',
                    desc: 'Allow multiple vendors to sell the same product.',
                    default: false
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        { label: "Back", action: "back", btnClass: "admin-btn btn-red" },
                        { label: "Next", action: "next", btnClass: "admin-btn btn-purple" }
                    ]
                },
            ],
        },
        {
            id: "commission_setup",
            label: "Set Up Revenue Sharing",
            icon: "adminlib-commission",
            desc: 'Choose how earnings are split between Admin and Vendors.',
            countBtn: true,
            isWizardMode: true,
            formFields: [
                {
                    key: 'commission_mode',
                    type: 'select',
                    label: 'Revenue Sharing Mode',
                    options: [
                        { label: 'Admin fees', value: 'admin_fees' },
                        { label: 'Vendor commissions', value: 'vendor_commissions' },
                    ],
                },
                {
                    key: 'commission_type',
                    type: 'select',
                    label: 'Commission Type',
                    options: [
                        { label: 'Percentage', value: 'percentage' },
                        { label: 'Fixed', value: 'fixed' },
                    ],
                },
                {
                    key: 'commission_percent',
                    type: 'number',
                    label: 'Commission Percentage',
                    default: 80,
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        { label: "Back", action: "back", btnClass: "admin-btn btn-red" },
                        { label: "Next", action: "next", btnClass: "admin-btn btn-purple" }
                    ]
                },
            ],
        },
        {
            id: "vendor_capabilities",
            label: "Configure Vendor Permissions",
            icon: "adminlib-setting",
            desc: 'Control what dashboard sections and tools are available to active vendors.',
            countBtn: true,
            isWizardMode: true,
            formFields: [
                {
                    key: 'product_caps',
                    type: 'checkbox_group',
                    label: 'Products',
                    options: [
                        { label: 'Submit Products', value: 'submit_products' },
                        { label: 'Publish Products', value: 'publish_products' },
                        { label: 'Edit Published Products', value: 'edit_published_products' },
                    ]
                },
                {
                    key: 'coupon_caps',
                    type: 'checkbox_group',
                    label: 'Coupons',
                    options: [
                        { label: 'Submit Coupons', value: 'submit_coupons' },
                        { label: 'Publish Coupons', value: 'publish_coupons' },
                        { label: 'Edit/Delete Published Coupons', value: 'edit_delete_coupons' },
                    ]
                },
                {
                    key: 'media_caps',
                    type: 'checkbox_group',
                    label: 'Media',
                    options: [
                        { label: 'Upload Media Files', value: 'upload_media' },
                    ]
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        { label: "Back", action: "back", btnClass: "admin-btn btn-red" },
                        {
                            label: "Finish",
                            action: "finish",
                            btnClass: "admin-btn btn-purple",
                            redirect: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=dashboard`
                        }
                    ]
                },
            ],
        },
    ];



    const proSettingChanged = (pro: boolean) => {
        console.log("Pro setting change triggered", pro);
    };

    const updateSetting = (key: string, data: any) => {
        setValue(data);
    };

    const hasAccess = () => true;

    return (
        <div className="wizard-container">
            <div>
                <div className="welcome-wrapper">
                    <img src={img} alt="" />
                    <h4 className="wizard-title">Welcome to the MultivendorX family!</h4>
                    <div className="des">Thank you for choosing MultiVendorX! This quick setup wizard will help you configure the basic settings and have your marketplace ready in no time. It’s completely optional and shouldn’t take longer than five minutes.</div>
                </div>

                <PaymentTabsComponent
                    key={inputField.key}
                    name={inputField.key}
                    proSetting={isProSetting(inputField.proSetting ?? false)}
                    proSettingChanged={() => proSettingChanged(inputField.proSetting ?? false)}
                    apilink={String(inputField.apiLink)}
                    appLocalizer={appLocalizer}
                    methods={methods}
                    buttonEnable={inputField.buttonEnable}
                    value={value}
                    onChange={(data: any) => {
                        if (hasAccess()) {
                            settingChanged.current = true;
                            updateSetting(inputField.key, data);
                        }
                    }}
                    isWizardMode={true}
                    wizardIndex={currentStep}
                    setWizardIndex={setCurrentStep}
                />
            </div>
        </div>
    );
};

export default SetupWizard;
