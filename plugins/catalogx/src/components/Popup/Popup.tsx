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
            icon: 'popup-icon-personalized-pricing',
            text: __( 'Send Custom Quotes', 'catalogx' ),
        },
        {
            icon: 'popup-icon-exclusive-forms',
            text: __(
                'Wholesale Order Forms',
                'catalogx'
            ),
        },
        {
            icon: 'popup-icon-multiple-products',
            text: __(
                'Enquiry Cart',
                'catalogx'
            ),
        },
        {
            icon: 'popup-icon-add-file-uploads',
            text: __(
                'Advanced Enquiry Forms',
                'catalogx'
            ),
        },
        {
            icon: 'popup-icon-different-users',
            text: __(
                'Role-Based Pricing',
                'catalogx'
            ),
        },
        {
            icon: 'popup-icon-dynamic-pricing',
            text: __(
                'Category-Based Discounts',
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
