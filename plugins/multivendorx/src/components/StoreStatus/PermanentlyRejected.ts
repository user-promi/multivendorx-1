import { __ } from '@wordpress/i18n';

export default {
	id: 'permanently-rejected',
	priority: 1,
	name: __('Permanently Rejected', 'multivendorx'),
	desc: '',
	icon: 'adminfont-store-inventory',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_promotion_limit',
			label: __('Account capabilities', 'multivendorx'),
			type: 'nested',
			single: true,
			nestedFields: [
				{
					key: 'paid_promotion_limit',
					type: 'checklist',
					options: [
						{
							label: __(
								'Can log in to dashboard',
								'multivendorx'
							),
							check: false,
						},
						{
							label: __(
								'Cannot modify store settings',
								'multivendorx'
							),
							check: false,
						},
						{
							label: __(
								'Cannot add or edit products',
								'multivendorx'
							),
							check: false,
						},
					],
				},
			],
		},
	],
};
