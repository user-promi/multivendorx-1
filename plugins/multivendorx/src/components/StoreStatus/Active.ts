import { __ } from '@wordpress/i18n';

export default {
    id: 'active',
    priority: 1,
    name: __('Active', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            blocktext: __(
                'The store is active and fully operational. Stores have complete access to manage products, process orders, receive payouts, and configure all store settings.',
                'multivendorx'
            ),
        },
        {
            key: 'store_promotion_limit',
            // label: __('Store promotion limit', 'multivendorx'),
            type: 'nested',
            single: true,
            nestedFields: [
                {
                    key: 'paid_promotion_limit',
                    type: 'setup',
                    label: 'Dashboard access settings',
                    desc: 'Control what dashboard sections and tools are available to active stores.',
                    link: '#',
                },
            ],
        },

    ],
};
