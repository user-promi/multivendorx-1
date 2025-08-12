import { __ } from '@wordpress/i18n';

export default {
    id: 'product-content-access',
    priority: 1,
    name: __( 'Listing & Content Access', 'multivendorx' ),
    desc: __(
        'Select the types of products stores are allowed to add.',
        'multivendorx'
    ),
    icon: 'adminlib-warehousing-icon',
    submitUrl: 'settings',
    modal: [
        {
            key: 'product_types',
            type: 'checkbox',
            label: __( 'Allowed Product Types', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Select the types of products you want to allow in your marketplace. <li>Simple: Standard product with no variations. <li>Variable: Product with variations (like size or color). <li>External: Links to another site. <li>Rental: Rental-based product.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'simple',
                    label: __( 'Simple', 'multivendorx' ),
                    value: 'simple',
                },
                {
                    key: 'variable',
                    label: __( 'Variable', 'multivendorx' ),
                    value: 'variable',
                },
                {
                    key: 'external',
                    label: __( 'External', 'multivendorx' ),
                    value: 'external',
                },
                {
                    key: 'rental',
                    label: __( 'Rental', 'multivendorx' ),
                    value: 'rental',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'type_options',
            type: 'checkbox',
            label: __( 'Additional Type options', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Select the types of products you want to enable in your marketplace: <li>Virtual Products: Choose this option for products that don’t have a physical form (e.g., services, memberships). <li>Downloadable Products: Use this option for products that customers can download (e.g., software, eBooks).',
                'multivendorx'
            ),
            options: [
                {
                    key: 'virtual',
                    label: __( 'Virtual', 'multivendorx' ),
                    value: 'virtual',
                },
                {
                    key: 'downloadable',
                    label: __( 'Downloadable', 'multivendorx' ),
                    value: 'downloadable',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'products_fields',
            type: 'checkbox',
            label: __( 'Required Product Information Fields ', 'multivendorx' ),
            desc: __(
                'Select the types of products you want to enable in your marketplace: <li>General: Basic product details such as name, description, and price.<li>Inventory: Manage stock levels, SKU, and stock status for products.<li>Linked Products: Link related products, upsells, and cross-sells to increase sales.<li>Attributes: Add custom attributes like size, color, or material to products.<li>Advanced Settings: Configure additional options like purchase notes and order visibility.<li>Policies: Set store policies, including return and refund rules.<li>Product Tags: Help categorize products using tags for easier searching and filtering.<li>GTIN (Global Trade Item Number): Enter the product’s unique identifier for tracking and categorization purposes.',
                'multivendorx'
            ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'general',
                    label: __( 'General', 'multivendorx' ),
                    value: 'general',
                },
                {
                    key: 'inventory',
                    label: __( 'Inventory', 'multivendorx' ),
                    value: 'inventory',
                },
                {
                    key: 'linked_product',
                    label: __( 'Linked Product', 'multivendorx' ),
                    value: 'linked_product',
                },
                {
                    key: 'attribute',
                    label: __( 'Attribute', 'multivendorx' ),
                    value: 'attribute',
                },
                {
                    key: 'advanced',
                    label: __( 'Advance', 'multivendorx' ),
                    value: 'advanced',
                },
                {
                    key: 'policies',
                    label: __( 'Policies', 'multivendorx' ),
                    value: 'policies',
                },
                {
                    key: 'product_tag',
                    label: __( 'Product Tag', 'multivendorx' ),
                    value: 'product_tag',
                },
                {
                    key: 'GTIN',
                    label: __( 'GTIN', 'multivendorx' ),
                    value: 'GTIN',
                },
            ],
            selectDeselect: true,
        }, 
        // {
        //     key: 'separator_content',
        //     type: 'section',
        //     desc: __( 'Media Management', 'multivendorx' ),
        //     hint: __(
        //         'Manage the media files stores can upload.',
        //         'multivendorx'
        //     ),
        // },
        // {
        //     key: 'media_management_options',
        //     type: 'checkbox',
        //     label: __( 'Media Management Options', 'multivendorx' ),
        //     desc: __(
        //         'Select the permissions you want to grant stores for media file uploads.',
        //         'multivendorx'
        //     ),
        //     options: [
        //         {
        //             key: 'is_upload_files',
        //             label: __( 'Upload Media Files', 'multivendorx' ),
        //             value: 'is_upload_files',
        //         },
        //     ],
        //     selectDeselect: true,
        // },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'SKU Generation', 'multivendorx' ),
            hint: __(
                'Control how SKUs are handled for products.',
                'multivendorx'
            ),
        },
        {
            key: 'sku_generator_simple',
            type: 'setting-toggle',
            label: __(
                'SKU Management for Products',
                'multivendorx'
            ),
            desc: __(
                'Choose how SKUs for simple, external, or parent products are generated:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'never',
                    label: __( 'Never (let me set them)', 'multivendorx' ),
                    value: 'never',
                },
                {
                    key: 'slugs',
                    label: __(
                        'Using the product slug (name)',
                        'multivendorx'
                    ),
                    value: 'slugs',
                },
                {
                    key: 'ids',
                    label: __( 'Using the product ID)', 'multivendorx' ),
                    value: 'ids',
                },
            ],
        },
        // {
        //     key: 'sku_generator_variation',
        //     type: 'select',
        //     label: __(
        //         'SKU Management for Product Variations',
        //         'multivendorx'
        //     ),
        //     desc: __(
        //         'Define how SKUs for product variations will be generated:',
        //         'multivendorx'
        //     ),
        //     options: [
        //         {
        //             key: 'choose_options',
        //             label: __( 'Choose options', 'multivendorx' ),
        //             value: 'choose_options',
        //         },
        //         {
        //             key: 'never',
        //             label: __( 'Never (let me set them)', 'multivendorx' ),
        //             value: 'never',
        //         },
        //         {
        //             key: 'slugs',
        //             label: __(
        //                 'Using the product slug (name)',
        //                 'multivendorx'
        //             ),
        //             value: 'slugs',
        //         },
        //         {
        //             key: 'ids',
        //             label: __( 'Using the product ID)', 'multivendorx' ),
        //             value: 'ids',
        //         },
        //     ],
        // },
        {
            key: 'sku_generator_attribute_spaces',
            type: 'setting-toggle',
            label: __(
                'SKU Formating Options',
                'multivendorx'
            ),
            desc: __(
                'Choose whether to replace spaces in attribute names when generating SKUs:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'no',
                    label: __(
                        'Replace Spaces in Attribute',
                        'multivendorx'
                    ),
                    value: 'no',
                },
                {
                    key: 'underscore',
                    label: __(
                        'Keep Original Spacing',
                        'multivendorx'
                    ),
                    value: 'underscore',
                },
                {
                    key: 'dash',
                    label: __(
                        'Custom SKU Format Rules',
                        'multivendorx'
                    ),
                    value: 'dash',
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Help vendors select accurate product categories through guided category selection:', 'multivendorx' ),
            hint: __(
                'Category Pyramid Guide (CPG)',
                'multivendorx'
            ),
        },
        {
            key: 'sku_generator_attribute_spaces',
            type: 'setting-toggle',
            label: __(
                'Category Selection Method',
                'multivendorx'
            ),
            desc: __(
                'Choose whether to replace spaces in attribute names when generating SKUs:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'no',
                    label: __(
                        'Guided Sequential Selection',
                        'multivendorx'
                    ),
                    value: 'no',
                },
                {
                    key: 'underscore',
                    label: __(
                        'Free Multi-Selection',
                        'multivendorx'
                    ),
                    value: 'underscore',
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Control whether related product suggestions are shown from the same store, the entire marketplace, or not at all.', 'multivendorx' ),
            hint: __(
                'Related Products Source',
                'multivendorx'
            ),
        },
        {
            key: 'sku_generator_attribute_spaces',
            type: 'setting-toggle',
            label: __(
                'Recommendation Source',
                'multivendorx'
            ),
            desc: __(
                'Choose whether to replace spaces in attribute names when generating SKUs:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'no',
                    label: __(
                        'Same Store',
                        'multivendorx'
                    ),
                    value: 'no',
                },
                {
                    key: 'underscore',
                    label: __(
                        'All Store',
                        'multivendorx'
                    ),
                    value: 'underscore',
                },

            ],
        },
    ],
};
