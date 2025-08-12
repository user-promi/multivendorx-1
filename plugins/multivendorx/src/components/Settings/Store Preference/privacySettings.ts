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
            key: 'hide_sold_by_label',
            type: 'checkbox',
            label: __( 'Display Store Name on Products', 'multivendorx' ),
            desc: __( 'Show the vendor’s store name alongside products in listings and detail pages, helping customers identify which store is selling each item.', 'multivendorx' ),
            options: [
                {
                    key: 'hide_sold_by_label',
                    value: 'hide_sold_by_label',
                },
            ],
            look: 'toggle',
        },  
        {
            key: 'sold_by_location',
            type: 'checkbox',
            label: __( 'Split Cart by Store', 'multivendorx' ),
            desc: __( 'Enable a modern, vendor-specific cart view where items are grouped by store. This split view is also reflected in customer order emails, showing sub-order details clearly for each store.', 'multivendorx' ),
            options: [
                {
                    key: 'sold_by_location',
                    value: 'sold_by_location',
                },
            ],
            dependent: {
                key: 'hide_sold_by_label',
                value: 'hide_sold_by_label',
            },
            look: 'toggle',
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
            label: __( 'Store page elements', 'multivendorx' ),
            desc: __( 'Manage store information visibility on the store page.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_owner_info',
                    label: __( 'Owner Info', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Store Description', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_address',
                    label: __( 'Address', 'multivendorx' ),
                    value: 'show_store_address',
                },
                {
                    key: 'show_contact_button',
                    label: __( 'Store Contact', 'multivendorx' ),
                    value: 'show_contact_button',
                },
                {
                    key: 'show_store_ratings',
                    label: __( 'Store Ratings', 'multivendorx' ),
                    value: 'show_store_ratings',
                },
                {
                    key: 'show_store_phone_number',
                    label: __( 'Phone Number', 'multivendorx' ),
                    value: 'show_store_phone_number',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_email_visibility',
            type: 'section',
            desc: __( 'Email Visibility', 'multivendorx' ),
            hint: __(
                'Control what store information is visible in customer emails.',
                'multivendorx'
            ),
        },
        {
            key: 'email_visibility_settings',
            type: 'checkbox',
            label: __( 'Email Communications', 'multivendorx' ),
            desc: __( 'Manage store details shown in customer emails.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'buyer_see_store_details_in_email',
                    label: __( 'Include Store Details In Customer Order Email', 'multivendorx' ),
                    value: 'buyer_see_store_details_in_email',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_store_policy_override',
            type: 'section',
            desc: __( 'Store Policy Override', 'multivendorx' ),
            hint: __(
                'Allow stores to set or override the default store policies (e.g., refund, shipping, and cancellation policies).',
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
                    label: __( 'Store Policy', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Shipping Policy', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Refund and Return Policy', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'enable_profile_deactivation_request',
            type: 'checkbox',
            label: __( 'Profile Deactivation Request', 'multivendorx' ),
            desc: __( 'Let stores temporarily deactivate their profiles from their dashboard.', 'multivendorx' ),
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
