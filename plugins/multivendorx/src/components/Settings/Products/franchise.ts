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
			key: 'enable_franchise',
			label: __('Store order creation', 'multivendorx'),
			desc: __(
				'Franchise stores can manually place orders for products they manage. Here global marketplace commission rules apply.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'enable_franchise',
					value: 'enable_franchise',
				},
			],
			look: 'toggle',
		},
		{
			key: 'allow_store_create_orders',
			label: __('Admin product ordering', 'multivendorx'),
			settingDescription: __(
				'Permit franchise stores to create order from the admin products.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'allow_store_create_orders',
					value: 'allow_store_create_orders',
				},
			],
			look: 'toggle',
		},
		{
			key: 'allow_store_orders_admin',
			label: __('Store price override', 'multivendorx'),
			settingDescription: __(
				'Let franchise stores adjust the selling price of admin-owned products based on requirements.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'allow_store_orders_admin',
					value: 'allow_store_orders_admin',
				},
			],
			dependent: {
				key: 'allow_store_create_orders',
				set: true,
				value: 'allow_store_create_orders',
			},
			look: 'toggle',
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order fulfillment and assignment', 'multivendorx'),
		},
		{
			key: 'enable_automatic_assignment',
			label: __('Automatic store assignment', 'multivendorx'),
			settingDescription: __(
				'Automatically assign customer orders to the nearest eligible franchise store based on location.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'enable_automatic_assignment',
					value: 'enable_automatic_assignment',
				},
			],
			look: 'toggle',
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Franchise service area controls', 'multivendorx'),
		},
		{
			key: 'restrict_location',
			label: __('Location restriction', 'multivendorx'),
			settingDescription: __(
				'Limit franchise store operations to defined geographic areas such as city, state, or postal code.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'restrict_location',
					value: 'restrict_location',
				},
			],
			look: 'toggle',
		},
	],
};
