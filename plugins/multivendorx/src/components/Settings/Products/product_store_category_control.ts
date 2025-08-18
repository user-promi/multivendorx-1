import { __ } from '@wordpress/i18n';

export default {
    id: 'product -store-category -control',
    priority: 3,
    name: __( 'Category Pyramid Guide (CPG)', 'multivendorx' ),
    desc: __(
        'Help vendors select accurate product categories through guided category selection:','multivendorx'
    ),
    video: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/video/general-settings',
    },
    docs: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/docs/general-settings',
    },
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
           
        {
            key: 'sku_generator_attribute_spaces',
            type: 'setting-toggle',
            label: __(
                'Category Selection Method',
                'multivendorx'
            ),
            desc: __('<ul><li><b>Guided Sequential Selection</b>: Vendors must first choose primary category, then select from available subcategories.</li><li><b>Free Multi-Selection</b>ss: Vendors can select any number of categories and subcategories without restrictions.</li></ul>',
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
    ],
};