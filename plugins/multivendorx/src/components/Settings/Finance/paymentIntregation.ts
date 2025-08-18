import { __ } from '@wordpress/i18n';

export default {
    id: 'payment-integration',
    priority: 3,
    name: __( 'Disbursement Method', 'multivendorx' ),
    desc: __(
        "Choose which payment integrations to enable for store payouts",
        'multivendorx'
    ),
    icon: 'adminlib-dynamic-pricing',
    submitUrl: 'settings',
    modal: [
        {
            key: 'payment_methods',
            type: 'payment-tabs',
            modal: [
                {
                    icon: 'ST',
                    label: 'Stripe Connect',
                    connected: true,
                    desc: 'Full marketplace solution with instant payouts, comprehensive dispute handling, and global coverage. Best for established marketplaces.',
                    formFields: [
                        { key: 'api_key', type: 'text', label: 'API Key', placeholder: 'Enter API Key' },
                        { key: 'secret_key', type: 'password', label: 'Secret Key', placeholder: 'Enter Secret Key' },
                        { key: 'test_mode', type: 'checkbox', label: 'Enable Test Mode' }
                    ]
                },
                {
                    icon: 'SM',
                    label: 'Stripe Marketplace',
                    connected: false,
                    desc: 'Alternative Stripe integration with different fee structure. Suitable for high-volume marketplaces with negotiated rates.',
                    formFields: [
                        { key: 'api_key', type: 'text', label: 'API Key', placeholder: 'Enter API Key' },
                        { key: 'secret_key', type: 'password', label: 'Secret Key', placeholder: 'Enter Secret Key' },
                        { key: 'test_mode', type: 'checkbox', label: 'Enable Test Mode' }
                    ]
                },
                {
                    icon: 'PP',
                    label: 'PayPal Payout',
                    connected: true,
                    desc: 'Send money directly to store PayPal accounts. Great for international stores and those preferring PayPal.',
                    formFields: [
                        { key: 'client_id', type: 'text', label: 'Client ID', placeholder: 'Enter Client ID' },
                        { key: 'client_secret', type: 'password', label: 'Client Secret', placeholder: 'Enter Client Secret' },
                        { key: 'sandbox', type: 'checkbox', label: 'Enable Sandbox Mode' }
                    ]
                },
                {
                    icon: 'PM',
                    label: 'PayPal MassPay',
                    connected: false,
                    desc: 'Bulk payout solution for sending multiple payments at once. Reduces transaction fees for high-volume payouts.',
                    formFields: [
                        { key: 'client_id', type: 'text', label: 'Client ID', placeholder: 'Enter Client ID' },
                        { key: 'client_secret', type: 'password', label: 'Client Secret', placeholder: 'Enter Client Secret' },
                        { key: 'sandbox', type: 'checkbox', label: 'Enable Sandbox Mode' }
                    ]
                },
                {
                    icon: 'MP',
                    label: 'PayPal Marketplace',
                    connected: false,
                    desc: 'Comprehensive PayPal marketplace solution with advanced features for payment splitting and marketplace management.',
                    formFields: [
                        { key: 'client_id', type: 'text', label: 'Client ID', placeholder: 'Enter Client ID' },
                        { key: 'client_secret', type: 'password', label: 'Client Secret', placeholder: 'Enter Client Secret' },
                        { key: 'sandbox', type: 'checkbox', label: 'Enable Sandbox Mode' }
                    ]
                }
            ]
        }
        
    ],
};
