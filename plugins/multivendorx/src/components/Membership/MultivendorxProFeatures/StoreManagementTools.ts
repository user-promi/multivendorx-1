import { __ } from '@wordpress/i18n';

export default {
	id: 'store-management-tools',
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
					key: 'import_export',
					label: 'Import / Export Tools',
					description:
						'Bulk import and export products, orders, and store data',
				},
				{
					key: 'business_hours',
					label: 'Business Hours',
					description:
						'Set custom store operating hours and schedules',
				},
				{
					key: 'vacation_mode',
					label: 'Vacation Mode',
					description:
						'Temporarily close store with custom vacation message',
				},
				{
					key: 'staff_manager',
					label: 'Staff Manager',
					description: 'Add team members with role-based permissions',
				},
				{
					key: 'store_analytics',
					label: 'Store Analytics',
					description:
						'Access detailed sales reports and performance insights',
				},
				{
					key: 'store_seo',
					label: 'Store SEO',
					description: 'Optimize store pages for search engines',
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
