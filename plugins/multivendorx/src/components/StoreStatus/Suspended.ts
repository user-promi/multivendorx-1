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
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __('Store promotion limit', 'multivendorx'),
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
        {
            key: 'suspended_msg',
            label: 'Message shown to suspended stores',
            type: 'textarea',
            des: 'What pending stores can do',
        },
    ],
};
