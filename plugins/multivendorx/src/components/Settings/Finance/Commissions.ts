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
                'Set your default commission rate that will apply to all orders. You can choose between a fixed amount ($) or a percentage (%) of the order value. Additionally, you can create advanced commission rules below to automatically adjust rates based on specific conditions like product price, quantity, or total order value.',
                'multivendorx'
            ),
            addButtonLabel: 'Add New',
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
                    preInsideText: '$',
                    size: "8rem",
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
                    preInsideText: '$',
                    size: "8rem",
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
                    size: "8rem",
                    preInsideText: '$',
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
                    preTextFirstRow: "Fixed",
                    postText: "+",
                },
                {
                    key: 'commission_percentage',
                    type: 'number',
                    size: '8rem',
                    postInsideText: __('%', 'multivendorx'),
                    postText: "commission will be charged.",
                    postTextFirstRow: "",
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
            label: __('Tax on shipping', 'multivendorx'),
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
            proSetting: true,
            settingDescription: __(
                'Define a fee to cover platform costs. Apply a fixed, percentage, or combined rate. Choose whether it’s paid by the customer at checkout or deducted from the store’s commission.',
                'multivendorx'
            ),
<<<<<<< HEAD
            desc: __('<strong>Example setup:</strong><br>Order total = $100<br>Store commission = 80%<br>Marketplace fee = $2 + 10% = $12<ul><li><strong>Case 1 – Fee added to the customer’s order total:</strong><br>Customer pays = $100 + $12 = $112</li><li><strong>Case 2 – Fee deducted from the store’s commission:</strong><br>Customer pays = $100<br>Final store payout = 80% of $100 - $12 = $68</li></ul>', 'multivendorx'),
=======
            desc: __('<strong>Example setup:</strong><br>Product price = $100<br>Marketplace fee = $2 + 10%<ul><li><strong>Case 1 – Fee added to the customer’s order total:</strong><br>Customer pays = $100 + ($2 + 10% of $100) = $112<li><strong>Case 2 – Fee deducted from the store’s commission:</strong><br>Customer pays = $100<br>Marketplace fee = $2 + 10% of $100 = $12<br>Store receives = $100 - $12 = $88</li></ul>', 'multivendorx'),
>>>>>>> b0fec53f (css fixed)
            nestedFields: [
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
            proSetting: true,
            settingDescription: __('Set the facilitator fee as a fixed amount, a percentage, or both, deducted from the store commission. Store-wise fees can also be configured from the store edit page.', 'multivendorx'),
            desc: __(' <strong>Global facilitator:</strong> Assign a single facilitator for the entire marketplace from <a href="#">here</a>.<br> <strong>Individual facilitators:</strong> Set facilitators for specific stores from the <em>Facilitator Settings</em> section or the <em>Store Edit</em> page.<br> <strong>Example:</strong> If a store earns $1000 commission and the facilitator fee is $50 + 5%, then total facilitator fee = $50 + (5% of 1000) = $100 → the store receives $900 after facilitator deductions. ', 'multivendorx'),
            nestedFields: [
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
            settingDescription: __('Set up gateway fees to recover the transaction costs charged by your payment provider. These fees are deducted from the store’s commission so your earnings remain unaffected.', 'multivendorx'),
            rowClass: 'single-line',
            single: true,
            desc: __('Use this setting to manage transaction fees for different payment methods. You can define a default fee or set individual fees for each payment mode, such as bank transfer or cash on delivery.<br><strong>Example setup:</strong><br>Product price = $100<br>Store commission = 30%<br>Gateway fee = 10%<ul><li><strong>Customer pays:</strong> $100</li><li><strong>Store commission:</strong> 30% of $100 = $30</li><li><strong>Gateway fee:</strong> 10% of $100 = $10</li><li><strong>Final store earning:</strong> $30 - $10 = $20</li><li><strong>Admin earning:</strong> $70</li></ul>', 'multivendorx'),
            nestedFields
        },
    ],
};
