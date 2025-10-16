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
            label: __('Shipping methods available to stores', 'multivendorx'),
            desc: __('View-only - Available shipping modules for stores', 'multivendorx'),
            buttonEnable: true,
            toggleType: 'icon',
            modal: [
                {
                    id: 'zone-wise-shipping',
                    icon: "adminlib-google",
                    label: 'Zone-wise shipping',
                    connected: false,
                    desc: 'Connect and authenticate stores via Google accounts <span class="admin-badge yellow">North America</span>  <span class="admin-badge blue">North America</span>  <span class="admin-badge yellow">North America</span>  <span class="admin-badge red">North America</span>',
                },
                {
                    id: 'country-wise-shipping',
                    icon: "adminlib-twitter",
                    label: 'Country-wise shipping',
                    connected: false,
                    desc: 'Stores set flat rates per country (like "$10 to ship to Canada").',
                },
                {
                    id: 'distance-based-shipping',
                    icon: "adminlib-facebook",
                    label: 'Distance-based shipping',
                    connected: false,
                    desc: 'Shipping cost is calculated based on miles/kilometers between the store's location and the customer.',

                },
            ]
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Order fulfillment',
                'multivendorx'
            ),
            desc: __("Configure the shipping carriers stores can use, how customers track their packages, and when orders are marked as complete.", 'multivendorx'),
        },
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __('Shipping carriers', 'multivendorx'),
            settingDescription: __("Select the carriers stores can choose when fulfilling orders. Customers will see these names when tracking packages.", 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            addNewBtn: 'Add Custom Provider',
            options: [
                {
                    key: 'completed',
                    label: __('Australia post', 'multivendorx'),
                    value: 'completed',
                },
                {
                    key: 'delivered',
                    label: __('Canada post', 'multivendorx'),
                    value: 'delivered',
                },
                {
                    key: 'shipped',
                    label: __('City link', 'multivendorx'),
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
                    label: __('Polish shipping providers', 'multivendorx'),
                    value: 'FedOnTracEx',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'shipping_providers',
            type: 'multi-string',
            label: __('Shipping providers', 'multivendorx'),
            placeholder: __('Select which providers stores can use for order fulfillment.', 'multivendorx'),
            // iconEnable: true,
            descEnable: true,
            // requiredEnable: true,
            settingDescription: __(
                'Select from existing carriers or let stores connect their own. Only the enabled providers will be available for assigning tracking numbers.',
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
            label: __('Delivery progress stages', 'multivendorx'),
            placeholder: __('Steps customers see as their order moves toward delivery. These stages show up in order tracking so customers know where their package is.', 'multivendorx'),
            iconEnable: true,
            descEnable: true,
            requiredEnable: true,
            settingDescription: __(
                'Create additional statuses to match your logistics flow (for example, Packed, Out for Delivery, Returned, Awaiting Pickup).',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
            defaultValues: [
                { value: "On the way", locked: true, iconClass: "adminlib-check", description: "Order is received by store", tag: "Primary", required: true },
                { value: "Delivered", locked: true, iconClass: "adminlib-clock", description: "Order is being processed", tag: "Primary", required: true },
                { value: "Shipped", iconClass: "adminlib-truck", default: "Primary" } // editable
            ],
            iconOptions: ["adminlib-check", "adminlib-clock", "adminlib-cart", "adminlib-store"], // dropdown options
            proSetting: false,
            maxItems: 10,
            allowDuplicates: false
        },
        {
            key: 'order-completion-rules',
            type: 'setting-toggle',
            label: __('When orders are marked complete', 'multivendorx'),
            settingDescription: __('Control when orders are automatically marked Completed after shipment details are added or delivery is confirmed. This controls how and when the system finalizes orders once the delivery process is done.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Auto complete on delivery - Orders automatically close once marked as delivered by the carrier or store.</li><li>Wait for customer confirmation - Orders stay open until the customer confirms they received their package.</li></ul>',
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
                    label: __('Wait for customer confirmation', 'multivendorx'),
                    value: 'country_wise',
                },
            ],
			{
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            title: 'Why it matters',
            blocktext: __(
                '<ul><li>Custom delivery stages make order tracking more transparent for customers and help stores maintain an accurate fulfillment timeline.</li></ul>',
                'multivendorx'
            ),
        },
        },
    ],
};
