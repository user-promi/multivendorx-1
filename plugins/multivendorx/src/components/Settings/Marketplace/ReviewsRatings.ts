import { __ } from '@wordpress/i18n';

export default {
    id: 'review-management',
    priority: 4,
    name: __( 'Store Reviews', 'multivendorx' ),
    desc: __( 'Manage product and store review settings.', 'multivendorx' ),
    icon: 'adminlib-store-review',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_rating_page',
            type: 'blocktext',
            label: __( 'no_label', 'multivendorx' ),
            blocktext: __(
                '<b>Store and product reviews are separate. Enable product reviews from <a href="/wp-admin/admin.php?page=wc-settings&tab=products" target="_blank">WooCommerce settings</a>.</b>',
                'multivendorx'
            ),            
        },
        {
            key: 'is_storereview_varified',
            type: 'checkbox',
            label: __( 'Verified buyer reviews only', 'multivendorx' ),
            desc: __( 'Accept reviews only from verified buyers who purchased a product.', 'multivendorx' ),
            options: [
                {
                    key: 'is_storereview_varified',
                    value: 'is_storereview_varified',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'store-review',
        },
        {
            key: 'ratings_parameters',
            type: 'multi-string',
            label: __('Rating parameters', 'multivendorx'),
            //placeholder: __('Define the key milestones in a store’s delivery process. These stages help stores communicate order progress to customers', 'multivendorx'),
            iconEnable: false,
            descEnable: true,
            moduleEnabled: 'store-review',
            requiredEnable: true,
            settingDescription: __(
                'Define rating parameters such as packaging, delivery, behaviour, policies, etc.',
                'multivendorx'
            ),
            defaultValues: [
                { value: "Product quality",},
                { value: "Customer service",},
                { value: "Delivery experience",},
                { value: "Value for money", },
                { value: "Overall experience",},
            ],
            // dependent: {
            //     key: 'product_review_sync',
            //     set: true,
            // },
            proSetting: false,
            maxItems: 10,
            allowDuplicates: false,
        },
    ],
};
