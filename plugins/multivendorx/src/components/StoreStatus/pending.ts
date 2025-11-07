import { __ } from '@wordpress/i18n';

export default {
    id: 'pending-approval',
    priority: 1,
    name: __('Pending Approval', 'multivendorx'),
    desc: '',
    icon: 'adminlib-store-inventory',
    submitUrl: 'settings',
    modal: [
        {
            key: 'pending_msg',
            label: 'Message shown to pending stores:',
            type: 'text',
            des: 'What pending stores can do',
        },
    ],
};
