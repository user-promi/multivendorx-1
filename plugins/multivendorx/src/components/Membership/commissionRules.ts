import { __ } from '@wordpress/i18n';

export default {
    id: 'commission-rules',
    priority: 4,
    name: __('Commission Rules', 'multivendorx'),
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
            label: __('Commission Mode', 'multivendorx'),
            settingDescription: __("Choose whether to use global commission settings or custom plan-based commission", 'multivendorx'),
            desc: __(
                '',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_order',
                    label: __('Global', 'multivendorx'),
                    value: 'store_order',
                },
                {
                    key: 'per_item',
                    label: __('Plan Based', 'multivendorx'),
                    value: 'per_item',
                },
            ],
        },
    ],
};
