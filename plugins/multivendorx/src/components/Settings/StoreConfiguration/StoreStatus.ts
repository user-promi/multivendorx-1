import { __ } from '@wordpress/i18n';

export default {
    id: 'store_status_control',
    priority: 3,
    name: __('Store Status', 'multivendorx'),
    desc: __(
        'Control access and visibility based on store approval status. Configure how pending, rejected, suspended, and approved stores behave within your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-store',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_compliance_management',
            type: 'payment-tabs',
            // label: 'What Must Sellers Complete Before Selling?',
            // settingDescription: __('Check all requirements sellers must finish to activate their store', 'multivendorx'),
            modal: [
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-store-analytics",
                    label: 'Pending Status',
                    connected: true,
                    // disableBtn: true,
                    enableOption: true,
                    // openForm: ,
                    // countBtn: true,
                    desc: 'Stores awaiting approval',
                    formFields: [

                        {
                            key: 'required_tasks',
                            type: 'description',
                            // label: __('Show Products on Storefront', 'multivendorx'),
                            title: "Access Permissions",
                            des: "Pending stores can log in to their dashboard but cannot configure any settings.",
                        },
                    ],
                },
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-like",
                    label: 'Rejected Status',
                    connected: true,
                    // disableBtn: true,
                    enableOption: true,
                    // openForm: ,
                    // countBtn: true,
                    desc: 'Stores denied approval',
                    formFields: [

                        {
                            key: 'required_tasks',
                            type: 'description',
                            // label: __('Show Products on Storefront', 'multivendorx'),
                            title: "Access Permissions",
                            des: "Rejected stores can log in to their dashboard and reapply for approval.",
                        },
                    ],
                },
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-error",
                    label: 'Suspended Status',
                    connected: true,
                    // disableBtn: true,
                    enableOption: true,
                    // openForm: ,
                    // countBtn: true,
                    desc: 'Temporarily inactive stores',
                    formFields: [

                        {
                            key: 'required_tasks',
                            type: 'setup',
                            // label: __('Show Products on Storefront', 'multivendorx'),
                            title: "Show Products on Storefront",
                            des: "Keep suspended store products visible to customers (non-purchasable).",
                            link: "#"
                        },
                    ],
                },
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-store-support",
                    label: 'Approved Status',
                    connected: true,
                    // disableBtn: true,
                    enableOption: true,
                    // openForm: ,
                    // countBtn: true,
                    desc: 'Active and operational stores',
                    formFields: [

                        {
                            key: 'required_tasks',
                            type: 'setup',
                            // label: __('Show Products on Storefront', 'multivendorx'),
                            title: "Dashboard Access Control",
                            des: "Manage dashboard menu items and capabilities for approved stores",
                            link: "#"
                        },
                    ],
                },
            ]
        },
    ],
};