<?php

namespace MultiVendorX\Payments;

use MultiVendorX\Commission\CommissionUtil;

defined('ABSPATH') || exit;

class RealtimeGateway extends \WC_Payment_Gateway {

    // public function __construct() {
    //     parent::__construct();
    // }

    public function get_all_information($order_id) {
        $order = wc_get_order($order_id);
        if ( !$order && $order->get_parent_id() == 0 ){
            return;
        }
        $all_info = [];

        $suborders = MultiVendorX()->order->get_suborders($order->get_id());
        foreach ($suborders as $suborder) {
            $store_id = $suborder->get_meta( 'multivendorx_store_id', true );
            $suborder_id = $suborder->get_id();

            $commission = CommissionUtil::get_commission_by_store_and_order_id($store_id, $suborder_id);

            $store_amount = $commission->store_payable;
            $admin_amount = $commission->marketplace_payable;

            $all_info[] = [
                'store_id'  => $store_id,
                'store_amount'  => $store_amount,
                'admin_amount'  => $admin_amount
            ];
        }

        return $all_info;

    }
    
}