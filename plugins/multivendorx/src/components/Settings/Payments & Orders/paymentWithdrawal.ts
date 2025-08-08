import { __ } from '@wordpress/i18n';

export default {
    id: 'payment-withdrawal',
    priority: 2,
    name: __( 'Payment & Withdrawal', 'multivendorx' ),
    desc: __(
        "Tailor your marketplace's commission plan to fit your revenue-sharing preferences.",
        'multivendorx'
    ),
    icon: 'adminlib-dynamic-pricing',
    submitUrl: 'settings',
    modal: [
        {
            key: 'payment_gateway_charge',
            label: __( 'Payment Gateway Charge', 'multivendorx' ),
            desc: __(
                'Include any additional fees charged by the payment gateway during online transactions.',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'payment_gateway_charge',
                    label: __( '', 'multivendorx' ),
                    value: 'payment_gateway_charge',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'gateway_charges_cost_carrier',
            type: 'select',
            label: __( 'Gateway charges responsibility', 'multivendorx' ),
            desc: __(
                'Decide who will bear the payment gateway charges (e.g., admin or vendor) when making automated payment',
                'multivendorx'
            ),
            options: [
                {
                    key: 'vendor',
                    label: __( 'Vendor', 'multivendorx' ),
                    value: __( 'vendor', 'multivendorx' ),
                },
                {
                    key: 'admin',
                    label: __( 'Site owner', 'multivendorx' ),
                    value: __( 'admin', 'multivendorx' ),
                },
                {
                    key: 'separate',
                    label: __( 'Separately', 'multivendorx' ),
                    value: __( 'separate', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'payment_gateway_charge',
                set: true,
            },
        },
        {
            key: 'payment_gateway_charge_type',
            type: 'select',
            label: __( 'Gateway charge structure', 'multivendorx' ),
            desc: __(
                'Choose how payment gateway fees will be calculated.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'percent',
                    label: __( 'Percentage', 'multivendorx' ),
                    value: 'percent',
                },
                {
                    key: 'fixed',
                    label: __( 'Fixed amount', 'multivendorx' ),
                    value: 'fixed',
                },
                {
                    key: 'fixed_with_percentage',
                    label: __( '%age + Fixed', 'multivendorx' ),
                    value: 'fixed_with_percentage',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge',
                set: true,
            },
        },
        // gayeway charge value
        {
            key: 'default_gateway_charge_value',
            type: 'multi-number',
            label: __( 'Gateway charge value', 'multivendorx' ),
            desc: __(
                'Set specific values for gateway fees based on the selected charge structure.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'fixed_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __( 'Fixed paypal masspay amount', 'multivendorx' ),
                    value: 'fixed_gayeway_amount_paypal_masspay',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge_type',
                value: 'fixed',
            },
        },
        {
            key: 'default_gateway_charge_value',
            type: 'multi-number',
            label: __( 'Gateway Value', 'multivendorx' ),
            desc: __(
                'The commission amount added here will be applicable for all commissions. In case the your commission type is fixed the',
                'multivendorx'
            ),
            options: [
                {
                    key: 'percent_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __(
                        'Percent paypal masspay amount',
                        'multivendorx'
                    ),
                    value: 'percent_gayeway_amount_paypal_masspay',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge_type',
                value: 'percent',
            },
        },
        {
            key: 'default_gateway_charge_value',
            type: 'multi-number',
            label: __( 'Gateway Value', 'multivendorx' ),
            desc: __(
                'The commission amount added here will be applicable for all commissions. In case the your commission type is fixed the',
                'multivendorx'
            ),
            options: [
                {
                    key: 'fixed_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __( 'Fixed paypal masspay amount', 'multivendorx' ),
                    value: 'fixed_gayeway_amount_paypal_masspay',
                },
                {
                    key: 'percent_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __(
                        'Percent paypal masspay amount',
                        'multivendorx'
                    ),
                    value: 'percent_gayeway_amount_paypal_masspay',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge_type',
                value: 'fixed_with_percentage',
            },
        },
        {
            key: 'choose_payment_mode_automatic_disbursal',
            label: __( 'Disbursement Schedule', 'multivendorx' ),
            desc: __(
                'Schedule when vendors would receive their commission',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'choose_payment_mode_automatic_disbursal',
                    value: 'choose_payment_mode_automatic_disbursal',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'payment_schedule',
            type: 'radio',
            label: __( 'Set Schedule', 'multivendorx' ),
            options: [
                {
                    key: 'weekly',
                    label: __( 'Weekly', 'multivendorx' ),
                    value: 'weekly',
                },
                {
                    key: 'daily',
                    label: __( 'Daily', 'multivendorx' ),
                    value: 'daily',
                },
                {
                    key: 'monthly',
                    label: __( 'Monthly', 'multivendorx' ),
                    value: 'monthly',
                },
                {
                    key: 'fortnightly',
                    label: __( 'Fortnightly', 'multivendorx' ),
                    value: 'fortnightly',
                },
                {
                    key: 'hourly',
                    label: __( 'Hourly', 'multivendorx' ),
                    value: 'hourly',
                },
            ],
            dependent: {
                key: 'choose_payment_mode_automatic_disbursal',
                set: true,
            },
        },
        {
            key: 'commission_threshold',
            type: 'number',
            label: __( 'Disbursement Threshold', 'multivendorx' ),
            desc: __(
                'Add the minimum value required before payment is disbursed to the vendor',
                'multivendorx'
            ),
        },
        {
            key: 'withdrawal_request',
            label: __( 'Allow Withdrawal Request', 'multivendorx' ),
            desc: __(
                'Let vendors withdraw payment prior to reaching the agreed disbursement value',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'withdrawal_request',
                    value: 'withdrawal_request',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'commission_threshold_time',
            type: 'number',
            label: __( 'Withdrawal Locking Period', 'multivendorx' ),
            desc: __(
                'Refers to the minimum number of days required before a seller can send a withdrawal request',
                'multivendorx'
            ),
            placeholder: __( 'in days', 'multivendorx' ),
        },
        {
            key: 'order_withdrawl_status',
            type: 'multi-select',
            label: __(
                'Available Order Status for Withdrawal',
                'multivendorx'
            ),
            desc: __(
                'Withdrawal request would be available in case of these order statuses',
                'multivendorx'
            ),
            options: [
                {
                    key: 'on-hold',
                    label: __( 'On hold', 'multivendorx' ),
                    value: 'on-hold',
                },
                {
                    key: 'processing',
                    label: __( 'Processing', 'multivendorx' ),
                    value: 'processing',
                },
                {
                    key: 'completed',
                    label: __( 'Completed', 'multivendorx' ),
                    value: 'completed',
                },
            ],
        },
        {
            key: 'no_of_orders',
            type: 'number',
            label: __( 'Number of Free Withdrawals', 'multivendorx' ),
            desc: __( 'Number of free withdrawal requests.', 'multivendorx' ),
        },
        {
            key: 'commission_transfer',
            type: 'number',
            label: __( 'Withdrawal Charges', 'multivendorx' ),
            desc: __(
                'Vendors will be charged this amount per withdrawal after the quota of free withdrawals is over.',
                'multivendorx'
            ),
        },  
    ],
};
