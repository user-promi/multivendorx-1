<?php

namespace MultiVendorX\Payments;

defined('ABSPATH') || exit;

use MultiVendorX\Store\Store;


class BankTransfer
{
    public function __construct()
    {
        add_action('multivendorx_process_bank-transfer_payment', array($this, 'process_payment'), 10, 5);
    }

    public function get_id()
    {
        return 'bank-transfer';
    }

    public function get_settings()
    {
        return [
            'icon' => 'adminlib-bank',
            'id' => $this->get_id(),
            'label' => 'Bank Transfer',
            'enableOption' => true,
            'disableBtn' => true,
            'desc' => 'Transfer payouts directly to store’s bank accounts.',
            'formFields' => [
                [
                    'key' => 'bank_name',
                    'type' => 'multi-checkbox',
                    'selectDeselect' => true,

                    'label' => __('Bank details required from the store', 'multivendorx'),
                    'options' => [
                        [
                            'key' => 'bank_name',
                            'label' => __('Bank name', 'multivendorx'),
                            'value' => 'bank_account_details',
                            'edit' => true,
                        ],
                        [
                            'key' => 'routing_number',
                            'label' => __('ABA routing number)', 'multivendorx'),
                            'value' => 'routing_number',
                            'edit' => true,
                        ],
                        [
                            'key' => 'destination_currency',
                            'label' => __('Destination currency', 'multivendorx'),
                            'value' => 'destination_currency',
                            'edit' => true,
                        ],
                        [
                            'key' => 'bank_address',
                            'label' => __('Bank address', 'multivendorx'),
                            'value' => 'bank_address',
                            'edit' => true,
                        ],
                        [
                            'key' => 'IBAN',
                            'label' => __('IBAN', 'multivendorx'),
                            'value' => 'IBAN',
                            'edit' => true,
                        ],
                        [
                            'key' => 'account_holder_name',
                            'label' => __('Account holder Name', 'multivendorx'),
                            'value' => 'account_holder_name',
                            'edit' => true,
                        ],
                        [
                            'key' => 'account_number',
                            'label' => __('Account number', 'multivendorx'),
                            'value' => 'account_number',
                            'edit' => true,
                        ],
                    ],
                ],

                // [
                //     'key' => 'abr_routing_number',
                //     'type' => 'text',
                //     'label' => 'ABA Routing Number',
                //     'placeholder' => 'Enter ABA Routing Number',
                // ],
                // [
                //     'key' => 'destination_currency',
                //     'type' => 'text',
                //     'label' => 'Destination Currency',
                //     'placeholder' => 'Enter Destination Currency',
                // ],
                // [
                //     'key' => 'bank_address',
                //     'type' => 'text-area',
                //     'label' => 'Bank Address',
                //     'placeholder' => 'Enter Bank Address',
                // ],
                // [
                //     'key' => 'iban',
                //     'type' => 'text',
                //     'label' => 'IBAN',
                //     'placeholder' => 'Enter IBAN',
                // ],
                // [
                //     'key' => 'account_holder_name',
                //     'type' => 'text',
                //     'label' => 'Account Holder Name',
                //     'placeholder' => 'Enter Account Holder Name',
                // ],
                // [
                //     'key' => 'account_number',
                //     'type' => 'text',
                //     'label' => 'Account Number',
                //     'placeholder' => 'Enter Account Number',
                // ]
            ]
        ];
    }

    public function get_store_payment_settings()
    {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);

        $settings = !empty($payment_admin_settings['bank-transfer']) ? $payment_admin_settings['bank-transfer'] : [];

        if (!empty($settings) && $settings['enable']) {
            return [
                'id' => $this->get_id(),
                'label' => __('Bank Transfer', 'multivendorx'),
                'fields' => [

                    [
                        'key' => 'account_holder_name',
                        'type' => 'text',
                        'label' => 'Account holder name',
                    ],
                    [
                        'key' => 'account_type',
                        'type' => 'setting-toggle',
                        'label' => __('Account type', 'multivendorx'),
                        'options' => [
                            ['key' => 'current', 'label' => __('Current', 'multivendorx'), 'value' => 'current'],
                            ['key' => 'savings', 'label' => __('Savings', 'multivendorx'), 'value' => 'savings'],
                        ]
                    ],
                    [
                        'key' => 'bank_name',
                        'type' => 'text',
                        'label' => 'Bank name',
                    ],
                    [
                        'key' => 'bank_address',
                        'type' => 'text-area',
                        'label' => 'Bank address',
                    ],
                    [
                        'key' => 'abr_routing_number',
                        'type' => 'text',
                        'label' => 'ABA routing number',
                    ],
                    [
                        'key' => 'iban',
                        'type' => 'text',
                        'label' => 'IBAN',
                    ],
                    [
                        'key' => 'destination currency',
                        'type' => 'text',
                        'label' => 'Destination currency',
                    ],
                ]
            ];
        }

    }

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null, $note = null)
    {

        // quick autoload/class check (helps debugging)
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $store = new Store($store_id);

        $status = 'success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            'Bank Transfer',
            $status,
            $order_id,
            $transaction_id,
            $note,
            $amount
        );


    }

}

