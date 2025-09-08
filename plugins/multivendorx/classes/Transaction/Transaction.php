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

        $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status', [] );
        if( in_array($vendor_order->get_status(), $disbursement_status)){
            $disbursement_method = MultiVendorX()->setting->get_setting( 'disbursement_method' );
            $lock_period         = (int) MultiVendorX()->setting->get_setting( 'commission_lock_period', 0 );
            
            $status = 'Pending';
            $time   = current_time('mysql');

            $commission = CommissionUtil::get_commission_db($commission_id);

            if ($disbursement_method == 'instantly') {
                $status = 'Completed';

            } elseif ($disbursement_method == 'waiting' ) {
                if($lock_period == 0) {
                    $status = 'Completed';
                    
                } elseif ($lock_period > 0) {
                    $status = 'Pending';
                    $time   = date( 'Y-m-d H:i:s', current_time( 'timestamp' ) + ( $lock_period * DAY_IN_SECONDS ) );;
                }
            }

            $data = [
                'store_id'         => (int) $commission->store_id,
                'order_id'         => (int) $commission->order_id,
                'commission_id'    => (int) $commission_id,
                'entry_type'       => 'Cr',
                'transaction_type' => 'Commission',
                'amount'           => (float) $commission->commission_total,
                'currency'         => get_woocommerce_currency(),
                'narration'        => "Commission received for order " . $vendor_order->get_id(),
                'status'           => $status,
                'available_at'     => $time
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
    }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    public static function get_transaction_db( $commission_id ) {
        global $wpdb;
        $transaction = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM `" . $wpdb->prefix . Utill::TABLES['transaction'] . "` WHERE commission_id = %d", $commission_id )
        );
        return $transaction ?? new \stdClass();
    }
}