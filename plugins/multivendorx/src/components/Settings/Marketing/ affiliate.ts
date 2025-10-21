import { __ } from '@wordpress/i18n';

export default {
    id: ' affiliate',
    priority: 4,
    name: __( 'Affiliate', 'multivendorx' ),
    desc: __( 'Decide whose share will be reduced when paying affiliate commissions. The payout can either be deducted from the admin’s commission or from the store’s earnings.', 'multivendorx' ),
    icon: 'adminlib-setting',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_store',
            type: 'setting-toggle',
            label: __( 'Who pays affiliate commissions', 'multivendorx' ),
            desc: __(
                'Select who is responsible for paying affiliate referral commissions:<ul><li>Admin - The marketplace admin pays affiliates for referrals.</li><li>Store - Individual stores pay affiliates for referrals generated through their products.</li></ul>',
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
