import { __ } from '@wordpress/i18n';

export default {
    id: 'shipping',
    priority: 6,
    name: __( 'Shipping', 'multivendorx' ),
    desc: __(
        'Choose whether stores follow a step-by-step guided process through the category hierarchy or freely select multiple categories & subcategories without restrictions.','multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        {
            key: 'taxable_shipping',
            label: __('Enable Taxable Shipping', 'multivendorx'),
            settingDescription: __('If enabled, shipping charges will be treated as taxable items during checkout. Disable this to keep shipping costs tax-free.', 'multivendorx'),
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
            key: 'shipping_method_type',
            type: 'setting-toggle',
            label: __('Shipping Method Type', 'multivendorx'),
            settingDescription: __("Choose the primary logic your marketplace uses to calculate and display shipping costs.", 'multivendorx'),
            desc: __(
                '<ul><li>Shipping rules based on pre-defined zones created from regions</li><li>Shipping rates determined by the customer\'s country.</li><li>Shipping costs calculated based on delivery distance between vendor and customer.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'zone_wise',
                    label: __('Zone Wise', 'multivendorx'),
                    value: 'zone_wise',
                },
                {
                    key: 'country_wise',
                    label: __('Country Wise', 'multivendorx'),
                    value: 'country_wise',
                },
                {
                    key: 'distance_wise',
                    label: __('Distance Wise', 'multivendorx'),
                    value: 'distance_wise',
                },
            ],
        },
        {
            key: 'allow_store_regions',
            label: __('Allow Store Shipping Regions', 'multivendorx'),
            settingDescription: __("Admin can set which countries or states a store can deliver to. Vendors will only be able to ship within these selected regions.", 'multivendorx'),
            desc: __('', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'allow_store_regions',
                    value: 'allow_store_regions',
                },
            ],
            look: 'toggle',
        }, 
        {
            key: 'enable_tracking',
            label: __('Enable Shipment Tracking Service', 'multivendorx'),
            desc: __("When enabled, vendors can enter tracking numbers and carrier details for their orders. Customers will receive shipment updates automatically.", 'multivendorx'),
            // desc: __('', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'enable_tracking',
                    value: 'enable_tracking',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'shipping_method',
            type: 'multi-string',
            label: __( 'Add shipping method', 'multivendorx' ),
            placeholder: __( 'Enter Shipping method', 'multivendorx' ),
            settingDescription: __(
                'Add one or more reasons that stores can select when handling refund requests.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
        },

        {
            key: 'shipping_stage',
            type: 'multi-string',
            label: __( 'Add stage', 'multivendorx' ),
            placeholder: __( 'Enter Shipping stage', 'multivendorx' ),
            settingDescription: __(
                'Add one or more reasons that stores can select when handling refund requests.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
        },

        {
            key: 'enable_shipment_rule',
            label: __('Enable Shipment Completion Rule', 'multivendorx'),
            desc: __("If enabled, an order must include shipment details before it can move to Completed status.", 'multivendorx'),
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
            key: 'enable_customer_confirmation',
            label: __('Enable Customer Delivery Confirmation', 'multivendorx'),
            desc: __("When enabled, customers can confirm their order as Delivered. Once marked, the order status will automatically change to Completed.", 'multivendorx'),
            // desc: __('', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'enable_customer_confirmation',
                    value: 'enable_customer_confirmation',
                },
            ],
            look: 'toggle',
        },
    ],
};
