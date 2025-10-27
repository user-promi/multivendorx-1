import { __ } from '@wordpress/i18n';

export default {
    id: 'tax-compliance',
    priority: 6,
    name: __('Tax Compliance', 'mvx-pro'),
    desc: __('Stores must provide valid bank account details and tax documents (PAN, GST, VAT, TIN) to receive payouts. Payment processor verification may be required. Non-compliant stores may be restricted from payouts.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'financial_tax_required_uploads',
            type: 'checkbox',
            label: __('Required Store Uploads', 'mvx-pro'),
            desc: __('Select which financial or tax-related documents stores must upload for compliance verification.', 'mvx-pro'),
            options: [
                {
                    key: 'bank_account_details',
                    label: __('Bank Account Details', 'mvx-pro'),
                    value: 'bank_account_details',
                },
                {
                    key: 'tax_identification_documents',
                    label: __('Tax Identification Documents (TINs/VAT/GST/EIN/SSN/ITIN. etc.)', 'mvx-pro'),
                    value: 'tax_identification_documents',
                },
            ],
            selectDeselect: true,
        },
    ],
};
