import { __ } from '@wordpress/i18n';

export default {
    id: 'under-review',
    priority: 1,
    name: __('Under Review', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __('Store promotion limit', 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'pause_selling_products',
                    label: __('Pause selling products', 'multivendorx'),
                    value: 'pause_selling_products',
                    desc: __('Temporarily disables product sales and order fulfillment while the review is in progress.', 'multivendorx'),
                },
                {
                    key: 'hold_payments_release',
                    label: __('Hold payments release', 'multivendorx'),
                    value: 'hold_payments_release',
                    desc: __('Suspends payout processing. Earnings will be released once the store successfully clears the review.', 'multivendorx'),
                },
                {
                    key: 'restrict_new_product_uploads',
                    label: __('Restrict new product uploads', 'multivendorx'),
                    value: 'restrict_new_product_uploads',
                    desc: __('Prevents sellers from adding or editing products during the review period. Existing listings remain visible to customers.', 'multivendorx'),
                },
            ],

            selectDeselect: true,
        },
        {
            key: 'pending_msg',
            label: 'Message shown to stores under review',
            type: 'text',
            value: 'Your store is under review. Sales and payouts are temporarily paused.',
            des: 'What pending stores can do',
        },
    ],
};
