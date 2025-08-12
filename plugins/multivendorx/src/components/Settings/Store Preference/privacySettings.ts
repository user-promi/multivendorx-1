import { __ } from '@wordpress/i18n';

export default {
    id: 'privacy-settings',
    priority: 6,
    name: __( 'Privacy', 'multivendorx' ),
    desc: __(
        'Control public visibility of store and store info',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [ 
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store Info on Products', 'multivendorx' ),
            desc: __( 'Control which store information is visible on product pages.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_name_on_products',
                    label: __( 'Show store name on products', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_logo_next_to_products',
                    label: __( 'Show store logo next to products', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_order_breakdown_by_store',
                    label: __( 'Show order breakdown by store', 'multivendorx' ),
                    value: 'show_store_address',
                },                
            ],
            selectDeselect: true,
        },
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Cart & Checkout', 'multivendorx' ),
            desc: __( 'Control which store information is visible during shopping and checkout.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'group_items_by_store_in_cart',
                    label: __( 'Group items by store in the shopping cart', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'display_store_support_details',
                    label: __( 'Display Store Support details', 'multivendorx' ),
                    value: 'show_store_address',
                },
                
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_store_page_details',
            type: 'section',
            desc: __( 'Store Page Details', 'multivendorx' ),
            hint: __(
                'Control which store information is visible on the store’s store page.',
                'multivendorx'
            ),
        },
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store page deatils', 'multivendorx' ),
            desc: __( 'Manage store information visibility on the store page.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_owner_info',
                    label: __( 'Address', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Phone', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Email', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Information', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_ratings',
                    label: __( 'Store Ratings', 'multivendorx' ),
                    value: 'show_store_ratings',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_store_policy_override',
            type: 'section',
            desc: __( 'Store Policy Override', 'multivendorx' ),
            hint: __(
                'Allow stores to set or override the default store policies.',
                'multivendorx'
            ),
        },
        {
            key: 'store_policy_override',
            type: 'checkbox',
            label: __( 'Policies', 'multivendorx' ),
            desc: __( 'Allow stores to override default marketplace policies.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Store', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Shipping', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Refund and Return', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_store_policy_override',
            type: 'section',
            desc: __( 'Profile Deactivation Request', 'multivendorx' ),
            hint: __(
                'Allow stores to set or override the default store policies.',
                'multivendorx'
            ),
        },
        {
            key: 'enable_profile_deactivation_request',
            type: 'checkbox',
            label: __( 'Enable Profile Deativation', 'multivendorx' ),
            options: [
                {
                    key: 'enable_profile_deactivation_request',
                    value: 'enable_profile_deactivation_request',
                },
            ],
            look: 'toggle',
        },  
    ],
};
