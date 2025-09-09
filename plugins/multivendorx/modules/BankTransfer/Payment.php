<?php

namespace MultiVendorX\BankTransfer;

defined('ABSPATH') || exit;

use MultiVendorX\Store\Store;


class Payment {
    public function __construct(){
        add_action('multivendorx_process_bank-transfer_payment', array($this, 'process_payment'), 10, 4);
    }

    public function get_id() {
        return 'bank-transfer';
    }

    public function get_settings() {
        return [
            'icon'      => 'BB',
            'id'        => $this->get_id(),
            'label'     => 'Bank Transfer',
            'enableOption' => true,
            'desc'      => 'Bank transfer',
            'formFields' => [
                [
                    'key'   => 'payment_mode',
                    'type'  => 'setting-toggle',
                    'label' => __('Payment Mode', 'multivendorx'),
                    'options' => [
                        ['key' => 'sandbox', 'label' => __('Sandbox', 'multivendorx'), 'value' => 'sandbox'],
                        ['key' => 'live', 'label' => __('Live', 'multivendorx'), 'value' => 'live'],
                    ]
                ],
                [
                    'key'         => 'client_id',
                    'type'        => 'text',
                    'label'       => 'Client ID',
                    'placeholder' => 'Enter Client id',
                ],
                [
                    'key'         => 'client_secret',
                    'type'        => 'text',
                    'label'       => 'Client Secret Key',
                    'placeholder' => 'Enter Secret Key',
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );

        $paypal_settings = !empty($payment_admin_settings['bank-transfer']) ? $payment_admin_settings['bank-transfer'] : [];
        
        if ($paypal_settings['enable']) {
            return [
                'id'    => $this->get_id(),
                'label' => __('Bank Transfer', 'multivendorx'),
                'fields' => [
                    
                ]
            ];
        }

    }

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null) {

        // quick autoload/class check (helps debugging)
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );
        $store   = new Store( $store_id );

        $status ='success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            'Bank Transfer',
            $status,
            $order_id, 
            $transaction_id
        );

        
    }

}

