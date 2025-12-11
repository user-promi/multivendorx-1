import { __ } from '@wordpress/i18n';

export default {
	id: 'log',
	priority: 2,
	name: __( 'Log', 'multivendorx' ),
	desc: __(
		'Site errors and events are logged for easy troubleshooting.',
		'multivendorx'
	),
	icon: 'adminlib-document',
	submitUrl: 'settings',
	modal: [
		{
			key: 'multivendorx_adv_log',
			type: 'checkbox',
			label: __( 'Advance log', 'moowoodle' ),
			options: [
				{
					key: 'multivendorx_adv_log',
					value: 'multivendorx_adv_log',
				},
			],
			look: 'toggle',
		},
		{
			key: 'multivendorx_log',
			type: 'log',
			classes: 'log-section',
			apiLink: 'logs',
			fileName: 'error.txt',
		},
	],
};
