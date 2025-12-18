import { __ } from '@wordpress/i18n';

export default {
	id: 'product-types',
	priority: 1,
	name: __('Policies', 'multivendorx'),
	desc: __(
		'Define and publish the rules and guidelines that apply to your marketplace.',
		'multivendorx'
	),
	icon: 'adminlib-store-policy',
	submitUrl: 'settings',
	modal: [
		{
			key: 'role_access_table',
			type: 'multi-checkbox-table',
			rows: [
				{
					key: 'booking',
					label: 'Booking Products',
					description:
						'Allow stores to sell appointment and booking-based products',
				},
				{
					key: 'subscription',
					label: 'Subscription Products',
					description:
						'Enable recurring subscription-based products with auto-renewal',
				},
				{
					key: 'bundle',
					label: 'Bundle Products',
					description:
						'Create product bundles with multiple items sold together',
				},
			],

			columns: [
				{
					key: 'description',
					label: 'Description',
					type: 'description',
				},
				{
					key: 'status',
					label: 'Status',
				},
			],
		},
	],
};
