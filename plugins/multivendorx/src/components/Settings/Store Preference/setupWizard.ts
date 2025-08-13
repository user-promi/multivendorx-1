import { __ } from '@wordpress/i18n';

export default {
    id: 'setup-wizard',
    priority: 3,
    name: 'Onboarding',
    desc: __(
        'Control whether new stores get step-by-step guidance or go directly to their dashboar',
        'multivendorx'
    ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'disable_setup_wizard',
            type: 'setting-toggle',
            label: __( 'Guided Setup Experience', 'multivendorx' ),
            desc: __('When guided setup is disabled, stores bypass the setup wizard and access their dashboard immediately.',
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
