<?php

namespace MultiVendorX\PaypalPayout;


defined('ABSPATH') || exit;

class Payment {
    public function __construct(){
        
        add_action('multivendorx_process_paypal-payout_payment', array($this, 'process_payment'), 10, 2);
    }

    public function get_id() {
        return 'paypal-payout';
    }

    public function get_settings() {
        return [
            'icon'      => 'PP',
            'id'        => $this->get_id(),
            'label'     => 'Paypal Payout',
            'connected' => true,
            'desc'      => 'Full marketplace solution with instant payouts, comprehensive dispute handling, and global coverage. Best for established marketplaces.',
            'formFields' => [
                [
                    'key'         => 'paypal_email',
                    'type'        => 'text',
                    'label'       => 'Paypal Email',
                    'placeholder' => 'Enter Email',
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        return [
            'id'    => $this->get_id(),
            'label' => __('Paypal Payout', 'multivendorx'),
            'fields' => [
                [
                    'name'        => 'paypal_email',
                    'type'        => 'email',
                    'label'       => __('PayPal Email', 'multivendorx'),
                    'placeholder' => __('Enter your PayPal email address', 'multivendorx'),
                ]
            ]
        ];
    }

    public function process_payment($store_id, $amount) {
        

        // after success or fail payment
        do_action('multivendorx_after_payment_complete', $store_id);
    }
}
