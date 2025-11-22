import { __ } from '@wordpress/i18n';

export default {
    id: 'active',
    priority: 1,
    name: __('Active', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_promotion_limit',
            // label: __('What sellers can do', 'multivendorx'),
            type: 'nested',
            single: true,
            nestedFields: [
                {
                    key: 'paid_promotion_limit',
                    type: 'setup',
                    label: 'Configure store permissions',
                    desc: 'Control what dashboard sections and tools are available to active stores.',
                    link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-capability`,
                },
            ],
        },

    ],
};
