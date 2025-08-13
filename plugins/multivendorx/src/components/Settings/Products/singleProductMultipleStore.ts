import { __ } from '@wordpress/i18n';

export default {
    id: 'single-product-multiple-store',
    priority: 2,
    name: __( 'Single Product Multiple Store', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        {
            key: 'is_singleproductmultistore',
            type: 'checkbox',
            label: __( 'Allow Store to Copy Products', 'multivendorx' ),
            desc: __(
                'Let stores search for products sold on your site and sell them from their store.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_singleproductmultistore',
                    value: 'is_singleproductmultistore',
                },
            ],
            look: 'toggle',
            // moduleEnabled: 'spmv',
        },
        {
            key: 'singleproductmultistore_show_order',
            type: 'select',
            label: __( 'Display Shop Page Product', 'multivendorx' ),
            desc: __(
                'Select the criteria on which the SPMV product is going to be based on.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'min-price',
                    label: __( 'Min Price', 'multivendorx' ),
                    value: __( 'min-price', 'multivendorx' ),
                },
                {
                    key: 'max-price',
                    label: __( 'Max Price', 'multivendorx' ),
                    value: __( 'max-price', 'multivendorx' ),
                },
                {
                    key: 'top-rated-store',
                    label: __( 'Top rated store', 'multivendorx' ),
                    value: __( 'top-rated-store', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'is_singleproductmultistore',
                set: true,
            },
            proSetting: true,
            moduleEnabled: 'spmv',
        },
        {
            key: 'moreoffers_display_position',
            type: 'select',
            label: __( 'More Offers Display Position', 'multivendorx' ),
            desc: __(
                'Select where you want the "More Offers" section to appear on the Single Product Page.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'none',
                    label: __( 'None', 'multivendorx' ),
                    value: 'none',
                },
                {
                    key: 'above-tabs',
                    label: __( 'Above Single Page Product Tabs', 'multivendorx' ),
                    value: 'above-tabs',
                },
                {
                    key: 'inside-tabs',
                    label: __( 'Display Inside Single Page Product Tabs', 'multivendorx' ),
                    value: 'inside-tabs',
                },
                {
                    key: 'after-tabs',
                    label: __( 'After Single Page Product Tabs', 'multivendorx' ),
                    value: 'after-tabs',
                },
            ],
            dependent: {
                key: 'is_singleproductmultistore',
                set: true,
            },
            proSetting: false,
            moduleEnabled: 'spmv',
        },
    ],
};