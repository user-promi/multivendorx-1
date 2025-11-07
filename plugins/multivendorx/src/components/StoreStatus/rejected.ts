import { __ } from '@wordpress/i18n';

export default {
    id: 'rejected',
    priority: 2,
    name: __('Rejected', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'rejected_msg',
            label: 'Message shown to rejected stores',
            type:'text',
            des: 'What rejected stores can do',
        },
    ],
};
