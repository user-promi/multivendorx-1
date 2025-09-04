import { __ } from '@wordpress/i18n';

export default {
    id: 'version-control',
    priority: 6,
    name: __( 'Version Control', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [     

        
    ],
};
