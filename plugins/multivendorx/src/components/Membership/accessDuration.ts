import { __ } from '@wordpress/i18n';

export default {
    id: 'access-duration',
    priority: 3,
    name: __('Access Duration', 'multivendorx'),
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
            label: __('Plan Validity', 'multivendorx'),
            desc: __(
                'Decide how the system should calculate the marketplace commission.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_order',
                    label: __('Unlimited', 'multivendorx'),
                    value: 'store_order',
                },
                {
                    key: 'per_item',
                    label: __('Fixed Days', 'multivendorx'),
                    value: 'per_item',
                },
            ],
        },
        {
            key: 'plan-price',
            type: 'number',
            size: '10rem',
            desc: 'Number of days the plan remains valid',
            label: __('Validity Duration', 'multivendorx'),
        },
    ],
};
