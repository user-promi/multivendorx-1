import { __ } from '@wordpress/i18n';

export default {
	id: 'order-actions-refunds',
	priority: 5,
	name: __('Refunds', 'multivendorx'),
	desc: __(
		'Control refund rules, eligibility stages, and valid claim periods.',
		'multivendorx'
	),
	icon: 'adminlib-marketplace-refund',
	submitUrl: 'settings',
	modal: [
		{
			key: 'customer_refund_status',
			type: 'checkbox',
			label: __('Eligible order status for refund', 'multivendorx'),
			class: 'mvx-toggle-checkbox',
			settingDescription: __(
				'Customers can only request a refund when their order is in the selected status.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-refund',
			options: [
				{
					key: 'completed',
					label: __('Completed', 'multivendorx'),
					value: 'completed',
				},
				{
					key: 'delivered',
					label: __('Delivered', 'multivendorx'),
					value: 'delivered',
					proSetting: true,
				},
				{
					key: 'processing',
					label: __('Processing', 'multivendorx'),
					value: 'processing',
				},
				{
					key: 'shipped',
					label: __('Shipped', 'multivendorx'),
					value: 'shipped',
					proSetting: true,
				},
			],
			selectDeselect: true,
		},
		{
			key: 'refund_days',
			type: 'number',
			label: __('Refund claim period', 'multivendorx'),
			settingDescription: __(
				'Set the number of days within which a customer can request a refund.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-refund',
			size: '8rem',
			max: 365,
			postInsideText: 'days',
		},
		{
			key: 'refund_reasons',
			type: 'panel-tabs',
			label: __('Refund reasons', 'multivendorx'),
			placeholder: __('Enter refund reasons here…', 'multivendorx'),
			settingDescription: __(
				'Add one or more reasons that stores can select when handling refund requests.',
				'multivendorx'
			),
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Reasons',
				formFields: [
					{
						key: 'title',
						type: 'text',
						label: 'Reason',
						placeholder: 'Enter title',
					},
					{
						key: 'required',
						type: 'checkbox',
						label: 'Required',
					},
				],
			},
			modal: [
				{
					id: 'damaged-or-defective-product',
					label: 'Damaged or defective product',
					required: true,
				},
				{
					id: 'wrong-item',
					label: 'Wrong item delivered',
					required: true,
				},
				{
					id: 'product-not-as-described',
					label: 'Product not as described',
					required: true,
				},
				{
					id: 'late-delivery',
					label: 'Late delivery',
					formFields: [
						{
							key: 'title',
							type: 'text',
							label: 'Reason',
							placeholder: 'Enter title',
						},
						{
							key: 'required',
							type: 'checkbox',
							label: 'Required',
						},
					],
				},
				{
					id: 'changed-mind',
					label: 'Changed mind',
					formFields: [
						{
							key: 'title',
							type: 'text',
							label: 'Reason',
							placeholder: 'Enter title',
						},
						{
							key: 'required',
							type: 'checkbox',
							label: 'Required',
						},
					],
				},
			],
			// requiredEnable: true,
			// defaultValues: [
			// 	{
			// 		value: 'Damaged or defective product',
			// 		required: true,
			// 		deleteDisabled: true,
			// 	},
			// 	{
			// 		value: 'Wrong item delivered',
			// 		required: true,
			// 		deleteDisabled: true,
			// 	},
			// 	{
			// 		value: 'Product not as described',
			// 		required: true,
			// 		deleteDisabled: true,
			// 	},
			// 	{ value: 'Late delivery' },
			// 	{ value: 'Changed mind' },
			// ],
			moduleEnabled: 'marketplace-refund',
		},
	],
};
