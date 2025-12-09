import { __ } from '@wordpress/i18n';

export default {
    id: 'product-limits',
    priority: 5,
    name: __('Product Limits', 'multivendorx'),
    desc: __(
        'Site errors and events are logged for easy troubleshooting.',
        'multivendorx'
    ),
    icon: 'adminlib-database',
    submitUrl: 'settings',
    modal: [
        {
            key: 'sender_name',
            type: 'text',
            label: __('Total Product Limit', 'multivendorx'),
            placeholder: __('Marketplace Team', 'multivendorx'),
            settingDescription: __('Enter 0 for unlimited products', 'multivendorx'),
        },
    ],
};
