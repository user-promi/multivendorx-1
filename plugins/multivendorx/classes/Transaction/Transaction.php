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

        add_action( 'woocommerce_order_status_changed', array($this, 'create_transaction_for_sub_order'), 20, 4 );
        if (is_admin()) {
            add_action( 'multivendorx_after_calculate_commission', array($this, 'create_transaction_for_backend_order'), 10, 2 );
        }
    }

    public function init_classes() {
        $this->container = array();
    }

    public function create_transaction_for_backend_order($commission_id, $vendor_order) {
        if ($commission_id > 0) {
            $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status' );
            if( !empty($disbursement_status) && in_array($vendor_order->get_status(), $disbursement_status)){
                $this->create_transaction($commission_id, $vendor_order);
    
            }
        }
    }

    public function create_transaction_for_sub_order($order_id, $old_status, $new_status, $order) {
        if ($order->get_parent_id() == 0) {
            return;
        }

        $payment_method = $order->get_payment_method();
        // if (payment method is stripe or paypal marketplace and the check charges then this function return)
        $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status' );
        if( !empty($disbursement_status) && in_array($new_status, $disbursement_status)){
            $commission_id = $order->get_meta( 'multivendorx_commission_id', true);
            $this->create_transaction($commission_id, $order);
        }
    }

    public function create_transaction($commission_id, $order) {
        global $wpdb;

        $exists = $this->get_transaction_db($commission_id);
        if (!empty($exists)) {
            return;
        }

        $lock_period = (int) MultiVendorX()->setting->get_setting( 'commission_lock_period', 0 );
        $status = 'Pending';
        $time   = current_time('mysql');

        $commission = CommissionUtil::get_commission_db($commission_id);

        if($lock_period == 0) {
            $status = 'Completed';
            
        } elseif ($lock_period > 0) {
            $status = 'Pending';
            $time   = date( 'Y-m-d H:i:s', current_time( 'timestamp' ) + ( $lock_period * DAY_IN_SECONDS ) );;
        }
        
        $data = [
            'store_id'         => (int) $commission->store_id,
            'order_id'         => (int) $commission->order_id,
            'commission_id'    => (int) $commission_id,
            'entry_type'       => 'Cr',
            'transaction_type' => 'Commission',
            'amount'           => (float) $commission->commission_total,
            'currency'         => get_woocommerce_currency(),
            'narration'        => "Commission received for order " . $order->get_id(),
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

        if ($transaction_id) {
            $wpdb->update(
                $wpdb->prefix . Utill::TABLES['commission'],
                array( 'status' => 'paid' ),
                array( 'id' => $commission_id ),
                array( '%s' ),
                array( '%d' )
            );
        }

        do_action('multivendorx_after_create_transaction', $transaction_id, $commission);
        return $transaction_id;
    }

    // public function create_transaction($order_id, $old_status, $new_status, $order) {
    //     global $wpdb;

    //     if ($order->get_parent_id() == 0) {
    //         return;
    //     }

    //     $payment_method = $order->get_payment_method();
    //     // if (payment method is stripe or paypal marketplace and the check charges then this function return)
    //     $disbursement_status = MultiVendorX()->setting->get_setting( 'disbursement_order_status' );
    //     if( !empty($disbursement_status) && in_array($new_status, $disbursement_status)){
    //         $disbursement_method = MultiVendorX()->setting->get_setting( 'disbursement_method' );
    //         $commission_id = $order->get_meta( 'multivendorx_commission_id', true);
    //         $exists = $this->get_transaction_db($commission_id);
    //         if (!empty($exists)) {
    //             return;
    //         }

    //         $lock_period = (int) MultiVendorX()->setting->get_setting( 'commission_lock_period', 0 );
    //         $status = 'Pending';
    //         $time   = current_time('mysql');

    //         $commission = CommissionUtil::get_commission_db($commission_id);

    //         if ($disbursement_method == 'instantly') {
    //             $status = 'Completed';

    //         } elseif ($disbursement_method == 'waiting' ) {
    //             if($lock_period == 0) {
    //                 $status = 'Completed';
                    
    //             } elseif ($lock_period > 0) {
    //                 $status = 'Pending';
    //                 $time   = date( 'Y-m-d H:i:s', current_time( 'timestamp' ) + ( $lock_period * DAY_IN_SECONDS ) );;
    //             }
    //         }

    //         $data = [
    //             'store_id'         => (int) $commission->store_id,
    //             'order_id'         => (int) $commission->order_id,
    //             'commission_id'    => (int) $commission_id,
    //             'entry_type'       => 'Cr',
    //             'transaction_type' => 'Commission',
    //             'amount'           => (float) $commission->commission_total,
    //             'currency'         => get_woocommerce_currency(),
    //             'narration'        => "Commission received for order " . $order->get_id(),
    //             'status'           => $status,
    //             'available_at'     => $time
    //         ];

    //         $format = [ "%d", "%d", "%d", "%s", "%s", "%f", "%s", "%s", "%s", "%s" ];

    //         $wpdb->insert(
    //             $wpdb->prefix . Utill::TABLES['transaction'],
    //             $data,
    //             $format
    //         );

    //         $transaction_id = $wpdb->insert_id;
    //         return $transaction_id;
    //     }
    // }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    public static function get_transaction_db( $commission_id ) {
        global $wpdb;
        $transaction = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM `" . $wpdb->prefix . Utill::TABLES['transaction'] . "` WHERE commission_id = %d", $commission_id ), ARRAY_A 
        );
        return $transaction ?? [];
    }

    public static function get_transaction_information( $args ) {
        global $wpdb;
    
        $where = [];
    
        //Extract and sanitize order/orderBy early so they don't go into WHERE
        $orderBy = isset( $args['orderBy'] ) ? esc_sql( $args['orderBy'] ) : '';
        $order   = isset( $args['order'] ) ? strtoupper( esc_sql( $args['order'] ) ) : 'ASC';
    
        //Remove non-column keys
        unset( $args['orderBy'], $args['order'] );
    
        // Filter by id(s)
        if ( isset( $args['id'] ) ) {
            $ids     = is_array( $args['id'] ) ? $args['id'] : [ $args['id'] ];
            $ids     = implode( ',', array_map( 'intval', $ids ) );
            $where[] = "id IN ($ids)";
        }
    
        // Filter by store_id
        if ( isset( $args['store_id'] ) ) {
            $where[] = ' ( store_id = ' . esc_sql( intval( $args['store_id'] ) ) . ' ) ';
        }
    
        // Filter by order_id
        if ( isset( $args['order_id'] ) ) {
            $where[] = ' ( order_id = ' . esc_sql( intval( $args['order_id'] ) ) . ' ) ';
        }
    
        // Filter by commission_id
        if ( isset( $args['commission_id'] ) ) {
            $where[] = ' ( commission_id = ' . esc_sql( intval( $args['commission_id'] ) ) . ' ) ';
        }
    
        // Filter by transaction_type
        if ( isset( $args['transaction_type'] ) ) {
            $where[] = " ( transaction_type = '" . esc_sql( $args['transaction_type'] ) . "' ) ";
        }
    
        // Filter by entry_type (Cr/Dr)
        if ( isset( $args['entry_type'] ) ) {
            $where[] = " ( entry_type = '" . esc_sql( $args['entry_type'] ) . "' ) ";
        }
    
        // Filter by status
        if ( isset( $args['status'] ) ) {
            $where[] = " ( status = '" . esc_sql( $args['status'] ) . "' ) ";
        }
    
        // Filter by date range
        if ( isset( $args['start_date'] ) ) {
            $where[] = " ( created_at >= '" . esc_sql( $args['start_date'] ) . "' ) ";
        }
        if ( isset( $args['end_date'] ) ) {
            $where[] = " ( created_at <= '" . esc_sql( $args['end_date'] ) . "' ) ";
        }
    
        $table = $wpdb->prefix . Utill::TABLES['transaction'];
    
        // Base query (count or select)
        if ( isset( $args['count'] ) ) {
            $query = "SELECT COUNT(*) FROM $table";
        } else {
            $query = "SELECT * FROM $table";
        }
    
        // Add WHERE
        if ( ! empty( $where ) ) {
            $condition = $args['condition'] ?? ' AND ';
            $query    .= ' WHERE ' . implode( $condition, $where );
        }
    
        //Add ORDER BY (only for non-count queries)
        if ( ! isset( $args['count'] ) && ! empty( $orderBy ) ) {
            // Only allow ASC or DESC
            if ( ! in_array( $order, [ 'ASC', 'DESC' ], true ) ) {
                $order = 'ASC';
            }
            $query .= " ORDER BY {$orderBy} {$order}";
        }
    
        //Add limit & offset (only for non-count)
        if ( ! isset( $args['count'] ) && isset( $args['limit'], $args['offset'] ) ) {
            $limit  = intval( $args['limit'] );
            $offset = intval( $args['offset'] );
            $query .= " LIMIT {$limit} OFFSET {$offset}";
        }
    
        //Run query
        if ( isset( $args['count'] ) ) {
            return (int) ( $wpdb->get_var( $query ) ?? 0 );
        }
    
        return $wpdb->get_results( $query, ARRAY_A ) ?? [];
    }
    

    public static function get_balances_for_store( $store_id ) {
        global $wpdb;
        $table_name = $wpdb->prefix . Utill::TABLES['transaction'];

        $query = $wpdb->prepare("
            SELECT 
                balance, 
                locking_balance
            FROM {$table_name}
            WHERE store_id = %d
            ORDER BY id DESC
            LIMIT 1
        ", $store_id);

        // Fetch the result
        $result = $wpdb->get_row($query);

        if ( ! $result ) {
            return [
                'balance' => 0.00,
                'locking_balance' => 0.00,
            ];
        }

        return [
            'balance' => floatval($result->balance),
            'locking_balance' => floatval($result->locking_balance),
        ];
    }

}