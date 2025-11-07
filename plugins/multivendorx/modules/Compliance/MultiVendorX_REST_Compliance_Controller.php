<?php

namespace MultiVendorX\Compliance;
use MultiVendorX\Compliance\Util;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Compliance_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'report-abuse';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

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
            [
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'delete_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
        ]);
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' )||current_user_can('edit_stores');
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'create_stores' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('edit_stores');
    }


    // GET 
    public function get_items( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
    
        // Get filters
        $store_id  = $request->get_param( 'store_id' );
        $start_date = $request->get_param( 'start_date' );
        $end_date   = $request->get_param( 'end_date' );
        $order_by   = $request->get_param( 'orderBy' ) ?: 'created_at';
        $order      = strtoupper( $request->get_param( 'order' ) ) === 'ASC' ? 'ASC' : 'DESC';
    
        // Count only
        if ( $request->get_param( 'count' ) ) {
            $total_count = Util::get_report_abuse_information( [ 'count' => true ] );
            return rest_ensure_response( (int) $total_count );
        }
    
        // Prepare args
        $args = [
            'limit'     => $limit,
            'offset'    => $offset,
            'order_by'  => $order_by,
            'order'     => $order,
        ];
    
        if ( ! empty( $store_id ) ) {
            $args['store_ids'] = [ intval( $store_id ) ];
        }
    
        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $args['date_range'] = [
                'start' => $start_date,
                'end'   => $end_date,
            ];
        }
    
        // Fetch reports
        $reports = Util::get_report_abuse_information( $args );
    
        $formatted = array_map( function( $r ) {
            $store = new \MultiVendorX\Store\Store( $r['store_id'] );
            $store_name = $store->data['name'] ?? '';
    
            $product = wc_get_product( $r['product_id'] );
            $product_name = $product ? $product->get_name() : '';
            $product_link = $product ? get_permalink( $product->get_id() ) : '';
    
            return [
                'ID'           => (int) $r['ID'],
                'store_id'     => (int) $r['store_id'],
                'store_name'   => $store_name,
                'product_id'   => (int) $r['product_id'],
                'product_name' => $product_name,
                'product_link' => $product_link,
                'name'         => $r['name'],
                'email'        => $r['email'],
                'reason'       => $r['message'],
                'created_at'   => $r['created_at'],
                'updated_at'   => $r['updated_at'],
            ];
        }, $reports );
    
        return rest_ensure_response( $formatted );
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
                [ 'status' => 403 ]
            );
        }
        
      
    
        return rest_ensure_response( $data );
    }
    
    public function update_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
      
        return rest_ensure_response( [ 'success' => true ] );
    }
    
    public function delete_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        // Get report ID
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid report ID', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        // Fetch the report
        $report = reset( Util::get_report_abuse_information( [ 'id' => $id ] ) );
        if ( ! $report ) {
            return new \WP_Error(
                'not_found',
                __( 'Report not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // Delete via Util helper
        $deleted = Util::delete_report_abuse( $id );
    
        if ( ! $deleted ) {
            return new \WP_Error(
                'delete_failed',
                __( 'Failed to delete report', 'multivendorx' ),
                [ 'status' => 500 ]
            );
        }
    
        return rest_ensure_response( [ 'success' => true ] );
    }
    
    
    
    
}