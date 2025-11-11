import React, { useState, useRef } from 'react';
import './SetupWizard.scss';
import 'zyra/build/index.css';
import { PaymentTabsComponent } from 'zyra';
// import PaymentTabsComponent from '../path/to/PaymentTabsComponent';

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

    // Required for PaymentTabsComponent
    const [value, setValue] = useState({});
    const settingChanged = useRef(false);

    const appLocalizer = (window as any).appLocalizer; // If needed

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
        {
            id: "paypal",
            label: "Welcome to the MultivendorX family!",
            icon: "adminlib-advertise-product",
            desc: 'Thank you for choosing MultiVendorX! This quick setup wizard will help you configure the basic settings and have your marketplace ready in no time. It’s completely optional and shouldn’t take longer than five minutes.',
            // connected: false,
            // enableOption: true,
            formFields: [
                {
                    key: 'enable_advertisement_in_subscription',
                    type: 'setup',
                    title: 'Identity verification',
                    des: 'Control what dashboard sections and tools are available to active stores.',
                    link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=identity-verification`,
                },
            ],
        },
        {
            id: "stripe",
            label: "Configure Your Store",
            icon: "adminlib-stripe",
            desc: 'Configure Your Store',
            connected: true,
            enableOption: true,
            formFields: [
                {
                    key: 'enable_advertisement_in_subscription',
                    type: 'text',
                    label: 'Store URL',
                    placeholder: 'Define vendor store URL',
                },
            ],
        },
        {
            id: "razorpay",
            label: "Commission Setup",
            icon: "adminlib-commission",
            desc: 'Verify store identity and business legitimacy',
            connected: false,
            enableOption: false,
        },
    ];


    const proSettingChanged = (pro: boolean) => {
        console.log("Pro setting change triggered", pro);
    };

    const updateSetting = (key: string, data: any) => {
        setValue(data);
    };

    const hasAccess = () => true;

    const toggleSection = (index: number) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    return (
        <div className="wizard-container">

            {/* Add PaymentTabsComponent */}
            <div style={{ marginTop: "30px" }}>
                <h4>Payment Setup</h4>

                <PaymentTabsComponent
                    key={inputField.key}
                    name={inputField.key}
                    proSetting={isProSetting(inputField.proSetting ?? false)}
                    proSettingChanged={() => proSettingChanged(inputField.proSetting ?? false)}
                    apilink={String(inputField.apiLink)}
                    appLocalizer={appLocalizer}
                    methods={methods} // static methods object
                    buttonEnable={inputField.buttonEnable}
                    value={value}
                    onChange={(data: any) => {
                        if (hasAccess()) {
                            settingChanged.current = true;
                            updateSetting(inputField.key, data);
                        }
                    }}
                />

            </div>
        </div>
    );
};

export default SetupWizard;
