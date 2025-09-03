import { __ } from '@wordpress/i18n';

export default {
    id: 'disbursement',
    priority: 2,
    name: __('Disbursement', 'multivendorx'),
    desc: __("Tailor your marketplace commission plan to fit your revenue sharing preferences.",'multivendorx'),
    icon: 'adminlib-dynamic-pricing',
    submitUrl: 'settings',
    modal: [
          {
            key: 'order_status',
            type: 'checkbox',
            label: __('Eligible Order Statuses for Commission Payout', 'multivendorx'),
			settingDescription: __("Choose which order statuses qualify for commission payouts.",'multivendorx'),
            class: 'mvx-toggle-checkbox',

            options: [
                {
                    key: 'completed',
                    label: __('Completed', 'multivendorx'),
                    value: 'completed',
                },
                {
                    key: ' delivered ',
                    label: __('Delivered', 'multivendorx'),
                    value: ' delivered ',
                },
                {
                    key: 'shipped',
                    label: __('Shipped', 'multivendorx'),
                    value: 'shipped',
                },
                {
                    key: ' processing ',
                    label: __('Processing', 'multivendorx'),
                    value: ' processing ',
                },
            ],
            selectDeselect: true,
        },
		{
            key: 'payment_method',
            type: 'setting-toggle',
            label: __('Commission Settlement', 'multivendorx'),
			settingDescription: __("Select how commissions are released from the admin account.",'multivendorx'),
             desc: __("<ul><li>Instant Payout – Commissions are released immediately.</li><li>Scheduled / Delayed Payout – Commissions are released after a waiting period.</li></ul>",'multivendorx'),
            options: [
                {
                    key: 'instantly',
                    label: __('Instant Payout', 'multivendorx'),
                    value: '    ',
                },
                {
                    key: 'waitting',
                    label: __('Scheduled / Delayed Payout', 'multivendorx'),
                    value: 'waitting',
                },
            ],
        },
       {
            key: 'commission_threshold_time',
            label: __('Lock period', 'multivendorx'),
            desc: __(
                  'Set a waiting period before commissions become eligible for payout. Helps account for refunds, cancellations, or disputes.','multivendorx'),
            type: 'multi-number',
            options: [
                {
                    key: 'commission_percentage',
                    label: __('Day', 'multivendorx'),
                    type: 'number',
                    labelAfterInput: true,
                },
            ],
        },
		{
            key: 'payout_threshold_time',
            label: __('Minimum payout threshold', 'multivendorx'),
            desc: __(
                  'Define the minimum amount a store must accumulate before payouts are processed.','multivendorx'),
            type: 'multi-number',
            options: [
                {
                    key: 'commission_percentage',
                    label: __('$', 'multivendorx'),
                    type: 'number',
                    labelAfterInput: false,
                },
            ],
        },
        {
            key: 'payment_schedule',
            type: 'setting-toggle',
            label: __('Payout frequency', 'multivendorx'),
			settingDescription: __("Decide how often store commissions are released:",'multivendorx'),
             desc: __("<ul><li>If Manual is selected, stores handle withdrawals themselves from their dashboard.</li><li>Otherwise, commissions are automatically disbursed to stores based on the chosen schedule.</li></ul>",'multivendorx'),
            options: [
                {
                    key: 'mannual',
                    label: __('Mannual', 'multivendorx'),
                    value: 'mannual',
                },
                {
                    key: 'weekly',
                    label: __('Weekly', 'multivendorx'),
                    value: 'weekly',
                },
                {
                    key: 'daily',
                    label: __('Daily', 'multivendorx'),
                    value: 'daily',
                },
                {
                    key: 'monthly',
                    label: __('Monthly', 'multivendorx'),
                    value: 'monthly',
                },
                {
                    key: 'fortnightly',
                    label: __('Fortnightly', 'multivendorx'),
                    value: 'fortnightly',
                },
                {
                    key: 'hourly',
                    label: __('Hourly', 'multivendorx'),
                    value: 'hourly',
                },
            ],
        },
       {
            key: 'commission_threshold_time',
            label: __('Free withdrawal', 'multivendorx'),
            desc: __('','multivendorx'),
            type: 'multi-number',
            options: [
                {
                    key: 'commission_percentage',
                    type: 'number',
                    labelAfterInput: false,
                },
            ],
        },
		{
            key: 'commission_threshold_time',
            type: 'multi-number',
            label: __('Processing fee', 'multivendorx'),
            desc: __('','multivendorx'),
            options: [
                {
                key: 'commission_percentage',
                label: __('$', 'multivendorx'),
                type: 'number',
                labelAfterInput: false,
                },
            ],
        },     
    ],
};
