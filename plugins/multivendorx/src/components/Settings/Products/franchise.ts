import { __ } from '@wordpress/i18n';

export default {
	id: 'franchise',
	priority: 1,
	name: __('Franchise', 'multivendorx'),
	tabTitle: 'Order creation rules',
	desc: __(
		'Franchise mode lets you run multiple branch stores under one brand, with each outlet managing its own orders and local service areas.',
		'multivendorx'
	),
	icon: 'adminlib-single-product',
	submitUrl: 'settings',
	modal: [
		{
			key: 'singleproductmultistore_show_order',
			type: 'setting-toggle',
			label: __('Location Restriction', 'multivendorx'),
			options: [
				{
					key: 'min-price',
					label: __('City', 'multivendorx'),
					value: __('city', 'multivendorx'),
				},
				{
					key: 'max-price',
					label: __('State', 'multivendorx'),
					value: __('max-price', 'multivendorx'),
				},
				{
					key: 'top-rated-store',
					label: __('Postal Code', 'multivendorx'),
					value: __('top-rated-store', 'multivendorx'),
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order Fulfillment', 'multivendorx'),
			desc: __(
				'Decide how customer orders should be routed to franchise stores',
				'multivendorx'
			),
		},
		{
			key: 'automatic_store_assignment',
			type: 'setting-toggle',
			label: __('Automatic Store Assignment', 'multivendorx'),
			options: [
				{
					key: 'min-price',
					label: __('Nearest Store', 'multivendorx'),
					value: __('min-price', 'multivendorx'),
				},
				{
					key: 'max-price',
					label: __('Manual Assignment', 'multivendorx'),
					value: __('max-price', 'multivendorx'),
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order Creation', 'multivendorx'),
			desc: __(
				'Control how franchise stores create and manage their own orders',
				'multivendorx'
			),
		},
		{
			key: 'taxable',
			label: __('Store Order Creation', 'multivendorx'),
			desc: __(
				'Allow franchise stores to manually create orders for the products they manage. Useful for in-store purchases, phone orders, or wholesale requests.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'taxable',
					value: 'taxable',
				},
			],
			look: 'toggle',
		},
		{
			key: 'taxable',
			label: __('Admin Product Ordering', 'multivendorx'),
			desc: __(
				'Allow franchise stores to place orders for products from the admin catalog. This lets stores restock or sell admin-owned products directly.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'taxable',
					value: 'taxable',
				},
			],
			look: 'toggle',
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Admin Product Pricing', 'multivendorx'),
			desc: __(
				'Configure how store pricing works when selling admin-owned products',
				'multivendorx'
			),
		},
		{
			key: 'taxable',
			label: __('Store Price Override', 'multivendorx'),
			desc: __(
				'Let franchise stores adjust the selling price of admin products based on local demand or regional pricing requirements.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'taxable',
					value: 'taxable',
				},
			],
			look: 'toggle',
		},
	],
};
