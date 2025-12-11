import { __ } from '@wordpress/i18n';

export default {
	id: 'coupon',
	priority: 4,
	name: __( 'Coupons & Discounts', 'mvx-pro' ),
	desc: __(
		'Manage how discounts and coupons affect commission calculations.',
		'mvx-pro'
	),
	icon: 'adminlib-coupon',
	submitUrl: 'settings',
	modal: [
		{
			key: 'commission_include_coupon',
			label: __( 'Who will bear the coupon cost', 'multivendorx' ),
			type: 'setting-toggle',
			desc: __(
				'<strong>Example setup:</strong><br>Product price = $100<br>Coupon = 20% / $20 (Fixed)  <br>Configured store commission = 80%<ul><li>Stores - If Store bears the coupon cost, coupon amount will be deducted from the store commission.<br>Store commission = 80% of $100 = $80<br>Final store earning = $80 - $20 (Coupon value) = $60</li><li>Admin - Commission is based on original price. Admin bears full coupon discount. <br>Store commission = 80% of $100 = $80</li><li>His His Whose Whose - Discount is split according to commission rates.<br>Store commission = 80% of $100 = $80<br>Store share of coupon = 80% of $20 = $16<br>Final store earning = $80 - $16 = $64</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'store',
					label: __( 'Stores', 'multivendorx' ),
					value: 'store',
				},
				{
					key: 'admin',
					label: __( 'Admin', 'multivendorx' ),
					value: 'admin',
				},
				{
					key: 'seperate',
					label: __( 'His His Whose Whose', 'multivendorx' ),
					value: 'seperate',
				},
			],
			look: 'toggle',
		},
		{
			key: 'admin_coupon_excluded',
			label: __( 'Exclude admin created coupons', 'multivendorx' ),
			desc: __(
				'<li>Enabled - admin-created coupons will not reduce store commission.</li><li>Disabled - store commission adjusts according to the ‘Who will bear the coupon cost’ setting.</li>',
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
