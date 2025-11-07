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
                'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
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
        {
            key: 'pending_msg',
            label: 'Message shown to pending stores',
            type: 'text',
            value: 'Message shown to pending stores:',
            des: 'What pending stores can do',
        },
    ],
};
