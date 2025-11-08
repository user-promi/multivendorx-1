import { __ } from '@wordpress/i18n';

export default {
    id: 'pending-approval',
    priority: 1,
    name: __('Pending Approval', 'multivendorx'),
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
            label: __('Store promotion limit', 'multivendorx'),
            type: 'nested',
            single: true,
            nestedFields: [
                {
                    key: 'paid_promotion_limit',
                    type: 'checklist',
                    options: [
                        {
                            label: __('Can log in to dashboard', 'multivendorx'),
                            check: true,
                        },
                        {
                            label: __('Cannot modify store settings', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('Denied from adding or editing products', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('Cannot process or fulfill orders', 'multivendorx'),
                            check: false,
                        },
                    ]
                },
            ],
        },
        {
            key: 'pending_msg',
            label: 'Message shown to pending stores',
            type: 'text',
            value: 'Your store is awaiting approval and will be activated soon.',
            des: 'What pending stores can do',
        },
    ],
};
