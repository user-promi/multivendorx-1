<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Actions_Items_Controller extends \WP_REST_Controller {
    /**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'multivendorx/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'actions-items';

    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, [
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

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
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

        register_rest_route($this->namespace, '/states/(?P<country>[A-Z]{2})', [
            'methods'               => \WP_REST_Server::READABLE,
            'callback'              => [$this, 'get_states_by_country'],
            'permission_callback'   => [$this, 'get_items_permissions_check'],
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
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $count = $request->get_param( 'count' );
        $response = array();
    
        if ( $count ) {
            // Pending products
            $pending_products = wc_get_products( array(
                'status'   => 'pending',
                'limit'    => -1,
                'return'   => 'ids',
                'meta_key' => 'multivendorx_store_id',
            ) );
            $pending_products = count( $pending_products );
    
            global $wpdb;
    
            // Pending stores
            $store_table   = "{$wpdb->prefix}" . Utill::TABLES['store'];
            $pending_stores = (int) $wpdb->get_var(
                "SELECT COUNT(*) 
                 FROM {$store_table} 
                 WHERE status = 'pending'"
            );
    
            // Pending coupons
            $pending_coupons = get_posts( array(
                'post_type'      => 'shop_coupon',
                'post_status'    => 'pending',
                'numberposts'    => -1,
                'fields'         => 'ids',
                'meta_key'       => 'multivendorx_store_id',
            ) );
            $pending_coupons = count( $pending_coupons );
    
            // Pending transactions
            $transaction_table   = "{$wpdb->prefix}" . Utill::TABLES['transaction'];
            $pending_transactions = (int) $wpdb->get_var(
                "SELECT COUNT(*) 
                 FROM {$transaction_table} 
                 WHERE status = 'pending'"
            );
    
            // Build response
            $response = array(
                'pending_products'     => $pending_products,
                'pending_stores'       => $pending_stores,
                'pending_coupons'      => $pending_coupons,
                'pending_transactions' => $pending_transactions,
            );
        }
    
        return rest_ensure_response( $response );
    }
    

    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
        $registrations = $request->get_header( 'registrations' );

        $store_data = $request->get_param('formData');
        // Create store object
        $store = new \MultiVendorX\Store\Store();

        $core_fields = [ 'name', 'slug', 'description', 'who_created', 'status' ];
        foreach ( $core_fields as $field ) {
            if ( isset( $store_data[ $field ] ) ) {
                $store->set( $field, $store_data[ $field ] );
            }
        }

        $insert_id = $store->save();

        if ( $insert_id && ! $registrations ) {
            foreach ( $store_data as $key => $value ) {
                if ( ! in_array( $key, $core_fields, true ) ) {
                    $store->update_meta( $key, $value );
                }
            }
        }

        if ( $registrations ) {
            // Collect all non-core fields into one array
            $non_core_fields = [];
            foreach ( $store_data as $key => $value ) {
                if ( ! in_array( $key, $core_fields, true ) ) {
                    $non_core_fields[$key] = $value;
                }
            }

            // Save them under one key
            if ( ! empty( $non_core_fields ) ) {
                $store->update_meta( 'multivendorx-registration-data', $non_core_fields );
            }
        }

        return rest_ensure_response( [
            'success' => true,
            'id'      => $insert_id,
        ] );
    }

    public function get_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );
        $fetch_user = $request->get_param( 'fetch_user' );
        $registrations = $request->get_header( 'registrations' );
        if ($fetch_user) {
            $users = StoreUtil::get_store_users($id);

            $response = [
                'id'           => $id,
                'store_owners' => $users,
            ];
            return rest_ensure_response( $response );
        }

        // Load the store
        $store = new \MultiVendorX\Store\Store( $id );
        if ( $registrations ) {
            $response = StoreUtil::get_store_registration_form( $store->get_id() );

            return rest_ensure_response( $response );
        }

        $response = [
            'id'          => $store->get_id(),
            'name'        => $store->get('name'),
            'slug'        => $store->get('slug'),
            'description' => $store->get('description'),
            'who_created' => $store->get('who_created'),
            'status'      => $store->get('status'),
        ];

        // Add meta data
        foreach ( $store->meta_data as $key => $values ) {
            $response[ $key ] = is_array( $values ) ? $values[0] : $values;
        }

        return rest_ensure_response( $response );
    }

    public function update_item( $request ) {
        $id   = absint( $request->get_param( 'id' ) );
        $data = $request->get_json_params();

        $store = new \MultiVendorX\Store\Store( $id );

        if ( $data['store_owners'] ) {
            StoreUtil::add_store_users([
                'store_id' => $data['id'],
                'store_owners' => $data['store_owners'],
                'role_id' => 'store_owner',
            ]);

            return rest_ensure_response( [
                'success' => true
            ] );
        }
        
        $store->set( 'name',        $data['name'] ?? $store->get('name') );
        $store->set( 'slug',        $data['slug'] ?? $store->get('slug') );
        $store->set( 'description', $data['description'] ?? $store->get('description') );
        $store->set( 'who_created', 'admin' );
        $store->set( 'status',      $data['status'] ?? $store->get('status') );

        if ( is_array( $data ) ) {
            foreach ( $data as $key => $value ) {
                if ( ! in_array( $key, [ 'id', 'name', 'slug', 'description', 'who_created', 'status' ], true ) ) {
                    $store->update_meta( $key, $value );
                }
            }
        }

        $store->save();

        return rest_ensure_response( [
            'success' => true,
            'id'      => $store->get_id(),
        ] );
    }


    public function get_states_by_country($request) {
        $country_code = $request->get_param('country');
        $states = WC()->countries->get_states($country_code);

        $state_list = [];

        if (is_array($states)) {
            foreach ($states as $code => $name) {
                $state_list[] = [
                    'label' => $name,
                    'value' => $code,
                ];
            }
        }

        return rest_ensure_response($state_list);
    }
}