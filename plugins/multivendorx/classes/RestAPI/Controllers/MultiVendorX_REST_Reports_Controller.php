<?php
/**
 * MultiVendorX REST API Reports controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Transaction\Transaction;
use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Reports controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class MultiVendorX_REST_Reports_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'reports';

    /**
     * Register the routes for the objects of the controller.
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
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
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
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ), // only admins can delete.
				),
			)
        );
    }

    /**
     * Check if a given request has access to read items.
     *
     * @param  object $request Full details about the request.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );
    }

    /**
     * Check if a given request has access to create an item.
     *
     * @param  object $request Full details about the request.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' );
    }

    /**
     * Check if a given request has access to update an item.
     *
     * @param  object $request Full details about the request.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' );
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
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
            $page   = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset = ( $page - 1 ) * $limit;

            return rest_ensure_response(
                array(
                    'items'   => $items,
                    'all'     => $all_count,
                    'publish' => $publish_count,
                    'pending' => $pending_count,
                    'draft'   => $draft_count,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

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
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            return rest_ensure_response(
                array()
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Update an existing item.
     *
     * @param object $request Full details about the request.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $post_id,
                    'title'   => $data['title'] ?? '',
                    'content' => $data['content'] ?? '',
                    'status'  => get_post_status( $post_id ),
                    'stores'  => $stores,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get a single item.
     *
     * @param object $request Full details about the request.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $id = absint( $request->get_param( 'id' ) );
            if ( ! $id ) {
                return new \WP_Error(
                    'invalid_store_id',
                    __( 'Invalid store ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            // --- Fetch Data ---
            $commission  = CommissionUtil::get_commission_summary_for_store( $id );
            $transaction = Transaction::get_balances_for_store( $id );

            // --- Fetch Pending Withdraw Amount ---
            $store_meta      = Store::get_store_by_id( $id );
            $withdraw_amount = 0;
            if ( ! empty( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] ] ) ) {
                $withdraw_amount = floatval( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] ] );
            }

            // --- Merge Data ---
            $commission  = is_array( $commission ) ? $commission : array();
            $transaction = is_array( $transaction ) ? $transaction : array();

            $merged_data                     = array_merge( $commission, $transaction );
            $merged_data['threshold_amount'] = MultiVendorX()->setting->get_setting( 'payout_threshold_amount', 0 );
            $merged_data['lock_period']      = MultiVendorX()->setting->get_setting( 'commission_lock_period', 0 );
            // --- Include Store ID and Withdraw Amount ---
            $merged_data['store_id']        = $id;
            $merged_data['withdraw_amount'] = $withdraw_amount;

            return rest_ensure_response( $merged_data );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Delete a single item.
     *
     * @param object $request Full data about the request.
     */
    public function delete_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $post_id,
                    'message' => __( 'Announcement deleted successfully', 'multivendorx' ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
}
