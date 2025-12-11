    import { __ } from '@wordpress/i18n';

export default {
	id: 'payment-membership-message',
	priority: 1,
	name: __('Basic Plan Details', 'multivendorx'),
	desc: __(
		'Site errors and events are logged for easy troubleshooting.',
		'multivendorx'
	),
	icon: 'adminlib-database',
	submitUrl: 'settings',
	modal: [
		{
			key: 'clear_notifications',
			type: 'text',
			label: __('Plan Name', 'multivendorx'),
		},
		{
			key: 'tinymce_api_section',
			type: 'text',
			label: __('Plan Description', 'multivendorx'),
			desc: __(
				'Describe the benefits and features of this plan',
				'multivendorx'
			),
		},
		{
			key: 'enable_franchise',
			label: __('Plan Status', 'multivendorx'),
			desc: __('Plan is active', 'multivendorx'),
			type: 'checkbox',
			options: [
				{
					key: 'enable_franchise',
					value: 'enable_franchise',
				},
			],
			look: 'toggle',
		},
		{
			key: 'enable_franchise',
			label: __('Mark as Recommended ', 'multivendorx'),
			desc: __('Show highlight ribbon on this plan', 'multivendorx'),
			type: 'checkbox',
			options: [
				{
					key: 'enable_franchise',
					value: 'enable_franchise',
				},
			],
			look: 'toggle',
		},
	],
};