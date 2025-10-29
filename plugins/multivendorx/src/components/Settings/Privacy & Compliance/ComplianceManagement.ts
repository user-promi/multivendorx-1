import { __ } from '@wordpress/i18n';

export default {
    id: 'non-compliance',
    priority: 2,
    name: __('Compliance Management', 'mvx-pro'),
    desc: __('Control store access based on verification status. Ensure only compliant stores can operate fully on your marketplace.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        
        {
            key: 'store_compliance_management',
            type: 'payment-tabs',
            label: 'What Must Sellers Complete Before Selling?',
            settingDescription: __('Check all requirements sellers must finish to activate their store', 'multivendorx'),
            modal: [
                {
                    id: 'seller-verification',
                    icon: "adminlib-google",
                    label: 'Seller Verification',
                    connected: true,
                    disableBtn: true,
                    countBtn: true,
                    openForm: true,
                    enableOption: true,
                    desc: 'Verify store identity and business legitimacy',
                    formFields: [
                        {
                            key: 'required_tasks',
                            type: 'multi-checkbox',
                            label: __('Required Tasks', 'multivendorx'),
                            class: 'mvx-toggle-checkbox',
                            options: [
                                {
                                    key: 'enable_advertisement_in_subscription',
                                    label: __('Identity Verification', 'multivendorx'),
                                    value: 'enable_advertisement_in_subscription',
                                    desc: __('Allow stores to advertise products at no extra cost if included in their subscription plan.', 'multivendorx'),
                                },
                                {
                                    key: 'display_advertised_product_on_top',
                                    label: __('Social Verification', 'multivendorx'),
                                    value: 'display_advertised_product_on_top',
                                    desc: __('Display advertised products at the top of catalog pages such as the shop or store page.', 'multivendorx'),
                                },
                                {
                                    key: 'out_of_stock_visibility',
                                    label: __('Email Verification', 'multivendorx'),
                                    value: 'out_of_stock_visibility',
                                    desc: __('Hide advertised products that are out of stock. Note: if WooCommerce’s out-of-stock visibility setting is enabled, products will be hidden regardless of this setting.', 'multivendorx'),
                                },
                            ],
                            selectDeselect: true,
                        },
                        {
                            key: 'non_compliance_action',
                            type: 'setting-toggle',
                            label: __('Non-Compliance Action', 'multivendorx'),
                            options: [
                                {
                                    key: 'block_dashboard_access',
                                    label: __('Block dashboard access', 'multivendorx'),
                                    value: 'block_dashboard_access',
                                },
                                {
                                    key: 'hide_store_from_view',
                                    label: __('Hide store from view', 'multivendorx'),
                                    value: 'hide_store_from_view',
                                },
                                {
                                    key: 'disable_product upload',
                                    label: __('Disable product upload', 'multivendorx'),
                                    value: 'disable_product upload',
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'product-compliance',
                    icon: "adminlib-product",
                    label: 'Product Compliance',
                    openForm: true,
                    disableBtn: true,
                    countBtn: true,
                    desc: 'Ensure product listings meet marketplace standards',
                    formFields: [
                        {
                            key: 'required_tasks',
                            type: 'multi-checkbox',
                            label: __('Required Tasks', 'multivendorx'),
                            class: 'mvx-toggle-checkbox',
                            options: [
                                {
                                    key: 'prohibited',
                                    label: __('Prohibited Items Check', 'multivendorx'),
                                    value: 'prohibited',
                                    desc: __('Block restricted or banned products.', 'multivendorx'),
                                },
                                {
                                    key: 'reviews',
                                    label: __('Product Images & Descriptions', 'multivendorx'),
                                    value: 'reviews',
                                    desc: __('Approve product reviews before publishing.', 'multivendorx'),
                                },
                                {
                                    key: 'content',
                                    label: __('Product Authenticity Certificates', 'multivendorx'),
                                    value: 'content',
                                    desc: __('Enforce image and description standards.', 'multivendorx'),
                                },
                                {
                                    key: 'reports',
                                    label: __('Product Abuse Reporting', 'multivendorx'),
                                    value: 'reports',
                                    desc: __('Handle product violation reports.', 'multivendorx'),
                                },
                            ],
                            selectDeselect: true,
                        },
                        {
                            key: 'non_compliance_action',
                            type: 'setting-toggle',
                            label: __('Non-Compliance Action', 'multivendorx'),
                            options: [
                                {
                                    key: 'prevent_product_publishing',
                                    label: __('Prevent Publishing', 'multivendorx'),
                                    value: 'PreventProductPublishing',
                                },
                                {
                                    key: 'Set_store_as_pending',
                                    label: __('Set store as pending', 'multivendorx'),
                                    value: 'SetStoreAsPending',
                                },
                                {
                                    key: 'notify_admin_only',
                                    label: __('Notify Admin Only', 'multivendorx'),
                                    value: 'NotifyAdmin',
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'legal-policy',
                    icon: "adminlib-verification3",
                    label: 'Legal & Policy',
                    openForm: true,
                    disableBtn: true,
                    countBtn: true,
                    desc: 'Require acceptance of platform terms and policies',
                    formFields: [
                        {
                            key: 'required_tasks',
                            type: 'multi-checkbox',
                            label: __('Required Tasks', 'multivendorx'),
                            class: 'mvx-toggle-checkbox',
                            options: [
                                {
                                    key: 'terms',
                                    label: __('Terms & Conditions', 'multivendorx'),
                                    value: 'terms',
                                    desc: __('Mandatory platform agreement acceptance.', 'multivendorx'),
                                },
                                {
                                    key: 'privacy',
                                    label: __('Privacy Policy Consent', 'multivendorx'),
                                    value: 'privacy',
                                    desc: __('Data handling acknowledgment.', 'multivendorx'),
                                },
                                {
                                    key: 'agreement',
                                    label: __('Seller Agreement Upload', 'multivendorx'),
                                    value: 'agreement',
                                    desc: __('Signed contract submission.', 'multivendorx'),
                                },
                                {
                                    key: 'refund',
                                    label: __('Return Policy Compliance', 'multivendorx'),
                                    value: 'refund',
                                    desc: __('Follow marketplace refund rules.', 'multivendorx'),
                                },
                            ],
                            selectDeselect: true,
                        },
                        {
                            key: 'non_compliance_action',
                            type: 'setting-toggle',
                            label: __('Non-Compliance Action', 'multivendorx'),
                            options: [
                                {
                                    key: 'block_store_access',
                                    label: __('Block Store Access', 'multivendorx'),
                                    value: 'BlockStoreAccess',
                                },
                                {
                                    key: 'restrict_marketplace_features',
                                    label: __('Restrict Features', 'multivendorx'),
                                    value: 'RestrictMarketplaceFeatures',
                                },
                                {
                                    key: 'notify_admin_only',
                                    label: __('Notify Admin Only', 'multivendorx'),
                                    value: 'NotifyAdmin',
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'financial-compliance',
                    icon: "adminlib-import",
                    label: 'Financial Compliance',
                    openForm: true,
                    disableBtn: true,
                    countBtn: true,
                    desc: 'Verify tax information and monitor transactions',
                    formFields: [
                        {
                            key: 'required_tasks',
                            type: 'multi-checkbox',
                            label: __('Required Tasks', 'multivendorx'),
                            class: 'mvx-toggle-checkbox',
                            options: [
                                {
                                    key: 'tax',
                                    label: __('Tax Information', 'multivendorx'),
                                    value: 'tax',
                                    desc: __('TINs/VAT/GST/EIN/SSN/ITIN etc registration and details.', 'multivendorx'),
                                },
                                {
                                    key: 'monitoring',
                                    label: __('Bank Account Details', 'multivendorx'),
                                    value: 'monitoring',
                                    desc: __('Detect suspicious payment activity.', 'multivendorx'),
                                },
                                {
                                    key: 'commission',
                                    label: __('Commission Transparency', 'multivendorx'),
                                    value: 'commission',
                                    desc: __('Track fee deductions and payouts.', 'multivendorx'),
                                },
                            ],
                            selectDeselect: true,
                        },
                        {
                            key: 'non_compliance_action',
                            type: 'setting-toggle',
                            label: __('Non-Compliance Action', 'multivendorx'),
                            options: [
                                {
                                    key: 'disable_payouts',
                                    label: __('Disable Payouts', 'multivendorx'),
                                    value: 'DisablePayouts',
                                },
                                {
                                    key: 'notify_admin_only',
                                    label: __('Notify Admin Only', 'multivendorx'),
                                    value: 'NotifyAdmin',
                                },
                            ],
                        },
                    ],
                }

            ]
        },
    ],
};
