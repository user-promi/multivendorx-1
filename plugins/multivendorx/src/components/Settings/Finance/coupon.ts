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
            desc: __('<ul><li>Stores – Commission is calculated after the coupon is applied.<br>Example: Product price = $100, Coupon = 20% of $100 = $20<br>Price after coupon = $100 − $20 = $80<br>Store commission = 80% of $80 = $64<br>Final store earning = $64</li><li>Full Commission – Commission is calculated on the original product price; store covers no discount.<br>Example: Product price = $100, Coupon = 20% of $100 = $20<br>Store commission = 80% of $100 = $80<br>Final store earning = $80</li><li>His His Whose Whose – Discount is split according to commission rates; both admin and store bear their share.<br>Example: Product price = $100, Coupon = 20% of $100 = $20, Admin 20% → Store 80%<br>Store commission = 80% of $100 = $80<br>Admin share of coupon = 20% of $20 = $4<br>Store share of coupon = 80% of $20 = $16<br>Final store earning = $80 − $16 = $64</li></ul>','multivendorx'),
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
