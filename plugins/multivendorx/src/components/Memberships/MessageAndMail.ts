import { __, sprintf } from '@wordpress/i18n';

export default {
    id: 'message-mail',
    priority: 1,
    name: __( 'Message/Mail', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [     
        {
            key: 'webhook_redirect_uri',
            type: 'blocktext',
            label: __( 'Config webhook URI', 'mvx-pro' ),
            blocktext: sprintf(
                __(
                    'To enable recurring subscriptions, you need to configure webhooks. Please navigate to the <a href="%s">webhook</a> settings and set your webhook URL : <br><code>%s</code><br><code>%s</code>',
                    'mvx-pro'
                ),
                appLocalizer.webhookLink,
                appLocalizer.queryUrl,
                appLocalizer.endpointUrl
            ),
        },
        {
            key: 'store_dashboard_page',
            type: 'select',
            label: __( 'Vendor Membership', 'multivendorx' ),
            desc: __(
                'Choose your preferred page for Vendor Membership List.',
                'multivendorx'
            ),
            options: appLocalizer.pages_list,
        },





        {
            key: '_payment_due_msg',
            label: __('Payment Due Message', 'mvx-pro'),
            type: 'text',
            desc: __('It will reminder when payment was due.', 'mvx-pro'),
            database_value: '',
        },
        {
            key: '_upcoming_renew_reminder_msg',
            label: __('Upcoming Renew Reminder Message', 'mvx-pro'),
            type: 'text',
            desc: __('It will reminder for upcoming renew.', 'mvx-pro'),
            database_value: '',
        },
        {
            key: '_after_grace_pariod_msg',
            label: __('Reminder Message After Grace Period', 'mvx-pro'),
            type: 'text',
            desc: __('Enter reminder message when grace period expired.', 'mvx-pro'),
            database_value: '',
        },
        {
            key: 'enable_email_notification',
            label: __('Enable Email Notification', 'mvx-pro'),
            type: 'checkbox',
            desc: __('Enable notification by email for vendor during end of the package expiration.', 'mvx-pro'),
            options: [
                {
                    key: 'enable_email_notification',
                    value: 'enable_email_notification',
                }
            ],
            look: 'toggle',
        },
        {
            key: 'no_of_days_email',
            label: __('No. of Day', 'mvx-pro'),
            type: 'text',
            desc: __('Before an email will be sent to the vendor.', 'mvx-pro'),
            database_value: '',
        }

    ],
};