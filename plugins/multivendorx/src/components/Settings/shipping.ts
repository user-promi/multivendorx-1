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
            label: __('Shipping methods available to stores ', 'multivendorx'),
            desc: __('See which shipping options your stores can offer to customers. Each method determines how shipping costs are calculated.', 'multivendorx'),
            buttonEnable: true,
            toggleType: 'icon',
            modal: [
                {
                    id: 'zone-wise-shipping',
                    icon: "adminlib-google",
                    label: 'Zone based shipping',
                    openForm: true,
                    desc: 'Stores set different rates for different regions (like "East Coast" or "California").',
                    formFields: [
                        { key: 'client_id', type: 'description', label: 'Currently enabled zones', des: '<span class="admin-badge yellow">North America</span>  <span class="admin-badge blue">North America</span>  <span class="admin-badge yellow">North America</span>  <span class="admin-badge red">North America</span>' },
                        { key: 'client_id', type: 'description', label: ' ', des: '<span class="admin-btn btn-purple"><i class="adminlib-plus-circle-o"></i>Add new Zone</span>' }
                    ],
                },
                {
                    id: 'country-wise-shipping',
                    icon: "adminlib-twitter",
                    label: 'Country-wise shipping',
                    openForm: true,
                    desc: 'Let store set specific shipping rates based on destination countries.',
                },
                {
                    id: 'distance-based-shipping',
                    icon: "adminlib-facebook",
                    label: 'Distance-based shipping',
                    openForm: true,
                    desc: 'Calculate shipping costs based on actual distance between locations.',

                },
            ]
        },

        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __(' Shipping carriers', 'multivendorx'),
            settingDescription: __(" Choose which shipping providers stores can use. Only the carriers you enable will be available for sellers to ship their products and add tracking details. This helps keep all shipments through trusted, approved providers.", 'multivendorx'),
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
            key: 'section',
            type: 'section',
            hint: __(
                'Delivery flow',
                'multivendorx'
            ),
            desc: __("Define the steps orders follow from purchase to completion. Set what customers see in tracking and choose whether orders complete automatically or after customer confirmation.", 'multivendorx'),
        },
        // {
        //     key: 'shipping_providers',
        //     type: 'multi-string',
        //     label: __('Shipping providers', 'multivendorx'),
        //     placeholder: __('Select which providers stores can use for order fulfillment.', 'multivendorx'),
        //     // iconEnable: true,
        //     descEnable: true,
        //     // requiredEnable: true,
        //     settingDescription: __(
        //         'Select from existing carriers or let stores connect their own. Only the enabled providers will be available for assigning tracking numbers.',
        //         'multivendorx'
        //     ),
        //     name: 'abuse_report_reasons',
        //     defaultValues: [
        //         { value: "Australia Post", description: "Order is received by store" },
        //         { value: "Canada Post", description: "Order is received by store" },
        //         { value: "Australia Post", description: "Order is received by store" },
        //         { value: "Canada Post", description: "Order is received by store" },
        //         { value: "Australia Post", description: "Order is received by store" },
        //         { value: "Canada Post", description: "Order is received by store" },
        //     ],
        //     // iconOptions: ["adminlib-check", "adminlib-clock", "adminlib-cart", "adminlib-store"], // dropdown options
        //     proSetting: false,
        //     // maxItems: 10,
        //     allowDuplicates: false
        // },
        {
            key: 'shipping_stage',
            type: 'multi-string',
            label: __('Delivery progress stages', 'multivendorx'),
            //placeholder: __('Define the key milestones in a store’s delivery process. These stages help stores communicate order progress to customers', 'multivendorx'),
            iconEnable: true,
            descEnable: true,
            requiredEnable: true,
            settingDescription: __(
                'Steps customers see as their order moves toward delivery. These stages show up in order tracking so customers know where their package is.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
            defaultValues: [
                { value: "Delivered", locked: true, iconClass: "adminlib-check", description: "Order is received by store", required: true },
                { value: "Cancelled", locked: true, iconClass: "adminlib-clock", description: "Order is cancelled", required: true },
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
            settingDescription: __('Specifies how orders are finalized and transitioned from Delivered to Completed after the package has reached the customer',
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
