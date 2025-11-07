import { __ } from '@wordpress/i18n';

export default {
    id: 'deactivated',
    priority: 1,
    name: __('Deactivated', 'multivendorx'),
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
                            label: __('Log in to dashboard', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('Access selling privileges', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('Submit reapplication or appeal', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('View or manage product listings', 'multivendorx'),
                            check: false,
                        },{
                            label: __('Retain any marketplace privileges', 'multivendorx'),
                            check: false,
                        },
                    ]
                },
            ],
        },
    ],
};
