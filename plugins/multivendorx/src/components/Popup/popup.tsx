/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './popup.scss';

const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Upgrade Your Plan',
        'multivendorx'
    ),
    moreText: __( 'More surprises? Oh yes.', 'multivendorx' ),
    messages: [
        {
            icon: 'popup-icon-double-opt-in',
            text: __( 'Double Opt-in.', 'multivendorx' ),
        },
        {
            icon: 'popup-icon-ban-spam-mail',
            text: __( 'Ban Spam Mail.', 'multivendorx' ),
        },
        {
            icon: 'popup-icon-export-subscribers',
            text: __( 'Export Subscribers.', 'multivendorx' ),
        },
        {
            icon: 'popup-icon-subscription-dashboard',
            text: __( 'Subscription Dashboard.', 'multivendorx' ),
        },
        {
            icon: 'popup-icon-mailchimp',
            text: __( 'MailChimp Integration.', 'multivendorx' ),
        },
        {
            icon: 'popup-icon-recaptcha',
            text: __( 'Recaptcha Support.', 'multivendorx' ),
        },
        {
            icon: 'popup-icon-subscription-dashboard',
            text: __( 'Subscription Details.', 'multivendorx' ),
        },
        {
            icon: 'popup-icon-export-import',
            text: __( 'Export/Import Stock.', 'multivendorx' ),
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
            link: 'https://multivendorx.com/checkout/$399'
        },
    ]
};

const ShowProPopup: React.FC = () => {
    return <ProPopup { ...proPopupContent } />;
};

export default ShowProPopup;
