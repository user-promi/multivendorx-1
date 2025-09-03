import { __ } from '@wordpress/i18n';

export default {
    id: 'setup-widget',
    priority: 3,
    name: __( 'Setup Widget', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [   

        
    ],
};
