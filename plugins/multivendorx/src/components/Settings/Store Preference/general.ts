import { __ } from '@wordpress/i18n';
import wordpressLogo from '@/assets/images/wordpress.png';
import moodleLogo from '@/assets/images/moodle.png';

export default {
    id: 'general',
    priority: 1,
    name: __( 'General', 'multivendorx' ),
    desc: __(
        'Manage core store settings, including approval workflow, backend access, mapping options, and location-based search.',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_store',
            type: 'setting-toggle',
            label: __('Store Approval Workflow', 'multivendorx'),
            desc: __(
                'Decide how you want to approve new stores for your marketplace: <li>Choose whether to vet stores manually or let them start selling immediately.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'manually',
                    label: __('Manually', 'multivendorx'),
                    value: 'manually',
                },
                {
                    key: 'automatically',
                    label: __('Automatically', 'multivendorx'),
                    value: 'automatically',
                },
            ],
        },
        {
            key: 'store_backend_access',
            type: 'checkbox',
            label: __("Store Backend Dashboard Access", 'multivendorx'),
            desc: __('Give stores full WordPress backend access to manage their business from one integrated dashboard.', 'multivendorx'),
            options: [
                {
                    key: 'store_backend_access',
                    value: 'store_backend_access',
                },
            ],
            look: 'toggle',
            proSetting: true,
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Geo Location',
                'multivendorx'
            ),
        },  
        {
            key: 'radius_search_unit',
            type: 'setting-toggle',
            label: __( 'Show map', 'multivendorx' ),
            desc: __(
                'Select the unit of measurement for distance-based search filters on the store or product locator.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'both',
                    label: __( 'Both', 'multivendorx' ),
                    value: 'both',
                },
                {
                    key: 'store_lisiting',
                    label: __( 'Store Lisiting', 'multivendorx' ),
                    value: 'store_lisiting',
                },
                {
                    key: 'shop_page',
                    label: __( 'Shop Page', 'multivendorx' ),
                    value: 'shop_page',
                },
            ],
        },
        {
            key: 'choose_map_api',
            type: 'checkbox-custom-img',
            defaulValue: 'google_map_set',
            label: __( 'Map Provider', 'multivendorx' ),
            wrapperClass: 'img-checkbox-wrapper',
            inputWrapperClass: 'img-checkbox',
            desc: __( 'Select the map service that will power location features and maps across the site. Different providers may require an API key.', 'multivendorx' ),
            syncDirections: [
                {
                    key: 'google_map_set',
                    label: __( 'Google map', 'multivendorx' ),
                    value: __( 'google_map_set', 'multivendorx' ),
                    img1: wordpressLogo,
                },
                {
                    key: 'mapbox_api_set',
                    label: __( 'Mapbox map', 'multivendorx' ),
                    value: __( 'mapbox_api_set', 'multivendorx' ),
                    img1: moodleLogo,
                },
            ],
        },
        {
            key: 'google_api_key',
            type: 'text',
            label: __( 'Google Map API key', 'multivendorx' ),
            desc: __(
                '<a href="https://developers.google.com/maps/documentation/javascript/get-api-key#get-an-api-key" target="_blank">Click here to generate key</a>',
                'multivendorx'
            ),
            dependent: {
                key: 'choose_map_api',
                set: true,
                value: 'google_map_set',
            },
        },
        {
            key: 'mapbox_api_key',
            type: 'text',
            label: __( 'Mapbox access token', 'multivendorx' ),
            desc: __(
                '<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token</a>',
                'multivendorx'
            ),
            dependent: {
                key: 'choose_map_api',
                set: true,
                value: 'mapbox_api_set',
            },
        },
        // {
        //     key: 'store_address_input',
        //     type: 'textarea',
        //     label: __( 'Store Address Input', 'multivendorx' ),
            
        //     desc: __( 'Enter the full store address. This information may be displayed on the store page and used for shipping or location purposes.', 'multivendorx' ),
        //     placeholder: __( '123 Main Street, City, State, ZIP Code', 'multivendorx' ),
        // },
        {
            key: 'radius_search_distance',
            type: 'multi-number',
            label: __( 'Location Search', 'multivendorx' ),
            desc: __( 'Help customers find nearby stores with location-based search.', 'multivendorx' ),
            options: [
                {
                    key: 'radius_search_min_distance',
                    label: __( 'min', 'multivendorx' ),
                    type: 'number',
                },
                {
                    key: 'radius_search_max_distance',
                    label: __( 'max', 'multivendorx' ),
                    type: 'number',
                },
                {
                    key: 'radius_search_unit',
                    type: 'radio',
                    options: [
                        {
                            key: 'kilometers',
                            label: __( 'Kilometers', 'multivendorx' ),
                            value: 'kilometers',
                        },
                        {
                            key: 'miles',
                            label: __( 'Miles', 'multivendorx' ),
                            value: 'miles',
                        },
                    ],
                },                
            ],
        },    
    ],
};