<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Transaction\Transaction; 
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Transaction_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'transaction';

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'create_item' ],
                'permission_callback' => [ $this, 'create_item_permissions_check' ],
            ],
        ] );

        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
            ],
        ]);
    }

    public function get_items_permissions_check($request) {
        // return current_user_can( 'read' );
        return true;
    }

     // POST permission
    public function create_item_permissions_check($request) {
        // return current_user_can( 'manage_options' );
        return true;
    }

    public function update_item_permissions_check($request) {
        // return current_user_can('manage_options');
        return true;
    }


    // GET 
    // public function get_items( $request ) {
    //     $nonce = $request->get_header( 'X-WP-Nonce' );
    //     if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
    //         return new \WP_Error(
    //             'invalid_nonce',
    //             __( 'Invalid nonce', 'multivendorx' ),
    //             array( 'status' => 403 )
    //         );
    //     }
    
    //     // Get request parameters
    //     $limit    = max( intval( $request->get_param( 'row' ) ), 10 );
    //     $page     = max( intval( $request->get_param( 'page' ) ), 1 );
    //     $offset   = ( $page - 1 ) * $limit;
    //     $count    = $request->get_param( 'count' );
    //     $store_id = intval( $request->get_param( 'store_id' ) );
    //     $status    = $request->get_param( 'status' );
        
    //     $args = array();
    //     if ( $count ) {
    //         $args['count'] = true;
    //     }
    //     if ( $status ) {
    //         $args['status'] = $status;
    //     }
    //     if ( $store_id ) {
    //         $args['store_id'] = $store_id;
    //     }
    //     // If requesting count, return immediately
    //     if ( $count ) {
    //         $transactions = Transaction::get_transaction_information( $args );
    //         return rest_ensure_response( (int) $transactions );
    //     }
    //     $args['limit'] = $limit;
    //     $args['offset'] = $offset;

    //     // Use the reusable transaction query function
    //     $transactions = Transaction::get_transaction_information( $args );

    //     // Map results to frontend-friendly structure
    //     $formatted = array_map( function( $row ) {
    //         return [
    //             'date'             => $row['created_at'],
    //             'order_details'    => $row['narration'],
    //             'transaction_type' => $row['transaction_type'],
    //             'payment_mode'     => $row['entry_type'],
    //             'credit'           => $row['entry_type'] === 'Cr' ? $row['amount'] : 0,
    //             'debit'            => $row['entry_type'] === 'Dr' ? $row['amount'] : 0,
    //             'balance'          => $row['balance'],
    //             'status'           => $row['status'],
    //         ];
    //     }, $transactions );
    
    //     return rest_ensure_response( $formatted );
    // }
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $limit    = max( intval( $request->get_param( 'row' ) ), 10 );
        $page     = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset   = ( $page - 1 ) * $limit;
        $count    = $request->get_param( 'count' );
        $store_id = intval( $request->get_param( 'store_id' ) );
        $status   = $request->get_param( 'status' );
        $filter_status   = $request->get_param( 'filter_status' );
        // 🔹 Handle date range from request
        $start_date = $request->get_param('start_date');
        $end_date   = $request->get_param('end_date');
    
        if ( $start_date ) {
            $start_date = date('Y-m-d H:i:s', strtotime($start_date));
        }
        if ( $end_date ) {
            $end_date = date('Y-m-d H:i:s', strtotime($end_date));
        }
    
        $args = array();
        if ( $count ) $args['count'] = true;
        if ( $status ) $args['status'] = $status;
        if ( $store_id ) $args['store_id'] = $store_id;
    
        // Add date filters
        if ( $start_date ) $args['start_date'] = $start_date;
        if ( $end_date )   $args['end_date']   = $end_date;
        if ( $filter_status )   $args['entry_type']   = $filter_status;
    
        if ( $count ) {
            $transactions = Transaction::get_transaction_information( $args );
            return rest_ensure_response( (int) $transactions );
        }
    
        $args['limit']  = $limit;
        $args['offset'] = $offset;
    
        $transactions = Transaction::get_transaction_information( $args );
    
        $formatted = array_map(function($row) {
            $store = new \MultiVendorX\Store\Store($row['store_id']);
    
            return [
                'id'             => $row['id'],
                'store_name'     => $store ? $store->get('name') : '-',
                'amount'         => $row['amount'],
                'balance'        => $row['balance'],
                'status'         => $row['status'],
                'payment_method' => $store->meta_data['payment_method'] ?? 'Not Saved',
                'credit'         => $row['entry_type'] === 'Cr' ? $row['amount'] : 0,
                'debit'          => $row['entry_type'] === 'Dr' ? $row['amount'] : 0,
                'date'           => $row['created_at'],
                'order_details'  => $row['order_id'],
                'transaction_type' => $row['transaction_type'],
            ];
        }, $transactions);
        $countArgs = [
            'count' => true,
        ];
        
        if ( $store_id ) {
            $countArgs['store_id'] = $store_id;
        }
        
        $all    = Transaction::get_transaction_information( $countArgs );
        $credit = Transaction::get_transaction_information( array_merge( $countArgs, ['entry_type' => 'Cr'] ) );
        $debit  = Transaction::get_transaction_information( array_merge( $countArgs, ['entry_type' => 'Dr'] ) );
        
        $response = [
            'transaction' => $formatted,
            'all'         => $all,
            'credit'      => $credit,
            'debit'      =>  $debit,
        ];
        return rest_ensure_response( $response );
    }
    
    
    
    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
       
    }

    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $store_id = absint( $request->get_param( 'id' ) );
    
        if ( ! $store_id ) {
            return rest_ensure_response( [
                'balance'         => 0,
                'locking_balance' => 0,
                'lifetime_earning'=> 0,
            ] );
        }
    
        global $wpdb;
        $table_name = "{$wpdb->prefix}" . Utill::TABLES['transaction'];
    
        // Fetch last transaction row for the store
        $last_transaction = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT balance, locking_balance 
                 FROM $table_name 
                 WHERE store_id = %d 
                 ORDER BY created_at DESC 
                 LIMIT 1",
                $store_id
            ),
            ARRAY_A
        );
    
        $balance = isset($last_transaction['balance']) ? $last_transaction['balance'] : 0;
        $locking_balance = isset($last_transaction['locking_balance']) ? $last_transaction['locking_balance'] : 0;
    
        // Calculate total lifetime earnings (sum of all amounts)
        $total_earning = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(amount) 
                 FROM $table_name 
                 WHERE store_id = %d",
                $store_id
            )
        );
    
        $total_earning = $total_earning ? $total_earning : 0;
    
        // Lifetime earning minus locking balance
        $lifetime_earning = $total_earning - $locking_balance;

        $payout_threshold = MultiVendorX()->setting->get_setting('payout_threshold_amount', 0);

        // If it’s an array, take first value, else use as is
        if (is_array($payout_threshold)) {
            $payout_threshold = reset($payout_threshold) ?: 0;
        }
        
        $payout_threshold = floatval($payout_threshold);
        
        return rest_ensure_response([
            'wallet_balance'   => $balance + $locking_balance,
            'reserve_balance'  => $payout_threshold,
            'available_balance'=> max(0, $balance - $payout_threshold),
            'balance'          => $balance,
            'locking_balance'  => $locking_balance,
            'lifetime_earning' => $lifetime_earning,
        ]);
                
    }
    
    public function update_item( $request ) {
        
    }

}