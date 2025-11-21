import { __ } from '@wordpress/i18n';

export default {
    id: 'product-store-category-control',
    priority: 3,
    name: __( 'Category Pyramid Guide (CPG)', 'multivendorx' ),
    desc: __(
        'Choose whether stores follow a step-by-step guided process through the category hierarchy or freely select multiple categories & subcategories without restrictions.','multivendorx'
    ),
    video: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/video/general-settings',
    },
    docs: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/docs/general-settings',
    },
    icon: 'adminlib-module',
    submitUrl: 'settings',
    modal: [
           
        {
            key: 'category_pyramid_guide',
            type: 'setting-toggle',
            label: __(
                'Category selection method',
                'multivendorx'
            ),
            desc: __('<ul><li>Guided sequential selection - Stores must first choose primary category, then select from available subcategories.</li><li>Free multi-selection - Stores can select any number of categories and subcategories without restrictions.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'yes',
                    label: __(
                        'Guided sequential selection',
                        'multivendorx'
                    ),
                    value: 'yes',
                },
                {
                    key: 'no',
                    label: __(
                        'Free multi-selection',
                        'multivendorx'
                    ),
                    value: 'no',
                },
            ],
        },      
    ],
};
