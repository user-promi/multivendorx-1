import { __ } from '@wordpress/i18n';

export default {
    id: 'commission-rule',
    priority: 1,
    name: __( 'Commissions', 'multivendorx' ),
    desc: __(
        "Tailor your marketplace's commission plan to fit your revenue-sharing preferences.",
        'multivendorx'
    ),
    icon: 'adminlib-dynamic-pricing',
    submitUrl: 'settings',
    modal: [
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __( 'Commission Type', 'multivendorx' ),
            desc: __(
                'Choose the type of commission structure that best fits your marketplace model.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __( 'Per Transaction', 'multivendorx' ),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __( 'Per Unit', 'multivendorx' ),
                    value: 'per_unit',
                },
                {
                    key: 'per_store',
                    label: __( 'Per Store', 'multivendorx' ),
                    value: 'per_store',
                },
                {
                    key: 'commission_by_product_price',
                    label: __( 'By Product Price', 'multivendorx' ),
                    value: 'commission_by_product_price',
                },
                {
                    key: 'commission_by_purchase_quantity',
                    label: __( 'By Purchase Quantity', 'multivendorx' ),
                    value: 'commission_by_purchase_quantity',
                },
            ],
        },
        
        // Nested Input fields added later
        {
            key: 'mvx_commission_rules_per_transaction',
            type: 'multi-number',
            label: __( 'Commission Value', 'multivendorx' ),
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_transaction',
                    label: __( '%', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Percentage of product price per transaction',
                        'multivendorx'
                    ),
                },
                {
                    key: 'mvx_commission_fixed_per_transaction',
                    label: __( '$', 'multivendorx' ),
                    type: 'number',
                    desc: __( 'Fixed amount per transaction', 'multivendorx' ),
                },                
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'per_transaction',
            },
        },
        {
            key: 'mvx_commission_rules_per_unit',
            type: 'multi-number',
            label: __( 'Commission Value', 'multivendorx' ),
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_unit',
                    label: __( '%', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Percentage of product price per unit',
                        'multivendorx'
                    ),
                },
                {
                    key: 'mvx_commission_fixed_per_unit',
                    label: __( '$', 'multivendorx' ),
                    type: 'number',
                    desc: __( 'Fixed amount per unit', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'per_unit',
            },
        },
        {
            key: 'mvx_commission_rules_per_unit',
            type: 'multi-number',
            label: __( 'Commission Value', 'multivendorx' ),
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_unit',
                    label: __( '%', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Percentage of product price per unit',
                        'multivendorx'
                    ),
                },
                {
                    key: 'mvx_commission_fixed_per_unit',
                    label: __( '$', 'multivendorx' ),
                    type: 'number',
                    desc: __( 'Fixed amount per unit', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'per_store',
            },
        },
        {
            key: 'commission_by_product_price',
            type: 'nested',
            label: 'Commission By Product Price',
            addButtonLabel: 'Add New',
            deleteButtonLabel: 'Remove',
            nestedFields: [
                {
                    key: 'product_cost',
                    type: 'select',
                    label: 'If product',
                    options: [
                        { value: 'up_to', label: 'Price' },
                        { value: 'more_than', label: 'Quantity' },
                    ],
                },
                {
                    key: 'rule',
                    type: 'select',
                    options: [
                        { value: 'up_to', label: 'Up To' },
                        { value: 'more_than', label: 'More than' },
                        { value: 'more', label: 'More than' },
                    ],
                },
                {
                    key: 'commission_type',
                    type: 'number',
                    label: 'To ',
                },
                {
                    key: 'commission_percent',
                    type: 'multi-number',
                    label: 'apply commission',
                    options: [
                        {
                            key: 'mvx_commission_percentage_per_unit',
                            label: __( '%', 'multivendorx' ),
                            type: 'number',
                            desc: __(
                                'Percentage of product price per unit',
                                'multivendorx'
                            ),
                        },
                        {
                            key: 'mvx_commission_fixed_per_unit',
                            label: __( '$', 'multivendorx' ),
                            type: 'number',
                            desc: __( 'Fixed amount per unit', 'multivendorx' ),
                        },
                    ],
                },
                {
                    key: 'mvx_commission_rules_per_unit',
                    type: 'multi-number',
                    label: __( 'Commission Value', 'multivendorx' ),
                    desc: __(
                        'This is the default commission amount that will be applicable for all transactions.',
                        'multivendorx'
                    ),
                    labelAfterInput:true,
                    options: [
                        {
                            key: 'mvx_commission_percentage_per_unit',
                            label: __( '%', 'multivendorx' ),
                            type: 'number',
                            desc: __(
                                'Percentage of product price per unit',
                                'multivendorx'
                            ),
                        },
                        {
                            key: 'mvx_commission_fixed_per_unit',
                            label: __( '$', 'multivendorx' ),
                            type: 'number',
                            desc: __( 'Fixed amount per unit', 'multivendorx' ),
                        },
                    ],
                    dependent: {
                        key: 'commission_type',
                        set: true,
                        value: 'per_store',
                    },
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'commission_by_product_price',
            },
        },
        {
            key: 'commission_by_purchase_quantity',
            type: 'nested',
            label: 'Commission By Purchase Quantity',
            addButtonLabel: 'Add New',
            deleteButtonLabel: 'Remove',
            nestedFields: [
                {
                    key: 'purchase_quantity',
                    type: 'number',
                    label: 'Purchase Quantity',
                    placeholder: 'Enter quantity',
                },
                {
                    key: 'quantity_rule',
                    type: 'select',
                    label: 'Rule',
                    options: [
                        { value: 'up_to', label: 'Up To' },
                        { value: 'more_than', label: 'More than' },
                    ],
                },
                {
                    key: 'quantity_commission_type',
                    type: 'select',
                    label: 'Commission Type',
                    options: [
                        { value: 'percent', label: 'Percent' },
                        { value: 'fixed', label: 'Fixed' },
                        { value: 'percent_fixed', label: 'Percent + Fixed' },
                    ],
                },
                {
                    key: 'quantity_commission_percent',
                    type: 'number',
                    label: 'Commission Percent (%)',
                    placeholder: 'Enter percent',
                },
                {
                    key: 'quantity_commission_fixed',
                    type: 'number',
                    label: 'Commission Fixed ($)',
                    placeholder: 'Enter fixed amount',
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'commission_by_purchase_quantity',
            },
        },          
        {
            key: 'separator_content',
            type: 'section',
            hint:__('What`s Included in Store Commission ','multivendorx'),
            desc:__('Choose which order components are factored into commission calculations','multivendorx')
        },
        {
            key: 'give_shipping',
            label: __( 'Shipping', 'multivendorx' ),
            desc: __(
                'Add shipping fees to the commission calculation base amount',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'give_shipping',
                    value: 'give_shipping',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'commission_calculation_on_tax',
            type: 'setting-toggle',
            label: __( 'Tax', 'multivendorx' ),
            desc: __(
                'Calculate commission based on the total including taxes, not just the product price.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __( 'No Tax', 'multivendorx' ),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __( '100% tax', 'multivendorx' ),
                    value: 'per_unit',
                },
                {
                    key: 'per_store',
                    label: __( 'Commision based tax', 'multivendorx' ),
                    value: 'per_store',
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            hint:__('Coupon & Discount Handling','multivendorx'),
            desc:__('Define how discounts and coupons affect commission calculations','multivendorx')
        },
        {
            key: 'commission_include_coupon',
            label: __( 'Who will bear the Coupon Cost', 'multivendorx' ),
            type: 'checkbox',
            desc: __(
                'Tap to let the stores bear the coupon discount charges of the coupons created by them',
                'multivendorx'
            ),
            options: [
                {
                    key: 'commission_include_coupon',
                    value: 'commission_include_coupon',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'admin_coupon_excluded',
            label: __( 'Exclude Admin-Created Coupons from Store Commission', 'multivendorx' ),
            desc: __(
                'When admin creates marketplace-wide coupons, don`t reduce store commissions',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'admin_coupon_excluded',
                    value: 'admin_coupon_excluded',
                },
            ],
            look: 'toggle',
        },
    ],
};
