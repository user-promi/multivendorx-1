import { __ } from '@wordpress/i18n';

export default {
	id: 'wholesale',
	priority: 3,
	headerTitle: __('Wholesale', 'multivendorx'),
	headerDescription: __(
		'Configure rules for wholesale buyers and pricing.',
		'multivendorx'
	),
	headerIcon: 'wholesale1',
	submitUrl: 'settings',
	modal: [
		{
			key: 'wholesale_buyer_verification',
			type: 'choice-toggle',
			label: __('Wholesale buyer verification', 'multivendorx'),
			settingDescription: __(
				'Decide how wholesale buyers are approved before they can access bulk pricing.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Automatic - Any user registering as a wholesale buyer is instantly approved without admin review.</li><li>Manual - Admin must review and approve each wholesale buyer request before access is granted.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'automatic',
					label: __('Automatic', 'multivendorx'),
					value: 'automatic',
				},
				{
					key: 'manual',
					label: __('Manual', 'multivendorx'),
					value: 'manual',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'wholesale_price_access',
			type: 'choice-toggle',
			label: __('Who can see wholesale prices', 'multivendorx'),
			settingDescription: __(
				'Choose which users can see wholesale pricing in store catalogs.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>All registered users - Every logged-in customer can see wholesale prices, regardless of approval status.</li><li>Approved wholesale buyers only - Only users approved as wholesale buyers can see wholesale prices.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'registered',
					label: __('All registered users', 'multivendorx'),
					value: 'registered',
				},
				{
					key: 'wholesale_only',
					label: __('Approved wholesale buyers only', 'multivendorx'),
					value: 'wholesale_only',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'wholesale_price_display',
			type: 'choice-toggle',
			label: __('How wholesale prices are shown', 'multivendorx'),
			settingDescription: __(
				'Control whether wholesale prices are shown alongside retail prices or separately.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Along with retail prices - Display both retail and wholesale prices side by side, so buyers can compare.</li><li>Wholesale price only - Replace retail pricing with wholesale pricing for eligible buyers.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'with_retail',
					label: __('Along with retail prices', 'multivendorx'),
					value: 'with_retail',
				},
				{
					key: 'wholesale_price',
					label: __('Wholesale price only', 'multivendorx'),
					value: 'wholesale_price',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'what_business_information_wholesale_buyers_must_provide',
			type: 'checkbox',
			label: __('What business information wholesale buyers must provide', 'multivendorx'),
			settingDescription: __(
				'Choose the business details required during wholesale registration.',
				'multivendorx'
			),
			desc: __(
				'Only the fields enabled below will appear in the registration form.',
				'multivendorx'
			),
			options: [
				{
					key: 'business_name',
					label: __('Business name', 'multivendorx'),
					value: 'business_name',
					edit: true,
				},
				{
					key: 'business_type',
					label: __('Business type', 'multivendorx'),
					value: 'business_type',
					edit: true,
				},
				{
					key: 'tax_identification_number',
					label: __('Tax identification number', 'multivendorx'),
					value: 'tax_identification_number',
					edit: true,
				},
				{
					key: 'expected_monthly_volume',
					label: __('Expected Monthly Volume', 'multivendorx'),
					value: 'expected_monthly_volume',
					edit: true,
				},
				{
					key: 'business_address',
					label: __('Business address', 'multivendorx'),
					value: 'business_address',
					edit: true,
				},
			],
			selectDeselect: true,
		},
		{
			key: 'what_documents_wholesale_buyers_must_submit',
			type: 'checkbox',
			label: __(
				'What documents wholesale buyers must submit',
				'multivendorx'
			),
			settingDescription: __(
				'Decide which verification documents are required during registration.',
				'multivendorx'
			),
			options: [
				{
					key: 'business_registration_certificate',
					label: __('Business registration certificate', 'multivendorx'),
					value: 'business_registration_certificate',
				},
				{
					key: 'tax_identification_document',
					label: __('Tax identification document', 'multivendorx'),
					value: 'tax_identification_document',
				},
				{
					key: 'address_proof',
					label: __('Address proof', 'multivendorx'),
					value: 'address_proof',
				},
				{
					key: 'identity_proof',
					label: __(
						'Identity proof (owner / authorized person)',
						'multivendorx'
					),
					value: 'identity_proof',
				},
				{
					key: 'reseller_distributor_certificate',
					label: __(
						'Reseller / distributor certificate',
						'multivendorx'
					),
					value: 'reseller_distributor_certificate',
				},
				{
					key: 'other_supporting_document',
					label: __('Other supporting document', 'multivendorx'),
					value: 'other_supporting_document',
				},
			],
			selectDeselect: true,
		}
	],
};
