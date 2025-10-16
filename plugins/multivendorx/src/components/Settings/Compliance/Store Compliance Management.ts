import { __ } from '@wordpress/i18n';

export default {
    id: 'non-compliance',
    priority: 1,
    name: __('Non-Compliance Handling', 'mvx-pro'),
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
                    connected: false,
                    desc: 'Verify store identity and business legitimacy',
                    formFields: [
                        { key: 'client_id', type: 'text', label: 'Google Client ID', placeholder: 'Enter Google Client ID' },
                        {
                            key: 'store_advertisement_advanced_settings',
                            type: 'checkbox',
                            label: __('Advanced advertising settings', 'multivendorx'),
                            class: 'mvx-toggle-checkbox',
                            options: [
                                {
                                    key: 'enable_advertisement_in_subscription',
                                    label: __('Include advertising in subscriptions', 'multivendorx'),
                                    value: 'enable_advertisement_in_subscription',
                                    desc: __('Allow stores to advertise products at no extra cost if included in their subscription plan.', 'multivendorx'),
                                    proSetting: true
                                },
                                {
                                    key: 'mark_advertised_product_as_featured',
                                    label: __('Mark advertised products as featured', 'multivendorx'),
                                    value: 'mark_advertised_product_as_featured',
                                    desc: __('Automatically mark advertised products as featured. They will be removed from the featured list once advertising expires.', 'multivendorx'),
                                    proSetting: true
                                },
                                {
                                    key: 'display_advertised_product_on_top',
                                    label: __('Show advertised products at the top', 'multivendorx'),
                                    value: 'display_advertised_product_on_top',
                                    desc: __('Display advertised products at the top of catalog pages such as the shop or store page.', 'multivendorx'),
                                    proSetting: true
                                },
                                {
                                    key: 'out_of_stock_visibility',
                                    label: __('Hide out-of-stock advertised products', 'multivendorx'),
                                    value: 'out_of_stock_visibility',
                                    desc: __('Hide advertised products that are out of stock. Note: if WooCommerce’s out-of-stock visibility setting is enabled, products will be hidden regardless of this setting.', 'multivendorx'),
                                    proSetting: true
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'product-compliance',
                    icon: "adminlib-twitter",
                    label: 'Product Compliance',
                    connected: false,
                    desc: 'Ensure product listings meet marketplace standards',
                    formFields: [
                        { key: 'api_key', type: 'text', label: 'Twitter API Key', placeholder: 'Enter Twitter API Key' },
                        { key: 'api_secret_key', type: 'password', label: 'Twitter API Secret Key', placeholder: 'Enter Twitter API Secret Key' },
                        { key: 'bearer_token', type: 'text', label: 'Bearer Token', placeholder: 'Enter Bearer Token' },
                    ],
                },
                {
                    id: 'legal-policy',
                    icon: "adminlib-facebook",
                    label: 'Legal & Policy',
                    connected: false,
                    desc: 'Require acceptance of platform terms and policies',
                    formFields: [
                        { key: 'app_id', type: 'text', label: 'Facebook App ID', placeholder: 'Enter Facebook App ID' },
                        { key: 'app_secret', type: 'password', label: 'Facebook App Secret', placeholder: 'Enter Facebook App Secret' },
                    ],
                },
                {
                    id: 'financial-compliance',
                    icon: "adminlib-linkedin",
                    label: 'Financial Compliance',
                    connected: false,
                    desc: 'Verify tax information and monitor transactions',
                    formFields: [
                        { key: 'client_id', type: 'text', label: 'LinkedIn Client ID', placeholder: 'Enter LinkedIn Client ID' },
                        { key: 'client_secret', type: 'password', label: 'LinkedIn Client Secret', placeholder: 'Enter LinkedIn Client Secret' },
                        { key: 'redirect_uri', type: 'text', label: 'Redirect URI', placeholder: 'Enter Redirect URI' },
                    ],
                }
            ]
        },
    ],
};