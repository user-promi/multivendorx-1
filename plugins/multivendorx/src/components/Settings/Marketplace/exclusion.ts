import { __ } from '@wordpress/i18n';

export default {
    id: 'enquiry-quote-exclusion',
    priority: 8,
    headerTitle: __( 'Exclusion', 'catalogx' ),
    headerDescription: __(
        'Exclude catalog viewing, enquiries, and quotes by user roles and product attributes.',
        'catalogx'
    ),
    icon: 'adminlib-exclude',
    submitUrl: 'settings',
    modal: [
        {
            key: 'exclusion',
            type: 'multi-checkbox-table',
            label: __( '', 'catalogx' ),
            desc: __( 'Grid Table', 'catalogx' ),
            classes: 'gridTable no-label',
            rows: [
                {
                    key: 'userroles_list',
                    label: __( 'User Role', 'catalogx' ),
                    options: [
                        { value: 'administrator', label: __( 'Administrator', 'catalogx' ) },
                        { value: 'editor1',        label: __( 'Editor1',        'catalogx' ) },
                        { value: 'editor2',        label: __( 'Editor2',        'catalogx' ) },
                        { value: 'editor3',        label: __( 'Editor3',        'catalogx' ) },
                        { value: 'author',        label: __( 'Author',        'catalogx' ) },
                    ],
                },
                {
                    key: 'user_list',
                    label: __( 'User Name', 'catalogx' ),
                    options: [
                        { key: 'administrator', value: __( 'Administrator', 'catalogx' ) },
                        { key: 'editor',        value: __( 'Editor',        'catalogx' ) },
                        { key: 'author',        value: __( 'Author',        'catalogx' ) },
                    ],
                },
                {
                    key: 'product_list',
                    label: __( 'Product', 'catalogx' ),
                    options: [
                        { key: 'administrator', value: __( 'Administrator', 'catalogx' ) },
                        { key: 'editor',        value: __( 'Editor',        'catalogx' ) },
                        { key: 'author',        value: __( 'Author',        'catalogx' ) },
                    ],
                },
                {
                    key: 'category_list',
                    label: __( 'Category', 'catalogx' ),
                    options: [
                        { key: 'administrator', value: __( 'Administrator', 'catalogx' ) },
                        { key: 'editor',        value: __( 'Editor',        'catalogx' ) },
                        { key: 'author',        value: __( 'Author',        'catalogx' ) },
                    ],
                },
                {
                    key: 'tag_list',
                    label: __( 'Tag', 'catalogx' ),
                    options: [
                        { key: 'administrator', value: __( 'Administrator', 'catalogx' ) },
                        { key: 'editor',        value: __( 'Editor',        'catalogx' ) },
                        { key: 'author',        value: __( 'Author',        'catalogx' ) },
                    ],
                },
                {
                    key: 'brand_list',
                    label: __( 'Brand', 'catalogx' ),
                    options: [
                        { key: 'administrator', value: __( 'Administrator', 'catalogx' ) },
                        { key: 'editor',        value: __( 'Editor',        'catalogx' ) },
                        { key: 'author',        value: __( 'Author',        'catalogx' ) },
                    ],
                },
            ],
            columns: [
                {
                    key: 'catalog_exclusion',
                    label: __( 'Catalog', 'catalogx' ),
                    type:'multi-select',
                },
                {
                    key: 'enquiry_exclusion',
                    label: __( 'Enquiry', 'catalogx' ),
                },
                {
                    key: 'quote_exclusion',
                    label: __( 'Quote', 'catalogx' ),
                },
            ],
        },
    ],
};
