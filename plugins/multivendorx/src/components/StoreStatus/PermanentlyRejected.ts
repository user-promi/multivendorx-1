import { __ } from '@wordpress/i18n';

export default {
    id: 'permanently-rejected',
    priority: 1,
    name: __('Permanently Rejected', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            blocktext: __(
                'The store application has been permanently rejected. Sellers can view their dashboard in read-only mode but cannot make changes or reapply without admin intervention.',
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
                            label: __('Cannot add or edit products', 'multivendorx'),
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
            value: 'Your application has been permanently rejected. Contact admin for clarification.',
            des: 'What pending stores can do',
        },
    ],
};
