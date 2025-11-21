import { __ } from '@wordpress/i18n';

export default {
    id: 'custom-css',
    priority: 7,
    name: __( 'Custom CSS', 'multivendorx' ),
    desc: __(
        'Custom CSS can be added here to modify and style the dashboard.',
        'multivendorx'
    ),
    icon: 'adminlib-coding',
    submitUrl: 'settings',
    modal: [     

        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __(
                'Add your own CSS here to modify and style the dashboard to match your preferences.',
                'multivendorx'
            ),
            label: __( 'Addional CSS', 'multivendorx' ),
        },
    ],
};
