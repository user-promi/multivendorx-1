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
            desc: __(<ul><li>'Stores - commission is calculated after the coupon is applied.Example: Product $100 – 20% coupon = $80 → Store earns 80% of $80 = $64'</li><li>Admin - Commission is calculated on the original price, admin covers the discount.Example: Product $100 – 20% coupon = $80 → Store earns 80% of $100 = $80</li></ul>,'multivendorx'),
            options: [
                {
                    key: 'store_coupon',
					label: __('Stores', 'multivendorx'),
                    value: 'commission_include_coupon',
                },
				{
                    key: 'admin_coupon',
                    label: __('Admin', 'multivendorx'),
                    value: 'mannual',
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
