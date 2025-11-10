import { __ } from '@wordpress/i18n';


export default {
    id: 'sms-configuration',
    priority: 6,
    name: __('SMS Configuration', 'multivendorx'),
    desc: __('Define what each store role can access and manage within the marketplace.', 'multivendorx'),
    icon: 'adminlib-user-network-icon',
    submitUrl: 'settings',
    modal: [
    ]
}