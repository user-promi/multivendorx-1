import { __ } from '@wordpress/i18n';

export default {
    id: 'product-limits',
    priority: 5,
    name: __('Product Limits', 'multivendorx'),
    desc: __(
        'Site errors and events are logged for easy troubleshooting.',
        'multivendorx'
    ),
    icon: 'adminlib-database',
    submitUrl: 'settings',
    modal: [
        {
            key: 'plan-price',
            type: 'number',
            size: '10rem',
            desc: 'Enter 0 for unlimited products',
            label: __('Total Product Limit', 'multivendorx'),
        },
        {
            key: 'plan-price',
            type: 'number',
            size: '10rem',
            desc: 'Maximum number of images per product (optional)',
            label: __('Gallery Images per Product', 'multivendorx'),
        },
        {
            key: 'enable_franchise',
            label: __('Featured Product Access ', 'multivendorx'),
            desc: __('Allow sellers to mark products as featured', 'multivendorx'),
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
            key: 'store_branding_details',
            type: 'checkbox',
            label: __('Product Types', 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_name',
                    label: __('Simple Products', 'multivendorx'),
                    value: 'show_store_name',
                },
                {
                    key: 'show_store_logo_next_to_products',
                    label: __('External / Affiliate Products', 'multivendorx'),
                    value: 'show_store_logo_next_to_products',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'product_permissions',
            type: 'checkbox',
            label: __('Product Permissions', 'multivendorx'),
            // settingDescription: __( 'Decide which details appear with products and on store pages.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'add_products',
                    label: __('Add Products', 'multivendorx'),
                    desc: __('Allow sellers to add new products'),
                    value: 'add_products',
                },
                {
                    key: 'edit_products',
                    label: __('Edit Products', 'multivendorx'),
                    desc: __('Allow sellers to edit existing products', 'multivendorx'),
                    value: 'edit_products',
                },
                {
                    key: 'delete_products',
                    label: __('Delete Products', 'multivendorx'),
                    desc: __('Allow sellers to delete their products', 'multivendorx'),
                    value: 'delete_products',
                },
                {
                    key: 'upload_media',
                    label: __('Upload Media Files', 'multivendorx'),
                    desc: __('Allow sellers to upload images and media', 'multivendorx'),
                    value: 'upload_media',
                },
            ],
            selectDeselect: true,
        },
    ],
};
