import { __ } from '@wordpress/i18n';

export default {
	id: 'invoices',
	priority: 6,
	name: __('Invoices', 'multivendorx'),
	desc: __(
		'Set up when and how invoices are generated in your marketplace.',
		'multivendorx'
	),
	icon: 'adminfont-invoice',
	submitUrl: 'settings',
};
