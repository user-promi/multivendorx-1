import { __ } from '@wordpress/i18n';

export default {
    id: 'store-inventory',
    priority: 4,
    name: __( 'Store Inventory', 'multivendorx' ),
    desc: __(
        'Manage inventory alerts and stock monitoring settings for vendors in your marketplace',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        {
            key: 'low_stock_alert',
            type: 'checkbox',
            label: __( 'Low Stock Alerts', 'multivendorx' ),
            desc: __(
                'Notify vendors when inventory is running low.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'low_stock_alert',
                    value: 'low_stock_alert',
                },
            ],
            look: 'toggle',
        },
        
        {
            key: 'out_of_stock_alert',
            type: 'checkbox',
            label: __( 'Out Of Stock Alerts', 'multivendorx' ),
            desc: __(
                'Notify vendors when products are unavailable.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'out_of_stock_alert',
                    value: 'out_of_stock_alert',
                },
            ],
            look: 'toggle',
        },
        
       
    ],
};