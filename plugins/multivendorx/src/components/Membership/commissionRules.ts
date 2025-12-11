import { __ } from '@wordpress/i18n';

export default {
	id: 'commission-rules',
	priority: 4,
	name: __('Commission Rules', 'multivendorx'),
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
			label: __('Commission Mode', 'multivendorx'),
			desc: __(
				'Choose whether to use global commission settings or custom plan-based commission',
				'multivendorx'
			),
			options: [
				{
					key: 'free',
					label: __('Global', 'multivendorx'),
					value: 'store_order',
				},
				{
					key: 'paid',
					label: __('Plan Based', 'multivendorx'),
					value: 'per_item',
				},
			],
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Billing Cycle', 'multivendorx'),
			desc: __('', 'multivendorx'),
			options: [
				{
					key: 'monthly',
					label: __('Percentage', 'multivendorx'),
					value: 'monthly',
				},
				{
					key: 'yearly',
					label: __('Flat Fee', 'multivendorx'),
					value: 'yearly',
				},
			],
		},
		{
			key: 'plan-price',
			type: 'number',
			size: '12rem',
			label: __('Admin Commission Value', 'multivendorx'),
		},
	],
};
