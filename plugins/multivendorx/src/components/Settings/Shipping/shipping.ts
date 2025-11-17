import { __ } from '@wordpress/i18n';
const shippingMethods = appLocalizer?.all_shippings
    ? Object.values(appLocalizer.all_shippings)
    : [];
console.log(shippingMethods)
export default {
    id: 'shipping',
    priority: 6,
    name: __('Shipping', 'multivendorx'),
    desc: __(
        'Choose whether stores follow a step-by-step guided process through the category hierarchy or freely select multiple categories & subcategories without restrictions.', 'multivendorx'
    ),
    icon: 'adminlib-shipping',
    submitUrl: 'settings',
    modal: [
        {
            key: 'shipping_modules',
            type: 'payment-tabs',
            label: __('Shipping methods available to stores ', 'multivendorx'),
            desc: __('See which shipping options your stores can offer to customers. Each method determines how shipping costs are calculated.', 'multivendorx'),
            buttonEnable: true,
            toggleType: 'icon',
            modal: shippingMethods
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
