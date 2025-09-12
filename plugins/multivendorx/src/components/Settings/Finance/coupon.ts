import { __ } from '@wordpress/i18n';

export default {
    id: 'store-coupon',
    priority: 3,
    name: __('Coupon and Discount', 'mvx-pro'),
    desc: __('Manage how discounts and coupons affect commission calculations', 'mvx-pro'),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [        
        {
            key: 'commission_include_coupon',
            label: __( 'Who will bear the coupon cost', 'multivendorx' ),
            type: 'setting-toggle',
            desc: __('<ul><li>Stores - commission is calculated after the coupon is applied.Example: Product $100 – 20% coupon = $80 → Store earns 80% of $80 = $64</li><li>Admin - Commission is calculated on the original price, admin covers the discount.Example: Product $100 – 20% coupon = $80 → Store earns 80% of $100 = $80</li><li>His His Whose Whose – Discount is split according to commission rates. Both admin and store bear their share.Example: Product $100 – 20% coupon = $80 Admin commission 10% → Admin bears 10% of $20 = $2 Store bears remaining 90% → Store bears $18 of the discount</li></ul>','multivendorx'),
            options: [
                {
                    key: 'store',
					label: __('Stores', 'multivendorx'),
                    value: 'store',
                },
				{
                    key: 'admin',
                    label: __('Admin', 'multivendorx'),
                    value: 'admin',
                },
				{
                    key: 'seperate',
                    label: __('His His Whose Whose', 'multivendorx'),
                    value: 'seperate',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'admin_coupon_excluded',
            label: __( 'Exclude admin created coupons from store commission', 'multivendorx' ),
            desc: __(
                'When admin creates marketplace-wide coupons, do not reduce store commissions',
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
