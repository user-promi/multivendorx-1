<?php

namespace MultiVendorX\Payments;

defined('ABSPATH') || exit;

class Disbursement {
    public function __construct() {
        add_action('woocommerce_order_status_changed', array($this, 'disbursement_process'), 10, 4);
    }

    public function disbursement_process($order_id, $old_status, $new_status, $order) {
        $commission_id = $order->get_meta( 'multivendorx_commission_id', true) ?? '';
        
        $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status' );
        if( !empty($disbursement_status) && in_array($new_status, $disbursement_status)){
            $disbursement_method = MultiVendorX()->setting->get_setting( 'disbursement_method' );
            if ($disbursement_method == 'instantly') {

            }
        }

    }
}