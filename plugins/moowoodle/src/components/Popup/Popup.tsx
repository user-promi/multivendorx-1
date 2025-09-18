/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './Popup.scss';
const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Your students will love this!',
        'moowoodle'
    ),
    moreText: __( 'Better courses, bigger profits', 'moowoodle' ),
    upgradeBtnText: __( 'Yes, Upgrade Me!', 'moowoodle' ),
    messages: [
        {
            text: __( 'Bulk Course Sync', 'moowoodle' ),
            des: __( 'Sync multiple Moodle™ courses to WordPress with one click.', 'moowoodle' ),
        },
        {
            text: __( 'Cohort Enrollment', 'moowoodle' ),
            des: __( 'Sell and enroll entire Moodle™ cohorts via WooCommerce.', 'moowoodle' ),
        },
    ],
    btnLink: appLocalizer.products_link,
};


const ShowProPopup: React.FC = () => {
    return <ProPopup {...proPopupContent} />;
};

export default ShowProPopup;
