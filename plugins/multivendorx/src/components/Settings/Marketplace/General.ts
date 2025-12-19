import { __ } from '@wordpress/i18n';

export default {
	id: 'marketplace',
	priority: 1,
	name: __('Overview', 'multivendorx'),
	tabTitle: 'Marketplace Pages Configuration',
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
			hint: __('Enable Content Styling Tools For stores', 'multivendorx'),
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
			hint: __('Shortcode Library', 'multivendorx'),
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
					key: 'marketplace_products',
					label: '[marketplace_products]',
					name: 'Show store products',
					desc: __(
						'Displays all products added by a store. Use this to create store-specific product listing pages.',
						'multivendorx'
					),
					arguments:
						'<ul> <li><b>store</b> - Store ID, slug, email, or username (optional)</li> <li><b>perpage</b> - Number of products to display (default: 12)</li> <li><b>columns</b> - Number of products per row (default: 4)</li> <li><b>filter</b> - Type of products to show: all, recent, featured, sale, top_rated, best_selling (default: all)</li> <li><b>sort</b> - Predefined sorting: latest, oldest, rating, popularity, title (optional)</li> <li><b>orderby</b> - Sort products by a specific field, used when sort is not set (default: title)</li> <li><b>order</b> - Display order: ASC or DESC (default: ASC)</li> <li><b>category</b> - Product category slugs, comma separated (optional)</li> <li><b>operator</b> - Category filter operator: IN, NOT IN, AND (default: IN)</li> </ul>',},
				
				{
					key: 'marketplace_dashboard',
					label: '[marketplace_dashboard]',
					name: 'Marketplace dashboard',
					desc: __(
						'Displays the store dashboard where stores manage products, orders, earnings, and store settings.',
						'multivendorx'
					),
					arguments:
						'<ul><li>No arguments required</li></ul>',
				},
				{
					key: 'marketplace_registration',
					label: '[marketplace_registration]',
					name: 'Marketplace registration',
					desc: __(
						'Displays the store registration form. Use this to allow new users to sign up as stores.',
						'multivendorx'
					),
					arguments:
						'<ul><li>No arguments required</li></ul>',
				},

				{
					key: 'marketplace_stores',
					label: '[marketplace_stores]',
					name: 'Show store lists',
					desc: __(
						'Displays a list of all registered stores with ratings. Use this to help customers discover stores.',
						'multivendorx'
					),
					arguments:
						'<ul><li><b>orderby</b> - Sort stores by name, category, or registration date (default: registered)</li><li><b>order</b> - Display order: ASC or DESC (default: ASC)</li></ul>',
				},
				{
					key: 'store_coupons',
					label: '[store_coupons]',
					name: 'Show store coupons',
					desc: __(
						'Displays coupons created by a store along with their usage details. Useful for stores to track coupon performance.',
						'multivendorx'
					),
					arguments:
						'<ul><li>No arguments required</li></ul>',
				},
			],
		},
	],
};
