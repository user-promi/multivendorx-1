<?php

namespace MultiVendorX\Transaction;
use MultiVendorX\Utill;
use MultiVendorX\Commission\CommissionUtil;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Transaction class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */
class Transaction {
    private $container = array();

    public function __construct() {
        $this->init_classes();

        add_action( 'multivendorx_after_calculate_commission', array($this, 'create_transaction'), 10, 3 );
    }

    public function init_classes() {
        $this->container = array();
    }

    public function create_transaction($commission_id, $vendor_order, $main_order) {
        global $wpdb;

        $commission = CommissionUtil::get_commission_db($commission_id);

         $data = [
            'store_id'         => $commission->store_id,
            'order_id'         => $commission->order_id,
            'commission_id'    => $commission_id,
            'entry_type'       => 'Cr',
            'transaction_type' => 'Commission',
            'amount'           => $commission->commission_total,
            // 'currency'          => $vendor_id,
            'narration'        => "Commission received for order " . $vendor_order->get_id(),
            'status'           => 'Processed',
            'created_at'       => current_time(),
        ];

        $format = [ "%d", "%d", "%d", "%s", "%s", "%f", "%s", "%s", "%s", "%s" ];

        $wpdb->insert(
            $wpdb->prefix . Utill::TABLES['transaction'],
            $data,
            $format
        );

        $transaction_id = $wpdb->insert_id;
        return $transaction_id;
    }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

}