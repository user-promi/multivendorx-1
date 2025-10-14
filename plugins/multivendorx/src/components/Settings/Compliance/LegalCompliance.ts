import { __ } from '@wordpress/i18n';

export default {
    id: 'legal-compliance',
    priority: 3,
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
    ],
};
