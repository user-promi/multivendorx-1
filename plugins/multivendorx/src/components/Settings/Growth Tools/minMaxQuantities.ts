import { __ } from '@wordpress/i18n';

export default {
    id: 'min-max',
    priority: 3,
    name: __( 'Min-Max Quantities', 'multivendorx' ),
    desc: __( 'Set purchase quantity limits to manage inventory and bulk orders', 'multivendorx' ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_commission_rules_per_unit',
            type: 'multi-number',
            label: __( 'Global Quantity Rules', 'multivendorx' ),
            desc: __(
                'Choose the Min/Max rules you want to enable for products.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_unit',
                    label: __( 'min', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Percentage of product price per unit',
                        'multivendorx'
                    ),
                },
                {
                    key: 'mvx_commission_fixed_per_unit',
                    label: __( 'max', 'multivendorx' ),
                    type: 'number',
                    desc: __( 'Fixed amount per unit', 'multivendorx' ),
                },
            ],
        },
        
    ],
};
