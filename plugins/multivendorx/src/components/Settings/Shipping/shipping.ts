import { __ } from '@wordpress/i18n'; // Assuming this environment uses WordPress i18n utility

// Replicate the data from your original component
const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'];
const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];
const shippingProviders = [
    'Australia Post', 'Canada Post', 'City Link', 'DHL', 'DPD',
    'Fastway South Africa', 'FedEx', 'OnTrac', 'ParcelForce',
    'Polish Shipping Providers', 'Royal Mail', 'SAPO',
    'TNT Express (Consignment)', 'TNT Express (Reference)',
    'FedEx Sameday', 'UPS', 'USPS', 'DHL US', 'Other'
];

// Map countries/states to checkbox options
const countryOptions = countries.map(country => ({
    key: country.toLowerCase().replace(/\s/g, '_'),
    label: country,
    value: country,
}));

const stateOptions = states.map(state => ({
    key: state.toLowerCase().replace(/\s/g, '_'),
    label: state,
    value: state,
}));

// Map custom statuses to the expected 'nested' field structure
const customStatusFields = [
    // Pre-defined mandatory statuses
    { id: 1, name: 'Processing', removable: true },
    { id: 2, name: 'Ready for Pickup', removable: true },
    { id: 3, name: 'Picked Up', removable: true },
    { id: 4, name: 'On the Way', removable: true },
    { id: 5, name: 'Delivered', removable: false },
    { id: 6, name: 'Cancelled', removable: false }
].map(status => ({
    key: `status_${status.name.toLowerCase().replace(/\s/g, '_')}`,
    type: 'custom_status_display', // Assuming a custom type for the status list
    label: status.name,
    isRemovable: status.removable,
    color: status.name === 'Delivered' ? 'green' : status.name === 'Cancelled' ? 'red' : 'blue',
}));


export default {
    id: 'shipping-settings',
    priority: 5, // Example priority
    name: __('Shipping Settings', 'multivendorx'),
    desc: __(
        "Manage shipping methods, providers, and tracking, set zones or country restrictions, and control how orders are shipped and completed.",
        'multivendorx'
    ),
    icon: 'adminlib-package', // Adjusted icon name based on similar libraries
    submitUrl: 'shipping_settings', // Example API endpoint for saving
    modal: [
        // 1. General Shipping Configuration
        {
            key: 'general_shipping_section',
            type: 'section',
            hint: __('General Shipping Configuration', 'multivendorx'),
        },
        {
            key: 'taxable_shipping',
            type: 'checkbox',
            label: __('Enable Taxable Shipping', 'multivendorx'),
            settingDescription: __("If enabled, shipping charges will be treated as taxable items during checkout. Disable this to keep shipping costs tax-free.", 'multivendorx'),
            look: 'toggle',
            options: [{ key: 'taxable_shipping_enabled', value: 'yes' }],
            default: false,
        },
        {
            key: 'shipping_method_type',
            type: 'setting-toggle',
            label: __('Shipping Method Type', 'multivendorx'),
            settingDescription: __("Choose the primary logic your marketplace uses to calculate and display shipping costs.", 'multivendorx'),
            options: [
                {
                    key: 'zone_wise',
                    label: __('Zone Wise', 'multivendorx'),
                    value: 'zone',
                    desc: __("Shipping rules based on pre-defined zones created from regions, states, or postal codes.", 'multivendorx'),
                },
                {
                    key: 'country_wise',
                    label: __('Country Wise', 'multivendorx'),
                    value: 'country',
                    desc: __("Shipping rates determined by the customer's country.", 'multivendorx'),
                },
                {
                    key: 'distance_wise',
                    label: __('Distance Wise', 'multivendorx'),
                    value: 'distance',
                    desc: __("Shipping costs calculated based on delivery distance between vendor and customer.", 'multivendorx'),
                },
            ],
            default: 'zone',
        },

        // 2. Zone and Region Control (Dependent on shipping_method_type === 'zone')
        {
            key: 'zone_region_section',
            type: 'section',
            hint: __('Zone and Region Control', 'multivendorx'),
            dependent: {
                key: 'shipping_method_type',
                set: true,
                value: 'zone',
            },
        },
        {
            key: 'allow_store_regions',
            type: 'checkbox',
            label: __('Allow Store Shipping Regions', 'multivendorx'),
            settingDescription: __("Admin can set which countries or states a store can deliver to. Vendors will only be able to ship within these selected regions.", 'multivendorx'),
            look: 'toggle',
            options: [{ key: 'allow_store_regions_enabled', value: 'yes' }],
            default: false,
            dependent: {
                key: 'shipping_method_type',
                set: true,
                value: 'zone',
            },
        },
        {
            key: 'allowed_countries',
            type: 'multiselect-checkbox',
            label: __('Select Allowed Countries', 'multivendorx'),
            settingDescription: __("Select the countries where shipping is permitted for vendors.", 'multivendorx'),
            options: countryOptions,
            size: "full",
            // The visibility of this field is tied to `allow_store_regions` being checked
            dependent: [
                { key: 'shipping_method_type', set: true, value: 'zone' },
                { key: 'allow_store_regions', set: true, value: 'yes' },
            ],
        },
        {
            key: 'allowed_states',
            type: 'multiselect-checkbox',
            label: __('Select Allowed States', 'multivendorx'),
            settingDescription: __("Select the states/regions where shipping is permitted for vendors.", 'multivendorx'),
            options: stateOptions,
            size: "full",
            dependent: [
                { key: 'shipping_method_type', set: true, value: 'zone' },
                { key: 'allow_store_regions', set: true, value: 'yes' },
            ],
        },

        // 3. Shipment Tracking Settings
        {
            key: 'shipment_tracking_section',
            type: 'section',
            hint: __('Shipment Tracking Settings', 'multivendorx'),
        },
        {
            key: 'enable_tracking',
            type: 'checkbox',
            label: __('Enable Shipment Tracking Service', 'multivendorx'),
            settingDescription: __("When enabled, vendors can enter tracking numbers and carrier details for their orders. Customers will receive shipment updates automatically.", 'multivendorx'),
            look: 'toggle',
            options: [{ key: 'enable_tracking_enabled', value: 'yes' }],
            default: true,
        },
        {
            key: 'selected_providers',
            type: 'multiselect-checkbox',
            label: __('Choose Shipping Providers', 'multivendorx'),
            settingDescription: __("Select one or multiple providers that vendors can use for tracking.", 'multivendorx'),
            options: shippingProviders.map(provider => ({
                key: provider.toLowerCase().replace(/\s|\(|\)/g, '_'),
                label: provider,
                value: provider,
            })),
            default: ['FedEx', 'UPS', 'USPS'],
            size: "full",
            dependent: {
                key: 'enable_tracking',
                set: true,
                value: 'yes',
            },
        },
        // A placeholder for the Info box about selected providers
        // In a real CDE setup, the count might be calculated and displayed by the rendering component.

        // 4. Shipping Status Management
        {
            key: 'shipping_status_section',
            type: 'section',
            hint: __('Shipping Status Management', 'multivendorx'),
        },
        {
            key: 'custom_statuses',
            type: 'custom_status_list', // Assuming a custom component to handle the status list UI
            label: __('Custom Shipping Status', 'multivendorx'),
            desc: __('Use these statuses to track order progress. "Delivered" and "Cancelled" are mandatory system statuses.', 'multivendorx'),
            single: true,
            addButtonLabel: 'Add Custom Status',
            nestedFields: customStatusFields, // Pass the initial statuses here
        },


        // 5. Delivery Confirmation Settings
        {
            key: 'delivery_confirmation_section',
            type: 'section',
            hint: __('Delivery Confirmation Settings', 'multivendorx'),
        },
        {
            key: 'enable_shipment_rule',
            type: 'checkbox',
            label: __('Enable Shipment Completion Rule', 'multivendorx'),
            settingDescription: __("If enabled, an order must include shipment details before it can move to Completed status.", 'multivendorx'),
            look: 'toggle',
            options: [{ key: 'enable_shipment_rule_enabled', value: 'yes' }],
            default: false,
        },
        {
            key: 'enable_customer_confirmation',
            type: 'checkbox',
            label: __('Enable Customer Delivery Confirmation', 'multivendorx'),
            settingDescription: __("When enabled, customers can confirm their order as Delivered. Once marked, the order status will automatically change to Completed.", 'multivendorx'),
            look: 'toggle',
            options: [{ key: 'enable_customer_confirmation_enabled', value: 'yes' }],
            default: true,
        },
    ],
};