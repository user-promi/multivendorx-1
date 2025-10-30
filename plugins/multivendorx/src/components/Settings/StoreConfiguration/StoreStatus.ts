import { __ } from '@wordpress/i18n';

export default {
    id: 'store_status_control',
    priority: 3,
    name: __('Store Status', 'multivendorx'),
    desc: __(
        'Control access and visibility based on store approval status. Configure how pending, denied, under review, suspended, active, and deactivated stores behave within your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_compliance_management',
            type: 'payment-tabs',
            modal: [
                {
                    id: 'Pending Status',
                    icon: "adminlib-store-analytics",
                    label: 'Pending Approval',
                    connected: true,
                    // disableBtn: true,
                    // countBtn: true,
                    desc: 'Stores awaiting approval',
                    formFields: [
                        {
                            key: 'pending_description',
                            type: 'description',
                            title: "What pending stores can do",
                            des: "Pending stores can log in and view their dashboard, but cannot configure settings, add products, or start selling until approved.",
                        },
                        {
                            key: 'pending_permissions',
                            type: 'check-list',
                            options: [
                                { desc: __('Can log in to dashboard', 'multivendorx'), check: true },
                                { desc: __('Modify store settings', 'multivendorx'), check: false },
                                { desc: __('Add or edit products', 'multivendorx'), check: false },
                                { desc: __('Process or fulfill orders', 'multivendorx'), check: false },
                            ]
                        },
                    ],
                },
                {
                    id: 'Rejected Status',
                    icon: "adminlib-like",
                    label: 'Declined',
                    connected: true,
                    enableOption: true,
                    desc: 'Applications refused during onboarding',
                    formFields: [
                        {
                            key: 'denied_description',
                            type: 'description',
                            title: "What denied stores can do",
                            des: "Denied stores can log in to see rejection reasons and reapply with updated information, but cannot sell or modify store details.",
                        },
                        {
                            key: 'denied_permissions',
                            type: 'check-list',
                            options: [
                                { desc: __('Log in to dashboard', 'multivendorx'), check: true },
                                { desc: __('View rejection reason', 'multivendorx'), check: true },
                                { desc: __('Submit new application', 'multivendorx'), check: true },
                                { desc: __('Modify products or settings', 'multivendorx'), check: false },
                                { desc: __('Sell or fulfill orders', 'multivendorx'), check: false },
                            ]
                        },
                    ],
                },
                {
                    id: 'Suspended Status',
                    icon: "adminlib-error",
                    label: 'Suspended',
                    connected: true,
                    enableOption: true,
                    desc: 'Stores with revoked selling privileges',
                    formFields: [
                        {
                            key: 'suspended_description',
                            type: 'description',
                            title: "About suspended stores",
                            des: "Stores whose selling rights are temporarily revoked due to policy or compliance violations. Configure what they can still access.",
                        },
                        {
                            key: 'suspended_show_products',
                            type: 'setup',
                            title: "Show products on storefront",
                            des: "Let customers view products but disable purchases. A message will indicate that the store is temporarily closed.",
                        },
                        {
                            key: 'suspended_allow_login',
                            type: 'setup',
                            title: "Allow dashboard access",
                            des: "Store owners can log in to see suspension reasons and contact support, but cannot sell or modify listings.",
                        },
                        {
                            key: 'suspended_hold_payments',
                            type: 'setup',
                            title: "Hold all payments",
                            des: "Keep earnings on hold during suspension. Funds release only after reactivation or a successful appeal.",
                        },
                    ],
                },
                {
                    id: 'Approved Status',
                    icon: "adminlib-store-support",
                    label: 'Active',
                    connected: true,
                    enableOption: true,
                    desc: 'Stores in good standing',
                    formFields: [
                        {
                            key: 'active_description',
                            type: 'description',
                            title: "About active stores",
                            des: "Active stores have full access to all features, including listing products, fulfilling orders, and receiving payments.",
                        },
                        {
                            key: 'active_dashboard_access',
                            type: 'setup',
                            title: "Dashboard access settings",
                            des: "Control what dashboard sections and tools are available to active stores.",
                            link: "#",
                            hideCheckbox: true,
                        },
                    ],
                },
                {
                    id: 'store_deactivated_status',
                    icon: "adminlib-ban",
                    label: 'Deactivated',
                    connected: true,
                    enableOption: true,
                    desc: 'Permanently disabled stores',
                    formFields: [
                        {
                            key: 'deactivated_description',
                            type: 'description',
                            title: "What deactivated stores can do",
                            des: "Permanently banned stores lose all access due to severe violations such as fraud or repeated policy breaches. This action is irreversible.",
                        },
                        {
                            key: 'deactivated_warning',
                            type: 'note',
                            des: "Warning: Deactivated stores may have their data and inventory permanently deleted after a grace period. This cannot be undone.",
                        },
                    ],
                },
            ],
        },
    ],
};
