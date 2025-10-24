<?php

namespace MultiVendorX\ZoneShipping;
use MultiVendorX\ZoneShipping\Util;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Zone_Shipping_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'zone-shipping';

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
        $store_id = $request->get_param( 'store_id' );
        $zones = Util::get_zones( $store_id );
        return rest_ensure_response( $zones );
    }
    
    
    
    public function create_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return rest_ensure_response( [
                'success' => false,
                'message' => __( 'Invalid nonce', 'multivendorx' ),
            ] );
        }
    
        // Extract parameters from request
        $store_id  = intval( $request->get_param( 'storeId' ) );
        $zone_id   = intval( $request->get_param( 'zoneID' ) );
        $method_id = sanitize_text_field( $request->get_param( 'method' ) );
        $settings  = $request->get_param( 'settings' );
    
        // Validate required fields
        if ( empty( $method_id ) ) {
            return rest_ensure_response( [
                'success' => false,
                'message' => __( 'Shipping method is required', 'multivendorx' ),
            ] );
        }
    
        if ( empty( $zone_id ) ) {
            return rest_ensure_response( [
                'success' => false,
                'message' => __( 'Zone ID is required', 'multivendorx' ),
            ] );
        }
    
        if ( empty( $store_id ) ) {
            return rest_ensure_response( [
                'success' => false,
                'message' => __( 'Store ID is required', 'multivendorx' ),
            ] );
        }
    
        // Prepare clean data for insertion
        $data = [
            'zone_id'   => $zone_id,
            'method_id' => $method_id,
            'settings'  => is_array( $settings ) ? array_map( 'sanitize_text_field', $settings ) : [],
        ];
    
        // Call your helper to add the shipping method
        $result = Util::add_shipping_methods( $data, $store_id );
    
        // Handle response
        if ( is_wp_error( $result ) ) {
            return rest_ensure_response( [
                'success' => false,
                'message' => $result->get_error_message(),
                'code'    => $result->get_error_code(),
                'data'    => $result->get_error_data(),
            ] );
        }
    
        return rest_ensure_response( [
            'success'   => true,
            'message'   => __( 'Shipping method created successfully', 'multivendorx' ),
            'insert_id' => $result,
        ] );
    }
    
    

    public function get_item( $request ) {
        $zone_id = $request->get_param( 'zone_id' );
        $store_id = $request->get_param( 'store_id' );

        $zone = Util::get_zone( $zone_id, $store_id );
        return rest_ensure_response( $zone );
    }
    
    public function update_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header('X-WP-Nonce');
        if ( ! wp_verify_nonce($nonce, 'wp_rest') ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Invalid nonce', 'multivendorx' )
            ]);
        }
    
        $store_id      = intval($request->get_param('store_id'));
        $zone_id       = intval($request->get_param('zone_id'));
        $shipping_data = $request->get_param('shipping_data');
        $action        = $request->get_param('action');
        
        // Handle "add shipping"
        if ($action === 'add_shipping' && !empty($shipping_data['shippingMethod'])) {
            $data = [
                'zone_id'   => $zone_id,
                'method_id' => sanitize_text_field($shipping_data['shippingMethod']),
            ];
    
            $result = Util::add_shipping_methods($data, $store_id);
    
            // Log result
    
            if (is_wp_error($result)) {
                return rest_ensure_response([
                    'success' => false,
                    'message' => $result->get_error_message(),
                    'code'    => $result->get_error_code(),
                    'data'    => $result->get_error_data()
                ]);
            }
    
            return rest_ensure_response([
                'success' => true,
                'message' => __( 'Shipping method added successfully', 'multivendorx' ),
                'insert_id' => $result
            ]);
        }
    
        // Normal update
        return rest_ensure_response([ 'success' => true ]);
    }
    
    public function delete_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header('X-WP-Nonce');
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Invalid nonce', 'multivendorx' )
            ]);
        }
    
        $store_id    = intval( $request->get_param('store_id') );
        $zone_id     = intval( $request->get_param('zone_id') );
        $instance_id = intval( $request->get_param('instance_id') );
    
        if ( ! $store_id || ! $zone_id || ! $instance_id ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Missing required parameters', 'multivendorx' )
            ]);
        }
    
        // Call delete function
        $result = Util::delete_shipping_methods(
            [
                'zone_id'     => $zone_id,
                'instance_id' => $instance_id,
            ],
            $store_id
        );
    
        if ( is_wp_error( $result ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $result->get_error_message()
            ]);
        }
    
        return rest_ensure_response([
            'success' => true,
            'message' => __( 'Shipping method deleted successfully', 'multivendorx' )
        ]);
    }
}