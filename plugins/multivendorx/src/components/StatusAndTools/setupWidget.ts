import { __ } from '@wordpress/i18n';

export default {
    id: 'setup-widget',
    priority: 5,
    name: __( 'Setup widget', 'multivendorx' ),
    desc: __(
        'Data from your previous marketplace can be seamlessly transferred using this migration tool.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [   

        {
            key: 'setup_wizard',
            type: 'button',
            name: __( 'Setup wizard', 'multivendorx' ),
            label: __( 'Run setup wizard', 'multivendorx' ),
            desc: __(
                'Launch the step-by-step wizard to configure your marketplace quickly and effortlessly.',
                'multivendorx'
            ),
            link: appLocalizer.setup_wizard_url
        }
        
    ],
};
