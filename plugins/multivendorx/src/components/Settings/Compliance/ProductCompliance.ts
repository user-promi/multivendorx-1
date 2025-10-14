import { __ } from '@wordpress/i18n';

export default {
    id: 'product-compliance',
    priority: 4,
    name: __('Product Compliance', 'mvx-pro'),
    desc: __('All product listings must follow platform content guidelines and avoid prohibited categories. Branded or regulated products must include authenticity certificates. Optional safety certifications may be uploaded for regulated items.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'prohibited_product_categories',
            type: 'multi-string',
            label: __('Prohibited Product Categories', 'multivendorx'),
            placeholder: __('Add prohibited product category', 'multivendorx'),
            settingDescription: __(
                'Define one or more product categories that are not allowed to be listed on your marketplace.',
                'multivendorx'
            ),
            desc: __(
                '<b>Note:</b> Ensure sellers are informed about disallowed items before publishing. Violations may result in product removal or account penalties.',
                'multivendorx'
            ),
            name: 'prohibited_product_categories',
        },
        {
            key: 'required_store_uploads',
            type: 'checkbox',
            label: __('Required Store Uploads', 'mvx-pro'),
            desc: __('Select which documents or files stores must upload for compliance verification.', 'mvx-pro'),
            options: [
                {
                    key: 'product_authenticity_certificates',
                    label: __('Product Authenticity Certificates', 'mvx-pro'),
                    value: 'product_authenticity_certificates',
                },
                {
                    key: 'product_images_descriptions',
                    label: __('Product Images & Descriptions', 'mvx-pro'),
                    value: 'product_images_descriptions',
                },
                {
                    key: 'safety_certifications',
                    label: __('Safety Certifications', 'mvx-pro'),
                    value: 'safety_certifications',
                },
            ],
            selectDeselect: true,
        },
    ],
};
