import { __ } from '@wordpress/i18n';

export default {
    id: 'marketplace-settings',
    priority: 1,
    name: __( 'Overview', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    video: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/video/general-settings',
    },
    docs: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/docs/general-settings',
    },
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [          
        {
            key: 'store_registration_page',
            type: 'select',
            label: __( 'Store registration page', 'multivendorx' ),
            desc: __(
                'Choose the page with [store_registration] shortcode, this is where stores sign up.',
                'multivendorx'
            ),
            className:"select-class",
            options: appLocalizer.pages_list,
        },
        // {
        //     key: "sample_map",
        //     type: "map",
        //     label: 'Sample map', 
        //     desc: "This is a simple map",
        //     Lat: 22.5726,
        //     Lng: 88.3639
        // },
        {
            key: 'store_dashboard_page',
            type: 'select',
            label: __( 'Store dashboard page', 'multivendorx' ),
            desc: __(
                'The page with [mvx_store] shortcode will act as the store’s control center.',
                'multivendorx'
            ),
            options: appLocalizer.pages_list,
            
        },
        {
            key: 'store_url',
            type: 'text',
            label: __( 'Store URL', 'multivendorx' ),
            desc: __(
                'Set a custom slug for your store URL. For example, in the URL: https://yourdomain.com/[store]/store-slug, the default word [store] can be replaced with any slug you define here.',
                'multivendorx'
            ),
            size:"8rem",
            preText: appLocalizer.site_url + '/',
            postText: "/sample-store-slug/",
            proSetting: true,
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Enable content styling tools for stores',
                'multivendorx'
            ),
        },
        {
            key: 'tinymce_api_section',
            type: 'text',
            label: __( 'Tinymce API', 'multivendorx' ),
            desc: __(
                'To enable styling tools (rich text editing) <a href="https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target="_blank">get the API key</a> and paste it here.This allows them to format their product descriptions and other content with ease.',
                'multivendorx'
            ),
            moduleEnabled: 'advertisement',
        },        
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Shortcode library',
                'multivendorx'
            ),
        },
        {
            key: 'available_shortcodes',
            type: 'shortcode-table',
            label: __( 'Available shortcodes', 'multivendorx' ),
            desc: __( '', 'multivendorx' ),
            optionLabel: [ 'Shortcodes', 'Description', 'Arguments' ],
            icon: 'adminlib-general-tab',
            options: [
                {
                    key: '',
                    label: '[mvx_store]',
                    name: 'MVX Best Selling Products',
                    desc: __(
                        'Enables you to create a store dashboard.',
                        'multivendorx'
                    ),
                    arguments: '<ul><li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li> <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li></ul>',
                },
                {
                    key: '',
                    label: '[mvx_store]',
                    name: 'MVX Best Selling Products',
                    desc: __(
                        'Enables you to create a store dashboard.',
                        'multivendorx'
                    ),
                    arguments: '<ul><li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li> <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li></ul>',
                },
                {
                    key: '',
                    label: '[mvx_store]',
                    name: 'MVX Best Selling Products',
                    desc: __(
                        'Enables you to create a store dashboard.',
                        'multivendorx'
                    ),
                    arguments: '<ul><li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li> <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li></ul>',
                },
                {
                    key: '',
                    label: '[mvx_store]',
                    name: 'MVX Best Selling Products',
                    desc: __(
                        'Enables you to create a store dashboard.',
                        'multivendorx'
                    ),
                    arguments: '<ul><li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li> <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li></ul>',
                },
                {
                    key: '',
                    label: '[mvx_store]',
                    name: 'MVX Best Selling Products',
                    desc: __(
                        'Enables you to create a store dashboard.',
                        'multivendorx'
                    ),
                    arguments: '<ul><li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li> <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li>  <li><b>vendor</b> - Vendor ID, slug, email, or username (optional)</li></ul>',
                },                
            ],
        },
    ],
};
