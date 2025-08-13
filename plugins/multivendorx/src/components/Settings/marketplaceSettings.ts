import { __ } from '@wordpress/i18n';

export default {
    id: 'marketplace-settings',
    priority: 1,
    name: __( 'Marketplace Settings', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [     
        {
            key: 'store_registration_page',
            type: 'select',
            label: __( 'Store Registration Page', 'multivendorx' ),
            desc: __(
                'Select the page where you have inserted the <code>[store_registration]</code> shortcode. This page will be used to onboard new stores.',
                'multivendorx'
            ),
            options: appLocalizer.pages_list,
        },
        {
            key: 'store_dashboard_page',
            type: 'select',
            label: __( 'store dashboard page', 'multivendorx' ),
            desc: __(
                'Select the page on which you have inserted <code>[mvx_store]</code> shortcode. This will be the main dashboard page for your vendors to manage their store.',
                'multivendorx'
            ),
            options: appLocalizer.pages_list,
        },
        {
            key: 'store_url',
            type: 'text',
            desc: __(
                'Define the custom slug for the store store URL. For example, in the URL: https://yourdomain.com/store/[this-text]/[store-name], "[this-text]" will be replaced by the slug you set here.',
                'multivendorx'
            ),
            label: __('Store URL', 'multivendorx'),
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'text',
            label: __( 'TinyMCE Api', 'multivendorx' ),
            desc: __(
                'Set TinyMCE Api key <a href="https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target="_blank">Click here to generate key</a> to enable the text editor for vendors. This allows them to format their product descriptions and other content with ease.',
                'multivendorx'
            ),
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
            optionLabel: [ 'Shortcodes', 'Description' ],
            options: [
                {
                    key: '',
                    label: '[mvx_store]',
                    desc: __(
                        'Enables you to create a store dashboard ',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[store_registration]',
                    desc: __(
                        'Creates a page where the store registration form is available',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[store_coupons]',
                    desc: __(
                        'Lets you view  a brief summary of the coupons created by the store and number of times it has been used by the customers',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_recent_products]',
                    desc: __(
                        'Allows you to glance at the recent products added by store',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_products]',
                    desc: __(
                        'Displays the products added by store',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_featured_products]',
                    desc: __(
                        'Exhibits featured products added by the store',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_sale_products]',
                    desc: __(
                        'Allows you to see the products put on sale by a store',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_top_rated_products]',
                    desc: __(
                        'Displays the top rated products of the store',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_best_selling_products]',
                    desc: __(
                        'Presents you the option of viewing the best selling products of the vendor',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_product_category]',
                    desc: __(
                        'Lets you see the product categories used by the vendor',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_vendorslist]',
                    desc: __(
                        'Shows customers a list of available store.',
                        'multivendorx'
                    ),
                },
            ],
        },

    ],
};