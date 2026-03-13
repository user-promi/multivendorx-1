import { __ } from '@wordpress/i18n';

const settings =
	appLocalizer.settings_databases_value['store-permissions']
		?.edit_store_info_activation || [];

export default {
	id: 'general',
	priority: 1,
	headerTitle: __('General', 'multivendorx'),
	headerDescription: __(
		'Update your store’s core information - name, slug, description, and buyer message',
		'multivendorx'
	),
	headerIcon: 'tools',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		{
			type: 'text',
			label: __('Name', 'multivendorx'),
			key: 'name',
			readOnly: !settings.includes('store_name'),
		},
		{
			type: 'text',
			label: __('Storefront link', 'multivendorx'),
			key: 'slug',
		},
		{
			type: 'textarea',
			label: __('Description', 'multivendorx'),
			key: 'description',
			readOnly: !settings.includes('store_description'),
		},
		{
			type: 'text',
			label: __('Buyer welcome message after purchase', 'multivendorx'),
			key: 'messageToBuyer',
		},

		{
			key: 'enable_store_time',
			type: 'checkbox',
			label: __('Enable Store Time', 'multivendorx')
		},

		{
			key: 'enable_lunch_break',
			type: 'checkbox',
			label: __('Enable Lunch Break', 'multivendorx')
		},

		{
			key: 'enable_split_shift',
			type: 'checkbox',
			label: __('Split Shift (2 Time Slots)', 'multivendorx')
		},

		{
			key: 'business_hours',
			type: 'multi-checkbox-table',
			label: __('Shop Open & Close Timings', 'multivendorx'),
			dependent: {
				key: 'enable_store_time',
				value: true
			},

			rows: [
				{
					key: 'sunday',
					label: __('Sunday', 'multivendorx'),
					enabledKey: 'active_days',
					inactiveMessage: __('Store closed on Sunday', 'multivendorx')
				},
				{
					key: 'monday',
					label: __('Monday', 'multivendorx'),
					inactiveMessage: __('Store closed on monday', 'multivendorx'),
					enabledKey: 'active_days'
				},
				{
					key: 'tuesday',
					label: __('Tuesday', 'multivendorx'),
					inactiveMessage: __('Store closed on tuesday', 'multivendorx'),
					enabledKey: 'active_days'
				},
				{
					key: 'wednesday',
					label: __('Wednesday', 'multivendorx'),
					inactiveMessage: __('Store closed on wednesday', 'multivendorx'),
					enabledKey: 'active_days'
				},
				{
					key: 'thursday',
					label: __('Thursday', 'multivendorx'),
					inactiveMessage: __('Store closed on thursday', 'multivendorx'),
					enabledKey: 'active_days'
				},
				{
					key: 'friday',
					label: __('Friday', 'multivendorx'),
					inactiveMessage: __('Store closed on friday', 'multivendorx'),
					enabledKey: 'active_days'
				},
				{
					key: 'saturday',
					label: __('Saturday', 'multivendorx'),
					inactiveMessage: __('Store closed on saturday', 'multivendorx'),
					enabledKey: 'active_days'
				}
			],

			columns: [
				{
					key: 'shift1',
					label: __('First Shift', 'multivendorx'),
					visibleWhen: 'enable_store_time',
					fields: [
						{ key: 'start', type: 'time' },
						{ key: 'end', type: 'time' }
					]
				},
				{
					key: 'lunch_break',
					label: __('Lunch Break', 'multivendorx'),
					fields: [
						{ key: 'start', type: 'time' },
						{ key: 'end', type: 'time' }
					],
					visibleWhen: 'enable_lunch_break'
				},
				{
					key: 'shift2',
					label: __('Second Shift', 'multivendorx'),
					fields: [
						{ key: 'start', type: 'time' },
						{ key: 'end', type: 'time' }
					],
					visibleWhen: 'enable_split_shift'
				}
			]
		},
	],
};
