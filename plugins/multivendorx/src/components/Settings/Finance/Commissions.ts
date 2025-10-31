import { __ } from '@wordpress/i18n';

const gatewayList = appLocalizer.gateway_list || [];
const gatewayFields = gatewayList.flatMap(gateway => [
    {
        key: `${gateway.value}_fixed`,
        type: 'number',
        preInsideText: __('$', 'multivendorx'),
        size: "8rem",
        preText: gateway.label,
        postText: "+",
    },
    {
        key: `${gateway.value}_percentage`,
        type: 'number',
        postInsideText: __('%', 'multivendorx'),
        size: "8rem",
    },
    {   
        key: 'devider',
        type: 'devider',
    }
]);

const nestedFields = [
    {
        key: 'default_fixed',
        type: 'number',
        preInsideText: __('$', 'multivendorx'),
        size: "8rem",
        preText: 'Default',
        postText: "+",
    },
    {
        key: 'default_percentage',
        type: 'number',
        postInsideText: __('%', 'multivendorx'),
        size: "8rem",
    },
    {   
        key: 'devider',
        type: 'devider',
    },
    ...gatewayFields
];

export default {
    id: 'store-commissions',
    priority: 1,
    name: __('Commissions', 'multivendorx'),
    desc: __(
        "Tailor your marketplace commission plan to decide how much revenue stores earn from each sale.",
        'multivendorx'
    ),
    icon: 'adminlib-commission',
    submitUrl: 'settings',
    modal: [
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __('Commission type', 'multivendorx'),
            settingDescription: __("Choose how commissions should be calculated for your marketplace.", 'multivendorx'),
            desc: __(
                '<ul><li>Store order based - Calculated on the full order amount of each store. Example: A customer buys from 3 stores → commission applies separately to each store’s order.</li><li>Per item based - Applied to each product in the order. Example: An order with 5 items → commission applies 5 times, once per item.</li></ul>',
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
            desc: __(
                'Define commission rates based on total order value. Multiple rules can be created for different order value ranges.',
                'multivendorx'
            ),
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
                    preInsideText:'$',
                    size:"8rem",
                    skipFirstRow: true,
                    postText: "then",
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
                    postText: "then",
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
                    size:"8rem",
                    preInsideText:'$',
                    postText: "then",
                    dependent: {
                        key: 'rule_type',
                        set: true,
                        value: 'order_value',
                    },
                },
                {
                    key: 'commission_fixed',
                    type: 'text',
                    preInsideText: __('$', 'multivendorx'),
                    size: "8rem",
                    preText: 'fixed',
                    preTextFirstRow:"Fixed",
                    postText: "+",
                },
                {
                    key: 'commission_percentage',
                    type: 'number',
                    size: '8rem',
                    postInsideText: __('%', 'multivendorx'),
                    postText: "commission will be charged.",
                    postTextFirstRow:"",
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
                'Set global commission rates that apply to each individual item quantity. Commission will be calculated by multiplying the rate with the total number of items across all products in the order.',
                'multivendorx'
            ),
            nestedFields: [
                {
                    key: 'commission_fixed',
                    type: 'number',
                    preInsideText: __('$', 'multivendorx'),
                    size: "8rem",
                    preText: 'Fixed',
                    postText: "+",
                },
                {
                    key: 'commission_percentage',
                    type: 'number',
                    postInsideText: __('%', 'multivendorx'),
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
            desc: __('Choose which order components are factored into commission calculations.', 'multivendorx')
        },
        {
            key: 'give_shipping',
            label: __('Shipping amount', 'multivendorx'),
            settingDescription: __('This option determines whether shipping charges are included when calculating commission.', 'multivendorx'),
            desc: __(
                'If enabled, store’s net earning will include both commission and shipping fees.', 'multivendorx'),
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
            key: 'taxable_shipping',
            label: __('Enable taxable shipping', 'multivendorx'),
            settingDescription: __('Shipping charges will be treated as taxable items during checkout. Otherwise shipping costs will be tax-free.', 'multivendorx'),
            desc: __('', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'taxable_shipping',
                    value: 'taxable_shipping',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'give_tax',
            type: 'setting-toggle',
            label: __('Tax amount', 'multivendorx'),
            settingDescription: __('Configure how taxes are treated in commission calculations.', 'multivendorx'),
            desc: __('<li>No tax - Calculate commission on pre-tax amount only.<li>Full tax - Include 100% tax in commission base.<li>Commision based tax - Calculate commission on total order value including taxes, not just product price.', 'multivendorx'),
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
        {
            key: 'separator_content',
            type: 'section',
            hint: __("What gets deducted from store commission", 'multivendorx'),
            desc: __('Determine which fees to deduct from the commission amount.', 'multivendorx')
        },
        {
            key: 'marketplace_fees',
            type: 'nested',
            label: __('Marketplace fees', 'multivendorx'),
            single: true,
            settingDescription: __(
                'Define a fee to cover platform costs. Apply a fixed, percentage, or combined rate. Choose whether it’s paid by the customer at checkout or deducted from the store’s commission.',
                'multivendorx'
            ),
           desc: __('<p>This fee can either be <strong>added to the customer’s order total</strong> or <strong>deducted from each store’s commission</strong>, depending on your selection.</p><ul><li><strong>Example 1 – Customer Pays the Fee:</strong> Suppose a customer places an order from Store A ($100) and Store B ($200), with a 2% marketplace fee. The fee is calculated on the total order amount ($300) and added at checkout. The customer pays <strong>$306</strong>, while both stores receive their full commissions.</li><li><strong>Example 2 – Store Pays the Fee:</strong> The fee is applied individually to each store’s earnings. For <strong>Store A</strong> (80% commission), normal earning is $80. After applying 2% fee ($2), payout is <strong>$78</strong>. For <strong>Store B</strong>, earning is $160, and after a $4 fee, payout is <strong>$156</strong>.</li></ul>', 'multivendorx'),nestedFields: [
                {
                    key: 'commission_fixed',
                    type: 'text',
                    preInsideText: __('$', 'multivendorx'),
                    size: "8rem",
                    preText: 'Charge a fixed',
                    postText: "+",
                },
                {
                    key: 'commission_percentage',
                    type: 'number',
                    size: '8rem',
                    postInsideText: __('%', 'multivendorx'),
                },
                {
                    key: 'rule',
                    type: 'select',
                    label: 'to be',
                    options: [
                        { value: 'customer', label: 'added to the customer’s order total' },
                        { value: 'store', label: 'deducted from the store’s commission' },
                    ],
                    // postText: "",
                },
                
            ],
        },
        
        {
            key: 'facilitator_fees',
            type: 'nested',
            label: 'Facilitator fees',
            single: true,
            settingDescription: __('Set the facilitator fee as a fixed amount, a percentage, or both, deducted from the store commission. Store-wise fees can also be configured from the store edit page.', 'multivendorx'),
            desc: __('<ul><li>Admins can assign:</li><ul><li><strong>A global facilitator</strong> for the entire marketplace from <a href="#">here</a>.</li><li><strong>Individual facilitators</strong> for specific stores from the <em>Facilitator Settings</em> section or the <em>Store Edit</em> page.</li></ul><li><strong>Example:</strong> If a store earns $1000 commission and the facilitator fee is set to $50 + 5%, then the total facilitator fee = $50 + (5% of 1000) = $100, so the store receives $900 after facilitator deductions.</li></ul>', 'multivendorx'), nestedFields: [
                {
                    key: 'facilitator_fixed',
                    type: 'number',
                    preInsideText: __('$', 'multivendorx'),
                    size: "8rem",
                    preText: 'Fixed',
                    postText: "+",
                },
                {
                    key: 'facilitator_percentage',
                    type: 'number',
                    postInsideText: __('%', 'multivendorx'),
                    size: "8rem",
                },
            ],
        },  
        {
            key: 'gateway_fees',
            type: 'nested',
            label: __('Gateway fees', 'multivendorx'),
			settingDescription: __('Define the default fee that will be deducted from the store commission. If you want to charge different fees for each payment method, set the amounts here for gateways, bank transfers, or cash on delivery.', 'multivendorx'),
            rowClass: 'single-line',            
            single: true,
            desc: __('', 'multivendorx'),
            nestedFields
        },      
    ],
};
