import { __ } from '@wordpress/i18n';

export default {
	id: 'product-compliance',
	priority: 5,
	headerTitle: __('Product Compliance', 'multivendorx'),
	headerDescription: __(
		'All product listings must follow platform content guidelines and avoid prohibited categories. Branded or regulated products must include authenticity certificates. Optional safety certifications may be uploaded for regulated items.',
		'multivendorx'
	),
	headerIcon: 'per-product-shipping',
	submitUrl: 'settings',
	modal: [
		{
			key: 'prohibited_product_categories',
			type: 'expandable-panel',
			label: __('Prohibited product categories', 'multivendorx'),
			placeholder: __('Add prohibited product category', 'multivendorx'),
			settingDescription: __(
				'Define one or more product categories that are not allowed to be listed on your marketplace.',
				'multivendorx'
			),
			modal: [
				{
					id: 'business-registration',
					label: 'Product title',
					mandatory: true,
					formFields: [],
					desc: 'Confirms the store is legally registered as a business entity.',
				},
				{
					id: 'trade-license',
					label: 'Product description',
					mandatory: true,
					formFields: [],
					desc: 'Validates that the store is authorized to operate and conduct business legally.',
				},
				{
					id: 'Specifications',
					label: 'Specifications',
					formFields: [],
					desc: 'Confirms the store’s physical or operational business address.',
				},
				{
					id: 'Manufacturer / importer details',
					label: 'Manufacturer / importer details',
					formFields: [],
					desc: 'Confirms the store’s physical or operational business address.',
				},
				{
					id: 'address',
					label: 'Ingredients / materials',
					isCustom: true,
					desc: 'What the product is made of',
				},
				{
					id: 'Usage instructions',
					label: 'Usage instructions',
					isCustom: true,
					desc: 'How to use or operate the product safely',
				},
			],
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Product Categories',
				editableFields: {
					title: true,
					description: false,
					mandatory: true,
				},
				showMandatoryCheckbox: true,
				disableBtn: true,
			},
		},
		{
			key: 'who_can_report',
			type: 'choice-toggle',
			label: __('When triggered', 'multivendorx'),
			moduleEnabled: 'marketplace-compliance',
			options: [
				{
					key: 'hold_for_approval',
					label: __('Hold for approval', 'multivendorx'),
					value: 'hold_for_approval',
				},
				{
					key: 'notify_only',
					label: __('Notify only', 'multivendorx'),
					value: 'notify_only',
				},
			],
			look: 'toggle',
		},

		{
			key: 'electronics_section',
			type: 'section',
			title: __('Electronics', 'multivendorx'),
			desc: __('Phones, chargers, appliances, cables, lights', 'multivendorx'),
		},
		{
			key: 'electronics_hold_listing',
			type: 'checkbox',
			label: __('Hold listing until reviewed', 'multivendorx'),
			desc: __('Require review for electronics products', 'multivendorx'),
			options: [
				{
					key: 'electronics_hold_listing',
					value: 'electronics_hold_listing',
				},
			],
			look: 'toggle',
		},
		{
			key: 'electronics_required_documents',
			type: 'creatable-multi',
			label: __('Required documents from seller', 'multivendorx'),
			size: '30%',
			options: [
				{ value: 'invoice', label: __('Invoice', 'multivendorx') },
				{ value: 'warranty_certificate', label: __('Warranty Certificate', 'multivendorx') },
				{ value: 'safety_compliance', label: __('Safety Compliance', 'multivendorx') },
			],
			placeholder: __('Type document name…', 'multivendorx'),
			formatCreateLabel: (val) => `Add "${val}"`,
		},

		{
			key: 'food_section',
			type: 'section',
			title: __('Food, supplements & health products', 'multivendorx'),
			desc: __('Packaged food, vitamins, herbal products, drinks', 'multivendorx'),
		},
		{
			key: 'food_hold_listing',
			type: 'checkbox',
			label: __('Hold listing until reviewed', 'multivendorx'),
			desc: __('Require review for food & health products', 'multivendorx'),
			options: [
				{
					key: 'food_hold_listing',
					value: 'food_hold_listing',
				},
			],
			look: 'toggle',
		},
		{
			key: 'food_required_documents',
			type: 'creatable-multi',
			label: __('Required documents from seller', 'multivendorx'),
			size: '30%',
			options: [
				{ value: 'fssai_license', label: __('FSSAI License', 'multivendorx') },
				{ value: 'lab_test_report', label: __('Lab Test Report', 'multivendorx') },
				{ value: 'ingredients_list', label: __('Ingredients List', 'multivendorx') },
			],
			placeholder: __('Type document name…', 'multivendorx'),
			formatCreateLabel: (val) => `Add "${val}"`,
		},

		{
			key: 'toys_section',
			type: 'section',
			title: __("Toys & children's products", 'multivendorx'),
			desc: __("Toys, games, baby gear, kids' clothing", 'multivendorx'),
		},
		{
			key: 'toys_hold_listing',
			type: 'checkbox',
			label: __('Hold listing until reviewed', 'multivendorx'),
			desc: __('Require review for toys & children products', 'multivendorx'),
			options: [
				{
					key: 'toys_hold_listing',
					value: 'toys_hold_listing',
				},
			],
			look: 'toggle',
		},
		{
			key: 'toys_required_documents',
			type: 'creatable-multi',
			label: __('Required documents from seller', 'multivendorx'),
			size: '30%',
			options: [
				{ value: 'safety_certificate', label: __('Safety Certificate', 'multivendorx') },
				{ value: 'age_rating', label: __('Age Rating', 'multivendorx') },
				{ value: 'material_compliance', label: __('Material Compliance', 'multivendorx') },
			],
			placeholder: __('Type document name…', 'multivendorx'),
			formatCreateLabel: (val) => `Add "${val}"`,
		},

		{
			key: 'chemicals_section',
			type: 'section',
			title: __("Chemicals & cleaning products", 'multivendorx'),
			desc: __("Paints, solvents, cleaning agents, pesticides", 'multivendorx'),
		},
		{
			key: 'chemicals_hold_listing',
			type: 'checkbox',
			label: __('Hold listing until reviewed', 'multivendorx'),
			desc: __('Require review for chemicals & cleaning products', 'multivendorx'),
			options: [
				{
					key: 'chemicals_hold_listing',
					value: 'chemicals_hold_listing',
				},
			],
			look: 'toggle',
		},
		{
			key: 'chemicals_required_documents',
			type: 'creatable-multi',
			label: __('Required documents from seller', 'multivendorx'),
			size: '30%',
			options: [
				{ value: 'msds', label: __('Material Safety Data Sheet (MSDS)', 'multivendorx') },
				{ value: 'chemical_composition', label: __('Chemical Composition', 'multivendorx') },
				{ value: 'safety_handling', label: __('Safety Handling Instructions', 'multivendorx') },
			],
			placeholder: __('Type document name…', 'multivendorx'),
			formatCreateLabel: (val) => `Add "${val}"`,
		},
		
		{
			key: 'restricted_section',
			type: 'section',
			title: __("Restricted & prohibited products", 'multivendorx'),
			desc: __("Products that may be illegal or platform-prohibited", 'multivendorx'),
		},
		{
			key: 'restricted_auto_detect',
			type: 'checkbox',
			label: __('Auto-detect from category & keywords', 'multivendorx'),
			desc: __('System cross-checks listings against restricted list', 'multivendorx'),
			options: [
				{
					key: 'restricted_auto_detect',
					value: 'restricted_auto_detect',
				},
			],
			look: 'toggle',
		},
		{
			key: 'restricted_email_alert',
			type: 'checkbox',
			label: __('Send me an email when flagged', 'multivendorx'),
			desc: __('Instant alert for any restricted product attempt', 'multivendorx'),
			options: [
				{
					key: 'restricted_email_alert',
					value: 'restricted_email_alert',
				},
			],
			look: 'toggle',
		},
	],
};