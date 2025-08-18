import { __ } from '@wordpress/i18n';

export default {
    id: 'order-actions-refunds',
    priority: 4,
    name: __( 'Refunds', 'multivendorx' ),
    desc: __(
        'Manage refund eligibility, order handling, and return processes',
        'multivendorx'
    ),
    icon: 'adminlib-order',
    submitUrl: 'settings',
    modal: [
        {
            key: 'customer_refund_status',
            type: 'checkbox',
            label: __( 'Available Status for Refund', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Customers would be able to avail a refund only if their order is at the following stage/s',
                'multivendorx'
            ),
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
            label: __( 'Refund Claim Period (In Days)', 'multivendorx' ),
            desc: __(
                'The duration till which the refund request is available/valid',
                'multivendorx'
            ),
            max: 365,
            moduleEnabled: 'marketplace-refund',
        },
        {
            key: 'abuse_report_reasons',
            type: 'multi-string',
            label: __( 'Reason for Refund', 'multivendorx' ),
            placeholder: __( 'Enter a reason and click +', 'multivendorx' ),
            desc: __(
                'Add one or more predefined reasons that stores can select when reporting abuse.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
        }
    ],
};
