import { __ } from '@wordpress/i18n';

export default {
    id: 'role-manager',
    priority: 4,
    name: __('Role-Based Access', 'mvx-pro'),
    desc: __('Manage access permissions for different store roles.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [  
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Product Permission Options', 'multivendorx' ),
            hint: __(
                'Control how sellers can submit and manage their products',
                'multivendorx'
            ),
        },
        {
            key: 'product_permission_options',
            type: 'checkbox',
            label: __( 'Product Permission Options', 'multivendorx' ),
            desc: __( 'Manage the permissions sellers have for product submission, publishing, and editing.', 'multivendorx' ),
            options: [
                {
                    key: 'is_submit_product',
                    label: __( 'Submit Products for Approval', 'multivendorx' ),
                    value: 'is_submit_product',
                },
                {
                    key: 'is_published_product',
                    label: __( 'Publish Products Directly', 'multivendorx' ),
                    value: 'is_published_product',
                },
                {
                    key: 'is_edit_delete_published_product',
                    label: __( 'Edit/Delete Published Products', 'multivendorx' ),
                    value: 'is_edit_delete_published_product',
                },
                {
                    key: 'publish_and_submit_products',
                    label: __( 'Publish & Submit Edited Products', 'multivendorx' ),
                    value: 'publish_and_submit_products',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Coupon Management', 'multivendorx' ),
            hint: __(
                'Give sellers control over their discount coupons.',
                'multivendorx'
            ),
        },
        {
            key: 'coupon_management_options',
            type: 'checkbox',
            label: __( 'Coupon Management Options', 'multivendorx' ),
            desc: __( 'Manage the permissions sellers have for creating, publishing, and editing coupons.', 'multivendorx' ),
            options: [
                {
                    key: 'is_submit_coupon',
                    label: __( 'Create Coupons', 'multivendorx' ),
                    value: 'is_submit_coupon',
                },
                {
                    key: 'is_published_coupon',
                    label: __( 'Publish Coupons', 'multivendorx' ),
                    value: 'is_published_coupon',
                },
                {
                    key: 'is_edit_delete_published_coupon',
                    label: __( 'Edit/Delete Published Coupons', 'multivendorx' ),
                    value: 'is_edit_delete_published_coupon',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Media Management', 'multivendorx' ),
            hint: __(
                'Manage the media files sellers can upload.',
                'multivendorx'
            ),
        },
        {
            key: 'media_management_options',
            type: 'checkbox',
            label: __( 'Media Management Options', 'multivendorx' ),
            desc: __(
                'Select the permissions you want to grant sellers for media file uploads.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_upload_files',
                    label: __( 'Upload Media Files', 'multivendorx' ),
                    value: 'is_upload_files',
                },
            ],
            selectDeselect: true,
        },
                       
        {
            key: 'role_access_table',
            type: 'multi-checkbox-table',
            label: __('Role Access Control', 'multivendorx'),
            desc: __('Define which permissions each role should have.', 'multivendorx'),
            // moduleEnabled: 'role_manager',

            columns: [
                { key: 'store_owner', label: __('Store Owner', 'multivendorx') },
                { key: 'store_manager', label: __('Store Manager', 'multivendorx') },
                { key: 'product_manager', label: __('Product Manager', 'multivendorx') },
                { key: 'customer_support', label: __('Customer Support', 'multivendorx') },
                { key: 'order_assistant', label: __('Order Assistant', 'multivendorx') },
            ],
            rows: appLocalizer.capabilities

            // rows: [
            //     { key: 'manage_users', label: __('Manage Users', 'multivendorx') },
            //     { key: 'manage_products', label: __('Manage Products', 'multivendorx') },
            //     { key: 'read_products', label: __('Read Products', 'multivendorx') },
            //     { key: 'edit_products', label: __('Edit Products', 'multivendorx') },
            //     { key: 'delete_products', label: __('Delete Products', 'multivendorx') },
            //     { key: 'publish_products', label: __('Publish Products', 'multivendorx') },
            //     { key: 'upload_files', label: __('Upload Files', 'multivendorx') },
                
            //     { key: 'read_shop_orders', label: __('Read Shop Orders', 'multivendorx') },
            //     { key: 'edit_shop_orders', label: __('Edit Shop Orders', 'multivendorx') },
            //     { key: 'delete_shop_orders', label: __('Delete Shop Orders', 'multivendorx') },
                
            //     { key: 'read_shop_coupons', label: __('Read Shop Coupons', 'multivendorx') },
            //     { key: 'edit_shop_coupons', label: __('Edit Shop Coupons', 'multivendorx') },
            //     { key: 'delete_shop_coupons', label: __('Delete Shop Coupons', 'multivendorx') },
                
            // ],
        },                     
    ],
};
