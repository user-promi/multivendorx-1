import { __ } from '@wordpress/i18n';

export default {
    id: 'setup-wizard',
    priority: 3,
    name: 'Geo Location',
    desc: __(
        'Control whether new stores get step-by-step guidance or go directly to their dashboar',
        'multivendorx'
    ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
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
            type: 'setting-toggle',
            defaulValue: 'google_map_set',
            label: __( 'Map Provider', 'multivendorx' ),
            desc: __( 'Select the map service that will power location features and maps across the site. Different providers may require an API key.', 'multivendorx' ),
            options: [
                {
                    key: 'google_map_set',
                    label: __( 'Google map', 'multivendorx' ),
                    value: __( 'google_map_set', 'multivendorx' ),
                },
                {
                    key: 'mapbox_api_set',
                    label: __( 'Mapbox map', 'multivendorx' ),
                    value: __( 'mapbox_api_set', 'multivendorx' ),
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
