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
            key: 'restriction_for_sunspended',
            type: 'checkbox',
            label: __('What sellers can do', 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'store_visible_in_checkout',
                    label: __('Keep store visible but disable checkout', 'multivendorx'),
                    value: 'store_visible_in_checkout',
                    desc: __('Displays the store and its products but prevents customers from placing new orders.Freeze all pending payments', 'multivendorx'),
                },
                {
                    key: 'freeze_all_payments',
                    label: __('Freeze all pending payments', 'multivendorx'),
                    value: 'freeze_all_payments',
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
