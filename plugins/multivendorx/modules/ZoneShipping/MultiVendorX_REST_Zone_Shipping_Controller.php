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
    

        $store_id      = intval( $request->get_param('store_id') );
        $zone_id       = intval( $request->get_param('zone_id') );
        $method_id     = sanitize_text_field( $request->get_param('method_id') );
        $settings      = $request->get_param('settings');
    
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

        $shipping = new Shipping(); // instantiate your new shipping class
        $shipping->set_post_data( $data['settings'] ); // pass saved settings
        $shipping->process_admin_options(); // process/save settings
        
        // Clear WooCommerce shipping cache
        \WC_Cache_Helper::get_transient_version('shipping', true);
        // Log result

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
        $instance_id = $request->get_param( 'instanceId' );

        $method = Util::get_shipping_method( $instance_id );
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

        $store_id      = intval( $request->get_param('store_id') );
        $zone_id       = intval( $request->get_param('zone_id') );
        $method_id     = sanitize_text_field( $request->get_param('method_id') );
        $settings      = $request->get_param('settings');
        $instance_id   = $request->get_param('instance_id'); // optional, only for update

        if ( ! $method_id || ! $zone_id || ! $store_id || ! $settings ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Missing required parameters', 'multivendorx' )
            ]);
        }

        // Prepare data for DB
        $data = [
            'method_id' => $method_id,
            'zone_id'   => $zone_id,
            'store_id'  => $store_id,
            'settings'  => $settings
        ];

        // If instance_id is provided, update existing shipping method
        if ( $instance_id ) {
            $data['instance_id'] = intval( $instance_id );
            $updated = Util::update_shipping_method( $data );

            if ( $updated ) {
                // Process settings in Shipping class
                $shipping = new Shipping();
                $shipping->set_post_data( $settings );
                $shipping->process_admin_options();

                // Clear WooCommerce shipping cache
                \WC_Cache_Helper::get_transient_version('shipping', true);

                return rest_ensure_response([
                    'success' => true,
                    'message' => __( 'Shipping method updated successfully', 'multivendorx' ),
                    'data'    => $updated
                ]);
            }

            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Failed to update shipping method', 'multivendorx' )
            ]);
        }

        // Otherwise, add new shipping method
        $result = Util::add_shipping_methods( [ 'zone_id' => $zone_id, 'method_id' => $method_id ], $store_id );

        if ( is_wp_error( $result ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $result->get_error_message(),
                'code'    => $result->get_error_code(),
                'data'    => $result->get_error_data()
            ]);
        }

        // Process settings for new shipping method
        $shipping = new Shipping();
        $shipping->set_post_data( $settings );
        $shipping->process_admin_options();
        WC_Cache_Helper::get_transient_version('shipping', true);

        return rest_ensure_response([
            'success'   => true,
            'message'   => __( 'Shipping method added successfully', 'multivendorx' ),
            'insert_id' => $result
        ]);
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
    
        // Get the instance_id from the request
        $instance_id = intval( $request->get_param('instance_id') );
    
        // Validate the instance_id
        if ( ! $instance_id ) {
            return rest_ensure_response([
                'success' => false,
                'message' => __( 'Missing required instance_id parameter', 'multivendorx' )
            ]);
        }
    
        // Call the delete_shipping_method function
        $result = Util::delete_shipping_method( $instance_id );
    
        // Check if an error occurred during deletion
        if ( is_wp_error( $result ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $result->get_error_message()
            ]);
        }
    
        // Return success message if deletion was successful
        return rest_ensure_response([
            'success' => true,
            'message' => __( 'Shipping method deleted successfully', 'multivendorx' )
        ]);
    }
    
}