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
                'The store has been permanently deactivated. Stores have read-only access to historical data, but the storefront is removed from public view and no changes can be made.',
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
                            label: __('Cannot log in to dashboard', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('Cannot access selling privileges', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('Cannot view or manage product listings', 'multivendorx'),
                            check: false,
                        },
                    ]
                },
            ],
        },
    ],
};
