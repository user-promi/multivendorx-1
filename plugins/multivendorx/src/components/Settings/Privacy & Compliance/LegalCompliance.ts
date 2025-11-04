import { __ } from '@wordpress/i18n';

export default {
    id: 'legal-compliance',
    priority: 4,
    name: __('Legal Compliance', 'mvx-pro'),
    desc: __('Stores must submit signed agreements, accept platform terms & conditions, consent to the privacy policy, and set up their refund & return policy. Anti-counterfeit or copyright declarations must be submitted for regulated products.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'seller_agreement',
            type: 'textarea',
            label: __('Seller Agreement', 'multivendorx'),
            desc: __('Define the agreement outlining seller obligations and responsibilities on your marketplace.', 'multivendorx'),
        },
        {
            key: 'terms_conditions',
            type: 'textarea',
            label: __('Terms & Conditions', 'multivendorx'),
            desc: __('Specify general terms and conditions that govern participation and transactions.', 'multivendorx'),
        },
        {
            key: 'anti_counterfeit_policy',
            type: 'textarea',
            label: __('Anti-Counterfeit / Copyright Declaration', 'multivendorx'),
            desc: __('Declare your store’s compliance with intellectual property and anti-counterfeit laws.', 'multivendorx'),
        },
        {
            key: 'separator_legal_compliance',
            type: 'section',
            hint: __('Legal Compliance Settings', 'multivendorx'),
            desc: __('Manage how stores view, download, and acknowledge your platform’s compliance documents.', 'multivendorx')
        },
        {
            key: 'allow_download_upload',
            label: __('Allow store to download and re-upload legal documents', 'multivendorx'),
            settingDescription: __('Let stores download each compliance document (Seller Agreement, Terms & Conditions, Anti-Counterfeit Declaration) as a PDF. Stores can sign and re-upload the signed copies to confirm acceptance.', 'multivendorx'),
            desc: __('If disabled, stores can only read and accept the agreements directly within their dashboard.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'allow_download_upload',
                    value: 'allow_download_upload',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'allow_download_only',
            label: __('Allow download only', 'multivendorx'),
            settingDescription: __('Permit stores to download legal documents as PDF without requiring signed uploads.', 'multivendorx'),
            desc: __('Useful when you want stores to read documents offline but not upload any files.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'allow_download_only',
                    value: 'allow_download_only',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'require_signed_upload',
            label: __('Require signed upload before approval', 'multivendorx'),
            settingDescription: __('Force stores to upload signed versions before being marked as compliant.', 'multivendorx'),
            desc: __('Ensures every store formally acknowledges and agrees to your platform’s legal terms.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'require_signed_upload',
                    value: 'require_signed_upload',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'auto_timestamp_pdf',
            label: __('Auto-generate timestamped PDF copy', 'multivendorx'),
            settingDescription: __('Automatically create a timestamped copy of each agreement when downloaded.', 'multivendorx'),
            desc: __('The generated copy will be stored for administrative reference.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'auto_timestamp_pdf',
                    value: 'auto_timestamp_pdf',
                },
            ],
            look: 'toggle',
        },

    ],
};
