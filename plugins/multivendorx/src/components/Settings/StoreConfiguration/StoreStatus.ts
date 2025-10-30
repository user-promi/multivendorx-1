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
                    id: 'store_pending_status',
                    icon: 'adminlib-store-analytics',
                    label: 'Pending approval',
                    connected: true,
                    enableOption: true,
                    desc: 'Stores awaiting approval',
                    formFields: [
                        {
                            key: 'pending_description',
                            type: 'description',
                            title: 'What pending stores can do',
                            des: ' The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
                        },
                        {
                            key: 'pending_permissions',
                            type: 'check-list',
                            options: [
                                { desc: __('Can log in to dashboard', 'multivendorx'), check: true },
                                { desc: __('Modify store settings', 'multivendorx'), check: false },
                                { desc: __('Add or edit products', 'multivendorx'), check: false },
                                { desc: __('Process or fulfill orders', 'multivendorx'), check: false },
                            ],
                        },
                    ],
                },
                {
                    id: 'store_denied_status',
                    icon: 'adminlib-like',
                    label: 'Declined',
                    connected: true,
                    enableOption: true,
                    desc: 'Applications refused during onboarding',
                    formFields: [
                        {
                            key: 'denied_description',
                            type: 'description',
                            title: 'What denied stores can do',
                            des: 'The application was rejected during onboarding. Sellers can log in to view the rejection reason and reapply with updated information but cannot sell or modify store details.',
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
                            ],
                        },
                    ],
                },
                {
                    id: 'store_under_review_status',
                    icon: 'adminlib-store-review',
                    label: 'Under Review',
                    connected: true,
                    enableOption: true,
                    desc: 'Stores being checked for compliance',
                    formFields: [
                        {
                            key: 'review_description',
                            type: 'description',
                            title: 'About under review stores',
                            des: 'SThe store is temporarily restricted while the platform reviews compliance or documentation. Selling and payouts may be paused until the review is complete.',
                        },
                        {
                            key: 'review_allow_selling',
                            type: 'setup',
                            title: 'Selling during review',
                            des: 'Let stores continue selling and fulfilling orders while under review. Turn off to pause all sales activities.',
                        },
                        {
                            key: 'review_withhold_payments',
                            type: 'setup',
                            title: 'Hold payments until review complete',
                            des: 'Keep earnings on hold until the review concludes. Payments will release once compliance is cleared.',
                        },
                        {
                            key: 'review_restrict_listings',
                            type: 'setup',
                            title: 'Restrict adding new products',
                            des: 'Prevent stores from listing new products during review. Existing listings stay active unless selling is disabled.',
                        },
                    ],
                },
                {
                    id: 'store_suspended_status',
                    icon: 'adminlib-error',
                    label: 'Suspended',
                    connected: true,
                    enableOption: true,
                    desc: 'Stores with revoked selling privileges',
                    formFields: [
                        {
                            key: 'suspended_description',
                            type: 'description',
                            title: 'About suspended stores',
                            des: 'The store’s selling privileges are revoked due to policy or compliance violations. Listings are hidden or disabled, and payments are held until reactivation or successful appeal.',
                        },
                        {
                            key: 'suspended_show_products',
                            type: 'setup',
                            title: 'Show products on storefront',
                            des: 'Let customers view products but disable purchases. A message will indicate that the store is temporarily closed.',
                        },
                        {
                            key: 'suspended_allow_login',
                            type: 'setup',
                            title: 'Dashboard access for store owners',
                            des: 'Store owners can log in to see suspension reasons and contact support, but cannot sell or modify listings.',
                        },
                        {
                            key: 'suspended_hold_payments',
                            type: 'setup',
                            title: 'Hold all payments',
                            des: 'Keep earnings on hold during suspension. Funds release only after reactivation or a successful appeal.',
                        },
                    ],
                },
                {
                    id: 'store_active_status',
                    icon: 'adminlib-store-support',
                    label: 'Active',
                    connected: true,
                    enableOption: true,
                    desc: 'Stores in good standing',
                    formFields: [
                        {
                            key: 'active_description',
                            type: 'description',
                            title: 'About active stores',
                            des: 'The store is in good standing. Sellers can list products, fulfill orders, and receive payments without restriction.',
                        },
                        {
                            key: 'active_dashboard_access',
                            type: 'setup',
                            title: 'Dashboard access settings',
                            des: 'Control what dashboard sections and tools are available to active stores.',
                            link: '#',
                            hideCheckbox: true,
                        },
                    ],
                },
                {
                    id: 'store_deactivated_status',
                    icon: 'adminlib-identity-verification',
                    label: 'Deactivated',
                    connected: true,
                    enableOption: true,
                    desc: 'Permanently disabled stores',
                    formFields: [
                        {
                            key: 'deactivated_description',
                            type: 'description',
                            title: 'What deactivated stores can do',
                            des: 'The store is permanently disabled following serious or repeated violations. No further selling or account access is permitted.',
                        },
                        {
                            key: 'denied_permissions',
                            type: 'check-list',
                            options: [
                                { desc: __('Log in to dashboard', 'multivendorx'), check: false },
                                { desc: __('Access selling privileges', 'multivendorx'), check: false },
                                { desc: __('View or manage product listings', 'multivendorx'), check: false },
                                { desc: __('Submit reapplication or appeal', 'multivendorx'), check: false },
                                { desc: __('Retain any marketplace privileges', 'multivendorx'), check: false },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
