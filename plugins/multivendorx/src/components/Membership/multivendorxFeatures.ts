import { __ } from '@wordpress/i18n';

export default {
    id: 'multivendorx-features',
    priority: 6,
    name: __('MultivendorX Pro Features', 'multivendorx'),
    desc: __(
        'Site errors and events are logged for easy troubleshooting.',
        'multivendorx'
    ),
    icon: 'adminlib-database',
    submitUrl: 'settings',
    modal: [
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __('Plan Pricing Type', 'multivendorx'),
            settingDescription: __("Decide how the system should calculate the marketplace commission.", 'multivendorx'),
            desc: __(
                '',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_order',
                    label: __('Free', 'multivendorx'),
                    value: 'store_order',
                },
                {
                    key: 'per_item',
                    label: __('Paid', 'multivendorx'),
                    value: 'per_item',
                },
            ],
        },
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __('Billing Cycle', 'multivendorx'),
            desc: __(
                '',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_order',
                    label: __('Monthly', 'multivendorx'),
                    value: 'store_order',
                },
                {
                    key: 'per_item',
                    label: __('Yearly', 'multivendorx'),
                    value: 'per_item',
                },
                {
                    key: 'per_item',
                    label: __('One Time', 'multivendorx'),
                    value: 'per_item',
                },
            ],
        },
    ],
};
