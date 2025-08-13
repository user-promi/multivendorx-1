import { __ } from '@wordpress/i18n';

export default {
    id: 'store-capability',
    priority: 1,
    name: __('Store Capability', 'mvx-pro'),
    desc: __('Manage access permissions for different store roles.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [  
        {
            key: 'product_permission_options',
            type: 'checkbox',
            label: __( 'Product Control', 'multivendorx' ),
            desc: __( 'Set how vendors handle their product listings', 'multivendorx' ),
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
            key: 'coupon_management_options',
            type: 'checkbox',
            label: __( 'Coupon Privileges', 'multivendorx' ),
            desc: __( 'Control vendor discount and promotion powers', 'multivendorx' ),
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
            key: 'media_management_options',
            label: __( 'Upload Media Files', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'is_upload_files',
                    value: 'is_upload_files',
                },
            ],
            look: 'toggle',        },
        {
            key: 'additional_file_type',
            type: 'checkbox',
            label: __( 'Additional file type restrictions', 'multivendorx' ),
            desc: __(
                'Manage what files vendors can add to their stores',
                'multivendorx'
            ),
            options: [
                {
                    key: 'pdf',
                    label: __( 'Pdf', 'multivendorx' ),
                    value: 'pdf',
                },
                {
                    key: 'jpg',
                    label: __( 'Jpg', 'multivendorx' ),
                    value: 'Jpg',
                },
                {
                    key: 'jpeg',
                    label: __( 'Jpeg', 'multivendorx' ),
                    value: 'Jpeg',
                },
            ],
            selectDeselect: true,
            dependent: {
                key: 'media_management_options',
                set: true,
                value: 'is_upload_files',
            },
        },
        {
            key: 'max_upload_size',
            type: 'number',
            label: __('Max Upload Size', 'multivendorx'),
            desc: __(
                'In MB',
                'multivendorx'
            ),
            dependent: {
                key: 'media_management_options',
                set: true,
                value: 'is_upload_files',
            },
        },                     
    ],
};
