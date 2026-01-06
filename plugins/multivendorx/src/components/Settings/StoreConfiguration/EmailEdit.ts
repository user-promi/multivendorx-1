import { __ } from '@wordpress/i18n';

export default {
    id: 'email-edit',
    priority: 10,
    name: __('Email Template Customizer', 'multivendorx'),
    desc: __(
        'Edit and manage individual email templates used across the marketplace.',
        'multivendorx'
    ),
    icon: 'adminfont-store-seo',
    submitUrl: 'settings',
    modal: [
        {
			key: 'store_registration_from',
			type: 'email-template',
			desc: 'Customise personalised store registration form for marketplace.',
		},
    ]
};
