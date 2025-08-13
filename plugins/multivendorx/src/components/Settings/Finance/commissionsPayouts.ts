import { __ } from '@wordpress/i18n';

export default {
    id: 'commission-rule',
    priority: 1,
    name: __('Commissions', 'multivendorx'),
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
            label: __('Commission Type', 'multivendorx'),
            desc: __(
                'Choose the type of commission structure that best fits your marketplace model.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __('Per Transaction', 'multivendorx'),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __('Per Unit', 'multivendorx'),
                    value: 'per_unit',
                },
                {
                    key: 'rule_based',
                    label: __('Rule Based', 'multivendorx'),
                    value: 'commission_by_product_price',
                },
            ],
        },

        // Nested Input fields added later
        {
            key: 'mvx_commission_rules_per_transaction',
            type: 'multi-number',
            label: __('Commission Value', 'multivendorx'),
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_transaction',
                    label: __('%', 'multivendorx'),
                    type: 'number',
                    desc: __(
                        'Percentage of product price per transaction',
                        'multivendorx'
                    ),
                    labelAfterInput: true
                },
                {
                    key: 'mvx_commission_fixed_per_transaction',
                    label: __('$', 'multivendorx'),
                    type: 'number',
                    desc: __('Fixed amount per transaction', 'multivendorx'),
                    labelAfterInput: false
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
            label: __('Commission Value', 'multivendorx'),
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_unit',
                    label: __('%', 'multivendorx'),
                    type: 'number',
                },
                {
                    key: 'mvx_commission_fixed_per_unit',
                    label: __('$', 'multivendorx'),
                    type: 'number',
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'per_unit',
            },
        },
        {
            key: 'rule',
            type: 'nested',
            label: 'Rule',
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
                    label: 'is',
                    options: [
                        { value: 'up_to', label: 'Up To' },
                        { value: 'more_than', label: 'More than' },
                        { value: 'more', label: 'More than' },
                    ],
                },
                {
                    key: 'commission_type',
                    type: 'multi-number',
                    options: [
                        {
                            key: 'mvx_commission_fixed_per_unit',
                            label: __('$', 'multivendorx'),
                            type: 'number',
                        },
                    ],
                },
                {
                    key: 'commission_percent',
                    type: 'multi-number',
                    label: 'apply commission',
                    options: [
                        {
                            key: 'mvx_commission_fixed_per_unit',
                            label: __('Fixed $', 'multivendorx'),
                            type: 'number',
                            labelAfterInput: false

                        },
                    ],
                },
                {
                    key: 'commission_percent',
                    type: 'multi-number',
                    label: '+',
                    options: [
                        {
                            key: 'mvx_commission_fixed_per_unit',
                            label: __('%', 'multivendorx'),
                            type: 'number',
                            labelAfterInput: true

                        },
                    ],
                },

            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'commission_by_product_price',
            },
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __('What`s Included in Store Commission ', 'multivendorx'),
            desc: __('Choose which order components are factored into commission calculations', 'multivendorx')
        },
        {
            key: 'give_shipping',
            label: __('Shipping', 'multivendorx'),
            desc: __(
                'Add shipping fees to the commission calculation base amount. <li>If Enabled: Add shipping charges to the commission calculation base amount <li>If Excluded: Calculate commission only on product price, excluding shipping costs',
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
            label: __('Tax', 'multivendorx'),
            desc: __(
                'Configure how taxes are treated in commission calculations:<li>No Tax Inclusion: Calculate commission on pre-tax amount only.<li>100% Tax Inclusion: Include full tax amount in commission base.<li>Commission-Based Tax: Calculate commission on total order value including taxes, not just product price',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __('No Tax', 'multivendorx'),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __('100% tax', 'multivendorx'),
                    value: 'per_unit',
                },
                {
                    key: 'per_store',
                    label: __('Commision based tax', 'multivendorx'),
                    value: 'per_store',
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __('Coupon & Discount Handling', 'multivendorx'),
            desc: __('Define how discounts and coupons affect commission calculations', 'multivendorx')
        },

        {
            key: 'commission_calculation_on_tax',
            type: 'setting-toggle',
            label: __('Coupon Cost Assignment', 'multivendorx'),
            desc: __(
                'Configure how coupons affect store commission calculations:<li>Stores Pay Own Discounts: When a store creates a coupon, they absorb the discount cost from their earnings.<li>Platform Pays All Discounts: Marketplace covers all discount costs (store-created and admin-created coupons',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __('Stores Pay Own Discounts', 'multivendorx'),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __('Platform Pays All Discounts', 'multivendorx'),
                    value: 'per_unit',
                },
            ],
        },
        {
            key: 'commission_on_admin_coupons', // changed key
            type: 'setting-toggle',
            label: __('Commission on Admin Coupons', 'multivendorx'),
            desc: __(
                'Defines whether store commission is calculated before or after admin-applied discounts.<li>Before Admin Discount: Store commission based on original order amount, protecting store earnings from marketplace promotions.<li>After Admin Discount: Store commission based on final discounted amount when admin coupons are applied',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __('Before Admin Discount', 'multivendorx'),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __('After Admin Discount', 'multivendorx'),
                    value: 'per_unit',
                },
            ],
        }
        
    ],
};
