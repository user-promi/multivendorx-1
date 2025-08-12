import { __ } from '@wordpress/i18n';

export default {
    id: 'identity-verification',
    priority: 7,
    name: __( 'Verification', 'mvx-pro' ),
    desc: __(
        'Enable various forms of identity verification for stores and ensure a trusted marketplace.',
        'mvx-pro'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'verification_methods',
            type: 'verification-methods', // custom type
            label: 'Verification Methods',
            addButtonLabel: 'Add Verification Method',
            deleteButtonLabel: 'Remove',
            nestedFields: [
              { key: 'label', type: 'text', label: 'Label', placeholder: 'Enter label' },
              { key: 'required', type: 'checkbox', label: 'Required' },
              { key: 'active', type: 'checkbox', label: 'Active' },
            ],
          },          
        {
            key: 'badge_img',
            type: 'file',
            label: __( 'Verified badge', 'mvx-pro' ),
            width: 75,
            height: 75,
            desc: __(
                'Upload (32px height) size badge that will appear next to verified stores for credibility.',
                'mvx-pro'
            ),
        },
        {
            key: 'unverified_store_access',
            type: 'checkbox',
            label: __( 'Unverified Restrictions', 'mvx-pro' ),
            desc: __( 'Select the restrictions you want to apply to stores who have not yet completed their verification process.', 'mvx-pro' ),
            options: [
                {
                    key: 'endpoint_control',
                    label: __( 'Restrict access to other pages', 'mvx-pro' ),
                    value: 'endpoint_control',
                },
                {
                    key: 'redirect_verification_page',
                    label: __( 'Redirect to verification page', 'mvx-pro' ),
                    value: 'redirect_verification_page',
                },
                {
                    key: 'disable_add_product_endpoint',
                    label: __( 'Prevent Product Upload', 'mvx-pro' ),
                    value: 'disable_add_product_endpoint',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Verification Method ',
                'multivendorx'
            ),
        },
        {
            key: 'payment_methods',
            type: 'payment-tabs',
            modal: [
                {
                  icon: 'ID',
                  label: 'Identity Verification',
                  connected: false,
                  desc: 'Verify user identity using government-issued documents or facial recognition. Ensures authenticity of users.',
                  formFields: [
                    { key: 'enabled', type: 'checkbox', label: 'Enable Identity Verification' },
                    { key: 'document_type', type: 'select', label: 'Document Type', options: [
                      { value: 'passport', label: 'Passport' },
                      { value: 'driver_license', label: 'Driver License' },
                      { value: 'id_card', label: 'ID Card' }
                    ]},
                    { key: 'require_facial_recognition', type: 'checkbox', label: 'Require Facial Recognition' },
                  ],
                },
                {
                  icon: 'EM',
                  label: 'Email Verification',
                  connected: true,
                  desc: 'Verify user email addresses to prevent fake registrations and enhance security.',
                  formFields: [
                    { key: 'enabled', type: 'checkbox', label: 'Enable Email Verification' },
                    { key: 'verification_link_expiry', type: 'number', label: 'Verification Link Expiry (hours)', placeholder: 'Enter expiry time' },
                    { key: 'send_reminders', type: 'checkbox', label: 'Send Reminder Emails' },
                  ],
                },
                {
                  icon: 'SO',
                  label: 'Social Verification',
                  connected: false,
                  desc: 'Allow users to verify via social media accounts like Facebook, Google, or LinkedIn.',
                  formFields: [
                    { key: 'enabled', type: 'checkbox', label: 'Enable Social Verification' },
                    { key: 'providers', type: 'select', label: 'Providers', options: [
                      { value: 'facebook', label: 'Facebook' },
                      { value: 'google', label: 'Google' },
                      { value: 'linkedin', label: 'LinkedIn' }
                    ]},
                    { key: 'require_multiple', type: 'checkbox', label: 'Require Multiple Verifications' },
                  ],
                }
              ]
              
        },
        {
            key: 'store_verification',
            type: 'checkbox',
            label: __( 'Legal Ideantity Checks', 'mvx-pro' ),
            desc: __( 'Choose the types of verification you want to enable for stores.', 'mvx-pro' ),
            options: [
                {
                    key: 'address_verification',
                    label: __( 'Address Verification', 'mvx-pro' ),
                    value: 'address_verification',
                },
                {
                    key: 'id_verification',
                    label: __( 'Identity Verification', 'mvx-pro' ),
                    value: 'id_verification',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Email Verification',
                'multivendorx'
            ),
        },
        {
            key: 'enable_email_verification',
            label: __('Enable Email Verification', 'multivendorx'),
            desc: __('Enable this to require users to verify their email address after registration.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'enable_email_verification',
                    value: 'enable_email_verification',
                },
            ],
            look: 'toggle',
        },

        // Registration Notice - Textarea
        {
            key: 'registration_notice',
            label: __('Registration Notice', 'multivendorx'),
            desc: __('This message will be displayed on the registration page.', 'multivendorx'),
            type: 'textarea',
            class: 'mvx-setting-textarea',
        },

        // Login Notice - Textarea
        {
            key: 'login_notice',
            label: __('Login Notice', 'multivendorx'),
            desc: __('This message will be shown on the login page.', 'multivendorx'),
            type: 'textarea',
            class: 'mvx-setting-textarea',
        },     
        {
            key: 'separator_content',
            type: 'section',
            hint: __(
                'Connect Google, Facebook, Twitter, LinkedIn accounts for added credibility.',
                'multivendorx'
            ),
        },
        {
            key: 'admin_template_settings',
            type: 'blocktext',
            label: __( 'no_label', 'mvx-pro' ),
            blocktext: __( 'Google', 'mvx-pro' ),
        },
        {
            key: 'google_enable',
            label: __( 'Enable', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Enable this social verification for store', 'mvx-pro' ),
            options: [
                {
                    key: 'google_enable',
                    value: 'google_enable',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'google_redirect_url',
            type: 'text',
            label: __( 'Redirect URI', 'mvx-pro' ),
            desc: __( 'User redirect URL after successfully authenticated.', 'mvx-pro' ),
            dependent: {
                key: 'google_enable',
                set: true,
            },
        },
        {
            key: 'google_client_id',
            type: 'text',
            label: __( 'Client ID', 'mvx-pro' ),
            desc: __( '', 'mvx-pro' ),
            dependent: {
                key: 'google_enable',
                set: true,
            },
        },
        {
            key: 'google_client_secret',
            type: 'text',
            label: __( 'Client Secret', 'mvx-pro' ),
            desc: __(
                `<br>**<a target="_blank" href="https://console.developers.google.com/project">${ __(
                    'Create an App',
                    'mvx-pro'
                ) }</a>${ __(
                    ' to get your above Client ID and Client Secret.',
                    'mvx-pro'
                ) }`
            ),
            dependent: {
                key: 'google_enable',
                set: true,
            },
        },        
        {
            key: 'separator_content',
            type: 'section',
        },
        {
            key: 'admin_template_settings',
            type: 'blocktext',
            label: __( 'no_label', 'mvx-pro' ),
            blocktext: __( 'Facebook', 'mvx-pro' ),
        },
        {
            key: 'facebook_enable',
            label: __( 'Enable', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Enable this social verification for store', 'mvx-pro' ),
            options: [
                {
                    key: 'facebook_enable',
                    value: 'facebook_enable',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'facebook_redirect_url',
            type: 'text',
            label: __( 'Redirect URI', 'mvx-pro' ),
            desc: __( 'User redirect URL after successfully authenticated.', 'mvx-pro' ),
            dependent: {
                key: 'facebook_enable',
                set: true,
            },
        },
        {
            key: 'facebook_client_id',
            type: 'text',
            label: __( 'App ID', 'mvx-pro' ),
            desc: __( '', 'mvx-pro' ),
            dependent: {
                key: 'facebook_enable',
                set: true,
            },
        },
        {
            key: 'facebook_client_secret',
            type: 'text',
            label: __( 'App Secret', 'mvx-pro' ),
            desc: __(
                `<br>**<a target="_blank" href="https://developers.facebook.com/apps/">${ __(
                    'Create an App',
                    'mvx-pro'
                ) }</a>${ __(
                    ' to get your above App ID and App Secret.',
                    'mvx-pro'
                ) }`
            ),
            dependent: {
                key: 'facebook_enable',
                set: true,
            },
        },
        
        {
            key: 'separator_content',
            type: 'section',
        },
        {
            key: 'admin_template_settings',
            type: 'blocktext',
            label: __( 'no_label', 'mvx-pro' ),
            blocktext: __( 'Twitter', 'mvx-pro' ),
        },
        {
            key: 'twitter_enable',
            label: __( 'Enable', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Enable this social verification for store', 'mvx-pro' ),
            options: [
                {
                    key: 'twitter_enable',
                    value: 'twitter_enable',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'twitter_redirect_url',
            type: 'text',
            label: __( 'Redirect URI', 'mvx-pro' ),
            desc: __( 'User redirect URL after successfully authenticated.', 'mvx-pro' ),
            dependent: {
                key: 'twitter_enable',
                set: true,
            },
        },
        {
            key: 'twitter_client_id',
            type: 'text',
            label: __( 'Consumer Key', 'mvx-pro' ),
            desc: __( '', 'mvx-pro' ),
            dependent: {
                key: 'twitter_enable',
                set: true,
            },
        },
        {
            key: 'twitter_client_secret',
            type: 'text',
            label: __( 'Consumer Secret', 'mvx-pro' ),
            desc: __(
                `<br>**<a target="_blank" href="https://apps.twitter.com/">${ __(
                    'Create an App',
                    'mvx-pro'
                ) }</a>${ __(
                    ' to get your above Consumer Key and Consumer Secret.',
                    'mvx-pro'
                ) }`
            ),
            dependent: {
                key: 'twitter_enable',
                set: true,
            },
            proSetting: true,
            moduleEnabled: 'identity-verification',
        },
        
        {
            key: 'separator_content',
            type: 'section',
        },
        {
            key: 'admin_template_settings',
            type: 'blocktext',
            label: __( 'no_label', 'mvx-pro' ),
            blocktext: __( 'Linkedin', 'mvx-pro' ),
        },
        {
            key: 'linkedin_enable',
            label: __( 'Enable', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Enable this social verification for store', 'mvx-pro' ),
            options: [
                {
                    key: 'linkedin_enable',
                    value: 'linkedin_enable',
                },
            ],
            look: 'toggle',
            proSetting: true,
            moduleEnabled: 'identity-verification',
        },
        {
            key: 'linkedin_redirect_url',
            type: 'text',
            label: __( 'Redirect URI', 'mvx-pro' ),
            desc: __( 'User redirect URL after successfully authenticated.', 'mvx-pro' ),
            dependent: {
                key: 'linkedin_enable',
                set: true,
            },
            proSetting: true,
            moduleEnabled: 'identity-verification',
        },
        {
            key: 'linkedin_client_id',
            type: 'text',
            label: __( 'Client ID', 'mvx-pro' ),
            desc: __( '', 'mvx-pro' ),
            dependent: {
                key: 'linkedin_enable',
                set: true,
            },
            proSetting: true,
            moduleEnabled: 'identity-verification',
        },
        {
            key: 'linkedin_client_secret',
            type: 'text',
            label: __( 'Client Secret', 'mvx-pro' ),
            desc: __(
                `<br>**<a target="_blank" href="https://www.linkedin.com/developer/apps">${ __(
                    'Create an App',
                    'mvx-pro'
                ) }</a>${ __(
                    ' to get your above Client ID and Client Secret.',
                    'mvx-pro'
                ) }`
            ),
            dependent: {
                key: 'linkedin_enable',
                set: true,
            },
            proSetting: true,
            moduleEnabled: 'identity-verification',
        },
        
    ],
};
