/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './popup.scss';

interface PopupProps {
    moduleName?: string;
}

const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Your students will love this!',
        'multivendorx'
    ),
    moreText: __('Better courses, bigger profits', 'multivendorx'),
    upgradeBtnText: __('Yes, Upgrade Me!', 'multivendorx'),
    messages: [
        {   
            icon: 'adminlib-Bulk-Course-Sync',
            text: __('Bulk Course Sync', 'moowoodle'),
            des: __('Sync multiple Moodle™ courses to WordPress with one click.', 'moowoodle'),
        },
        {   
            icon: 'adminlib-classroom-enrollment',
            text: __('Cohort Enrollment', 'moowoodle'),
            des: __('Sell and enroll entire Moodle™ cohorts via WooCommerce.', 'moowoodle'),
        },
        {   
            icon: 'adminlib-cohort',
            text: __('Group Enrollment', 'moowoodle'),
            des: __('Map course variations to Moodle™ groups for targeted enrollment.', 'moowoodle'),
        },
        {   
            icon: 'adminlib-global-community',
            text: __('Classroom Enrollment', 'moowoodle'),
            des: __('Buy multiple seats and assign them to students or teams.', 'moowoodle'),
        },
        {   
            icon: 'adminlib-Gift-a-Course',
            text: __('Gift a Course', 'moowoodle'),
            des: __('Let customers purchase and gift courses to others.', 'moowoodle'),
        },
        {   
            icon: 'adminlib-Single-Sign-On',
            text: __('Single Sign-On (SSO)', 'moowoodle'),
            des: __('Access Moodle™ and WordPress with one login.', 'moowoodle'),
        },
        {
            icon: 'adminlib-Single-Sign-On',
            text: __('Smart Course Sync', 'moowoodle'),
            des: __('Keep course details updated between Moodle™ and WordPress.', 'moowoodle'),
        },
        {
            icon: 'adminlib-subscription-courses',
            text: __('Subscription Courses', 'moowoodle'),
            des: __('Offer courses with recurring subscription plans.', 'moowoodle'),
        },
        {
            icon: 'adminlib-user-network-icon',
            text: __('Unified Access', 'moowoodle'),
            des: __('Give learners one dashboard for all their courses.', 'moowoodle'),
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

const ShowProPopup: React.FC< PopupProps > = (props) => {
    console.log(appLocalizer);
    const modulePopupContent = {
        moduleName: props.moduleName,
        message: sprintf(
            /* translators: %s: Module name */
            __(
                'This feature is currently unavailable. To activate it, please enable the %s',
                'catalogx'
            ),
            props.moduleName
        ),
        moduleButton: __( 'Enable Now', 'catalogx' ),
        modulePageUrl:
            typeof appLocalizer !== 'undefined'
                ? `${appLocalizer.module_page_url}&module=${props.moduleName}`
                : '#',
    };

    return (
        <>
            { props.moduleName ? (
                <ProPopup { ...modulePopupContent } />
            ) : (
                <ProPopup { ...proPopupContent } />
            ) }
        </>
    );
};

export default ShowProPopup;
