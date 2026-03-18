/* global appLocalizer */
import { __ } from '@wordpress/i18n';

export const getTourSteps = (appLocalizer: any) => [
	{
		selector: '.card-content',
		placement: 'auto',
		title: __('Dashboard', 'multivendorx'),
		description: __(
			'View and configure your disbursement settings here.',
			'multivendorx'
		),
		next: {
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=commissions`,
			step: 1,
		},
	},
	{
		selector:
			'.form-group:has(.settings-form-label[for="commission_type"])',
		placement: 'right',
		title: __('Marketplace commissions', 'multivendorx'),
		description: __(
			'View and configure your disbursement settings here.',
			'multivendorx'
		),
		next: {
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=payouts`,
			step: 2,
		},
	},
	{
		selector:
			'.form-group:has(.settings-form-label[for="disbursement_order_status"])',
		placement: 'right',
		title: __('Store Configure', 'multivendorx'),
		description: __(
			'View and configure your disbursement settings here.',
			'multivendorx'
		),
		next: {
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=onboarding`,
			step: 3,
		},
	},
	{
		selector: '.form-group:has(.settings-form-label[for="approve_store"])',
		placement: 'right',
		title: __('Commission Value', 'multivendorx'),
		description: __(
			'View and configure your disbursement settings here.',
			'multivendorx'
		),
		next: {
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
			step: 4,
		},
	},
	{
		selector: '.category-filter .category-item:nth-child(3)',
		placement: 'right',
		title: __('Modules', 'multivendorx'),
		description: __(
			'Here you can enable or disable marketplace modules.',
			'multivendorx'
		),
		next: {
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
			step: 5,
		},
	},
	{
		selector: '[data-tour="simple-showcase-tour"]',
		placement: 'right',
		title: __('Modules', 'multivendorx'),
		description: __(
			'Here you can enable or disable marketplace modules.',
			'multivendorx'
		),
		next: {
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
			step: 6,
		},
	},
	{
		selector: '.category-filter .category-item:nth-child(5)',
		placement: 'right',
		title: __('Modules', 'multivendorx'),
		description: __(
			'Here you can enable or disable marketplace modules.',
			'multivendorx'
		),
		finish: true,
	},
];
