import { __ } from '@wordpress/i18n';

export default {
	id: 'pricing-billing',
	priority: 2,
	name: __( 'Pricing &Billing', 'multivendorx' ),
	desc: __(
		'Site errors and events are logged for easy troubleshooting.',
		'multivendorx'
	),
	icon: 'adminlib-database',
	submitUrl: 'settings',
	modal: [
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __( 'Plan Pricing Type', 'multivendorx' ),
			desc: __(
				'Decide how the system should calculate the marketplace commission.',
				'multivendorx'
			),
			options: [
				{
					key: 'free',
					label: __( 'Free', 'multivendorx' ),
					value: 'store_order',
				},
				{
					key: 'paid',
					label: __( 'Paid', 'multivendorx' ),
					value: 'per_item',
				},
			],
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __( 'Billing Cycle', 'multivendorx' ),
			desc: __( '', 'multivendorx' ),
			options: [
				{
					key: 'monthly',
					label: __( 'Monthly', 'multivendorx' ),
					value: 'monthly',
				},
				{
					key: 'yearly',
					label: __( 'Yearly', 'multivendorx' ),
					value: 'yearly',
				},
				{
					key: 'one_time',
					label: __( 'One Time', 'multivendorx' ),
					value: 'one_time',
				},
			],
		},
		{
			key: 'plan-price',
			type: 'number',
			size: '10rem',
			label: __( 'Plan Price', 'multivendorx' ),
		},
		{
			key: 'trial-period',
			type: 'number',
			label: __( 'Trial Period', 'multivendorx' ),
			size: '10rem',
			desc: __(
				'Number of days for free trial (optional)',
				'multivendorx'
			),
		},
	],
};
