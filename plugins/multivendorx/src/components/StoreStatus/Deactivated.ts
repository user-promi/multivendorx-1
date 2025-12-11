import { __ } from '@wordpress/i18n';

export default {
	id: 'deactivated',
	priority: 1,
	name: __('Permanently deactivated', 'multivendorx'),
	desc: '',
	icon: 'adminlib-store-inventory',
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
								'Cannot log in to dashboard',
								'multivendorx'
							),
							check: false,
						},
						{
							label: __(
								'Cannot access selling privileges',
								'multivendorx'
							),
							check: false,
						},
						{
							label: __(
								'Cannot view or manage product listings',
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
