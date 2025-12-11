import { __ } from '@wordpress/i18n';

export default {
	id: 'notifications',
	priority: 11,
	name: 'Notifications',
	desc: __(
		'Help customers discover stores and products near them by enabling location-based search and maps.',
		'multivendorx'
	),
	icon: 'adminlib-notification',
	submitUrl: 'settings',
	modal: [],
};
