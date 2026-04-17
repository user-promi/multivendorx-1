import { __ } from '@wordpress/i18n';

export default {
	id: 'invoices',
	priority: 6,
	headerTitle: __('Invoices', 'multivendorx'),
	settingTitle: 'Automatic invoice generation',
	headerDescription: __(
		'Choose at which order stages invoices should be generated automatically.',
		'multivendorx'
	),
	headerIcon: 'invoice',
	submitUrl: 'settings',
	hideSettingHeader: true,
	modal: [],
};
