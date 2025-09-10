import { __ } from '@wordpress/i18n';
import image1 from "../../../assets/images/popup-image.png";
import image2 from "../../../assets/images/popup-image.png";
import image3 from "../../../assets/images/popup-image.png";



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
            desc: __('Upload a logo to brand the vendor dashboard. If left blank, the site name will be shown instead.', 'multivendorx'),
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
                    key: 'orchid_bloom',
                    label: 'Orchid Bloom',
                    value: 'orchid_bloom',
                    colors: {
                        themeColor: '#3c1f5d',
                        buttonBg: '#5b3488ff',
                        buttonHoverBg: '#7b3eb8',
                    },
                },
                {
                    key: 'emerald_edge',
                    label: 'Emerald Edge',
                    value: 'emerald_edge',
                    colors: {
                        themeColor: '#2ecc71',       // Green
                        buttonBg: '#27ae60',
                        buttonHoverBg: '#1e8449',
                    },
                },
                {
                    key: 'solar_ember',
                    label: 'Solar Ember',
                    value: 'solar_ember',
                    colors: {
                        themeColor: '#e67e22',       // Orange
                        buttonBg: '#d35400',
                        buttonHoverBg: '#ba4a00',
                    },
                },
                {
                    key: 'crimson_blaze',
                    label: 'Crimson Blaze',
                    value: 'crimson_blaze',
                    colors: {
                        themeColor: '#e74c3c',       // Red
                        buttonBg: '#c0392b',
                        buttonHoverBg: '#922b21',
                    },
                },
                {
                    key: 'golden_ray',
                    label: 'Golden Ray',
                    value: 'golden_ray',
                    colors: {
                        themeColor: '#f1c40f',       // Yellow
                        buttonBg: '#f39c12',
                        buttonHoverBg: '#d68910',
                    },
                },
                {
                    key: 'obsidian_night',
                    label: 'Obsidian Night',
                    value: 'obsidian_night',
                    colors: {
                        themeColor: '#2c3e50',       // Black/Dark Gray
                        buttonBg: '#1c2833',
                        buttonHoverBg: '#17202a',
                    },
                },

            ],
        }
    ],
};
