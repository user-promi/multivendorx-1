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
				fontSize: 1.125,
			},
		},
		{
			id: 2,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __("Here's your sales report for the week of April 1-7, 2026.", 'multivendorx'),
			style: {
				color: '#2d3748',
				fontSize: 0.9,
			},
		},

		// column start
		{
			id: 4,
			type: 'columns',
			name: 'email-columns',
			layout:'3',
			style: {
				backgroundColor: '#e8e8e8',
				paddingTop: 1.313,
				paddingBottom: 1.313,
				marginTop: 2.5,
				borderRadius: 0.313,
				gap: 2
			},
			columns: [
				[
					{
						id: 6,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('48', 'multivendorx'),
						level: 1,
						style: {
							fontSize: 2,
							lineHeight: 1,
							textAlign: 'center'
						},
					},
					{
						id: 7,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Total orders", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 0.9,
							textAlign: 'center'

						},
					},
				],
				[
					{
						id: 8,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('$3,240', 'multivendorx'),
						level: 1,
						style: {
							fontSize: 2,
							lineHeight: 1,
							textAlign: 'center'

						},
					},
					{
						id: 9,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Total sales", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 0.9,
							textAlign: 'center'
						},
					},
				],
				[
					{
						id: 10,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('$2,831', 'multivendorx'),
						level: 1,
						style: {
							fontSize: 2,
							lineHeight: 1,
							textAlign: 'center',
							color: '#59a937'
						},
					},
					{
						id: 11,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Your earnings", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 0.9,
							textAlign: 'center'
						},
					},
				],
			],			
		},
		{
			id: 3,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __("Your payout will be processed within 2–3 business days. Reply to this email for any questions.", 'multivendorx'),
			style: {
				color: '#2d3748',
				fontSize: 1.125,
				marginTop: 10,
			},
		},
		{
			id: 4,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __("Best regards,", 'multivendorx'),
			style: {
				color: '#61666eff',
				fontSize: 1,
				marginBottom: 0.313,
				marginTop: 5,
			},
		},
		{
			id: 5,
			type: 'heading',
			name: 'email-heading-welcome',
			text: __('The Marketplace Team', 'multivendorx'),
			level: 6,
			style: {
				fontSize: 1,
			},
		},
	],
};
