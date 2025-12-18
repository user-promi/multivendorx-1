import { __ } from '@wordpress/i18n';

export default {
	id: 'third-party-integrations',
	priority: 6,
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
					key: 'invoice_packing_slip',
					label: 'Invoice & Packing Slip',
					description:
						'Generate professional invoices and packing slips',
				},
				{
					key: 'live_chat',
					label: 'Live Chat',
					description:
						'Real-time customer support chat on store pages',
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
