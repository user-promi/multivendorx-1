import { __ } from '@wordpress/i18n';

export default {
	id: 'notification-configuration',
	priority: 5,
	name: __('Notifications', 'multivendorx'),
	tabTitle: 'Email delivery setup',	
	desc: __(
		'Configure how marketplace emails are sent. All notifications dispatched by the site can be tracked and reviewed from <b><a href="#&tab=settings&subtab=notifications">Notification Settings</a></b>',
		'multivendorx'
	),
	icon: 'adminlib-notification',
	submitUrl: 'settings',
	modal: [
		
		{
			key: 'email_provider',
			type: 'setting-toggle',
			label: __('Email provider', 'multivendorx'),
			settingDescription: __(
				'Choose which service will send your marketplace emails.',
				'multivendorx'
			),
			options: [
				{
					key: 'wp_mail',
					label: __('WordPress Default (wp_mail)', 'multivendorx'),
					value: 'wp_mail',
				},
				{
					key: 'sendgrid',
					label: __('SendGrid', 'multivendorx'),
					value: 'sendgrid',
				},
				{
					key: 'mailgun',
					label: __('Mailgun', 'multivendorx'),
					value: 'mailgun',
				},
				{
					key: 'amazon_ses',
					label: __('Amazon SES', 'multivendorx'),
					value: 'amazon_ses',
				},
			],
		},

		{
			key: 'sender_name',
			type: 'text',
			label: __('Sender name', 'multivendorx'),
			placeholder: __('Marketplace Team', 'multivendorx'),
			settingDescription: __(
				'The name that will appear in the "From" field of outgoing emails.',
				'multivendorx'
			),
		},

		{
			key: 'sender_email_address',
			type: 'email',
			label: __('Sender email address', 'multivendorx'),
			placeholder: __('noreply@yourstore.com', 'multivendorx'),
			settingDescription: __(
				'The email address from which marketplace notifications will be sent.',
				'multivendorx'
			),
			desc: __(
				'The email address from which notifications are sent is provided. Test emails can be sent to confirm delivery.',
				'multivendorx'
			),
		},

		{
			key: 'sms_section',
			type: 'section',
			hint: __('SMS configuration', 'multivendorx'),
		},
		{
			key: 'sms_gateway_selector',
			type: 'setting-toggle',
			label: __('Select SMS gateway', 'multivendorx'),
			settingDescription: __(
				'Pick the SMS service your marketplace will use to send text alerts.',
				'multivendorx'
			),
			options: [
				{
					key: 'none',
					label: __('None', 'multivendorx'),
					value: '',
				},
				{
					key: 'twilio',
					label: __('Twilio', 'multivendorx'),
					value: 'twilio',
				},
				{
					key: 'vonage',
					label: __('Vonage', 'multivendorx'),
					value: 'vonage',
				},
				{
					key: 'clickatell',
					label: __('Clickatell', 'multivendorx'),
					value: 'clickatell',
				},
				{
					key: 'plivo',
					label: __('Plivo', 'multivendorx'),
					value: 'plivo',
				},
			],
		},
	],
};
