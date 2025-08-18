import { __ } from '@wordpress/i18n';

export default {
    id: 'store-appearance',
    priority: 5,
    name: __( 'Appearance', 'multivendorx' ),
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
            label: __( 'Branding Logo', 'multivendorx' ),
            width: 75,
            height: 75,
            desc: __( 'Upload brand image as logo', 'multivendorx' ),
        },      
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Store Customization',
                'multivendorx'
            ),
        },
        {
            key: 'store_color_settings',
            type: 'color-setting',
            label: 'Dashboard Color Scheme',
            desc: 'Set the color theme for store dashboards - the admin interface stores use to manage their business',
            showPreview: true,
            predefinedOptions: [
                {
                    key: 'purple_pulse',
                    label: 'Purple Pulse',
                    value: 'purple_pulse',
                    color: ['#3c1f5d', '#5a2d82', '#7b3eb8', '#9e64d9'],
                },
                {
                    key: 'majestic_orange',
                    label: 'Majestic Orange',
                    value: 'majestic_orange',
                    color: ['#ff9f1a', '#ff6f00', '#ff8533', '#e65100'],
                },
                {
                    key: 'ocean',
                    label: 'Ocean',
                    value: 'ocean',
                    color: ['#102a43', '#243b53', '#2c5282', '#2b6cb0'],
                },
            ],
        }, 
    ],
};
