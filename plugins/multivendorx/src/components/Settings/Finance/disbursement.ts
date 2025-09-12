import { __ } from '@wordpress/i18n';
export default {
    id: 'disbursement',
    priority: 2,
    name: __('Disbursement', 'multivendorx'),
    desc: __("Tailor your marketplace commission plan to fit your revenue sharing preferences.", 'multivendorx'),
    icon: 'adminlib-cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __('Eligible Order Statuses for Commission Payout', 'multivendorx'),
            settingDescription: __("Choose which order statuses qualify for commission payouts.", 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'completed',
                    label: __('Completed', 'multivendorx'),
                    value: 'completed',
                },
                {
                    key: 'delivered',
                    label: __('Delivered', 'multivendorx'),
                    value: 'delivered',
                },
                {
                    key: 'shipped',
                    label: __('Shipped', 'multivendorx'),
                    value: 'shipped',
                },
                {
                    key: 'processing',
                    label: __('Processing', 'multivendorx'),
                    value: 'processing',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'disbursement_method',
            type: 'setting-toggle',
            label: __('Commission settlement', 'multivendorx'),
            settingDescription: __("Select how commissions are released from the admin account.", 'multivendorx'),
            desc: __("<ul><li>Instant Payout – Commissions are released immediately.</li><li>Scheduled / Delayed Payout – Commissions are released after a waiting period.</li></ul>", 'multivendorx'),
            options: [
                {
                    key: 'instantly',
                    label: __('Instant payout', 'multivendorx'),
                    value: 'instantly',
                },
                {
                    key: 'waiting',
                    label: __('Scheduled / delayed payout', 'multivendorx'),
                    value: 'waiting',
                },
            ],
        },
        {
            key: 'commission_lock_period',
            label: __('Lock period', 'multivendorx'),
            settingDescription: __('Keep payouts on hold for a safety buffer. Helps cover refunds, cancellations, or disputes.', 'multivendorx'),
            type: 'number',
            size: '8rem',
            addonBefore:__('Wait', 'multivendorx'),
            addonAfter:__('before commissions become eligible for payout', 'multivendorx'),
            parameter: __('days', 'multivendorx'),
        },
        {
            key: 'payout_threshold_amount',
            label: __('Minimum payout threshold', 'multivendorx'),
            settingDescription: __(
                'Set the lowest balance a store must reach before they can get paid.', 'multivendorx'),
            type: 'number',
            addonBefore:__('Stores must accumulate at least', 'multivendorx'),
            prefixUnit: __('$', 'multivendorx'),
            addonAfter:__(' to get paid', 'multivendorx'),
            size: '8rem',
            options: [
                {
                    key: 'commission_percentage',
                    value: 'commission_percentage',
                },
            ],
        },
        {
            key: 'payment_schedules',
            type: 'setting-toggle',
            label: __('Payout frequency', 'multivendorx'),
            settingDescription: __("Decide how often store commissions are released", 'multivendorx'),
            desc: __("<ul><li>If Manual is selected, stores handle withdrawals themselves from their dashboard.</li><li>Otherwise, commissions are automatically disbursed to stores based on the chosen schedule.</li></ul>", 'multivendorx'),
            options: [
                {
                    key: 'mannual',
                    label: __('Manual', 'multivendorx'),
                    value: 'Mannual',
                },
                {
                    key: 'hourly',
                    label: __('Hourly', 'multivendorx'),
                    value: 'hourly',
                },
                {
                    key: 'daily',
                    label: __('Daily', 'multivendorx'),
                    value: 'daily',
                },
                {
                    key: 'weekly',
                    label: __('Weekly', 'multivendorx'),
                    value: 'weekly',
                },
                {
                    key: 'fortnightly',
                    label: __('Fortnightly', 'multivendorx'),
                    value: 'fortnightly',
                },
                {
                    key: 'monthly',
                    label: __('Monthly', 'multivendorx'),
                    value: 'monthly',
                },

            ],
        },
        //Hourly
        {
            key: 'disbursement_hourly',
            label: __('Hourly payouts', 'multivendorx'),
            type: 'number',
            size: '8rem',
            options: [
                {
                    key: 'payouts_every_hour',
                    value: 'payouts_every_hour',
                },
            ],
            addonAfter:__('minute of every hour', 'multivendorx'),
            addonBefore:__('At', 'multivendorx'),
            parameter:__('th', 'multivendorx'),
            dependent: {
                key: 'payment_schedules',
                set: true,
                value: 'hourly',
            },
        },
        //fort
        {
            key: 'disbursement_fortnightly', // updated key
            type: 'nested',
            label: __('Fortnightly disbursement', 'multivendorx'), // updated label
            before:__('Of', 'multivendorx'),
            single: true,
            desc: __(
                'Commissions are automatically sent to stores every 14 days based on your selected schedule. For example, if you choose "1st week Friday", payouts will occur on the first Friday of each two-week cycle.',
                'multivendorx'
            ),
            nestedFields: [
                {
                    key: 'payout_frequency',
                    type: 'select',
                    label:__('On', 'multivendorx'),
                    // label: __('Payout frequency', 'multivendorx'),
                    options: [
                        {
                            key: 'first',
                            label: __('1st', 'multivendorx'),
                            value: 'first',
                        },
                        {
                            key: 'second',
                            label: __('2nd', 'multivendorx'),
                            value: 'second',
                        },
                    ],
                },
                {
                    key: 'payout_day',
                    type: 'dropdown',
                    // label: __('Payout Day', 'multivendorx'),
                    // settingDescription: __("Select the day of the week to release store commissions:", 'multivendorx'),
                    // desc: __("<ul><li>Choose the specific day when store commissions should be disbursed.</li></ul>", 'multivendorx'),
                    options: [
                        { key: 'monday', label: __('Monday', 'multivendorx'), value: 'monday' },
                        { key: 'tuesday', label: __('Tuesday', 'multivendorx'), value: 'tuesday' },
                        { key: 'wednesday', label: __('Wednesday', 'multivendorx'), value: 'wednesday' },
                        { key: 'thursday', label: __('Thursday', 'multivendorx'), value: 'thursday' },
                        { key: 'friday', label: __('Friday', 'multivendorx'), value: 'friday' },
                        { key: 'saturday', label: __('Saturday', 'multivendorx'), value: 'saturday' },
                        { key: 'sunday', label: __('Sunday', 'multivendorx'), value: 'sunday' },
                    ],
                },
                {
                    key: 'store_opening_time',
                    addonBefore:__('at', 'multivendorx'),
                    type: 'time',
                    // label: __('Store Opening Time', 'multivendorx'),
                    // description: __('Select the time your store opens.', 'multivendorx'),
                },
            ],
            dependent: {
                key: 'payment_schedules', // parent dependent key
                set: true,
                value: 'fortnightly', // updated value
            },
        },
        //monthly
        {
            key: 'disbursement_monthly', // main key for monthly nested
            type: 'nested',
            label: __('Monthly disbursement', 'multivendorx'), // main label
            single: true,
            desc: __(
                'Date of the month: (defaults to last day if shorter month)<br>Once per month: Set the day of the month and time for store commissions payout.',
                'multivendorx'
            ),
            nestedFields: [
                {
                    key: 'payouts_every_month', // day of month
                    addonBefore: __('On', 'multivendorx'),
                    type: 'number',
                    size: '8rem',
                    options: [
                        {
                            key: 'payouts_every_month',
                            value: 'payouts_every_month',
                        },
                    ],
                    parameter: __('day', 'multivendorx'),
                },
                {
                    key: 'monthly_payout_time', // time of day
                    type: 'time', // links to TimeSelect component
                    addonBefore: __('at', 'multivendorx'),
                    description: __('Select the time of day your monthly payout should occur.', 'multivendorx'),
                    defaultValue: '09:00',
                },
            ],
            dependent: {
                key: 'payment_schedules', // show only if monthly
                set: true,
                value: 'monthly',
            },
        },
        //daily
        {
            key: 'daily_payout_time', // unique key for daily payout time
            type: 'time', // links to TimeSelect component
            label: __('Daily payout time', 'multivendorx'),
            addonBefore:__('At', 'multivendorx'),
            description: __('Once per day<br/>Run payouts at:', 'multivendorx'),
            defaultValue: '09:00', // optional: default payout time
            dependent: {
                key: 'payment_schedules', // only show if payment schedule is daily
                set: true,
                value: 'daily',
            },
            size: '6rem',
            proSetting: false, // set true if this is a Pro feature
        },
        {
            key: 'disbursement_weekly', // main key for weekly nested
            type: 'nested',
            label: __('Weekly disbursement', 'multivendorx'), // main label
            single: true,
            desc: __(
                'Once per week: Select the day and time of the week for store commissions payout.',
                'multivendorx'
            ),
            nestedFields: [
                {
                    key: 'weekly_payout_day', // day of week toggle
                    type: 'dropdown',
                    addonBefore:__('On', 'multivendorx'),
                    description: __('Select the day of the week for payouts:', 'multivendorx'),
                    options: [
                        { key: 'sunday', label: __('Sunday', 'multivendorx'), value: 'sunday' },
                        { key: 'monday', label: __('Monday', 'multivendorx'), value: 'monday' },
                        { key: 'tuesday', label: __('Tuesday', 'multivendorx'), value: 'tuesday' },
                        { key: 'wednesday', label: __('Wednesday', 'multivendorx'), value: 'wednesday' },
                        { key: 'thursday', label: __('Thursday', 'multivendorx'), value: 'thursday' },
                        { key: 'friday', label: __('Friday', 'multivendorx'), value: 'friday' },
                        { key: 'saturday', label: __('Saturday', 'multivendorx'), value: 'saturday' },
                    ],
                },
                {
                    key: 'weekly_payout_time', // time of day
                    type: 'time', // links to TimeSelect component
                    addonBefore: __('at', 'multivendorx'),
                    description: __('Select the time of day for weekly payouts.', 'multivendorx'),
                    defaultValue: '09:00',
                },
            ],
            dependent: {
                key: 'payment_schedules', // show only if weekly
                set: true,
                value: 'weekly',
            },
        },
        {
            key: 'withdrawals_fees',
            type: 'nested',
            label: __('Free withdrawals and fees', 'multivendorx'),
            single: true,
            settingDescription: __(
                'Control how many times stores can withdraw without fees.',
                'multivendorx'
            ),
            nestedFields: [
                {
                    key: 'free_withdrawals', // updated key
                    type: 'number',
                    size: '5rem',
                    options: [
                        {
                            key: 'free_withdrawals',
                            value: 'free_withdrawals',
                        },
                    ],
                    addonBefore: __('Stores get', 'multivendorx'),
                    addonAfter: __('free withdrawals. After that, each withdrawal costs', 'multivendorx'),
                },
                {
                    key: 'withdrawal_fixed', // updated key
                    type: 'number',
                    size: '8rem',
                    prefixUnit: __('$', 'multivendorx'),
                    addonBefore: 'Fixed',
                    addonAfter: "+",
                },
                {
                    key: 'withdrawal_percentage', // updated key
                    type: 'number',
                    size: '8rem',
                    parameter: __('%', 'catalogx'),
                },
            ],
        },
        
    ],
}
