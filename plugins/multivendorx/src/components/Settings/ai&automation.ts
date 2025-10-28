import { __ } from '@wordpress/i18n';

export default {
    id: 'ai-automation',
    priority: 10,
    name: 'AI & Automation',
    desc: __('Help customers discover stores and products near them by enabling location-based search and maps.', 'multivendorx'),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            blocktext: __(
                'Coming Soon',
                'multivendorx'
            ),
        },
    ],
};
