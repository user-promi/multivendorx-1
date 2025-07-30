import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './Popup.scss';

interface PopupProps {
    moduleName?: string;
}

export const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Unlock revenue-boosting features with CatalogX Pro today!',
        'catalogx'
    ),
    // messages: [
    //     { text: __('Speed up sales with personalized quotes.', 'catalogx') },
    //     {
    //         text: __(
    //             'Boost bulk sales with exclusive pricing and wholesale order forms.',
    //             'catalogx'
    //         ),
    //     },
    //     {
    //         text: __(
    //             'Enable multiple product enquiries at once to boost customer engagement.',
    //             'catalogx'
    //         ),
    //     },
    //     {
    //         text: __(
    //             'Advanced enquiry messaging with file uploads, tagging, etc.',
    //             'catalogx'
    //         ),
    //     },
    //     {
    //         text: __(
    //             'Increase revenue with tailored pricing for different user roles.',
    //             'catalogx'
    //         ),
    //     },
    //     {
    //         text: __(
    //             'Drive higher sales with customized pricing for product categories.',
    //             'catalogx'
    //         ),
    //     },
    // ],
    messages: [
        { icon: 'popup-icon-smart-course-sync', text: __('Bulk Course Sync.', 'moowoodle') },
        { icon: 'popup-icon-classroom-enrollment', text: __('Classroom Enrollment.', 'moowoodle') },
        { icon: 'popup-icon-gift-course', text: __('Gift a Course.', 'moowoodle') },
        { icon: 'popup-icon-sign', text: __('Single Sign-On.', 'moowoodle') },
        { icon: 'popup-icon-course-sync', text: __('Smart Course Sync.', 'moowoodle') },
        { icon: 'popup-icon-subscription-courses', text: __('Subscription Courses.', 'moowoodle') },
        { icon: 'popup-icon-unified-access', text: __('Unified Access.', 'moowoodle') },
    ],
};

const ShowPopup: React.FC<PopupProps> = (props) => {
    const modulePopupContent = {
        moduleName: props.moduleName,
        message: sprintf(
            'To activate please enable the %s module first',
            props.moduleName
        ),
        moduleButton: 'Enable Now',
        modulePageUrl:
            typeof appLocalizer !== 'undefined'
                ? appLocalizer.module_page_url
                : '#',
    };

    return (
        <>
            {props.moduleName ? (
                <ProPopup {...modulePopupContent} />
            ) : (
                <ProPopup {...proPopupContent} />
            )}
        </>
    );
};

export default ShowPopup;
