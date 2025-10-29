import { __ } from '@wordpress/i18n';

export default {
    id: 'store_status_control',
    priority: 3,
    name: __('Store Status', 'multivendorx'),
    desc: __(
        'Control access and visibility based on store approval status. Configure how pending, rejected, suspended, and approved stores behave within your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-store',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_compliance_management',
            type: 'payment-tabs',
            // label: 'What Must Sellers Complete Before Selling?',
            // settingDescription: __('Check all requirements sellers must finish to activate their store', 'multivendorx'),
            modal: [
                {
                    id: 'Verify store identity and business legitimacy',
                    icon: "adminlib-google",
                    label: 'Seller Verification',
                    connected: true,
                    // disableBtn: true,
                    enableOption: true,
                    // openForm: ,
                    desc: 'Stores awaiting approval',
                    formFields: [
                        {
                            key: 'required_tasks',
                            type: 'multi-checkbox',
                            label: __('Required Tasks', 'multivendorx'),
                            class: 'mvx-toggle-checkbox',
                            options: [
                                {
                                    key: 'enable_advertisement_in_subscription',
                                    label: __('Identity Verification', 'multivendorx'),
                                    value: 'enable_advertisement_in_subscription',
                                    desc: __('Allow stores to advertise products at no extra cost if included in their subscription plan.', 'multivendorx'),
                                },
                                {
                                    key: 'display_advertised_product_on_top',
                                    label: __('Social Verification', 'multivendorx'),
                                    value: 'display_advertised_product_on_top',
                                    desc: __('Display advertised products at the top of catalog pages such as the shop or store page.', 'multivendorx'),
                                },
                                {
                                    key: 'out_of_stock_visibility',
                                    label: __('Email Verification', 'multivendorx'),
                                    value: 'out_of_stock_visibility',
                                    desc: __('Hide advertised products that are out of stock. Note: if WooCommerce’s out-of-stock visibility setting is enabled, products will be hidden regardless of this setting.', 'multivendorx'),
                                },
                            ],
                            selectDeselect: true,
                        },
                        {
                            key: 'non_compliance_action',
                            type: 'setting-toggle',
                            label: __('Non-Compliance Action', 'multivendorx'),
                            options: [
                                {
                                    key: 'block_dashboard_access',
                                    label: __('Block dashboard access', 'multivendorx'),
                                    value: 'block_dashboard_access',
                                },
                                {
                                    key: 'hide_store_from_view',
                                    label: __('Hide store from view', 'multivendorx'),
                                    value: 'hide_store_from_view',
                                },
                                {
                                    key: 'disable_product upload',
                                    label: __('Disable product upload', 'multivendorx'),
                                    value: 'disable_product upload',
                                },
                            ],
                        },
                    ],
                },
            ]
        },
    ],
};