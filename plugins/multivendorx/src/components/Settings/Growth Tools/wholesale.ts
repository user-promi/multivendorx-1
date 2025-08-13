import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale',
    priority: 2,
    name: __( 'Wholesale Tradding', 'mvx-pro' ),
    desc: __( 'Wholesale', 'mvx-pro' ),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'need_approval_for_wholesale_customer',
            type: 'setting-toggle',
            label: __( 'Wholesale Buyer Verification', 'mvx-pro' ),
            desc: __(
                'Manage access to bulk pricing tiers based on customer status.',
                'mvx-pro'
            ),
            options: [
                {
                    key: 'automatic',
                    label: __( 'Automatic', 'mvx-pro' ),
                    value: 'automatic',
                },
                {
                    key: 'mannual',
                    label: __( 'Mannual', 'mvx-pro' ),
                    value: 'mannula',
                },
            ],
        },
        {
            key: 'need_approval_for_wholesale_customer',
            type: 'setting-toggle',
            label: __( 'Wholesale Price Access', 'mvx-pro' ),
            desc: __(
                'Help wholesale buyers quickly identify bulk discounts in store catalogs.',
                'mvx-pro'
            ),
            options: [
                {
                    key: 'yes',
                    label: __( 'Registered Users', 'mvx-pro' ),
                    value: 'yes',
                },
                {
                    key: 'no',
                    label: __( 'Wholesale Buyers', 'mvx-pro' ),
                    value: 'no',
                },
            ],
        },
        {
            key: 'need_approval_for_wholesale_customer',
            type: 'setting-toggle',
            label: __( 'Wholesale price display', 'mvx-pro' ),
            desc: __(
                'Ensure only legitimate wholesale customers get access to special pricing.',
                'mvx-pro'
            ),
            options: [
                {
                    key: 'yes',
                    label: __( 'Display along retail prices', 'mvx-pro' ),
                    value: 'yes',
                },
                {
                    key: 'no',
                    label: __( 'Wholesale only price', 'mvx-pro' ),
                    value: 'no',
                },
            ],
        },

    ],
};
