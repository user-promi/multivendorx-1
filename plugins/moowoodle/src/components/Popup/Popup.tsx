/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './Popup.scss';
const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __('Your students will love this!', 'moowoodle'),
    moreText: __('Better courses, bigger profits', 'moowoodle'),
    upgradeBtnText: __('Yes, Upgrade Me!', 'moowoodle'),
    messages: [
        {
            text: __('Bulk Course Sync', 'moowoodle'),
            des: __('Sync multiple Moodle™ courses to WordPress with one click.', 'moowoodle'),
        },
        {
            text: __('Cohort Enrollment', 'moowoodle'),
            des: __('Sell and enroll entire Moodle™ cohorts via WooCommerce.', 'moowoodle'),
        },
        {
            text: __('Group Enrollment', 'moowoodle'),
            des: __('Map course variations to Moodle™ groups for targeted enrollment.', 'moowoodle'),
        },
        {
            text: __('Classroom Enrollment', 'moowoodle'),
            des: __('Buy multiple seats and assign them to students or teams.', 'moowoodle'),
        },
        {
            text: __('Gift a Course', 'moowoodle'),
            des: __('Let customers purchase and gift courses to others.', 'moowoodle'),
        },
        {
            text: __('Single Sign-On (SSO)', 'moowoodle'),
            des: __('Access Moodle™ and WordPress with one login.', 'moowoodle'),
        },
        {
            text: __('Smart Course Sync', 'moowoodle'),
            des: __('Keep course details updated between Moodle™ and WordPress.', 'moowoodle'),
        },
        {
            text: __('Subscription Courses', 'moowoodle'),
            des: __('Offer courses with recurring subscription plans.', 'moowoodle'),
        },
        {
            text: __('Unified Access', 'moowoodle'),
            des: __('Give learners one dashboard for all their courses.', 'moowoodle'),
        },
    ],
    btnLink: appLocalizer.products_link,
};

const ShowProPopup: React.FC = () => {
    return <ProPopup {...proPopupContent} />;
};

export default ShowProPopup;
