import { __ } from '@wordpress/i18n';

export default {
    id: 'identity-verification',
    priority: 3,
    name: __('Store Identity', 'mvx-pro'),
    desc: __(
        'Seller verification confirms a store identity with address, contact, and social profiles-building trust and boosting buyer confidence.', 'mvx-pro'),
    icon: 'adminlib-verification',
    submitUrl: 'settings',

    modal: [
        {
            key: 'badge_img',
            type: 'setting-toggle',
            label: __('Verified badge', 'multivendorx'),
            desc: __(
                'Select a badge from the list above. Once a store is verified, the chosen badge will appear beside its name.',
                'multivendorx'
            ),
            moduleEnabled: 'identity-verification',
            proSetting: true,
            options: [
                {
                    key: 'icon1',
                    value: __('icon1', 'multivendorx'),
                    icon: 'adminlib-verification1',
                },
                {
                    key: 'icon2',
                    value: __('icon2', 'multivendorx'),
                    icon: 'adminlib-verification2',
                },
                {
                    key: 'icon3',
                    value: __('icon3', 'multivendorx'),
                    icon: 'adminlib-verification3',
                },
                {
                    key: 'icon4',
                    value: __('icon4', 'multivendorx'),
                    icon: 'adminlib-verification5',
                },
                // {
                //     key: 'icon5',
                //     value: __('icon5', 'multivendorx'),
                //     icon: 'adminlib-verification6',
                // },
                {
                    key: 'icon6',
                    value: __('icon6', 'multivendorx'),
                    icon: 'adminlib-verification7',
                },
                // {
                //     key: 'icon7',
                //     value: __('icon7', 'multivendorx'),
                //     icon: 'adminlib-verification8',
                // },
                {
                    key: 'icon8',
                    value: __('icon8', 'multivendorx'),
                    icon: 'adminlib-verification9',
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __("Identity verification", 'multivendorx'),
            desc: __('Verify store identity using government-issued documents or facial recognition. Ensures authenticity of users.')
        },
        {
            key: 'verification_methods',
            type: 'multi-string',
            label: __('Verification methods', 'multivendorx'),
            moduleEnabled: 'marketplace-compliance',
            // proSetting: true,
            requiredEnable: true,
            // name: 'abuse_report_reasons',
            defaultValues: [
                { value: "Passport",  iconClass: "adminlib-check", description: "Order is received by store", required: true },
                { value: "Driving licence",  iconClass: "adminlib-clock", description: "Order is being processed",required: true },
            ],
            iconOptions: ["adminlib-check", "adminlib-clock", "adminlib-cart", "adminlib-store"], // dropdown options
            maxItems: 10,
            allowDuplicates: false
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __("Social verification", 'multivendorx'),
            desc: __('Allow stores to verify their identity by connecting social media accounts.')
        },
        {
            key: 'all_verification_methods',
            type: 'payment-tabs',
            label: 'Social verification',
            moduleEnabled: 'identity-verification',
            proSetting: true,
            // settingDescription: __('Allow stores to verify their identity by connecting social media accounts.', 'multivendorx'),
            modal: [
                {
                    id: 'google-connect',
                    icon: "adminlib-google",
                    label: 'Google',
                    connected: false,
                    disableBtn: true,
                    desc: 'Connect and authenticate stores via Google accounts.',
                    formFields: [
                        { key: 'client_id', type: 'text', label: 'Google Client ID', placeholder: 'Enter Google Client ID' },
                        { key: 'client_secret', type: 'password', label: 'Google Client Secret', placeholder: 'Enter Google Client Secret' },
                        { key: 'redirect_uri', type: 'text', label: 'Redirect URI', placeholder: 'Enter Redirect URI' }
                    ],
                },
                {
                    id: 'twitter-connect',
                    icon: "adminlib-twitter",
                    label: 'Twitter',
                    connected: false,
                    disableBtn: true,
                    countBtn: false,
                    desc: 'Connect and authenticate stores via Twitter accounts.',
                    formFields: [
                        { key: 'api_key', type: 'text', label: 'Twitter API Key', placeholder: 'Enter Twitter API Key' },
                        { key: 'api_secret_key', type: 'password', label: 'Twitter API Secret Key', placeholder: 'Enter Twitter API Secret Key' },
                        { key: 'bearer_token', type: 'text', label: 'Bearer Token', placeholder: 'Enter Bearer Token' },
                    ],
                },
                {
                    id: 'facebook-connect',
                    icon: "adminlib-facebook",
                    label: 'Facebook',
                    connected: false,
                    disableBtn: true,
                    countBtn: false,
                    desc: 'Connect and authenticate stores via Facebook accounts.',
                    formFields: [
                        { key: 'app_id', type: 'text', label: 'Facebook App ID', placeholder: 'Enter Facebook App ID' },
                        { key: 'app_secret', type: 'password', label: 'Facebook App Secret', placeholder: 'Enter Facebook App Secret' },
                    ],
                },
                {
                    id: 'linkedin-connect',
                    icon: "adminlib-linkedin",
                    label: 'LinkedIn',
                    disableBtn: true,
                    countBtn: false,
                    desc: 'Connect and authenticate stores via LinkedIn accounts.',
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
