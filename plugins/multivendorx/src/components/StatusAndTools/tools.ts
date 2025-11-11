import { __ } from '@wordpress/i18n';

export default {
    id: 'custom-css',
    priority: 7,
    name: __( 'Custom CSS', 'multivendorx' ),
    desc: __(
        'Custom CSS can be added here to modify and style the dashboard.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [     

        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __(
                'Put your custom css here, to customize the store dashbaord.',
                'multivendorx'
            ),
            label: __( 'Addional CSS', 'multivendorx' ),
        },
    ],
};
