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
        // ─── Existing field (unchanged) ───────────────────────────────────────
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            label: __( 'Attachment', 'multivendorx' ),
            classes: 'gridTable',
            rows: [
                {
                    key: 'allow_download_pdf',
                    label: __( 'Download as PDF', 'multivendorx' ),
                },
                {
                    key: 'attach_pdf_to_email',
                    label: __( 'Attach with Email', 'multivendorx' ),
                },
            ],
            columns: [
                {
                    key: 'enquiry_pdf_permission',
                    label: __( 'Enquiry', 'multivendorx' ),
                    moduleEnabled: 'enquiry',
                },
                {
                    key: 'quote_pdf_permission',
                    label: __( 'Quote', 'multivendorx' ),
                    moduleEnabled: 'quote',
                },
            ],
            proSetting: true,
        },

        // ─── NEW: Business Hours with built-in Split Shift toggle ─────────────
        //
        // splitShiftToggle — renders the "Split Shift (2 Time Slots)" pill+toggle
        //   above the table. Its `key` stores the boolean in the setting object.
        //
        // columns:
        //   - shift1  → always visible  (First Shift)
        //   - shift2  → isSplitShift: true → only visible when toggle is ON
        //
        // Saved data shape:
        //   split_shift:        true | false
        //   active_days:        ['monday', 'tuesday', ...]
        //   shift1_sunday:      { start: '09:00', end: '18:00' }
        //   shift2_sunday:      { start: '17:00', end: '22:00' }  ← only saved when toggle is ON
        {
            key: 'business_hours',
            type: 'multi-checkbox-table',
            label: __( 'Shop Open & Close Timings', 'multivendorx' ),
            classes: 'gridTable',

            // The split-shift toggle rendered above the table
            splitShiftToggle: {
                key:   'split_shift',
                label: __( 'Split Shift (2 Time Slots)', 'multivendorx' ),
                icon:  'split-shift',   // adminfont-split-shift — swap to any valid icon
            },

            rows: [
                { key: 'sunday',    label: __( 'Sunday',    'multivendorx' ), enabledKey: 'active_days' },
                { key: 'monday',    label: __( 'Monday',    'multivendorx' ), enabledKey: 'active_days' },
                { key: 'tuesday',   label: __( 'Tuesday',   'multivendorx' ), enabledKey: 'active_days' },
                { key: 'wednesday', label: __( 'Wednesday', 'multivendorx' ), enabledKey: 'active_days' },
                { key: 'thursday',  label: __( 'Thursday',  'multivendorx' ), enabledKey: 'active_days' },
                { key: 'friday',    label: __( 'Friday',    'multivendorx' ), enabledKey: 'active_days' },
                { key: 'saturday',  label: __( 'Saturday',  'multivendorx' ), enabledKey: 'active_days' },
            ],

            columns: [
                {
                    key:   'shift1',
                    label: __( 'First Shift', 'multivendorx' ),
                    type:  'shift',
                    // No isSplitShift → always visible
                },
                {
                    key:          'shift2',
                    label:        __( 'Second Shift', 'multivendorx' ),
                    type:         'shift',
                    isSplitShift: true,   // ← hidden until split shift toggle is ON
                },
            ],
        },

        // ─── Existing field (unchanged) ───────────────────────────────────────
        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __(
                'Put your custom css here, to customize the enquiry form.',
                'multivendorx'
            ),
            label: __( 'Addional CSS', 'multivendorx' ),
        },
    ],
};