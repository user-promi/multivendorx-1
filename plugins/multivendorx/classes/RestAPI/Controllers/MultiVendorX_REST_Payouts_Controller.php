<?php
/**
 * Modules REST API controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API controller for Payouts.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class MultiVendorX_REST_Payouts_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'payouts';

    /**
     * Register routes.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'id' => array( 'required' => true ),
					),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/states/(?P<country>[A-Z]{2})',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_states_by_country' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			)
        );
    }

    /**
     * Check if the current user can get a collection of items.
     *
     * @return bool True if the user has permission, false otherwise.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' );
    }

    /**
     * Check if the current user can create a single item.
     *
     * @return bool True if the user has permission, false otherwise.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Check if the current user can update a single item.
     *
     * @return bool True if the user has permission, false otherwise.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Get a collection of items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            // Pagination.
            $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
            $page   = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset = ( $page - 1 ) * $limit;
            $count  = $request->get_param( 'count' );

            // Count only.
            if ( $count ) {
                $pending_products_count = count(
                    wc_get_products(
                        array(
                            'status'   => 'pending',
                            'limit'    => -1,
                            'return'   => 'ids',
                            'meta_key' => Utill::POST_META_SETTINGS['store_id'],
                        )
                    )
                );

                return rest_ensure_response( (int) $pending_products_count );
            }

            // Fetch pending products with pagination.
            $pending_products = wc_get_products(
                array(
                    'status'   => 'pending',
                    'limit'    => $limit,
                    'offset'   => $offset,
                    'return'   => 'objects',
                    'meta_key' => Utill::POST_META_SETTINGS['store_id'],
                )
            );

            $formatted_products = array();
            foreach ( $pending_products as $product ) {
                $formatted_products[] = apply_filters(
                    'multivendorx_product',
                    array(
                        'id'     => $product->get_id(),
                        'name'   => $product->get_name(),
                        'sku'    => $product->get_sku(),
                        'price'  => $product->get_price(),
                        'status' => $product->get_status(),
                    )
                );
            }

            return rest_ensure_response( $formatted_products );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log($e);

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Create a single item.
     *
     * @param object $request Full details about the request.
     */
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            $registrations = $request->get_header( 'registrations' );

            $store_data = $request->get_param( 'formData' );
            // Create store object.
            $store = new \MultiVendorX\Store\Store();

            $core_fields = array(
                Utill::STORE_SETTINGS_KEYS['name'],
                Utill::STORE_SETTINGS_KEYS['slug'],
                Utill::STORE_SETTINGS_KEYS['description'],
                Utill::STORE_SETTINGS_KEYS['who_created'],
                Utill::STORE_SETTINGS_KEYS['status'],
			);
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
                // Collect all non-core fields into one array.
                $non_core_fields = array();
                foreach ( $store_data as $key => $value ) {
                    if ( ! in_array( $key, $core_fields, true ) ) {
                        $non_core_fields[ $key ] = $value;
                    }
                }

                // Save them under one key.
                if ( ! empty( $non_core_fields ) ) {
                    $store->update_meta( Utill::STORE_SETTINGS_KEYS['registration_data'], $non_core_fields );
                }
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $insert_id,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log($e);

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get a specific item from the collection.
     *
     * @param object $request Full details about the request.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            $id            = absint( $request->get_param( 'id' ) );
            $fetch_user    = $request->get_param( 'fetch_user' );
            $registrations = $request->get_header( 'registrations' );
            if ( $fetch_user ) {
                $users = StoreUtil::get_store_users( $id );

                $response = array(
                    'id'           => $id,
                    'store_owners' => $users,
                );
                return rest_ensure_response( $response );
            }

            // Load the store.
            $store = new \MultiVendorX\Store\Store( $id );
            if ( $registrations ) {
                $response = StoreUtil::get_store_registration_form( $store->get_id() );

                return rest_ensure_response( $response );
            }

            $response = array(
                'id'          => $store->get_id(),
                'name'        => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                'slug'        => $store->get( Utill::STORE_SETTINGS_KEYS['slug'] ),
                'description' => $store->get( Utill::STORE_SETTINGS_KEYS['description'] ),
                'who_created' => $store->get( Utill::STORE_SETTINGS_KEYS['who_created'] ),
                'status'      => $store->get( Utill::STORE_SETTINGS_KEYS['status'] ),
            );

            // Add meta data.
            foreach ( $store->meta_data as $key => $values ) {
                $response[ $key ] = is_array( $values ) ? $values[0] : $values;
            }

            return rest_ensure_response( $response );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log($e);

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Update an existing item.
     *
     * @param object $request Request object.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            $id   = absint( $request->get_param( 'id' ) );
            $data = $request->get_json_params();

            $store = new \MultiVendorX\Store\Store( $id );

            if ( $data['store_owners'] ) {
                StoreUtil::add_store_users(
                    array(
                        'store_id'     => $data['id'],
                        'store_owners' => $data['store_owners'],
                        'role_id'      => 'store_owner',
                    )
                );

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }

            $store->set( Utill::STORE_SETTINGS_KEYS['name'], $data['name'] ?? $store->get( Utill::STORE_SETTINGS_KEYS['name'] ) );
            $store->set( Utill::STORE_SETTINGS_KEYS['slug'], $data['slug'] ?? $store->get( Utill::STORE_SETTINGS_KEYS['slug'] ) );
            $store->set( Utill::STORE_SETTINGS_KEYS['description'], $data['description'] ?? $store->get( Utill::STORE_SETTINGS_KEYS['description'] ) );
            $store->set( Utill::STORE_SETTINGS_KEYS['who_created'], 'admin' );
            $store->set( Utill::STORE_SETTINGS_KEYS['status'], $data['status'] ?? $store->get( Utill::STORE_SETTINGS_KEYS['status'] ) );

            if ( is_array( $data ) ) {
                foreach ( $data as $key => $value ) {
                    if ( ! in_array(
                        $key,
                        array(
							Utill::STORE_SETTINGS_KEYS['id'],
							Utill::STORE_SETTINGS_KEYS['name'],
							Utill::STORE_SETTINGS_KEYS['slug'],
							Utill::STORE_SETTINGS_KEYS['description'],
							Utill::STORE_SETTINGS_KEYS['who_created'],
							Utill::STORE_SETTINGS_KEYS['status'],
                        ),
                        true
                    ) ) {
                        $store->update_meta( $key, $value );
                    }
                }
            }

            $store->save();

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $store->get_id(),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log($e);

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get states by country code.
     *
     * @param object $request Full details about the request.
     */
    public function get_states_by_country( $request ) {
        $country_code = $request->get_param( 'country' );
        $states       = WC()->countries->get_states( $country_code );

        $state_list = array();

        if ( is_array( $states ) ) {
            foreach ( $states as $code => $name ) {
                $state_list[] = array(
                    'label' => $name,
                    'value' => $code,
                );
            }
        }

        return rest_ensure_response( $state_list );
    }
}
