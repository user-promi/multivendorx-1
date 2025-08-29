import { __ } from '@wordpress/i18n';

export default {
    id: 'min-max',
    priority: 3,
    name: __( 'Min and Max Quantities', 'multivendorx' ),
    desc: __( 'Set purchase limits to control inventory and bulk ordering.', 'multivendorx' ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mapbox_api_key',
            type: 'text',
            label: __( 'Mapbox access token', 'multivendorx' ),
            desc: __(
                '<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token</a>',
                'multivendorx'
            ),
            size:"8rem",
            before: "https://multivendorxs.mystagingwebsite.com/",
            after: "https://multivendorxs.mystagingwebsite.com/",
        },
        {
            key: 'mvx_commission_rules_per_unit',
            type: 'multi-number',
            label: __( 'Global quantity rules', 'multivendorx' ),
            desc: __(
                'Define minimum and maximum purchase quantities for products.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_unit',
                    label: __( 'Min', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Set the lowest number of units a customer can order.',
                        'multivendorx'
                    ),
                },
                {
                    key: 'mvx_commission_fixed_per_unit',
                    label: __( 'Max', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Set the highest number of units a customer can order.',
                        'multivendorx'
                    ),
                },
            ],
            proSetting:true
        },
    ],
};
