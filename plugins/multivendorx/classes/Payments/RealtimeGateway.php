<?php
/**
 * Realtime Payment Gateway.
 *
 * @package multivendorx
 */

namespace MultiVendorX\Payments;

use MultiVendorX\Commission\CommissionUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Realtime Payment Gateway.
 *
 * @class       Module class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class RealtimeGateway extends \WC_Payment_Gateway {

    // public function __construct() {
    // parent::__construct();
    // }

    /**
     * Get all information about the order.
     *
     * @param int $order_id Order ID.
     */
    public function get_all_information( $order_id ) {
        $order = wc_get_order( $order_id );
        if ( ! $order && $order->get_parent_id() === 0 ) {
            return;
        }
        $all_info = array();

        $suborders = MultiVendorX()->order->get_suborders( $order->get_id() );
        foreach ( $suborders as $suborder ) {
            $store_id    = $suborder->get_meta( Utill::POST_META_SETTINGS['store_id'], true );
            $suborder_id = $suborder->get_id();

            $commission = CommissionUtil::get_commission_by_store_and_order_id( $store_id, $suborder_id );

            $store_amount = $commission->store_payable;
            $admin_amount = $commission->marketplace_payable;

            $all_info[] = array(
                'store_id'     => $store_id,
                'store_amount' => $store_amount,
                'admin_amount' => $admin_amount,
            );
        }

        return $all_info;
    }
}
