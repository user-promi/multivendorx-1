import { __ } from '@wordpress/i18n';
import template1Html from '../../../assets/invoice/template1.html';
import template2Html from '../../../assets/invoice/template2.html';
import template3Html from '../../../assets/invoice/template3.html';

export default {
	id: 'store-invoice',
	priority: 6,
	name: __('Invoices', 'mvx-pro'),
	desc: __(
		'Set up when and how invoices are generated in your marketplace.',
		'mvx-pro'
	),
	icon: 'adminfont-invoice',
	submitUrl: 'settings',
	modal: [
		{
			key: 'mvx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('Invoice number format', 'multivendorx'),
			placeholder: 'Invoice number format',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'mvx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('Starting invoice number', 'multivendorx'),
			placeholder: 'Starting invoice number',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Invoice PDF page size', 'multivendorx'),
			classes: 'vertical w-50',
			desc: __(
				'Choose the page size for generated invoice PDFs',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('A4 (210 × 297 mm)', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Letter (8.5 × 11 in)', 'multivendorx'),
					value: 'per_unit',
				},
				{
					key: 'per_store',
					label: __('Legal (8.5 × 14 in)', 'multivendorx'),
					value: 'per_store',
				},
			],
			proSetting: true,
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('PDF layout orientation', 'multivendorx'),
			classes: 'vertical w-50',
			desc: __(
				'Choose whether invoices are generated in portrait or landscape mode',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'portrait',
					label: __('Portrait', 'multivendorx'),
					value: 'portrait',
				},
				{
					key: 'landscape',
					label: __('Landscape', 'multivendorx'),
					value: 'landscape',
				},
			],
			proSetting: true,
		},
		{
			key: 'type_options',
			type: 'checkbox',
			classes: 'vertical',
			label: __('Automatic email delivery', 'multivendorx'),
			class: 'mvx-toggle-checkbox',
			desc: __(
				'Choose how invoices are automatically sent to customers and stores',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'virtual',
					label: __(
						'Attach invoices to order emails',
						'multivendorx'
					),
					value: 'virtual',
				},
				{
					key: 'Send Separate Invoice Email',
					label: __('Send separate invoice email', 'multivendorx'),
					value: 'downloadable',
				},
				{
					key: 'Notify Stores of Invoice Generation',
					label: __(
						'Notify stores when invoices are generated',
						'multivendorx'
					),
					value: 'downloadable',
				},
				{
					key: 'Generate Packing Slips',
					label: __('Generate packing slips', 'multivendorx'),
					value: 'downloadable',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Add legal details and tax information to invoices',
				'multivendorx'
			),
			hint: __('Legal and tax information', 'multivendorx'),
		},
		{
			key: 'mvx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('GST number', 'multivendorx'),
			placeholder: 'Enter GST registration number',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'mvx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('Tax ID number', 'multivendorx'),
			placeholder: 'Enter tax ID number',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Customize invoice design with your branding and business details',
				'multivendorx'
			),
			hint: __('Branding and information', 'multivendorx'),
		},
		{
			key: 'company_logo',
			classes: 'vertical',
			type: 'file',
			label: __('Company logo', 'mvx-pro'),
			desc: __('Upload your company logo for invoices', 'mvx-pro'),
			size: 'small',
			proSetting: true,
			moduleEnabled: 'invoice',
		},
		{
			key: 'invoice_template_builder',
			type: 'color-setting',
			label: __('Invoice Template & PDF', 'mvx-pro'),
			moduleEnabled: 'invoice',
			apilink: 'pdf',
		  
			/* 🔹 HTML templates */
			templates: [
			  {
				key: 'invoice_1',
				label: __('Invoice Classic', 'mvx-pro'),
				html: template1Html,
			  },
			  {
				key: 'invoice_2',
				label: __('Invoice Modern', 'mvx-pro'),
				html: template2Html,
			  },
			  {
				key: 'invoice_3',
				label: __('Invoice Minimal', 'mvx-pro'),
				html: template3Html,
			  },
			],
		  
			/* 🎨 PRESET THEMES */
			presetThemes: [
			  {
				name: __('Blue', 'mvx-pro'),
				vars: {
				  '--accent': '#2563eb',
				  '--accent-secondary': '#0ea5e9',
				},
			  },
			  {
				name: __('Green', 'mvx-pro'),
				vars: {
				  '--accent': '#16a34a',
				  '--accent-secondary': '#22c55e',
				},
			  },
			  {
				name: __('Dark', 'mvx-pro'),
				vars: {
				  '--bg-page': '#0f172a',
				  '--bg-card': '#020617',
				  '--text-primary': '#e5e7eb',
				  '--text-muted': '#94a3b8',
				  '--border-color': '#1e293b',
				  '--accent': '#6366f1',
				  '--accent-secondary': '#22d3ee',
				},
			  },
			],
		  
			showPdfButton: true,
		}		  
	],
};
