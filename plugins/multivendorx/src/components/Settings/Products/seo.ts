import { __ } from '@wordpress/i18n';

export default {
    id: 'seo',
    priority: 5,
    name: __( 'SEO Support', 'mvx-pro' ),
    desc: __( 'Allow stores to optimize their products for better search engine visibility using SEO plugins.', 'mvx-pro' ),
    icon: 'adminlib-support',
    submitUrl: 'settings',
    modal: [       
        {
            key: 'store_seo_options',
            type: 'setting-toggle',
            label: __( 'SEO mode', 'mvx-pro' ),
            settingDescription: __('Let stores manage SEO and boost their visibility using advanced plugins.',
                'multivendorx'
            ),
            desc: __( '<ul><li>Yoast SEO – Add custom titles, meta descriptions, and keywords to products and store pages.</li><li>Rank Math – Similar to Yoast, but with advanced options like rich snippets and keyword analysis.</li></ul>', 'mvx-pro' ),
                options: [
                {
                    key: 'yoast',
                    label: __( 'Yoast', 'mvx-pro' ),
                    value: 'yoast',
                },
                {
                    key: 'rank_math',
                    label: __( 'Rank Math', 'mvx-pro' ),
                    value: 'rank_math',
                },
            ],
            //proSetting:true
        },
    ],
};
