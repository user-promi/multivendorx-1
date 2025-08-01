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
    messages: [
        {
            icon: 'popup-icon-smart-course-sync',
            text: __( 'Speed up sales with personalized quotes', 'catalogx' ),
        },
        {
            icon: 'popup-icon-classroom-enrollment',
            text: __(
                'Enable multiple product enquiries at once to boost customer engagement',
                'catalogx'
            ),
        },
        {
            icon: 'popup-icon-gift-course',
            text: __(
                'Advanced enquiry messaging with file uploads, tagging, etc',
                'catalogx'
            ),
        },
        {
            icon: 'popup-icon-sign',
            text: __(
                'Increase revenue with tailored pricing for different user roles',
                'catalogx'
            ),
        },
        {
            icon: 'popup-icon-course-sync',
            text: __(
                'Drive higher sales with customized pricing for product categories',
                'catalogx'
            ),
        },
    ],
};

const ShowPopup: React.FC< PopupProps > = ( props ) => {
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
            { props.moduleName ? (
                <ProPopup { ...modulePopupContent } />
            ) : (
                <ProPopup { ...proPopupContent } />
            ) }
        </>
    );
};

export default ShowPopup;
