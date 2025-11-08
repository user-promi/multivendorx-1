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
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            blocktext: __(
                'The store is under review due to compliance concerns. Selling is paused, payouts are held, and new product uploads are restricted until the review is complete.',
                'multivendorx'
            ),
        },
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __('Store promotion limit', 'multivendorx'),
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
        {
            key: 'pending_msg',
            label: 'Message shown to pending stores',
            type: 'textarea',
            value: 'Your store is under review. Sales and payouts are temporarily paused.',
            des: 'What pending stores can do',
        },
    ],
};
