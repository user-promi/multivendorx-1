import { __ } from '@wordpress/i18n';

export default {
    id: 'store-invoice',
    priority: 5,
    name: __('Invoice', 'mvx-pro'),
    desc: __('Select the PDF outupt mode.', 'mvx-pro'),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Configure when and how invoices are automatically generated in your marketplace', 'multivendorx' ),
            hint: __(
                'Invoice Generation Settings',
                'multivendorx'
            ),
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Invoice Number Format', 'multivendorx' ),            
            placeholder: 'Invoice Number Format',
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Starting Invoice Number', 'multivendorx' ),            
            placeholder: 'Starting Invoice Number',
        },
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __( 'Invoice PDF Page Size', 'multivendorx' ),
            classes: 'vertical width-50',
            desc: __(
                'Choose the type of commission structure that best fits your marketplace model.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __( 'A4 (210 × 297 mm)', 'multivendorx' ),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __( 'Letter (8.5 × 11 in)', 'multivendorx' ),
                    value: 'per_unit',
                },
                {
                    key: 'per_store',
                    label: __( 'Legal (8.5 × 14 in)', 'multivendorx' ),
                    value: 'per_store',
                },
            ],
        },
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __( 'PDF Layout Orientation', 'multivendorx' ),
            classes: 'vertical width-50',
            desc: __(
                'Choose the type of commission structure that best fits your marketplace model.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'portrait',
                    label: __( 'Portrait', 'multivendorx' ),
                    value: 'portrait',
                },
                {
                    key: 'landscape',
                    label: __( 'Landscape', 'multivendorx' ),
                    value: 'landscape',
                },
            ],
        },
        
        {
            key: 'type_options',
            type: 'checkbox',
            classes: 'vertical',
            label: __( ' Automatic Email Delivery ', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Configure when and how invoices are automatically sent to customers and stores',
                'multivendorx'
            ),
            options: [
                {
                    key: 'virtual',
                    label: __( 'Auto-attach Invoices to Order Emails', 'multivendorx' ),
                    value: 'virtual',
                },
                {
                    key: 'Send Separate Invoice Email',
                    label: __( 'Send Separate Invoice Email', 'multivendorx' ),
                    value: 'downloadable',
                },
                {
                    key: 'Notify Stores of Invoice Generation',
                    label: __( 'Notify Stores of Invoice Generation', 'multivendorx' ),
                    value: 'downloadable',
                },
                {
                    key: 'Generate Packing Slips',
                    label: __( 'Generate Packing Slips', 'multivendorx' ),
                    value: 'downloadable',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Configure when and how invoices are automatically generated in your marketplace', 'multivendorx' ),
            hint: __(
                'Legal & Tax Information',
                'multivendorx'
            ),
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'GST Number', 'multivendorx' ),            
            placeholder: 'Enter GST registration number',
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'TAX ID Number', 'multivendorx' ),            
            placeholder: 'Enter tax identification number',
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Customize invoice appearance with your brand and essential information', 'multivendorx' ),
            hint: __(
                ' Branding & Information',
                'multivendorx'
            ),
        },
        {
            key: 'company_logo',
            classes: 'vertical',
            type: 'file',
            label: __('Company Logo', 'mvx-pro'),
            desc: __('Upload brand image as logo', 'mvx-pro'),
            height: 75,
            width: 75,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
    ],
};