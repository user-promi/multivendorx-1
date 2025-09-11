import { __ } from '@wordpress/i18n';

export default {
    id: 'store-commissions',
    priority: 1,
    name: __('Store commissions', 'multivendorx'),
    desc: __(
        "Tailor your marketplace commission plan to decide how much revenue stores earn from each sale.",
        'multivendorx'
    ),
    icon: 'adminlib-rules',
    submitUrl: 'settings',
    modal: [
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __('Commission type', 'multivendorx'),
            settingDescription: __("Choose how commissions should be calculated for your marketplace.", 'multivendorx'),
            desc: __(
                '<ul><li>Store order based commission is calculated on the total order amount for each store separately. Example: If a customer buys from three stores, commission is applied three times – once for each store order.</li><li>Per item based commission is calculated on every single item sold, regardless of which store it belongs to. Example: If an order has five items, commission is applied five times – once for each item.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_order',
                    label: __('Store order based', 'multivendorx'),
                    value: 'store_order',
                },
                {
                    key: 'per_item',
                    label: __('Per item based', 'multivendorx'),
                    value: 'per_item',
                },
            ],
        },
        {
            key: 'commission_per_store_order',
            type: 'nested',
            label: 'Commission value',
            addButtonLabel: 'Add new',
            deleteButtonLabel: 'Remove',
            nestedFields: [
                {
                    key: 'rule_type',
                    type: 'select',
                    label: 'If',
                    options: [
                        { value: 'price', label: 'Product price' },
                        { value: 'quantity', label: 'Product quantity' },
                        { value: 'order_value', label: 'Order value' },
                    ],
                    skipFirstRow: true,
                },
                {
                    key: 'rule',
                    type: 'select',
                    label: 'is',
                    options: [
                        { value: 'less_than', label: 'up to' },
                        { value: 'more_than', label: 'more than' },
                    ],
                    skipFirstRow: true,
                },
                {
                    key: 'product_price',
                    type: 'number',
                    options: [
                        {
                            key: 'product_price',
                            value: 'product_price',
                        },
                    ],
                    skipFirstRow: true,
                    addonAfter: "then",
                    dependent: {
                        key: 'rule_type',
                        set: true,
                        value: 'price',
                    },
                },
                {
                    key: 'product_qty',
                    type: 'number',
                    options: [
                        {
                            key: 'product_qty',
                            value: 'product_qty',
                        },
                    ],
                    skipFirstRow: true,
                    addonAfter: "then",
                    dependent: {
                        key: 'rule_type',
                        set: true,
                        value: 'quantity',
                    },
                },
                {
                    key: 'order_value',
                    type: 'number',
                    options: [
                        {
                            key: 'order_value',
                            value: 'order_value',
                        },
                    ],
                    addonAfter: "then",
                    // skipFirstRow: true,
                    dependent: {
                        key: 'rule_type',
                        set: true,
                        value: 'order_value',
                    },
                },
                {
                    key: 'commission_fixed',
                    type: 'text',
                    desc: __('Fixed amount per transaction', 'multivendorx'),
                    meter: __('$', 'multivendorx'),
                    size: "8rem",
                    addonBefore: 'fixed',
                    addonAfter: "+",
                },
                {
                    key: 'commission_percentage',
                    type: 'number',
                    desc: __(
                        'Percentage of product price per transaction',
                        'multivendorx'
                    ),
                    size: '8rem',
                    parameter: __('%', 'multivendorx'),
                    addonAfter: "commission will be charged.",
                },

            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'store_order',
            },
        },

        {
            key: 'commission_per_item',
            type: 'nested',
            label: 'Commission value',
            single: true,
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            nestedFields: [
                {
                    key: 'commission_fixed',
                    type: 'number',
                    desc: __('Fixed amount per transaction', 'multivendorx'),
                    meter: __('$', 'catalogx'),
                    size: "8rem",
                    addonBefore: 'Fixed',
                    addonAfter: "+",
                },
                {
                    key: 'commission_percentage',
                    type: 'number',
                    desc: __(
                        'Percentage of product price per transaction',
                        'multivendorx'
                    ),
                    parameter: __('%', 'catalogx'),
                    size: "8rem",
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'per_item',
            },
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __("What's included along with store commission", 'multivendorx'),
            desc: __('Choose which order components are factored into commission calculations', 'multivendorx')
        },
        {
            key: 'give_shipping',
            label: __('Shipping amount', 'multivendorx'),
            settingDescription: __('This option determines whether shipping charges are included when calculating commission.', 'multivendorx'),
            desc: __(
                'If enabled, vendor’s net earning will include both commission and shipping fees.', 'multivendorx'),
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
            key: 'give_tax',
            type: 'setting-toggle',
            label: __('Tax amount', 'multivendorx'),
            settingDescription: __('Configure how taxes are treated in commission calculations.', 'multivendorx'),
            desc: __('<li>No Tax Inclusion: Calculate commission on pre-tax amount only.<li>100% Tax Inclusion: Include full tax amount in commission base.<li>Commission-Based Tax: Calculate commission on total order value including taxes, not just product price', 'multivendorx'),

            options: [
                {
                    key: 'no_tax',
                    label: __('No tax', 'multivendorx'),
                    value: 'no_tax',
                },
                {
                    key: 'full_tax',
                    label: __('Full tax', 'multivendorx'),
                    value: 'full_tax',
                },
                {
                    key: 'commision_based_tax',
                    label: __('Commision based tax', 'multivendorx'),
                    value: 'commision_based_tax',
                },
            ],
        },

    ],
};