import { __ } from '@wordpress/i18n';

export default {
    id: 'payment-gateways',
    priority: 4,
    name: __('Policies', 'multivendorx'),
    desc: __(
        'Define and publish the rules and guidelines that apply to your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-store-policy',
    submitUrl: 'settings',
    modal: [
        {
            key: 'role_access_table',
            type: 'multi-checkbox-table',
            rows: [
                {
                    key: 'paypal_marketplace',
                    label: 'PayPal Marketplace',
                    description: 'Enable PayPal for marketplace transactions',
                },
                {
                    key: 'stripe_marketplace',
                    label: 'Stripe Marketplace',
                    description: 'Process payments through Stripe Connect',
                },
                {
                    key: 'marketplace_fee',
                    label: 'Marketplace Fee',
                    description: 'Apply custom transaction fees on sales',
                },
            ],


            columns: [
                {
                    key: 'description',
                    label: 'Description',
                    type: 'description',
                },
                {
                    key: 'status',
                    label: 'Status',
                },
            ],
        },
    ],
};
