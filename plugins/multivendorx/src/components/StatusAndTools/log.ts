import { __ } from '@wordpress/i18n';

export default {
    id: 'log',
    priority: 3,
    name: __( 'Log', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [         
        {
            key: 'multivendorx_adv_log',
            type: 'log',
            classes: 'log-section',
            apiLink: 'logs',
            fileName: 'error.txt',
        },

        
    ],
};
