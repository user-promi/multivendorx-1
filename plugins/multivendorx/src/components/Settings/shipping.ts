import { __ } from '@wordpress/i18n';
const methods = appLocalizer?.all_payments
    ? Object.entries(appLocalizer.all_payments).map(([_, value]) => value)
    : [];

export default {
    id: 'shipping',
    priority: 6,
    name: __('Shipping', 'multivendorx'),
    desc: __(
        'Choose whether stores follow a step-by-step guided process through the category hierarchy or freely select multiple categories & subcategories without restrictions.', 'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        {
            key: 'payment_methods',
            type: 'payment-tabs',
            label: __('Shipping Modules Overview', 'multivendorx'),
            desc: __( 'View-only - Available shipping modules for stores', 'multivendorx' ),
            buttonEnable: true,
            toggleType: 'icon',
            modal: methods
        },
        {
            key: 'zone-wisehipping Selection',
            type: 'setting-toggle',
            label: __('Zone-wise Shipping Selection', 'multivendorx'),
            // settingDescription: __("Choose the primary logic your marketplace uses to calculate and display shipping costs.", 'multivendorx'),
            desc: __(
                'Allow vendors to select delivery zones',
                'multivendorx'
            ),
            options: [
                {
                    key: 'north_america',
                    label: __('North America', 'multivendorx'),
                    value: 'zone_wise',
                },
                {
                    key: 'country_wise',
                    label: __('Europe', 'multivendorx'),
                    value: 'country_wise',
                },
                {
                    key: 'distance_wise',
                    label: __('Asia-Pacific', 'multivendorx'),
                    value: 'distance_wise',
                },
                {
                    key: 'Middle',
                    label: __('Middle East', 'multivendorx'),
                    value: 'Middle',
                },
            ],
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Shipping controls',
                'multivendorx'
            ),
            desc: __("Define shipping features stores can use.",'multivendorx'),
        },
        {
            key: 'enable_shipment_rule',
            label: __('Allow Shipment Tracking', 'multivendorx'),
            desc: __("Enable stores to provide tracking information for orders", 'multivendorx'),
            // desc: __('', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'enable_shipment_rule',
                    value: 'enable_shipment_rule',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __(' Shipping Providers', 'multivendorx'),
            settingDescription: __(" Select which providers vendors can use (multiple selections allowed)", 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            addNewBtn: 'Add Custom Provider',
            options: [
                {
                    key: 'completed',
                    label: __('Australia Post', 'multivendorx'),
                    value: 'completed',
                },
                {
                    key: 'delivered',
                    label: __('Canada Post', 'multivendorx'),
                    value: 'delivered',
                },
                {
                    key: 'shipped',
                    label: __('City Link', 'multivendorx'),
                    value: 'shipped',
                },
                {
                    key: 'processing',
                    label: __('DHL', 'multivendorx'),
                    value: 'DHL',
                },
                {
                    key: 'processing',
                    label: __('Fastway South Africa', 'multivendorx'),
                    value: 'fastway-south-africa',
                },
                {
                    key: 'processing',
                    label: __('FedEx', 'multivendorx'),
                    value: 'FedEx',
                },
                {
                    key: 'processing',
                    label: __('OnTrac', 'multivendorx'),
                    value: 'FedOnTracEx',
                },
                {
                    key: 'processing',
                    label: __('Polish Shipping Providers', 'multivendorx'),
                    value: 'FedOnTracEx',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            title: 'Important Notes',
            blocktext: __(
                '<ul><li><b>Delivered </b>status will automatically mark sub-orders as Completed</li><li><b>Cancelled  </b>status will automatically cancel the entire order</li></ul>',
                'multivendorx'
            ),
        },
        {
            key: 'shipping_stage',
            type: 'multi-string',
            label: __('Add stage', 'multivendorx'),
            placeholder: __('Enter Shipping stage', 'multivendorx'),
            iconEnable : true,
            settingDescription: __(
                'Add one or more reasons that stores can select when handling refund requests.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
        },
        {
            key: 'order-completion-rules',
            type: 'setting-toggle',
            label: __('Order completion rules', 'multivendorx'),
            settingDescription: __('Control when orders are automatically marked Completed after shipment details are added or delivery is confirmed.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Auto complete on delivery - completes orders automatically when delivery happens (system-controlled).</li><li>Customer confirm delivery - completes orders only if the customer confirms (buyer-controlled).</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'north_america',
                    label: __('Auto complete on delivery', 'multivendorx'),
                    value: 'zone_wise',
                },
                {
                    key: 'country_wise',
                    label: __('Customer Confirm Delivery', 'multivendorx'),
                    value: 'country_wise',
                },
            ],
        },
    ],
};
