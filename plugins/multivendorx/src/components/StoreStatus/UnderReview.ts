import { __ } from '@wordpress/i18n';

export default {
    id: 'under-review',
    priority: 1,
    name: __('Under Review', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __('Eligible order statuses for commission payout', 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'completed',
                    label: __('Pause selling products', 'multivendorx'),
                    value: 'completed',
                },
                {
                    key: 'processing',
                    label: __('Hold payments release', 'multivendorx'),
                    value: 'processing',
                },
                {
                    key: 'delivered',
                    label: __('Restrict new product uploads', 'multivendorx'),
                    value: 'delivered',
                },
            ],
            selectDeselect: true,
        },
    ],
};
