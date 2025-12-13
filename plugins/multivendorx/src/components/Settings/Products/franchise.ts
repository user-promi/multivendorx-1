import { __ } from '@wordpress/i18n';

export default {
	id: 'franchise',
	priority: 1,
	name: __('Franchise', 'multivendorx'),
	tabTitle: 'Order routing',
	desc: __(
		'Franchise mode lets you run multiple branch stores under one brand. Use these settings to control how customer orders are routed to franchise stores.',
		'multivendorx'
	),
	icon: 'adminlib-single-product',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_assignment_method',
			type: 'setting-toggle',
			label: __('Store assignment method', 'multivendorx'),
			desc: __(
				'Choose how customer orders should be assigned to franchise stores.',
				'multivendorx'
			),
			options: [
				{
					key: 'nearest_store',
					label: __('Nearest store', 'multivendorx'),
					value: 'nearest_store',
					desc: __(
						'Automatically assign orders to the closest eligible franchise store based on the customer’s delivery address. Best suited for physical or region-based fulfillment.',
						'multivendorx'
					),
				},
				{
					key: 'manual_assignment',
					label: __('Manual assignment', 'multivendorx'),
					value: 'manual_assignment',
					desc: __(
						'Orders remain unassigned until an admin manually selects a franchise store.',
						'multivendorx'
					),
				},
			],
		},
		{
			key: 'location_restriction',
			type: 'setting-toggle',
			label: __('Location restriction', 'multivendorx'),
			desc: __(
				'Define how store service areas are used when assigning orders to the nearest store.',
				'multivendorx'
			),
			dependent: {
				kkey: 'store_assignment_method',
				set: true,
				value: 'nearest_store',
			},
			options: [
				{
					key: 'city',
					label: __('City', 'multivendorx'),
					value: 'city',
				},
				{
					key: 'state',
					label: __('State', 'multivendorx'),
					value: 'state',
				},
				{
					key: 'postal_code',
					label: __('Postal code', 'multivendorx'),
					value: 'postal_code',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order creation', 'multivendorx'),
			desc: __(
				'Control whether franchise stores can create and manage orders on their own.',
				'multivendorx'
			),
		},
		{
			key: 'store_order_creation',
			label: __('Store order creation', 'multivendorx'),
			desc: __(
				'Allow franchise stores to manually create orders for their products. Useful for phone orders, walk-in customers, or offline sales.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'enabled',
					value: 'enabled',
				},
			],
			look: 'toggle',
		},
		{
			key: 'admin_product_ordering',
			label: __('Admin product ordering', 'multivendorx'),
			desc: __(
				'Allow franchise stores to order products from the admin catalog for selling or restocking.',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'enabled',
					value: 'enabled',
				},
			],
			look: 'toggle',
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Admin product pricing', 'multivendorx'),
			desc: __(
				'Control how pricing works when franchise stores sell admin-owned products.',
				'multivendorx'
			),
		},
		{
			key: 'store_price_override',
			label: __('Store price override', 'multivendorx'),
			desc: __(
				'Allow franchise stores to adjust the selling price of admin products to match local market conditions.',
				'multivendorx'
			),
			type: 'checkbox',
			dependency: {
				key: 'admin_product_ordering',
				value: 'enabled',
			},
			options: [
				{
					key: 'enabled',
					value: 'enabled',
				},
			],
			look: 'toggle',
		},
	],
};
