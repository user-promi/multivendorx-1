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
            key: 'shipping_modules_overview',
            type: 'payment-tabs',
            label: __('Shipping Modules Overview', 'multivendorx'),
            desc: __('View-only - Available shipping modules for stores', 'multivendorx'),
            buttonEnable: true,
            toggleType: 'icon',
            modal: [
                {
                    id: 'zone-wise-shipping',
                    icon: "adminlib-google",
                    label: 'Zone-wise Shipping',
                    connected: false,
                    desc: 'Connect and authenticate stores via Google accounts <span class="admin-badge yellow">North America</span>  <span class="admin-badge blue">North America</span>  <span class="admin-badge yellow">North America</span>  <span class="admin-badge red">North America</span>',
                },
                {
                    id: 'country-wise-shipping',
                    icon: "adminlib-twitter",
                    label: 'Country-wise Shipping',
                    connected: false,
                    desc: 'Connect and authenticate stores via Twitter accounts.',
                },
                {
                    id: 'distance-based-shipping',
                    icon: "adminlib-facebook",
                    label: 'Distance-based Shipping',
                    connected: false,
                    desc: 'Connect and authenticate stores via Facebook accounts.',

                },
            ]
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Shipping controls',
                'multivendorx'
            ),
            desc: __("Define shipping features stores can use.", 'multivendorx'),
        },
        {
            key: 'enable_shipment_rule',
            label: __('Allow Shipment Tracking', 'multivendorx'),
            settingDescription: __("Let stores add tracking IDs and courier details so customers can track their orders directly from the order page.", 'multivendorx'),
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
            settingDescription: __(" You can select from existing carriers or let stores connect their own. Only the enabled providers will be available for assigning tracking numbers.", 'multivendorx'),
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
            key: 'shipping_providers',
            type: 'multi-string',
            label: __('Shipping Providers', 'multivendorx'),
            placeholder: __('Select which providers vendors can use (multiple selections allowed)', 'multivendorx'),
            // iconEnable: true,
            descEnable: true,
            // requiredEnable: true,
            settingDescription: __(
                'Add one or more reasons that stores can select when handling refund requests.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
            defaultValues: [
                { value: "Australia Post" ,description: "Order is received by store"},
                { value: "Canada Post" ,description: "Order is received by store"},
                { value: "Australia Post"  ,description: "Order is received by store"},
                { value: "Canada Post" ,description: "Order is received by store"},
                { value: "Australia Post" ,description: "Order is received by store"},
                { value: "Canada Post" ,description: "Order is received by store"},
            ],
            // iconOptions: ["adminlib-check", "adminlib-clock", "adminlib-cart", "adminlib-store"], // dropdown options
            proSetting: false,
            // maxItems: 10,
            allowDuplicates: false
        },
        {
            key: 'shipping_stage',
            type: 'multi-string',
            label: __('Shipment status', 'multivendorx'),
            placeholder: __('Define the key milestones in a store’s delivery process. These stages help stores communicate order progress to customers', 'multivendorx'),
            iconEnable: true,
            descEnable: true,
            requiredEnable: true,
            settingDescription: __(
                'Create additional statuses to match your logistics flow (for example, Packed, Out for Delivery, Returned, Awaiting Pickup).',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
            defaultValues: [
                { value: "Order Received", locked: true, iconClass: "adminlib-check", description: "Order is received by store", tag: "Primary", required: true },
                { value: "Processing", locked: true, iconClass: "adminlib-clock", description: "Order is being processed", tag: "Primary", required: true },
                { value: "Shipped", iconClass: "adminlib-truck", default: "Primary" } // editable
            ],
            iconOptions: ["adminlib-check", "adminlib-clock", "adminlib-cart", "adminlib-store"], // dropdown options
            proSetting: false,
            maxItems: 10,
            allowDuplicates: false
        },
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            title: 'Important Notes',
            blocktext: __(
                '<ul><li><b>Cancelled  </b>status will automatically cancel the entire order</li></ul>',
                'multivendorx'
            ),
        },
        {
            key: 'order-completion-rules',
            type: 'setting-toggle',
            label: __('Order completion rules', 'multivendorx'),
            settingDescription: __('Control when orders are automatically marked Completed after shipment details are added or delivery is confirmed. This controls how and when the system finalizes orders once the delivery process is done.',
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
