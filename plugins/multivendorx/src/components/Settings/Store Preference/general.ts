import { __ } from '@wordpress/i18n';

export default {
    id: 'general',
    priority: 1,
    name: __( 'Onboarding', 'multivendorx' ),
    desc: __(
        'Decide what vendors see first after signing up and guide them through the key steps to get their store ready for sales.'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_store',
            type: 'setting-toggle',
            label: __('New store registration approval', 'multivendorx'),
            desc: __(
                'Decide how you want to approve new stores for your marketplace: <ul><li>Require manual approval — Admin reviews and approves each store before granting dashboard access.</li><li>Approve automatically — Stores get immediate dashboard access and can start setting up right away.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'manually',
                    label: __('Manually', 'multivendorx'),
                    value: 'manually',
                },
                {
                    key: 'automatically',
                    label: __('Automatically', 'multivendorx'),
                    value: 'automatically',
                },
            ],
        },
        {
            key: 'store_backend_access',
            type: 'checkbox',
            label: __("Allow stores access to WordPress admin", 'multivendorx'),
            desc: __('If enabled, vendors can access both the WordPress dashboard and their store dashboard.', 'multivendorx'),
            options: [
                {
                    key: 'store_backend_access',
                    value: 'store_backend_access',
                },
            ],
            look: 'toggle',
            proSetting: true,
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Setup wizard',
                'multivendorx'
            ),
        }, 
        {
            key: 'disable_setup_wizard',
            type: 'setting-toggle',
            label: __( 'Guided setup wizard', 'multivendorx' ),
            desc: __('Help vendors set up their store quickly and correctly by showing a guided, step-by-step process after registration.<ul><li>Enabled — Vendors are shown the setup wizard with clear instructions for each step..</li><li>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'enable_guided_setup',
                    label:'Enabled',
                    value: 'enable_guided_setup',
                },
                {
                    key: 'skip_to_dashboard',
                    label:'Disabled',
                    value: 'skip_to_dashboard',
                },
            ],
        },
        {
            key: 'onboarding_steps_configuration',
            type: 'checkbox',
            label: __( 'Onboarding Steps Configuration', 'multivendorx' ),
            desc: __( 'Choose which steps vendors must complete before they can start selling:', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'store_profile_setup',
                    label: __( 'Store Profile Setup (store name, description, logo)', 'multivendorx' ),
                    value: 'store_profile_setup',
                },
                {
                    key: 'payment_information',
                    label: __( 'Payment Information (payout details, tax info)', 'multivendorx' ),
                    value: 'payment_information',
                },
                {
                    key: 'shipping_configuration',
                    label: __( 'Shipping Configuration (zones, rates, policies)', 'multivendorx' ),
                    value: 'shipping_configuration',
                },
                {
                    key: 'first_product_upload',
                    label: __( 'First Product Upload (require at least one product)', 'multivendorx' ),
                    value: 'first_product_upload',
                },
                {
                    key: 'identity_verification',
                    label: __( 'Identity Verification (documents, address confirmation)', 'multivendorx' ),
                    value: 'identity_verification',
                },
                {
                    key: 'store_policies',
                    label: __( 'Store Policies (refund, shipping, terms)', 'multivendorx' ),
                    value: 'store_policies',
                },
            ],
            selectDeselect: true,
        },                
        {
            key: 'setup_wizard_introduction',
            type: 'textarea',
            label: __(
                'Getting Started Message',
                'multivendorx'
            ),
            placeholder: __(
                'Welcome to [Marketplace Name]! Let’s set up your store in just a few minutes...',
                'multivendorx'
            ),            
            desc: __(
                'This message appears at the beginning of the setup process to set expectations and encourage completion.',
                'multivendorx'
            ),
        },




    ],
};