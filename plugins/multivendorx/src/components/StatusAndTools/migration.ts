import { __ } from '@wordpress/i18n';

export default {
    id: 'migration',
    priority: 6,
    name: __( 'Migration', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [         
        {
            key: 'migrate',
            type: 'button',
            name: __( 'Multivendor Migrate', 'multivendorx' ),
            label: __( 'Multivendor Migration', 'multivendorx' ),
            desc: __(
                'With this tool, you can transfer valuable data from your previous marketplace',
                'multivendorx'
            ),
        },

        
    ],
};
