import { __ } from '@wordpress/i18n';

export default {
    id: 'setup-widget',
    priority: 5,
    name: __( 'Setup Widget', 'multivendorx' ),
    desc: __(
        'Data from your previous marketplace can be seamlessly transferred using this migration tool.',
        'multivendorx'
    ),
    icon: 'adminlib-setup',
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
