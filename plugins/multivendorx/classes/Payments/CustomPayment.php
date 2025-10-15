<?php

namespace MultiVendorX\Payments;

defined('ABSPATH') || exit;

class CustomPayment {

    public function __construct(){
        add_action('multivendorx_process_custom-gateway_payment', array($this, 'process_payment'), 10, 5);
    }

    public function get_id() {
        return 'custom-gateway';
    }

    public function get_settings() {
        return [
            'icon'      => 'adminlib-cart',
            'id'        => $this->get_id(),
            'label'     => 'Custom Gateway',
            'enableOption' => true,
            'desc'      => '',
            'formFields' => [
                [
                    'key'         => 'custom_gateway_name',
                    'type'        => 'text',
                    'label'       => 'Gateway Name',
                    'placeholder' => 'Enter Name',
                ],
            ]
        ];
    }

    public function get_store_payment_settings() {

    }

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null, $note) {
        // quick autoload/class check (helps debugging)
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );
        $settings = !empty($payment_admin_settings['custom-gateway']) ? $payment_admin_settings['custom-gateway'] : [];
        
        $gateway_name = $settings && $settings['custom_gateway_name'] ? $settings['custom_gateway_name'] : 'Custom Gateway';

        $status ='success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            $gateway_name,
            $status,
            $order_id, 
            $transaction_id,
            $note, $amount
        );

        
    }
}