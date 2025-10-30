import { __ } from '@wordpress/i18n';

export default {
    id: 'store_status_control',
    priority: 3,
    name: __('Store Status', 'multivendorx'),
    desc: __(
        'Control access and visibility based on store approval status. Configure how pending, rejected, suspended, and approved stores behave within your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-store-inventory',
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
                    label: 'Pending',
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
                            title: "What pending stores can do",
                            des: "Pending stores can log in and see their application status, but they cannot add products, change settings, or start selling until you approve them.",
                        },
                        {
                            key: 'required_tasks',
                            type: 'check-list',
                            options: [
                                {
                                    desc: __('Can log in to dashboard.', 'multivendorx'),
                                    check: true,
                                },
                                {
                                    desc: __('Modify store settings.', 'multivendorx'),
                                    check: false,
                                },
                                {
                                    desc: __('Add or edit products.', 'multivendorx'),
                                    check: true,
                                },
                                {
                                    desc: __('Process orders.', 'multivendorx'),
                                    check: false,
                                },
                            ]
                        },
                    ],
                },
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-like",
                    label: 'Rejected',
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
                            title: "What rejected stores can do",
                            des: "Rejected stores can still log in to see why they were rejected and submit a new application with updated information.",
                        },
                        {
                            key: 'required_tasks',
                            type: 'check-list',
                            options: [
                                {
                                    desc: __('Log in to dashboard.', 'multivendorx'),
                                    check: true,
                                },
                                {
                                    desc: __('See why they were rejected.', 'multivendorx'),
                                    check: true,
                                },
                                {
                                    desc: __('Submit a new application with updated information.', 'multivendorx'),
                                    check: true,
                                },
                                {
                                    desc: __('Add products or start selling', 'multivendorx'),
                                    check: false,
                                },
                            ]
                        },
                    ],
                },
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-error",
                    label: 'Suspended',
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
                            title: "Show products on storefront",
                            des: "Customers can see products from suspended stores, but they won't be able to buy anything. A message will show that the store is temporarily closed.",
                            // link: "#"
                        },
                        {
                            key: 'required_tasks',
                            type: 'setup',
                            // label: __('Show Products on Storefront', 'multivendorx'),
                            title: "Allow dashboard access",
                            des: "Store owners can log in to see why they were suspended and contact support. They can't add products or sell anything during suspension.",
                            // link: "#"
                        },
                    ],
                },
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-store-support",
                    label: 'Approved',
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
                            link: "#",
                            hideCheckbox: true 
                        },
                    ],
                },
            ]
        },
    ],
};