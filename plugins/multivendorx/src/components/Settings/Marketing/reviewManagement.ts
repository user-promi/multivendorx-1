import { __ } from '@wordpress/i18n';

export default {
    id: 'review-management',
    priority: 2,
    name: __( 'Reviews & Rating', 'multivendorx' ),
    desc: __( 'Manage settings for product and store review.', 'multivendorx' ),
    icon: 'adminlib-settings',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_rating_page',
            type: 'blocktext',
            label: __( 'no_label', 'multivendorx' ),
            blocktext: __(
                '<b>Admin needs to enable product review from woocommerce settings</b>',
                'multivendorx'
            ),
        },
        {
            key: 'is_storereview',
            type: 'checkbox',
            label: __( 'Store Review', 'multivendorx' ),
            desc: __(
                'Any customer can rate and review a store.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_storereview',
                    value: 'is_storereview',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'is_storereview_varified',
            type: 'checkbox',
            label: __( 'Buyer only reviews', 'multivendorx' ),
            desc: __(
                'Allows you to accept reviews only from buyers purchasing the product.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_storereview_varified',
                    value: 'is_storereview_varified',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'product_review_sync',
            type: 'checkbox',
            label: __( 'Product Rating Sync', 'multivendorx' ),
            desc: __(
                'Store Rating will be calculated based on Store Rating + Product Rating.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'product_review_sync',
                    value: 'product_review_sync',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'ratings_parameters',
            type: 'multi-string',
            label: __( 'Ratings Parameters', 'multivendorx' ),
            placeholder: __( 'Enter a parameter and click +', 'multivendorx' ),
            desc: __(
                'Specify parameters for which you want to have ratings, e.g., Packaging, Delivery, Behaviour, Policy, etc.',
                'multivendorx'
            ),
            name: 'ratings_parameters',
            dependent: {
                key: 'product_review_sync',
                set: true,
            },
        }
        
    ],
};
