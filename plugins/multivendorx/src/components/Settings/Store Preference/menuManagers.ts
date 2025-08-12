import { __ } from '@wordpress/i18n';

export default {
    id: 'menu-manager',
    priority: 4,
    name: __( 'Menu Manager', 'multivendorx' ),
    desc: __(
        'Control public visibility of store and store info',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_dashboard_page',
            type: 'select',
            label: __( 'Store Dashboard page', 'multivendorx' ),
            desc: __(
                'Select the page on which you have inserted <code>[store_registration]</code> shortcode.This is the page where new stores can sign up.',
                'multivendorx'
            ),
            options: appLocalizer.vendor_dashboard_pages,
        },
        {
            key: 'menu_manager',
            label: __( 'Menu manager', 'multivendorx' ),
            type: 'endpoint-editor',
            apiLink: 'endpoints'
        },
    ]    
};