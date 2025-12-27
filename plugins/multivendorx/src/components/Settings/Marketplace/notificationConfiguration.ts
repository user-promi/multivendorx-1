import { __ } from '@wordpress/i18n';

export default {
	id: 'notification-configuration',
	priority: 5,
	name: __('Notifications Providers', 'multivendorx'),
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
			desc: __('<ul>Use the WordPress-supported SMTP plugin, which you can find here: <a href="https://wordpress.org/plugins/tags/smtp/" target="_blank">WordPress SMTP Plugins</a>.<br><strong>Important:</strong> <strong>Sender Email Address</strong> configured in your SMTP plugin match the sender email set in your email delivery setup settings.<br>Otherwise, WordPress may fall back to its default mail method.</ul>',
    'multivendorx'
),
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
		{
			key: 'email_section',
			type: 'section',
			hint: __('Order confirmation email for main and sub-orders', 'multivendorx'),
		},
		{
			key: 'sms_gateway_selector',
			type: 'setting-toggle',
			label: __('Order emails customers receives', 'multivendorx'),
			settingDescription: __(
				'Choose how order confirmation emails should be sent. ',
				'multivendorx'
			),
			desc: __(
				'In a multivendor setup, a <b>Main Order</b> is the parent order placed by the customer, while <b>Sub-orders</b> are created for each store.<br/><br/><b>Enabling the Main Order is recommended</b>, as it allows you to send a single email that includes the Main Order and all related Sub-orders. Alternatively, you can send separate emails for the Main Order and each Sub-order.',
				'multivendorx'
			),



			options: [
				{
					key: 'mainorder',
					label: __('Main order', 'multivendorx'),
					value: 'mainorder',
				},
				{
					key: 'suborder',
					label: __('Sub-orders Only', 'multivendorx'),
					value: 'suborder',
				},
				{
					key: 'mainnsub',
					label: __('Main & Sub order together', 'multivendorx'),
					value: '',
				},
			],

		},
	],
};
