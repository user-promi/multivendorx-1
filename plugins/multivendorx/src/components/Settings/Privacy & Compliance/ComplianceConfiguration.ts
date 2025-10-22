import { __ } from '@wordpress/i18n';

export default {
    id: 'non-compliance',
    priority: 2,
    name: __('Compliance Configuration', 'mvx-pro'),
    desc: __('Control store access based on verification status. Ensure only compliant stores can operate fully on your marketplace.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'unverified_store_access',
            type: 'checkbox',
            label: __('Enforcement actions', 'mvx-pro'),
            desc: __('Select the restrictions you want to apply to stores who have not yet completed their compliance.', 'mvx-pro'),
            options: [
                {
                    key: 'endpoint_control',
                    label: __('Restrict access to other pages', 'mvx-pro'),
                    value: 'endpoint_control',
                    proSetting: true,
                },
                {
                    key: 'redirect_verification_page',
                    label: __('Redirect to compliance checklist page', 'mvx-pro'),
                    value: 'redirect_verification_page',
                    proSetting: true,
                },
                {
                    key: 'disable_add_product_endpoint',
                    label: __('Prevent product upload', 'mvx-pro'),
                    value: 'disable_add_product_endpoint',
                    proSetting: true,
                },
                {
                    key: 'hide_store_from_customers',
                    label: __('Hide store from customers ', 'mvx-pro'),
                    value: 'hide_store_from_customers',
                    proSetting: true,
                },
            ],
            //proSetting:true,
            selectDeselect: true,
        },
        {
            key: 'store_compliance_management',
            type: 'payment-tabs',
            label: 'Store Compliance Management',
            // settingDescription: __('Allow stores to verify their identity by connecting social media accounts.', 'multivendorx'),
            modal: [
                {
                    id: 'seller-verification',
                    icon: "adminlib-google",
                    label: 'Seller Verification',
                    // connected: false,
                    // disableBtn: true,
                    // countBtn: true,
                    openForm: true,
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
                                    key: 'mark_advertised_product_as_featured',
                                    label: __('Mark advertised products as featured', 'multivendorx'),
                                    value: 'Business Registration',
                                    desc: __('Automatically mark advertised products as featured. They will be removed from the featured list once advertising expires.', 'multivendorx'),
                                },
                                {
                                    key: 'display_advertised_product_on_top',
                                    label: __('Bank Account Verification', 'multivendorx'),
                                    value: 'display_advertised_product_on_top',
                                    desc: __('Display advertised products at the top of catalog pages such as the shop or store page.', 'multivendorx'),
                                },
                                {
                                    key: 'out_of_stock_visibility',
                                    label: __('Address Verification', 'multivendorx'),
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
                                    key: 'store_order',
                                    label: __('Block Store Access', 'multivendorx'),
                                    value: 'store_order',
                                },
                                {
                                    key: 'prevent_product_uploads',
                                    label: __('Prevent Product Uploads', 'multivendorx'),
                                    value: 'per_item',
                                },
                                {
                                    key: 'notify_admin_only',
                                    label: __('Notify Admin Only', 'multivendorx'),
                                    value: 'notify_admin_only',
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
                                    label: __('Review Moderation', 'multivendorx'),
                                    value: 'reviews',
                                    desc: __('Approve product reviews before publishing.', 'multivendorx'),
                                },
                                {
                                    key: 'content',
                                    label: __('Content Guidelines', 'multivendorx'),
                                    value: 'content',
                                    desc: __('Enforce image and description standards.', 'multivendorx'),
                                },
                                {
                                    key: 'reports',
                                    label: __('Abuse Reporting', 'multivendorx'),
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
                                    key: 'flag_store_for_review',
                                    label: __('Flag for Review', 'multivendorx'),
                                    value: 'FlagStoreForReview',
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
                                    desc: __('GST/VAT registration and details.', 'multivendorx'),
                                },
                                {
                                    key: 'monitoring',
                                    label: __('Transaction Monitoring', 'multivendorx'),
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
