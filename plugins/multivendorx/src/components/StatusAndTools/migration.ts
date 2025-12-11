import { __ } from '@wordpress/i18n';

export default {
	id: 'migration',
	priority: 6,
	name: __( 'Migration', 'multivendorx' ),
	desc: __(
		'Follow the step-by-step wizard to import products, vendors, and settings effortlessly from other multivendor solutions.',
		'multivendorx'
	),
	icon: 'adminlib-migration',
	submitUrl: 'settings',
	modal: [
		{
			key: 'migrate',
			type: 'button',
			name: __( 'Run migration wizard', 'multivendorx' ),
			label: __( 'Multivendor migration', 'multivendorx' ),
			desc: __(
				'Seamlessly transfer your store data from your previous multivendor plugin (i.e. Dokan, WCFM and WC Vendor) using this migration tool.',
				'multivendorx'
			),
		},
	],
};
