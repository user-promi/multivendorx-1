import { __ } from '@wordpress/i18n';

export default {
    id: 'extra',
    priority: 6,
    headerTitle: __( 'Extra', 'multivendorx' ),
    headerDescription: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'multivendorx'
    ),
    icon: 'adminlib-cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            label: __( 'Attachment', 'multivendorx' ),
            classes: 'gridTable',
            rows: [
                { key: 'allow_download_pdf', label: __( 'Download as PDF',   'multivendorx' ) },
                { key: 'attach_pdf_to_email', label: __( 'Attach with Email', 'multivendorx' ) },
            ],
            columns: [
                { 
                    key: 'enquiry_pdf_permission', 
                    type: 'checkbox', 
                    label: __( 'Enquiry', 'multivendorx' ), 
                    moduleEnabled: 'enquiry' 
                },
                { 
                    key: 'quote_pdf_permission',   
                    type: 'checkbox', 
                    label: __( 'Quote',   'multivendorx' ), 
                    moduleEnabled: 'quote'   
                },
            ],
            proSetting: false,
        },

        {
            key: 'business_hours',
            type: 'multi-checkbox-table',
            label: __('Shop Open & Close Timings', 'multivendorx'),
            toggles: [
                {
                    key: 'enable_store_time',
                    label: __('Enable Store Time', 'multivendorx'),
                    icon: 'clock',
                    group: 1,
                    effects: { hideTable: true }
                },
                {
                    key: 'enable_lunch_break',
                    label: __('Enable Lunch Break', 'multivendorx'),
                    icon: 'coffee',
                    group: 2
                },
                {
                    key: 'enable_split_shift',
                    label: __('Split Shift (2 Time Slots)', 'multivendorx'),
                    icon: 'split-shift',
                    group: 2
                }
            ],
            rows: [
                { 
                    key: 'sunday', 
                    label: __('Sunday', 'multivendorx'), 
                    enabledKey: 'active_days', 
                    inactiveMessage: __('Store closed on Sunday', 'multivendorx') 
                },
                { 
                    key: 'monday', 
                    label: __('Monday', 'multivendorx'), 
                    enabledKey: 'active_days' 
                },
                { 
                    key: 'tuesday', 
                    label: __('Tuesday', 'multivendorx'), 
                    enabledKey: 'active_days' 
                },
                { 
                    key: 'wednesday', 
                    label: __('Wednesday', 'multivendorx'), 
                    enabledKey: 'active_days' 
                },
                { 
                    key: 'thursday', 
                    label: __('Thursday', 'multivendorx'), 
                    enabledKey: 'active_days' 
                },
                { 
                    key: 'friday', 
                    label: __('Friday', 'multivendorx'), 
                    enabledKey: 'active_days' 
                },
                { 
                    key: 'saturday', 
                    label: __('Saturday', 'multivendorx'), 
                    enabledKey: 'active_days' 
                }
            ],
            columns: [
                {
                    key: 'user_role',
                    label: __('User Role', 'catalogx'),
                    type: 'multi-select',
                    // All select-specific props go here
                    options: [
                        { value: 'administrator', label: __('Administrator', 'catalogx') },
                        { value: 'editor', label: __('Editor', 'catalogx') },
                        { value: 'author', label: __('Author', 'catalogx') },
                    ],
                    maxVisibleItems: 2,
                    isClearable: true,
                    selectDeselect: true,
                    placeholder: __('Select roles...', 'catalogx'),
                    noOptionsText: __('No roles found', 'catalogx')
                },
                {
                    key: 'shift1',
                    label: __('First Shift', 'multivendorx'),
                    type: 'time',
                    // All time-specific props go here
                    format: '24h',
                    step: 900,
                    min: '09:00',
                    max: '17:00',
                    placeholder: 'HH:MM'
                },
                {
                    key: 'lunch_break',
                    label: __('Lunch Break', 'multivendorx'),
                    type: 'time',
                    visibleWhen: 'enable_lunch_break',
                    // Time-specific props for lunch break
                    format: '24h',
                    step: 900,
                    min: '12:00',
                    max: '14:00',
                    placeholder: 'HH:MM'
                },
                {
                    key: 'shift2',
                    label: __('Second Shift', 'multivendorx'),
                    type: 'time',
                    visibleWhen: 'enable_split_shift',
                    // Time-specific props for second shift
                    format: '24h',
                    step: 900,
                    min: '14:00',
                    max: '22:00',
                    placeholder: 'HH:MM'
                }
            ]
        },

        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __('Put your custom css here, to customize the enquiry form.', 'multivendorx'),
            label: __('Additional CSS', 'multivendorx'),
            placeholder: '/* Enter your CSS here */',
            rows: 5
        },
    ],
};