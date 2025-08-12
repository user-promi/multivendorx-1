import { __ } from '@wordpress/i18n';

export default {
    id: 'user-capability',
    priority: 2,
    name: __('User Capability', 'mvx-pro'),
    desc: __('Manage access permissions for different store roles.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [           
        {
            key: 'role_access_table',
            type: 'multi-checkbox-table',
            moduleEnabled: 'role_manager',

            columns: [
                { key: 'storeOwner', label: __('Store Owner', 'mvx-pro') },
                { key: 'storeManager', label: __('Store Manager', 'mvx-pro') },
                { key: 'productManager', label: __('Product Manager', 'mvx-pro') },
                { key: 'customerSupport', label: __('Customer Support', 'mvx-pro') },
                { key: 'orderAssistant', label: __('Order Assistant', 'mvx-pro') },
            ],

            rows: appLocalizer.capabilities
        },                     
    ],
};
