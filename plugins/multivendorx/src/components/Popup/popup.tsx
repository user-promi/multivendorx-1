/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './popup.scss';

const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Your students will love this!',
        'multivendorx'
    ),
    moreText: __( 'Better courses, bigger profits', 'multivendorx' ),
    upgradeBtnText: __( 'Yes, Upgrade Me!', 'multivendorx' ),
    messages: [
        {
            text: __( 'Bulk Course Sync', 'multivendorx' ),
            des: __( 'Sync multiple Moodle™ courses to WordPress with one click.', 'multivendorx' ),
        },
        {
            text: __( 'Cohort Enrollment', 'multivendorx' ),
            des: __( 'Sell and enroll entire Moodle™ cohorts via WooCommerce.', 'multivendorx' ),
        },
    ],
    btnLink: [
        {
            site: '1',
            price: '$299',
            link: 'https://multivendorx.com/checkout/'
        },
        {
            site: '3',
            price: '$399',
            link: 'https://multivendorx.com/checkout/$399'
        },
        {
            site: '10',
            price: '$599',
            link: 'https://multivendorx.com/checkout/$599'
        },
    ]
};

const ShowProPopup: React.FC = () => {
    return <ProPopup { ...proPopupContent } />;
};

export default ShowProPopup;
