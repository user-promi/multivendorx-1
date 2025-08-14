import { __ } from '@wordpress/i18n';

export default {
    id: 'user-capability',
    priority: 2,
    name: __('User Capability', 'multivendorx'),
    desc: __('Manage access permissions for different store roles.', 'multivendorx'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [           
        {
            key: 'role_access_table',
            type: 'multi-checkbox-table',
            // moduleEnabled: 'role_manager',
            columns: appLocalizer.custom_roles,
            rows: appLocalizer.capabilities,
        },                     
    ],
};
