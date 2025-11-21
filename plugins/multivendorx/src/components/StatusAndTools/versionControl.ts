import { __ } from '@wordpress/i18n';

export default {
    id: 'version-control',
    priority: 3,
    name: __( 'Version control', 'multivendorx' ),
    desc: __(
        'Manage and switch plugin versions to restore or test previous releases when needed.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [     
    ],
};
