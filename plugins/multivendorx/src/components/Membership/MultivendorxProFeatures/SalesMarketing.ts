import { __ } from '@wordpress/i18n';

export default {
	id: 'sales-marketing',
	priority: 3,
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
					key: 'wholesale_b2b',
					label: 'Wholesale',
					description:
						'Offer special pricing for bulk buyers and B2B customers',
				},
				{
					key: 'min_max_quantities',
					label: 'Min / Max Quantities',
					description:
						'Set minimum and maximum purchase quantities per product',
				},
				{
					key: 'advertise_product',
					label: 'Advertise Product',
					description:
						'Promote products with featured listings and ads',
				},
				{
					key: 'store_inventory',
					label: 'Store Inventory',
					description:
						'Advanced stock management and inventory tracking',
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
