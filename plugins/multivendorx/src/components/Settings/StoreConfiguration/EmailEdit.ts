import { __ } from '@wordpress/i18n';

export default {
    id: 'email-edit',
    priority: 10,
    name: __('Email Editor', 'multivendorx'),
    desc: __(
        'Enable stores to enhance their product visibility using advanced third-party SEO plugins.',
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
