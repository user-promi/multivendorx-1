import { __ } from '@wordpress/i18n';
import google from '../../../assets/images/google.png';
import mapbox from '../../../assets/images/mapbox-logo.png';

export default {
    id: 'notii',
    priority: 1,
    name: 'Notifications',
    desc: __('Help customers discover stores and products near them by enabling location-based search and maps.', 'multivendorx'),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
    ],
};
