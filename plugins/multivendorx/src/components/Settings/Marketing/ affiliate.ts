import { __ } from '@wordpress/i18n';

export default {
    id: ' affiliate',
    priority: 3,
    name: __( 'Affiliate', 'multivendorx' ),
    desc: __( 'Decide if affiliate payouts reduce the admin’s commission share or the vendor’s sales earnings.', 'multivendorx' ),
    icon: 'adminlib-setting',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_store',
            type: 'setting-toggle',
            label: __( 'Who Pays Affiliate Commissions', 'multivendorx' ),
            desc: __(
                'Select who is responsible for paying affiliate referral commissions.:<ul><li>Admin – Commission is paid by the admin.</li><li>Store – Commission is paid by the vendor.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'admin',
                    label: __( 'Admin', 'multivendorx' ),
                    value: 'admin',
                },
                {
                    key: 'store',
                    label: __( 'Store', 'multivendorx' ),
                    value: 'store',
                },
            ],
        },
    ],
};
