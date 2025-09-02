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
            label: __('Eligible order statuses', 'multivendorx'),
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
            label: __('Payout Method', 'multivendorx'),
			settingDescription: __("Select the frequency at which store commissions are automatically transferred from the admin account via PayPal Payouts, PayPal MassPay, or Stripe.",'multivendorx'),
             desc: __("<ul><li>Manual – Payments are not scheduled automatically. The admin can pay vendors manually or vendors can request withdrawals.</li><li>Automatic (Hourly, Daily, Weekly, Fortnightly, Monthly) – Earnings are transferred automatically from the admin account to vendor accounts at the selected interval.</li></ul>",'multivendorx'),
            options: [
                {
                    key: 'instantly',
                    label: __('Instantly', 'multivendorx'),
                    value: 'instantly',
                },
                {
                    key: 'waitting',
                    label: __('Waitting', 'multivendorx'),
                    value: 'waitting',
                },
            ],
        },
		{
            key: 'payment_schedule',
            type: 'setting-toggle',
            label: __('Scheduler', 'multivendorx'),
			settingDescription: __("Select the frequency at which store commissions are automatically transferred from the admin account via PayPal Payouts, PayPal MassPay, or Stripe.",'multivendorx'),
             desc: __("<ul><li>Manual – Payments are not scheduled automatically. The admin can pay vendors manually or vendors can request withdrawals.</li><li>Automatic (Hourly, Daily, Weekly, Fortnightly, Monthly) – Earnings are transferred automatically from the admin account to vendor accounts at the selected interval.</li></ul>",'multivendorx'),
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
            label: __('Lock period', 'multivendorx'),
            desc: __(
                  'If enabled, vendor’s net earning will include both commission and shipping fees.','multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'commission_percentage',
                    value: 'give_shipping',
                },
            ],
            look: 'toggle',
        },
		{
            key: 'payout_threshold_time',
            label: __('Minimum payout threshold', 'multivendorx'),
            desc: __(
                  'If enabled, vendor’s net earning will include both commission and shipping fees.','multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'commission_percentage',
                    value: 'give_shipping',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __('Payout timing and eligibility', 'multivendorx'),
            desc: __('Define when earnings become available for payout based on order status', 'multivendorx')
        },
        {
            key: 'commission_by_product_price',
            type: 'nested',
            single: true,
            label: 'Withdrawal rules',
            nestedFields: [
              
                {
                    key: 'commission_threshold_time',
                    type: 'multi-number',
                    label: __('Free withdrawal', 'multivendorx'),
                    options: [
                        {
                            key: 'commission_percentage',
                            type: 'number',
                        },
                    ],
                },
                {
                    key: 'commission_threshold_time',
                    type: 'multi-number',
                    label: __('Processing fee', 'multivendorx'),
                    options: [
                        {
                            key: 'commission_percentage',
                            type: 'number',
                        },
                    ],
                },
            ],
        },
      
    ],
};
