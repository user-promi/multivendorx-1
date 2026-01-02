import { __ } from '@wordpress/i18n';
const methods = appLocalizer?.all_payments
	? Object.entries(appLocalizer.all_payments).map(([_, value]) => value)
	: [];

export default {
	id: 'delivery',
	priority: 2,
	name: __('Delivery', 'multivendorx'),
	desc: __(
		'Define the steps orders follow from purchase to completion. Set what customers see in tracking and choose whether orders complete automatically or after customer confirmation.',
		'multivendorx'
	),
	icon: 'adminlib-delivery',
	submitUrl: 'settings',
	modal: [
		{
			key: 'shipping_stage',
			type: 'expandable-panel',
			label: __('Delivery progress stages', 'multivendorx'),
			settingDescription: __(
				'Steps customers see as their order moves toward delivery. These stages show up in order tracking so customers know where their package is.',
				'multivendorx'
			),
			name: 'abuse_report_reasons',
			addNewBtn: true,
			addNewTemplate: {
				label: 'New progress stages',
				desc: 'dummy desc',
				icon: 'adminlib-rejecte',
				formFields: [
					{
						key: 'label',
						type: 'text',
						label: 'Progress Stages',
						placeholder: 'Enter progress stages',
					},
					{
						key: 'desc',
						type: 'textarea',
						label: 'Description',
					},
					{
						key: 'icon',
						type: 'iconlibrary',
						label: 'Select Icon',
						iconEnable: true,
						iconOptions: [
							'adminlib-delivery',
							'adminlib-rejecte',
							'adminlib-delivery-person',
							'adminlib-pending',
							'adminlib-order-completed',
							'adminlib-refund',
							'adminlib-cart',
							'adminlib-active',
							'adminlib-distance-shipping',
							'adminlib-geo-my-wp',
							'adminlib-per-product-shipping',
							'adminlib-verification7',
							'adminlib-verification9',
							'adminlib-verification3',
							'adminlib-multi-product',
							'adminlib-marketplace',
							'adminlib-location',
							'adminlib-wholesale1',
						],
						desc: 'Choose an icon for this panel'
					}
				],
			},
			modal: [],
			proSetting: false,
		},
		{
			key: 'order-completion-rules',
			type: 'setting-toggle',
			label: __('When orders are marked complete', 'multivendorx'),
			settingDescription: __(
				'Specifies how orders are finalized and transitioned from Delivered to Completed after the package has reached the customer',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Auto complete on delivery - completes orders automatically when delivery happens (system-controlled).</li><li>Customer confirm delivery - completes orders only if the customer confirms (buyer-controlled).</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'north_america',
					label: __('Auto complete on delivery', 'multivendorx'),
					value: 'zone_wise',
				},
				{
					key: 'country_wise',
					label: __('Customer confirm delivery', 'multivendorx'),
					value: 'country_wise',
				},
			],
		},
	],
};
