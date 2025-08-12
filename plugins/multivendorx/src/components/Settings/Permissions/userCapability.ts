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

            rows: [
                { key: 'manageUsers', label: __('Manage Users', 'mvx-pro') },
                { key: 'manageProducts', label: __('Manage Products', 'mvx-pro') },
                {
                    key: 'orders',
                    label: __('View/Process Orders', 'mvx-pro'),
                    options: [
                        { value: 'Full', label: __('Full', 'mvx-pro') },
                        { value: 'Limited', label: __('Limited', 'mvx-pro') },
                        { value: 'View Only', label: __('View Only', 'mvx-pro') },
                        { value: 'Views Only Basic Access', label: __('Views Only Basic Access', 'mvx-pro') },
                        { value: 'No', label: __('No', 'mvx-pro') },
                    ],
                },
                {
                    key: 'finances',
                    label: __('Access Finances', 'mvx-pro'),
                    options: [
                        { value: 'Full', label: __('Full', 'mvx-pro') },
                        { value: 'Limited', label: __('Limited', 'mvx-pro') },
                        { value: 'Refunds Only', label: __('Refunds Only', 'mvx-pro') },
                        { value: 'No', label: __('No', 'mvx-pro') },
                    ],
                },
                {
                    key: 'analytics',
                    label: __('Analytics', 'mvx-pro'),
                    options: [
                        { value: 'Full', label: __('Full', 'mvx-pro') },
                        { value: 'Some', label: __('Some', 'mvx-pro') },
                        { value: 'Product Only', label: __('Product Only', 'mvx-pro') },
                        { value: 'No', label: __('No', 'mvx-pro') },
                    ],
                },
                { key: 'messages', label: __('Customer Messages', 'mvx-pro') },
            ],
        },                     
    ],
};
