/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './popup.scss';

interface PopupProps {
    moduleName?: string;
    wooSetting?:string;
    wooLink?: string,
}

export const proPopupContent = {
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
            text: __('Bulk Course Sync', 'multivendorx'),
            des: __('Sync multiple Moodle™ courses to WordPress with one click.', 'multivendorx'),
        },
        {
            icon: 'adminlib-classroom-enrollment',
            text: __('Cohort Enrollment', 'multivendorx'),
            des: __('Sell and enroll entire Moodle™ cohorts via WooCommerce.', 'multivendorx'),
        },
        {
            icon: 'adminlib-cohort',
            text: __('Group Enrollment', 'multivendorx'),
            des: __('Map course variations to Moodle™ groups for targeted enrollment.', 'multivendorx'),
        },
        {
            icon: 'adminlib-global-community',
            text: __('Classroom Enrollment', 'multivendorx'),
            des: __('Buy multiple seats and assign them to students or teams.', 'multivendorx'),
        },
        {
            icon: 'adminlib-Gift-a-Course',
            text: __('Gift a Course', 'multivendorx'),
            des: __('Let customers purchase and gift courses to others.', 'multivendorx'),
        },
        {
            icon: 'adminlib-Single-Sign-On',
            text: __('Single Sign-On (SSO)', 'multivendorx'),
            des: __('Access Moodle™ and WordPress with one login.', 'multivendorx'),
        },
        {
            icon: 'adminlib-Single-Sign-On',
            text: __('Smart Course Sync', 'multivendorx'),
            des: __('Keep course details updated between Moodle™ and WordPress.', 'multivendorx'),
        },
        {
            icon: 'adminlib-subscription-courses',
            text: __('Subscription Courses', 'multivendorx'),
            des: __('Offer courses with recurring subscription plans.', 'multivendorx'),
        },
        {
            icon: 'adminlib-user-network-icon',
            text: __('Unified Access', 'multivendorx'),
            des: __('Give learners one dashboard for all their courses.', 'multivendorx'),
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

const ShowProPopup: React.FC<PopupProps> = (props) => {
    const modulePopupContent = {
        moduleName: props.moduleName,
        message: sprintf(
            /* translators: %s: Module name */
            __(
                'This feature is currently unavailable. To activate it, please enable the %s',
                'multivendorx'
            ),
            props.moduleName
        ),
        moduleButton: __('Enable Now', 'multivendorx'),
        modulePageUrl:
            typeof appLocalizer !== 'undefined'
                ? `${appLocalizer.module_page_url}&module=${props.moduleName}`
                : '#',
    };

    const wooPopupContent = {
        wooSetting: props.wooSetting,
        message: sprintf(
            __('To enable this feature, please configure WooCommerce settings: %s', 'multivendorx'),
            props.wooSetting
        ),
        wooButton: __('Go to WooCommerce Settings', 'multivendorx'),
        wooPageUrl:
            typeof appLocalizer !== 'undefined' && props.wooLink
                ? `${appLocalizer.site_url}/wp-admin/admin.php?${props.wooLink}`
                : '#',
    };
    return (
        <>
            {props.moduleName ? (
                <ProPopup {...modulePopupContent} />
            ) : props.wooSetting ? (
                <ProPopup {...wooPopupContent} />
            ) : (
                <ProPopup {...proPopupContent} />
            )}
        </>
    );

};

export default ShowProPopup;
