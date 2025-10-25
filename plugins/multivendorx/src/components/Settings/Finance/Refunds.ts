import { __ } from '@wordpress/i18n';

export default {
    id: 'order-actions-refunds',
    priority: 5,
    name: __( 'Refunds', 'multivendorx' ),
    desc: __(
        'Control refund rules, eligibility stages, and valid claim periods.',
        'multivendorx'
    ),
    icon: 'adminlib-order',
    submitUrl: 'settings',
    modal: [
        {
            key: 'customer_refund_status',
            type: 'checkbox',
            label: __( 'Eligible order status for refund', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            settingDescription: __(
                'Customers can only request a refund when their order is in the selected status.',
                'multivendorx'
            ),
            moduleEnabled: 'marketplace-refund',
            options: [
                {
                    key: 'pending',
                    label: __( 'Pending', 'multivendorx' ),
                    value: 'pending',
                },
                {
                    key: 'on-hold',
                    label: __( 'On hold', 'multivendorx' ),
                    value: 'on-hold',
                },
                {
                    key: 'processing',
                    label: __( 'Processing', 'multivendorx' ),
                    value: 'processing',
                },
                {
                    key: 'completed',
                    label: __( 'Completed', 'multivendorx' ),
                    value: 'completed',
                },
            ],
            selectDeselect: true,
            moduleEnabled: 'marketplace-refund',
        },
        {
            key: 'refund_days',
            type: 'number',
            label: __( 'Refund claim period', 'multivendorx' ),
            settingDescription: __(
                'Set the number of days within which a customer can request a refund.',
                'multivendorx'
            ),
            moduleEnabled: 'marketplace-refund',
            size: '8rem',
            max: 365,
            postInsideText: 'days',
            moduleEnabled: 'marketplace-refund',
        },
        {
            key: 'refund_reasons',
            type: 'multi-string',
            label: __( 'Refund reasons', 'multivendorx' ),
            placeholder: __( 'Enter refund reasons here…', 'multivendorx' ),
            settingDescription: __(
                'Add one or more reasons that stores can select when handling refund requests.',
                'multivendorx'
            ),
            defaultValues: [
                { value: "Damaged or Defective Product", },
                { value: "Wrong Item Delivered", },
                { value: "Product Not as Described", },
                { value: "Late Delivery", },
                { value: "Changed Mind", },
            ],
            moduleEnabled: 'marketplace-refund',
            name: 'abuse_report_reasons',
        }
    ],
};
