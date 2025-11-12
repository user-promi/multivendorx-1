import { __ } from '@wordpress/i18n';


export default {
    id: 'notification-configuration',
    priority: 5,
    name: __('Notification Configuration', 'multivendorx'),
    desc: __('Define what each store role can access and manage within the marketplace.', 'multivendorx'),
    icon: 'adminlib-user-network-icon',
    submitUrl: 'settings',
    modal: [
        // ===== Email Section =====
        {
            key: 'email_section',
            type: 'section',
            hint: __('The email provider used to deliver marketplace notifications is specified here.', 'multivendorx'),
        },
        {
            key: 'sender_name',
            type: 'text',
            label: __('Sender Name', 'multivendorx'),
            desc: __('The name displayed in outgoing emails is assigned. Test emails can be sent to confirm delivery.', 'multivendorx'),
        },
        {
            key: 'sender_email',
            type: 'text',
            label: __('Sender Email', 'multivendorx'),
            desc: __('The email address from which notifications are sent is provided. Test emails can be sent to confirm delivery.', 'multivendorx'),
        },

        // ===== SMS Section =====
        {
            key: 'sms_section',
            type: 'section',
            hint: __('The SMS gateway used to send text notifications is defined here.', 'multivendorx'),
        },
        {
            key: 'sender_phone',
            type: 'text',
            label: __('Sender Phone / ID', 'multivendorx'),
            desc: __('The phone number or sender ID used for outgoing SMS is assigned. Test SMS messages can be sent to confirm delivery.', 'multivendorx'),
        },
    ]
}