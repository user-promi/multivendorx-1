import { __ } from '@wordpress/i18n';

export default {
    id: 'franchise',
    priority: 1,
    name: __( 'Franchise Settings', 'multivendorx' ),
    desc: __(
        'Configure how franchise stores operate within your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-single-product',
    submitUrl: 'settings',
    modal: [
        {
            key: 'section',
            type: 'section',
            hint: __(
                'General settings',
                'multivendorx'
            ),
        },
        {
            key: 'enable_franchise',
            label: __('Enable Franchise System', 'multivendorx'),
            z: __('Activate franchise functionality across your entire marketplace. All other settings require this to be enabled.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'enable_franchise',
                    value: 'enable_franchise',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Order Management',
                'multivendorx'
            ),
        },
        {
            key: 'allow_store_create_orders',
            label: __('Allow stores to create orders', 'multivendorx'),
            settingDescription: __('Enable stores to manually create orders for their own products. Standard marketplace commission rules will apply.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'allow_store_create_orders',
                    value: 'allow_store_create_orders',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'allow_store_orders_admin',
            label: __('Allow stores to order admin products', 'multivendorx'),
            settingDescription: __('Permit franchise stores to place orders for products that belong to the admin catalog.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'allow_store_orders_admin',
                    value: 'allow_store_orders_admin',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Automatic Store Assignment',
                'multivendorx'
            ),
        },
        {
            key: 'enable_automatic_assignment',
            label: __('Enable Automatic Assignment', 'multivendorx'),
            settingDescription: __('System will automatically select the closest store to fulfill each order based on customer location.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'enable_automatic_assignment',
                    value: 'enable_automatic_assignment',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Advanced Settings',
                'multivendorx'
            ),
        },
        {
            key: 'restrict_location',
            label: __('Restrict stores by location', 'multivendorx'),
            settingDescription: __('Limit store operations to specific geographic regions such as city, state, or postal code boundaries.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'restrict_location',
                    value: 'restrict_location',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'override_admin_product',
            label: __('Allow stores to override admin product pricing', 'multivendorx'),
            settingDescription: __("Enable stores to modify prices when ordering admin products. Only applies if 'Allow stores to order admin products' is enabled.", 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'override_admin_product',
                    value: 'override_admin_product',
                },
            ],
            look: 'toggle',
        },
    ]
}