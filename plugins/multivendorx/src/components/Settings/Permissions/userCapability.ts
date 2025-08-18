import { __ } from '@wordpress/i18n';

const columns = Object.entries(appLocalizer.custom_roles).map(([key, value]) => {
    return {
        key: key,
        label: value,
    };
});

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
            columns: columns,
            rows: appLocalizer.capabilities,
        },                     
    ],
};
