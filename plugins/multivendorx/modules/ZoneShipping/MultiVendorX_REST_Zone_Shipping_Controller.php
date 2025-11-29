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
    
        $store_id  = intval( $request->get_param( 'store_id' ) );
        $zone_id   = intval( $request->get_param( 'zone_id' ) );
        $method_id = sanitize_text_field( $request->get_param( 'method_id' ) );
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
    
        // Prepare store object
        $store = new \MultiVendorX\Store\Store( $store_id );
    
        // Sanitize settings
        $clean_settings = is_array( $settings ) 
            ? array_map( 'sanitize_text_field', $settings ) 
            : [];
    
        // Build dynamic meta key using method_id
        $meta_key = sprintf( '%s_%d', $method_id, $zone_id );
    
        // Save only the settings as meta value
        $store->update_meta( $meta_key, $clean_settings );
        $store->save();
        // Process settings in Shipping class
        $shipping = new Shipping();
        $shipping->set_post_data( $settings );
        $shipping->process_admin_options();
        // Clear WooCommerce shipping cache
        \WC_Cache_Helper::get_transient_version( 'shipping', true );
    
        // Return response
        return rest_ensure_response( [
            'success'   => true,
            'message'   => __( 'Shipping method settings saved successfully', 'multivendorx' ),
            'store_id'  => $store_id,
            'zone_id'   => $zone_id,
            'meta_key'  => $meta_key,
        ] );
    }
    
    public function get_item( $request ) {
        $store_id  = $request->get_param( 'store_id' );
        $method_id = $request->get_param( 'method_id' );
        $zone_id   = $request->get_param( 'zone_id' );
    
        // Validate required params
        if ( empty( $store_id ) || empty( $method_id ) || empty( $zone_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'store_id, method_id and zone_id are required', 'multivendorx' ),
            ]);
        }
    
        $method = Util::get_shipping_method( $store_id, $method_id, $zone_id );
    
        return rest_ensure_response( $method );
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
    
        $store_id  = intval( $request->get_param('store_id') );
        $zone_id   = intval( $request->get_param('zone_id') );
        $method_id = sanitize_text_field( $request->get_param('method_id') );
        $settings  = $request->get_param('settings');
    
        if ( ! $method_id || ! $zone_id || ! $store_id || ! $settings ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Missing required parameters', 'multivendorx' )
            ]);
        }
    
        // -------------------------
        // Save or update shipping method in store meta instead of old table
        // -------------------------
        $updated = Util::update_shipping_method([
            'store_id'  => $store_id,
            'zone_id'   => $zone_id,
            'method_id' => $method_id,
            'settings'  => $settings
        ]);
    
        if ( ! $updated ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Failed to save shipping method', 'multivendorx' )
            ]);
        }
    
        // Process settings in Shipping class
        $shipping = new Shipping();
        $shipping->set_post_data( $settings );
        $shipping->process_admin_options();
    
        // Clear WooCommerce shipping cache
        \WC_Cache_Helper::get_transient_version('shipping', true);
    
        return rest_ensure_response([
            'success' => true,
            'message' => __( 'Shipping method saved successfully', 'multivendorx' ),
            'data'    => $updated
        ]);
    }
    
    public function delete_item( $request ) {
        $nonce = $request->get_header('X-WP-Nonce');
    
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Invalid nonce', 'multivendorx' )
            ]);
        }
    
        $store_id  = intval( $request->get_param('store_id') );
        $zone_id   = intval( $request->get_param('zone_id') );
        $method_id = sanitize_text_field( $request->get_param('method_id') );
    
        if ( ! $store_id || ! $zone_id || ! $method_id ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Missing required parameters', 'multivendorx' )
            ]);
        }
    
        $result = Util::delete_shipping_method( $store_id, $zone_id, $method_id );
    
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