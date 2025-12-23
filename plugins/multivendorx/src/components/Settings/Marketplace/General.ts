import { __ } from '@wordpress/i18n';

export default {
	id: 'marketplace',
	priority: 1,
	name: __('Overview', 'multivendorx'),
	tabTitle: 'Marketplace pages configuration',
	desc: __(
		'Configure the essential system pages required for your marketplace - including store registration, store dashboard.',
		'multivendorx'
	),
	video: {
		icon: 'adminlib-general-tab', // optional icon class
		link: 'https://example.com/video/general-settings',
	},
	docs: {
		icon: 'adminlib-general-tab', // optional icon class
		link: 'https://example.com/docs/general-settings',
	},
	icon: 'adminlib-view-files',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_registration_page',
			type: 'select',
			label: __('Store registration page', 'multivendorx'),
			desc: __(
				'Choose the page with [store_registration] shortcode, this is where stores sign up.',
				'multivendorx'
			),
			className: 'select-class',
			options: appLocalizer.pages_list,
		},
		// {
		//     key: "sample_map",
		//     type: "map",
		//     label: 'Sample map',
		//     desc: "This is a simple map",
		//     Lat: 22.5726,
		//     Lng: 88.3639
		// },
		{
			key: 'store_dashboard_page',
			type: 'select',
			label: __('Store dashboard page', 'multivendorx'),
			desc: __(
				'The page with [marketplace_store] shortcode will act as the store’s control center.',
				'multivendorx'
			),
			options: appLocalizer.pages_list,
		},
		{
			key: 'store_url',
			type: 'text',
			label: __('Storefront base ', 'multivendorx'),
			desc: __(
				'Set a custom base for your store URL. For example, in the URL: https://yourdomain.com/store/sample-store/, the default word [store] can be replaced with any name you define here.',
				'multivendorx'
			),
			size: '8rem',
			preText: appLocalizer.site_url + '/',
			postText: '/sample-store/',
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Enable content styling tools for stores', 'multivendorx'),
		},
		{
			key: 'tinymce_api_section',
			type: 'text',
			label: __('Tinymce API', 'multivendorx'),
			desc: __(
				'Get your <a href="https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target="_blank">TinyMCE API key</a> and paste it here, to unlock visual editing tools across the marketplace. Admin and stores can easily format text, add links, lists, and other styling to their store descriptions, announcements, knowledge base posts, and product details-no coding needed.',
				'multivendorx'
			),
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Shortcode library', 'multivendorx'),
		},
		{
			key: 'available_shortcodes',
			type: 'shortcode-table',
			label: __('Available shortcodes', 'multivendorx'),
			desc: __('', 'multivendorx'),
			optionLabel: ['Shortcodes', 'Description', 'Arguments'],
			icon: 'adminlib-general-tab',
			options: [
				{
					key: 'marketplace_dashboard',
					label: '[marketplace_dashboard]',
					name: 'Marketplace dashboard',
					desc: __(
						'Displays the store dashboard where stores manage products, orders, earnings, and store settings.',
						'multivendorx'
					),
				},
				{
					key: 'marketplace_registration',
					label: '[marketplace_registration]',
					name: 'Marketplace registration',
					desc: __(
						'Displays the store registration form. Use this to allow new users to sign up as stores.',
						'multivendorx'
					),
				},
				{
					key: 'marketplace_products',
					label: '[marketplace_products]',
					name: 'Show store products',
					desc: __(
						'Displays all products added by a store. Use this to create store-specific product listing pages.',
						'multivendorx'
					),
					arguments: [
						{
							attribute: 'store',
							description:
								'Displays products from a specific store.',
							accepted: 'Store ID, store name, email, or username',
							default: 'store="john-store"',
						},
						{
							attribute: 'perpage',
							description: 'How many products appear on one page',
							accepted: 'Any number',
							default: 'perpage="12"',
						},
						{
							attribute: 'columns',
							description: 'How many products appear in each row',
							accepted: 'Any number',
							default: 'columns="4"',
						},
						{
							attribute: 'filter',
							description: 'Choose which type of products to show',
							accepted:
								'all, recent, featured, sale, top_rated, best_selling',
							default: 'filter="featured"',
						},
						{
							attribute: 'sort',
							description: 'Choose how products are ordered',
							accepted:
								'latest, oldest, rating, popularity, title',
							default: 'sort="latest"',
						},
						{
							attribute: 'orderby',
							description:
								'Sort products by a specific field when sort is not set.',
							accepted: 'title, date, rating',
							default: 'orderby="title"',
						},
						{
							attribute: 'order',
							description: 'Choose the sorting direction',
							accepted: 'ASC, DESC',
							default: 'order="ASC"',
						},
						{
							attribute: 'category',
							description:
								'Show products from specific categories',
							accepted: 'Category short names, separated by commas',
							default: 'category="clothing,shoes"',
						},
						{
							attribute: 'operator',
							description:
								'Decide how multiple categories work together',
							accepted: 'IN (Any of the), NOT IN (All of the), AND (None of the)',
							default: 'category="clothing,accessories" operator="AND"',
						},
					],
				},
				{
					key: 'marketplace_stores',
					label: '[marketplace_stores]',
					name: 'Show store lists',
					desc: __(
						'Displays a list of all registered stores with ratings. Use this to help customers discover stores.',
						'multivendorx'
					),
					arguments: [
						{
							attribute: 'orderby',
							description:
								'Decide how the store list is sorted',
							accepted: 'name, category, registered',
							default: 'orderby="registered"',
						},
						{
							attribute: 'order',
							description: 'Decide the sorting direction',
							accepted: 'number',
							default: 'order="DESC"',
						},
					],
				},
				{
					key: 'store_coupons',
					label: '[store_coupons]',
					name: 'Show store coupons',
					desc: __(
						'Displays coupons created by a store along with their usage details. Useful for stores to track coupon performance.',
						'multivendorx'
					),
				},
			],
		},
	],
};
