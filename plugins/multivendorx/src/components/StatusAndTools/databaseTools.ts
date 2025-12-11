import { __ } from '@wordpress/i18n';

export default {
	id: 'database-tools',
	priority: 4,
	name: __( 'Database tools', 'multivendorx' ),
	desc: __(
		'Site errors and events are logged for easy troubleshooting.',
		'multivendorx'
	),
	icon: 'adminlib-database',
	submitUrl: 'settings',
	modal: [
		{
			key: 'transients',
			type: 'button',
			name: __( 'Clear transients', 'multivendorx' ),
			label: __( 'MultivendorX Vendors Transients', 'multivendorx' ),
			desc: __(
				'This button clears all vendor dashboards transient cache',
				'multivendorx'
			),
		},
		{
			key: 'visitor',
			type: 'button',
			name: __( 'Reset database', 'multivendorx' ),
			label: __( 'Reset visitors Stats Table', 'multivendorx' ),
			desc: __(
				'Use this tool to clear all the table data of MultivendorX visitors stats',
				'multivendorx'
			),
		},
		{
			key: 'migrate_order',
			type: 'button',
			name: __( 'Order migrate', 'multivendorx' ),
			label: __( 'Regenerate suborders', 'multivendorx' ),
			desc: __(
				'With this tool, you can create missing sub orders',
				'multivendorx'
			),
		},

		{
			key: 'default_pages',
			type: 'button',
			name: __( 'Create default MultiVendorX Page', 'multivendorx' ),
			label: __( 'MultiVendorX page', 'multivendorx' ),
			desc: __(
				'This tool will install all the missing MultiVendorX pages. Pages already defined and set up will not be replaced',
				'multivendorx'
			),
			apilink: 'status',
		},

		{
			key: 'separator_content',
			type: 'section',
			wrapperClass: 'divider-wrapper color-red',
			hint: __( 'Danger zone', 'multivendorx' ),
			desc: __( '', 'multivendorx' ),
		},

		{
			key: 'clear_notifications',
			type: 'number',
			wrapperClass: 'red-text',
			label: __( 'Clear notifications', 'multivendorx' ),
		},
	],
};
