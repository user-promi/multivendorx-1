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

const taxes_enabled = appLocalizer.taxes_enabled;

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
        "Tailor your marketplace commission plan to decide how much revenue marketplace earn from each sale.",
        'multivendorx'
    ),
    icon: 'adminlib-commission',
    submitUrl: 'settings',
    modal: [
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __('Marketplace commission', 'multivendorx'),
            settingDescription: __("Decide how the system should calculate the marketplace commission." 'multivendorx'),
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
            hint: __("What's included along with store earning", 'multivendorx'),
            desc: __('Choose which order components are factored into commission calculations.', 'multivendorx')
        },
        {
            key: 'give_shipping',
            label: __('Shipping amount', 'multivendorx'),
            settingDescription: __('This option determines whether shipping charges are included when calculating store earning.', 'multivendorx'),
            desc: __(
                'If enabled, store’s net earning will include both commission and shipping fees.', 'multivendorx'),
            type: 'checkbox',
            moduleEnabled: 'store-shipping',
            options: [
                {
                    key: 'give_shipping',
                    value: 'give_shipping',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'taxable',
            label: __('Tax on shipping', 'multivendorx'),
            settingDescription: __('Shipping charges will be treated as taxable items during checkout. Otherwise shipping costs will be tax-free.', 'multivendorx'),
            desc: __('', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'taxable',
                    value: 'taxable',
                },
            ],
            dependent: {
                key: 'give_shipping',
                set: true,
                value: 'give_shipping',
            },
            look: 'toggle',
        },
        ...(taxes_enabled === 'yes'
            ? [
                {
                    key: 'give_tax',
                    type: 'setting-toggle',
                    label: __('Tax amount', 'multivendorx'),
                    settingDescription: __('Configure how taxes are treated in commission calculations.', 'multivendorx'),
                    desc: __('<li>No tax - Calculate commission on pre-tax amount only.<li>Full tax - Include 100% tax in commission base.<li>Commission based tax - Calculate commission on total order value including taxes, not just product price.', 'multivendorx'),
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
                            label: __('Commission based tax', 'multivendorx'),
                            value: 'commision_based_tax',
                        },
                    ],
                }
            ]
            : []
        ),
        {
            key: 'separator_content',
            type: 'section',
            hint: __("What gets deducted from store earning", 'multivendorx'),
            desc: __('Determine which fees to deduct from the store earning.', 'multivendorx')
        },
        {
            key: 'marketplace_fees',
            type: 'nested',
            label: __('Platform fees', 'multivendorx'),
            single: true,
            proSetting: true,
            settingDescription: __(
                'Define a fee to cover platform costs. Apply a fixed, percentage, or combined rate. Choose whether it’s paid by the customer at checkout or deducted from the store’s commission.',
                'multivendorx'
            ),
            desc: __(
                '<strong>Example setup:</strong><br>Total product price of the order = $100<br>Platform fee = 80%<br>Marketplace commission = $2 + 10%<br> Payable marketplace fee = $12(i.e. $2 + 10% of 100)<br><em>(Fee is calculated on the total product price)</em><ul><li><strong>Case 1 – Fee paid by the customer:</strong><br>Customer pays = $100 + $12 = $112<br>Store receives = $80</li><li><strong>Case 2 – Fee deducted from the store:</strong><br>Customer pays = $100<br>Store earning = 80% of $100 = $80<br>Marketplace fee = $2 + 10% of 100 = $12<br>Final store payout = $80 - $12 = $68</li></ul>', 'multivendorx'),
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
            moduleEnabled: 'marketplace-fee',
        },

        {
            key: 'facilitator_fees',
            type: 'nested',
            label: 'Facilitator fees',
            single: true,
            proSetting: true,
            settingDescription: __('Set the facilitator fees as a fixed amount, a percentage, or both, deducted from the store earning. Store-wise fees can also be configured from the store edit page.', 'multivendorx'),
            desc: __(
                '<strong>Global facilitator:</strong> Assign a single facilitator for the entire marketplace from <a href="' +
                appLocalizer.site_url +
                '/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=facilitator">here</a>.<br>' +
                '<strong>Individual facilitators:</strong> Set facilitators for specific stores from the <em>Facilitator Settings</em> section or the <em>Store Edit</em> page.<br>' +
                '<strong>Example:</strong> If the total product price of the order is $1000 and the Marketplace commission is 20% while the facilitator fee is $50 + 5%, then the admin fee = 20% of 1000 = $200 and the facilitator fee = $50 + (5% of 1000) = $100 → the store receives $700 after all deductions.','multivendorx'
            ),
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
            moduleEnabled: 'facilitator',
        },
        {
            key: 'gateway_fees',
            type: 'nested',
            label: __('Gateway fees', 'multivendorx'),
            settingDescription: __('Set up gateway fees to recover the transaction costs charged by your payment provider. These fees are deducted from the store’s commission so your earnings remain unaffected.', 'multivendorx'),
            rowClass: 'single-line',
            moduleEnabled: 'marketplace-gateway',
            single: true,
            desc: __('<strong>Use this setting</strong> to manage transaction fees for different payment methods. You can set a default fee or define specific fees for each payment mode, such as bank transfer or cash on delivery.<br><br><strong>Example setup:</strong><br>Product price = $100<br>Store earning = 80%<br>Gateway fees = $10 + 5%<ul><li>Customer pays = $100</li><li>Store earning = 80% of $100 = $80</li><li>Gateway fees = $10 + 5% of $80 = $14</li><li>Final store earning = $80 - $14 = $66</li><li>Marketplace commission = ($100 - $80) + $14 = $34</li></ul>', 'multivendorx'),
            nestedFields
        },
    ],
};
