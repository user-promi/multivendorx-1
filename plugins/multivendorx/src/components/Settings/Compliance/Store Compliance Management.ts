import { __ } from '@wordpress/i18n';

export default {
    id: 'non-compliance',
    priority: 1,
    name: __('Non-Compliance Handling', 'mvx-pro'),
    desc: __('Control store access based on verification status. Ensure only compliant stores can operate fully on your marketplace.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [        
        {
            key: 'unverified_store_access',
            type: 'checkbox',
            label: __('Enforcement actions', 'mvx-pro'),
            desc: __('Select the restrictions you want to apply to stores who have not yet completed their compliance.', 'mvx-pro'),
            options: [
                {
                    key: 'endpoint_control',
                    label: __('Restrict access to other pages', 'mvx-pro'),
                    value: 'endpoint_control',
                    proSetting:true,
                },
                {
                    key: 'redirect_verification_page',
                    label: __('Redirect to compliance checklist page', 'mvx-pro'),
                    value: 'redirect_verification_page',
                    proSetting:true,
                },
                {
                    key: 'disable_add_product_endpoint',
                    label: __('Prevent product upload', 'mvx-pro'),
                    value: 'disable_add_product_endpoint',
                    proSetting:true,
                },                
                {
                    key: 'hide_store_from_customers',
                    label: __('Hide store from customers ', 'mvx-pro'),
                    value: 'hide_store_from_customers',
                    proSetting:true,
                },
            ],
            //proSetting:true,
            selectDeselect: true,
        },
    ],
};