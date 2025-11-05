import { __ } from '@wordpress/i18n';
const methods = appLocalizer?.all_payments
    ? Object.entries(appLocalizer.all_payments).map(([_, value]) => value)
    : [];

export default {
    id: 'shipping',
    priority: 1,
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
    ],
};
