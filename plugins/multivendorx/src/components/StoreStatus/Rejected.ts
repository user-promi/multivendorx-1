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
            key: 'pending_msg',
            label: 'Message shown rejected stores',
            type: 'textarea',
            value: 'Your application was not approved. Please review feedback and reapply.',
            des: 'What pending stores can do',
        },
    ],
};
