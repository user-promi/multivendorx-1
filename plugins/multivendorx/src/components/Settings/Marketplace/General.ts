import { __ } from '@wordpress/i18n';

export default {
	id: 'marketplace',
	priority: 1,
	name: __('Overview', 'multistorex'),
	tabTitle: 'Marketplace Pages Configuration',
	desc: __(
		'Configure the essential system pages required for your marketplace - including store registration, store dashboard.',
		'multistorex'
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
			label: __('Store registration page', 'multistorex'),
			desc: __(
				'Choose the page with [store_registration] shortcode, this is where stores sign up.',
				'multistorex'
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
			label: __('Store dashboard page', 'multistorex'),
			desc: __(
				'The page with [marketplace_store] shortcode will act as the store’s control center.',
				'multistorex'
			),
			options: appLocalizer.pages_list,
		},
		{
			key: 'store_url',
			type: 'text',
			label: __('Storefront base ', 'multistorex'),
			desc: __(
				'Set a custom base for your store URL. For example, in the URL: https://yourdomain.com/store/sample-store/, the default word [store] can be replaced with any name you define here.',
				'multistorex'
			),
			size: '8rem',
			preText: appLocalizer.site_url + '/',
			postText: '/sample-store/',
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Enable Content Styling Tools For stores', 'multistorex'),
		},
		{
			key: 'tinymce_api_section',
			type: 'text',
			label: __('Tinymce API', 'multistorex'),
			desc: __(
				'Get your <a href="https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target="_blank">TinyMCE API key</a> and paste it here, to unlock visual editing tools across the marketplace. Admin and stores can easily format text, add links, lists, and other styling to their store descriptions, announcements, knowledge base posts, and product details-no coding needed.',
				'multistorex'
			),
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Shortcode Library', 'multistorex'),
		},
		{
			key: 'available_shortcodes',
			type: 'shortcode-table',
			label: __('Available shortcodes', 'multistorex'),
			desc: __('', 'multistorex'),
			optionLabel: ['Shortcodes', 'Description', 'Arguments'],
			icon: 'adminlib-general-tab',
			options: [
				
				{
					key: 'marketplace_best_selling_products',
					label: '[marketplace_best_selling_products]',
					name: 'Show best selling products',
					desc: __(
						'Shows the products that sell the most for a store. Use this to highlight popular products and increase customer confidence.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>store</b> - storeID, slug, email, or username (optional)</li><li><b>perpage </b> - Number of products to show (default: 12)</li><li><b>columns</b> - Number of products per row (default: 4)</li><li><b>orderby</b> - Sort products by parameter (default: title)</li><li><b>order</b> - Display order: ASC or DESC (default: ASC)</li></ul>',
				},

				{
					key: 'marketplace_featured_products',
					label: '[marketplace_featured_products]',
					name: 'Show featured products',
					desc: __(
						'Displays products marked as featured by stores. Use this to promote highlighted or recommended products.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>store</b> - storeID, slug, email, or username (optional)</li><li><b>perpage </b> - Number of products to show (default: 12)</li><li><b>columns</b> - Number of products per row (default: 4)</li><li><b>orderby</b> - Sort products by parameter (default: date)</li><li><b>order</b> - Display order: ASC or DESC (default: DESC)</li></ul>',
				},

				{
					key: 'marketplace_product_category',
					label: '[marketplace_product_category]',
					name: 'Show product categories',
					desc: __(
						'Displays product categories created by stores. Use this to help customers browse products by category.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>store</b> - StoreID, slug, email, or username (optional)</li><li><b>perpage </b> - Number of categories to show (default: 12)</li><li><b>columns</b> - Number of categories per row (default: 4)</li><li><b>orderby</b> - Sort categories by parameter (default: title)</li><li><b>order</b> - Display order: ASC or DESC (default: DESC)</li><li><b>category</b> - Category slugs, comma separated (optional)</li><li><b>operator</b> - Filter operator: IN, NOT IN, AND (default: IN)</li></ul>',
				},
				{
					key: 'marketplace_sale_products',
					label: '[marketplace_sale_products]',
					name: 'Show sale products',
					desc: __(
						'Displays products that stores have put on sale. Use this to highlight discounts and special offers.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>store</b> - storeID, slug, email, or username (optional)</li><li><b>perpage </b> - Number of products to show (default: 12)</li><li><b>columns</b> - Number of products per row (default: 4)</li><li><b>orderby</b> - Sort products by parameter (default: title)</li><li><b>order</b> - Display order: ASC or DESC (default: ASC)</li></ul>',
				},
				{
					key: 'marketplace_recent_products',
					label: '[marketplace_recent_products]',
					name: 'Show recent products',
					desc: __(
						'Displays the most recently added products by stores. Use this to showcase new arrivals.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>store</b> - storeID, slug, email, or username (optional)</li><li><b>perpage </b> - Number of products to show (default: 12)</li><li><b>columns</b> - Number of products per row (default: 4)</li><li><b>orderby</b> - Sort products by parameter (default: date)</li><li><b>order</b> - Display order: ASC or DESC (default: DESC)</li></ul>',
				},
				{
					key: 'marketplace_top_rated_products',
					label: '[marketplace_top_rated_products]',
					name: 'Show top rated products',
					desc: __(
						'Displays the highest rated products of a store. Use this to build trust and showcase product quality.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>store</b> - storeID, slug, email, or username (optional)</li><li><b>perpage </b> - Number of products to show (default: 12)</li><li><b>columns</b> - Number of products per row (default: 4)</li><li><b>orderby</b> - Sort products by parameter (default: title)</li><li><b>order</b> - Display order: ASC or DESC (default: ASC)</li></ul>',
				},
				{
					key: 'marketplace_products',
					label: '[marketplace_products]',
					name: 'Show store products',
					desc: __(
						'Displays all products added by a store. Use this to create store-specific product listing pages.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>store</b> - storeID, slug, email, or username (optional)</li><li><b>columns</b> - Number of products per row (default: 4)</li><li><b>orderby</b> - Sort products by parameter (default: title)</li><li><b>order</b> - Display order: ASC or DESC (default: ASC)</li></ul>',
				},
				{
					key: 'store_coupons',
					label: '[store_coupons]',
					name: 'Show store coupons',
					desc: __(
						'Displays coupons created by a store along with their usage details. Useful for stores to track coupon performance.',
						'multistorex'
					),
					arguments:
						'<ul><li>No arguments required</li></ul>',
				},
				{
					key: 'marketplace_store',
					label: '[marketplace_store]',
					name: 'Store dashboard',
					desc: __(
						'Displays the store dashboard where stores manage products, orders, earnings, and store settings.',
						'multistorex'
					),
					arguments:
						'<ul><li>No arguments required</li></ul>',
				},
				{
					key: 'store_registration',
					label: '[store_registration]',
					name: 'Store registration',
					desc: __(
						'Displays the store registration form. Use this to allow new users to sign up as stores.',
						'multistorex'
					),
					arguments:
						'<ul><li>No arguments required</li></ul>',
				},

				{
					key: 'marketplace_storeslist',
					label: '[marketplace_storeslist]',
					name: 'Show store list',
					desc: __(
						'Displays a list of all registered stores with ratings. Use this to help customers discover stores.',
						'multistorex'
					),
					arguments:
						'<ul><li><b>orderby</b> - Sort stores by name, category, or registration date (default: registered)</li><li><b>order</b> - Display order: ASC or DESC (default: ASC)</li></ul>',
				},
			],
		},
	],
};
