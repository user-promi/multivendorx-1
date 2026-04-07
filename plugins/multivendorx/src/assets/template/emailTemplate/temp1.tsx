import { __ } from '@wordpress/i18n';

export const temp1 = {
	id: 'store-registration',
	name: __('Store Registration', 'multivendorx'),
	previewText: __(
		'Welcome to our marketplace! Complete your store setup to get started.',
		'multivendorx'
	),
	blocks: [
		{
			id: 1,
			type: 'heading',
			name: 'email-heading-welcome',
			text: __('Hi Store Owner', 'multivendorx'),
			level: 1,
			style: {
				fontSize: 1,
			},
		},
		{
			id: 2,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __("Here's your sales report for the week of April 1-7, 2026.", 'multivendorx'),
		},
		{
			id: 3,
			type: 'heading',
			name: 'email-heading-greeting',
			text: __('Hello {{vendor_name}},', 'multivendorx'),
			level: 3,
			style: {
				backgroundColor: 'transparent',
				color: '#4a5568',
				fontSize: 1.125,
				fontWeight: 'normal',
				marginBottom: 0.9375,
			},
		},
	],
};
