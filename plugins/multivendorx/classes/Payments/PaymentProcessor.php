<?php

namespace MultiVendorX\Payments;
use MultiVendorX\Store\Store;

defined('ABSPATH') || exit;

class PaymentProcessor {
    public function __construct() {
        add_action('multivendorx_after_payment_complete', array( $this, 'after_payment_complete'));
    }

    
    public function process_payment($store_id, $amount) {
        $store = new Store($store_id);

        $payment_method = $store->get_meta('payment_method');

        do_action("multivendorx_process_{$payment_method}_payment", $store_id, $amount);

    }

    public function after_payment_complete() {
        // transaction table update
    }
}