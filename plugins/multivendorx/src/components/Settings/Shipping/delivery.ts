import { __ } from '@wordpress/i18n';
const methods = appLocalizer?.all_payments
    ? Object.entries(appLocalizer.all_payments).map(([_, value]) => value)
    : [];

export default {
    id: 'delivery',
    priority: 2,
    name: __('Delivery', 'multivendorx'),
    desc: __(
        'Define the steps orders follow from purchase to completion. Set what customers see in tracking and choose whether orders complete automatically or after customer confirmation.', 'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
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
                    label: __('Customer confirm delivery', 'multivendorx'),
                    value: 'country_wise',
                },
            ],
        },
    ],
};
