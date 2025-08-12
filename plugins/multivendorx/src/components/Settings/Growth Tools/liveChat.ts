import { __ } from '@wordpress/i18n';

export default {
    id: 'live-chat',
    priority: 3,
    name: __( 'Live Chat', 'multivendorx' ),
    desc: __( 'Live Chat', 'multivendorx' ),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        
        {
            key: 'chat_provider',
            type: 'setting-toggle',
            label: __( 'Chat Platform Integration', 'multivendorx' ),
            desc: __(
                'Select your preferred chat provider for handling customer inquiries',
                'multivendorx'
            ),
            options: [
                {
                    key: 'facebook',
                    label: __( 'Facebook Messenger', 'multivendorx' ),
                    value: 'facebook',
                },
                {
                    key: 'talkjs',
                    label: __( 'Talkjs', 'multivendorx' ),
                    value: 'talkjs',
                },
                {
                    key: 'whatsapp',
                    label: __( 'Whatsapp', 'multivendorx' ),
                    value: 'whatsapp',
                },
            ],
        },
        {
            key: 'whatsapp_opening_pattern',
            type: 'select',
            label: __( 'Opening Pattern', 'multivendorx' ),
            options: [
                {
                    key: 'browser',
                    label: __( 'Browser', 'multivendorx' ),
                    value: 'browser',
                },
                {
                    key: 'app',
                    label: __( 'App', 'multivendorx' ),
                    value: 'app',
                },
            ],
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'whatsapp_pre_filled',
            type: 'textarea',
            desc: __(
                'Text that appears in the WhatsApp Chat window. Add variables {store_name}, {store_url} to replace with store name, store url.',
                'multivendorx'
            ),
            label: __( 'Pre-filled Message', 'multivendorx' ),
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'app_id',
            type: 'text',
            label: __( 'App ID', 'multivendorx' ),
            desc: __( 'Enter app generated app id here.', 'multivendorx' ),
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'app_secret',
            type: 'text',
            label: __( 'App Secret', 'multivendorx' ),
            desc: __(
                `<br>** <a target="_blank" href="https://talkjs.com/dashboard">${ __(
                    'Click here',
                    'multivendorx'
                ) }</a>${ __(
                    ' to get your above App ID and App Secret',
                    'multivendorx'
                ) }`
            ),
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'messenger_color',
            type: 'color',
            label: __( 'Messenger Color', 'multivendorx' ),
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'product_page_chat',
            type: 'select',
            label: __( 'Chat Button on Product Page', 'multivendorx' ),
            desc: __(
                'Choose your preferred place to display chat button.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'add_to_cart_button',
                    label: __( 'Add to Cart Button', 'multivendorx' ),
                    value: 'add_to_cart_button',
                },
                {
                    key: 'store_info',
                    label: __( 'Store Details Tab', 'multivendorx' ),
                    value: 'store_info',
                },
                {
                    key: 'none',
                    label: __( 'Hide', 'multivendorx' ),
                    value: 'none',
                },
            ],
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
    ],
};
