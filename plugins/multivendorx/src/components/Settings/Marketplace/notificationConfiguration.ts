import { __ } from '@wordpress/i18n';


export default {
    id: 'notification-configuration',
    priority: 5,
    name: __('Notification Configuration', 'multivendorx'),
    desc: __('Define what each store role can access and manage within the marketplace.', 'multivendorx'),
    icon: 'adminlib-user-network-icon',
    submitUrl: 'settings',
    modal: [
        {
            key: 'name',
            type: 'text',
            label: __( 'Name', 'multivendorx' ),
            desc: __(
                '',
                'multivendorx'
            ),
        },  
        {
            key: 'email',
            type: 'text',
            label: __( 'Sender Email', 'multivendorx' ),
            desc: __(
                '',
                'multivendorx'
            ),
        },  
        {
            key: 'phone_number',
            type: 'text',
            label: __( 'Sender Phone', 'multivendorx' ),
            desc: __(
                '',
                'multivendorx'
            ),
        },  
    ]
}