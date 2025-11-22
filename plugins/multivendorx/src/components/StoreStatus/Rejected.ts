import { __ } from '@wordpress/i18n';

export default {
    id: 'rejected',
    priority: 1,
    name: __('Rejected', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_promotion_limit',
            label: __('Account capabilities', 'multivendorx'),
            type: 'nested',
            single: true,
            nestedFields: [
                {
                    key: 'paid_promotion_limit',
                    type: 'checklist',
                    options: [
                        {
                            label: __('Log in to dashboard', 'multivendorx'),
                            check: true,
                        },
                        {
                            label: __('View rejection reason', 'multivendorx'),
                            check: true,
                        },
                        {
                            label: __('Submit new application', 'multivendorx'),
                            check: true,
                        },
                        {
                            label: __('Cannot modify products or settings', 'multivendorx'),
                            check: false,
                        },
                        {
                            label: __('Cannot sell or fulfill orders', 'multivendorx'),
                            check: false,
                        },
                    ]
                },
            ],
        },
        {
            key: 'rejected_msg',
            label: 'Message shown to rejected stores',
            type: 'textarea',
            des: 'What pending stores can do',
        },
    ],
};
