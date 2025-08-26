import { __ } from '@wordpress/i18n';

export default {
    id: 'store-appearance',
    priority: 5,
    name: __('Appearance', 'multivendorx'),
    desc: __(
        "Control how stores look and feel on your marketplace",
        'multivendorx'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_new_dashboard_site_logo',
            type: 'file',
            label: __('Branding logo', 'multivendorx'),
            size: 'small',
            desc: __('Upload brand image as logo', 'multivendorx'),
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Store customization',
                'multivendorx'
            ),
        },
        {
            key: 'store_color_settings',
            type: 'color-setting',
            label: 'Dashboard color scheme',
            desc: 'Set the color theme for store dashboards - the admin interface stores use to manage their business',
            showPreview: true,
            predefinedOptions: [
                {
                    key: 'purple_pulse',
                    label: 'Purple Pulse',
                    value: 'purple_pulse',
                    colors: {
                        buttonText: '#ffffff',
                        buttonBg: '#3c1f5d',
                        buttonBorder: '#5a2d82',
                        buttonHoverText: '#ffffff',
                        buttonHoverBg: '#7b3eb8',
                        buttonHoverBorder: '#9e64d9',
                        sidebarText: '#ffffff',
                        sidebarBg: '#3c1f5d',
                        sidebarActiveText: '#ffffff',
                        sidebarActiveBg: '#5a2d82',
                    },
                },
                {
                    key: 'majestic_orange',
                    label: 'Majestic Orange',
                    value: 'majestic_orange',
                    colors: {
                        buttonText: '#ffffff',
                        buttonBg: '#ff9f1a',
                        buttonBorder: '#ff6f00',
                        buttonHoverText: '#ffffff',
                        buttonHoverBg: '#ff8533',
                        buttonHoverBorder: '#e65100',
                        sidebarText: '#ffffff',
                        sidebarBg: '#ff9f1a',
                        sidebarActiveText: '#ffffff',
                        sidebarActiveBg: '#ff6f00',
                    },
                },
                {
                    key: 'ocean',
                    label: 'Ocean',
                    value: 'ocean',
                    colors: {
                        buttonText: '#ffffff',
                        buttonBg: '#102a43',
                        buttonBorder: '#243b53',
                        buttonHoverText: '#ffffff',
                        buttonHoverBg: '#2c5282',
                        buttonHoverBorder: '#2b6cb0',
                        sidebarText: '#ffffff',
                        sidebarBg: '#102a43',
                        sidebarActiveText: '#ffffff',
                        sidebarActiveBg: '#243b53',
                    },
                },
            ],
        }
    ],
};
