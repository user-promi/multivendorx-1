import { __ } from '@wordpress/i18n';

export default {
	id: 'min-max',
	priority: 6,
	name: __('Min/Max', 'multivendorx'),
	tabTitle: 'Product Min/Max',
	desc: __(
		'Set purchase limits for individual products to prevent bulk buying or ensure minimum order quantities.',
		'multivendorx'
	),
	icon: 'adminlib-min-max',
	submitUrl: 'settings',
	modal: [
		{
			key: 'product_quantity_rules',
			type: 'nested',
			label: __('Global quantity rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Set purchase limits for individual products to prevent bulk buying or ensure minimum order quantities.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'product_min_quantity',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'product_max_quantity',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'product_amount_rules',
			type: 'nested',
			label: __('Amount rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Control how much a customer can spend on an individual product by defining minimum and maximum purchase values.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'product_min_amount',
					preInsideText: __('Min', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'product_max_amount',
					preInsideText: __('Max', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order Min/Max', 'multivendorx'),
			desc: __(
				'Set limits on the total quantity or total value of an order to control bulk purchases or enforce minimum order requirements.',
				'multivendorx'
			),
		},
		{
			key: 'order_quantity_rules',
			type: 'nested',
			label: __('Global quantity rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Define the minimum and maximum total number of items a customer can add to their cart.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'order_min_quantity',
					preInsideText: __('Min', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'order_max_quantity',
					preInsideText: __('Max', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'order_amount_rules',
			type: 'nested',
			label: __('Amount rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Set the minimum and maximum total order value to ensure orders meet your business rules.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'order_min_amount',
					preInsideText: __('Min', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'order_max_amount',
					preInsideText: __('Max', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
			],
		},
	],
};
