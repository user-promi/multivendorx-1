import { __ } from '@wordpress/i18n';

export default {
    id: 'setup-widget',
    priority: 5,
    name: __( 'Setup Widget', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [   

        {
            key: 'setup_wizard',
            type: 'button',
            name: __( 'Setup Wizard', 'multivendorx' ),
            label: __( 'Run Setup Wizard', 'multivendorx' ),
            desc: __(
                'Follow this wizard to configure your marketplace step by step',
                'multivendorx'
            ),
            link: appLocalizer.setup_wizard_url
        }
        
    ],
};
