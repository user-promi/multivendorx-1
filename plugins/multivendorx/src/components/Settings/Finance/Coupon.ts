import { __ } from '@wordpress/i18n';

export default {
    id: 'store-coupon',
    priority: 3,
    name: __('Coupon & Discount', 'mvx-pro'),
    desc: __('Manage how discounts and coupons affect commission calculations', 'mvx-pro'),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [        
        {
            key: 'commission_include_coupon',
            label: __( 'Who will bear the Coupon Cost', 'multivendorx' ),
            type: 'checkbox',
            desc: __(
                'Tap to let the stores bear the coupon discount charges of the coupons created by them',
                'multivendorx'
            ),
            options: [
                {
                    key: 'commission_include_coupon',
                    value: 'commission_include_coupon',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'admin_coupon_excluded',
            label: __( 'Exclude Admin-Created Coupons from Store Commission', 'multivendorx' ),
            desc: __(
                'When admin creates marketplace-wide coupons, don`t reduce store commissions',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'admin_coupon_excluded',
                    value: 'admin_coupon_excluded',
                },
            ],
            look: 'toggle',
        },
    ],
};