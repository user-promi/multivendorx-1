import { __ } from '@wordpress/i18n';

export default {
    id: 'suspended',
    priority: 1,
    name: __('Suspended', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            blocktext: __(
                'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
                'multivendorx'
            ),
        },
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __('Eligible order statuses for commission payout', 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'completed',
                    label: __('Keep store visible but disable checkout', 'multivendorx'),
                    value: 'completed',
                    desc: __('Displays the store and its products but prevents customers from placing new orders.Freeze all pending payments', 'multivendorx'),
                },
                {
                    key: 'processing',
                    label: __('Freeze all pending payments', 'multivendorx'),
                    value: 'processing',
                    desc: __('Holds all earnings during suspension. Funds are released only after reinstatement or successful appeal.', 'multivendorx'),
                },
            ],
            selectDeselect: true,
        },
    ],
};
