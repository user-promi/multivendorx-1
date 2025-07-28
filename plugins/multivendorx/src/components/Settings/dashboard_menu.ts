import { __ } from '@wordpress/i18n';

export default {
    id: 'dashboard-menu',
    priority: 24,
    name: __( 'Dashboard Menu', 'multivendorx' ),
    desc: __( 'Dashboard Menu', 'multivendorx' ),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'menu_manager',
            label: __( 'Menu manager', 'multivendorx' ),
            type: 'endpoint-editor',
            apiLink: 'endpoints'
        },
    ]
}