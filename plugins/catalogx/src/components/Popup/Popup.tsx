import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';

const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Unlock revenue-boosting features with CatalogX Pro today!',
        'catalogx'
    ),
    messages: [
        __('Speed up sales with personalized quotes.', 'catalogx'),
        __(
            'Boost bulk sales with exclusive pricing and wholesale order forms.',
            'catalogx'
        ),
        __(
            'Enable multiple product enquiries at once to boost customer engagement.',
            'catalogx'
        ),
        __(
            'Advanced enquiry messaging with file uploads, tagging, etc.',
            'catalogx'
        ),
        __(
            'Increase revenue with tailored pricing for different user roles.',
            'catalogx'
        ),
        __(
            'Drive higher sales with customized pricing for product categories.',
            'catalogx'
        ),
    ],
};

const ShowProPopup: React.FC = () => {
    return <ProPopup {...proPopupContent} />;
};

export default ShowProPopup;
