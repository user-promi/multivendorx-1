<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Refund_Controller extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'refund';

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
                'methods'             => \WP_REST_Server::CREATABLE, // Add POST method
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
            ]
        ] );
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read_shop_orders' ) || current_user_can( 'edit_shop_orders' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('edit_shop_orders');
    }

    /**
     * Get refund items with pagination and filters
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }

        $limit      = max( intval( $request->get_param( 'row' ) ), 10 );
        $page       = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset     = ( $page - 1 ) * $limit;
        $count      = $request->get_param( 'count' );
        $search     = $request->get_param( 'searchField' );
        $search_action = $request->get_param( 'searchAction' );
        $status     = $request->get_param( 'status' );
        $start_date = $request->get_param( 'start_date' );
        $end_date   = $request->get_param( 'end_date' );

        // Count only request
        if ( $count ) {
            $total_count = $this->get_refund_requests_count( [
                'search' => $search,
                'search_action' => $search_action,
                'status' => $status,
                'start_date' => $start_date,
                'end_date' => $end_date,
            ] );
            return rest_ensure_response( (int) $total_count );
        }

        // Get refund data
        $refunds = $this->get_refund_requests_data( [
            'limit' => $limit,
            'offset' => $offset,
            'search' => $search,
            'search_action' => $search_action,
            'status' => $status,
            'start_date' => $start_date,
            'end_date' => $end_date,
        ] );

        return rest_ensure_response( $refunds );
    }

    /**
     * Get total count of refund requests based on filters
     */
    private function get_refund_requests_count( $args = [] ) {
        global $wpdb;

        $search = isset( $args['search'] ) ? sanitize_text_field( $args['search'] ) : '';
        $search_action = isset( $args['search_action'] ) ? sanitize_text_field( $args['search_action'] ) : 'all';
        $status = isset( $args['status'] ) ? sanitize_text_field( $args['status'] ) : 'all';
        $start_date = isset( $args['start_date'] ) ? sanitize_text_field( $args['start_date'] ) : '';
        $end_date = isset( $args['end_date'] ) ? sanitize_text_field( $args['end_date'] ) : '';

        // Get the orders table name
        $orders_table = $wpdb->prefix . 'wc_orders';
        $orders_meta_table = $wpdb->prefix . 'wc_orders_meta';

        $query = "SELECT COUNT(DISTINCT o.id) 
                  FROM {$orders_table} o 
                  INNER JOIN {$orders_meta_table} om ON o.id = om.order_id 
                  WHERE o.type = 'shop_order' 
                  AND om.meta_key = '_customer_refund_order' 
                  AND om.meta_value = 'refund_request'";

        // Date filter
        if ( $start_date && $end_date ) {
            $query .= $wpdb->prepare( " AND DATE(o.date_created_gmt) BETWEEN %s AND %s", $start_date, $end_date );
        }

        // Status filter
        if ( $status !== 'all' ) {
            $status_map = [
                'pending' => 'refund-requested',
                'approved' => 'refund-approved',
                'rejected' => 'refund-rejected'
            ];
            if ( isset( $status_map[ $status ] ) ) {
                $query .= $wpdb->prepare( " AND o.status = %s", $status_map[ $status ] );
            }
        }

        // Search filter
        if ( $search ) {
            switch ( $search_action ) {
                case 'order_number':
                    $query .= $wpdb->prepare( " AND o.id LIKE %s", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'customer':
                    $query .= $wpdb->prepare( " AND o.id IN (
                        SELECT order_id FROM {$orders_meta_table} 
                        WHERE meta_key IN ('_billing_first_name', '_billing_last_name', '_billing_company')
                        AND meta_value LIKE %s
                    )", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'email':
                    $query .= $wpdb->prepare( " AND o.id IN (
                        SELECT order_id FROM {$orders_meta_table} 
                        WHERE meta_key = '_billing_email' 
                        AND meta_value LIKE %s
                    )", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'products':
                    $query .= $wpdb->prepare( " AND o.id IN (
                        SELECT order_id FROM {$orders_meta_table} 
                        WHERE meta_key = '_customer_refund_product' 
                        AND meta_value LIKE %s
                    )", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'store':
                    $query .= $wpdb->prepare( " AND o.id IN (
                        SELECT order_id FROM {$orders_meta_table} 
                        WHERE meta_key = 'multivendorx_store_id' 
                        AND meta_value IN (
                            SELECT user_id FROM {$wpdb->usermeta} 
                            WHERE meta_key = 'store_name' 
                            AND meta_value LIKE %s
                        )
                    )", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                default: // 'all'
                    $query .= $wpdb->prepare( " AND (
                        o.id LIKE %s OR 
                        o.id IN (
                            SELECT order_id FROM {$orders_meta_table} 
                            WHERE meta_key IN ('_billing_first_name', '_billing_last_name', '_billing_company', '_billing_email', '_customer_refund_reason')
                            AND meta_value LIKE %s
                        ) OR
                        o.id IN (
                            SELECT order_id FROM {$orders_meta_table} 
                            WHERE meta_key = 'multivendorx_store_id' 
                            AND meta_value IN (
                                SELECT user_id FROM {$wpdb->usermeta} 
                                WHERE meta_key = 'store_name' 
                                AND meta_value LIKE %s
                            )
                        )
                    )", '%' . $wpdb->esc_like( $search ) . '%', '%' . $wpdb->esc_like( $search ) . '%', '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
            }
        }

        return $wpdb->get_var( $query );
    }

    /**
     * Get refund requests data with pagination and filters
     */
    private function get_refund_requests_data( $args = [] ) {
        global $wpdb;

        $limit = isset( $args['limit'] ) ? intval( $args['limit'] ) : 10;
        $offset = isset( $args['offset'] ) ? intval( $args['offset'] ) : 0;
        $search = isset( $args['search'] ) ? sanitize_text_field( $args['search'] ) : '';
        $search_action = isset( $args['search_action'] ) ? sanitize_text_field( $args['search_action'] ) : 'all';
        $status = isset( $args['status'] ) ? sanitize_text_field( $args['status'] ) : 'all';
        $start_date = isset( $args['start_date'] ) ? sanitize_text_field( $args['start_date'] ) : '';
        $end_date = isset( $args['end_date'] ) ? sanitize_text_field( $args['end_date'] ) : '';

        // Get the orders table name
        $orders_table = $wpdb->prefix . 'wc_orders';
        $orders_meta_table = $wpdb->prefix . 'wc_orders_meta';

        $query = "SELECT o.id, o.date_created_gmt, o.status,
                         om1.meta_value as refund_reason,
                         om2.meta_value as refund_products,
                         om3.meta_value as refund_images,
                         om4.meta_value as billing_first_name,
                         om5.meta_value as billing_last_name,
                         om6.meta_value as billing_email,
                         om7.meta_value as store_id
                  FROM {$orders_table} o 
                  INNER JOIN {$orders_meta_table} om ON o.id = om.order_id 
                  LEFT JOIN {$orders_meta_table} om1 ON o.id = om1.order_id AND om1.meta_key = '_customer_refund_reason'
                  LEFT JOIN {$orders_meta_table} om2 ON o.id = om2.order_id AND om2.meta_key = '_customer_refund_product'
                  LEFT JOIN {$orders_meta_table} om3 ON o.id = om3.order_id AND om3.meta_key = '_customer_refund_product_imgs'
                  LEFT JOIN {$orders_meta_table} om4 ON o.id = om4.order_id AND om4.meta_key = '_billing_first_name'
                  LEFT JOIN {$orders_meta_table} om5 ON o.id = om5.order_id AND om5.meta_key = '_billing_last_name'
                  LEFT JOIN {$orders_meta_table} om6 ON o.id = om6.order_id AND om6.meta_key = '_billing_email'
                  LEFT JOIN {$orders_meta_table} om7 ON o.id = om7.order_id AND om7.meta_key = 'multivendorx_store_id'
                  WHERE o.type = 'shop_order' 
                  AND om.meta_key = '_customer_refund_order' 
                  AND om.meta_value = 'refund_request'";

        // Date filter
        if ( $start_date && $end_date ) {
            $query .= $wpdb->prepare( " AND DATE(o.date_created_gmt) BETWEEN %s AND %s", $start_date, $end_date );
        }

        // Status filter
        if ( $status !== 'all' ) {
            $status_map = [
                'pending' => 'refund-requested',
                'approved' => 'refund-approved',
                'rejected' => 'refund-rejected'
            ];
            if ( isset( $status_map[ $status ] ) ) {
                $query .= $wpdb->prepare( " AND o.status = %s", $status_map[ $status ] );
            }
        }

        // Search filter
        if ( $search ) {
            switch ( $search_action ) {
                case 'order_number':
                    $query .= $wpdb->prepare( " AND o.id LIKE %s", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'customer':
                    $query .= $wpdb->prepare( " AND (
                        om4.meta_value LIKE %s OR 
                        om5.meta_value LIKE %s OR 
                        CONCAT(om4.meta_value, ' ', om5.meta_value) LIKE %s
                    )", '%' . $wpdb->esc_like( $search ) . '%', '%' . $wpdb->esc_like( $search ) . '%', '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'email':
                    $query .= $wpdb->prepare( " AND om6.meta_value LIKE %s", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'products':
                    $query .= $wpdb->prepare( " AND om2.meta_value LIKE %s", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                case 'store':
                    $query .= $wpdb->prepare( " AND om7.meta_value IN (
                        SELECT user_id FROM {$wpdb->usermeta} 
                        WHERE meta_key = 'store_name' 
                        AND meta_value LIKE %s
                    )", '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
                default: // 'all'
                    $query .= $wpdb->prepare( " AND (
                        o.id LIKE %s OR 
                        om4.meta_value LIKE %s OR 
                        om5.meta_value LIKE %s OR 
                        om6.meta_value LIKE %s OR 
                        om1.meta_value LIKE %s OR
                        om7.meta_value IN (
                            SELECT user_id FROM {$wpdb->usermeta} 
                            WHERE meta_key = 'store_name' 
                            AND meta_value LIKE %s
                        )
                    )", 
                    '%' . $wpdb->esc_like( $search ) . '%',
                    '%' . $wpdb->esc_like( $search ) . '%',
                    '%' . $wpdb->esc_like( $search ) . '%',
                    '%' . $wpdb->esc_like( $search ) . '%',
                    '%' . $wpdb->esc_like( $search ) . '%',
                    '%' . $wpdb->esc_like( $search ) . '%' );
                    break;
            }
        }

        $query .= " ORDER BY o.date_created_gmt DESC LIMIT %d OFFSET %d";
        $query = $wpdb->prepare( $query, $limit, $offset );

        $results = $wpdb->get_results( $query, ARRAY_A );

        $formatted_refunds = [];

        foreach ( $results as $refund_request ) {
            $order_id = $refund_request['id'];
            $order = wc_get_order( $order_id );

            if ( ! $order ) {
                continue;
            }

            // Get product names from product IDs
            $product_names = [];
            $refund_products = maybe_unserialize( $refund_request['refund_products'] );
            if ( is_array( $refund_products ) ) {
                foreach ( $refund_products as $product_id ) {
                    $product = wc_get_product( $product_id );
                    if ( $product ) {
                        $product_names[] = $product->get_name();
                    }
                }
            }

            // Calculate refund amount (total of refunded products)
            $refund_amount = 0;
            if ( is_array( $refund_products ) ) {
                foreach ( $order->get_items() as $item ) {
                    if ( in_array( $item->get_product_id(), $refund_products ) ) {
                        $refund_amount += $item->get_total();
                    }
                }
            }

            // Map order status to refund status
            $status_map = [
                'refund-requested' => 'Pending',
                'refund-approved' => 'Approved', 
                'refund-rejected' => 'Rejected',
                'processing' => 'Pending',
                'completed' => 'Approved',
                'cancelled' => 'Rejected',
                'wc-refund-requested' => 'Pending',
                'wc-refund-approved' => 'Approved',
                'wc-refund-rejected' => 'Rejected'
            ];

            $status = isset( $status_map[ $refund_request['status'] ] ) ? 
                     $status_map[ $refund_request['status'] ] : 'Pending';

            // Get customer name from meta or order object
            $customer_name = trim( ($refund_request['billing_first_name'] ?? '') . ' ' . ($refund_request['billing_last_name'] ?? '') );
            if ( empty( $customer_name ) ) {
                $customer_name = $order->get_billing_first_name() . ' ' . $order->get_billing_last_name();
            }

            // Get email from meta or order object
            $customer_email = $refund_request['billing_email'] ?? $order->get_billing_email();

            // Get store name
            $store_name = __('Unknown Store', 'multivendorx');
            $store_id = $refund_request['store_id'] ?? 0;
            if ( $store_id ) {
                $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
                $store_name = $store_obj->get('name');
            }

            $formatted_refunds[] = [
                'id' => (int) $order_id,
                'orderNumber' => '#' . $order_id,
                'customer' => $customer_name ?: __( 'Guest', 'multivendorx' ),
                'email' => $customer_email ?: __( 'No email', 'multivendorx' ),
                'amount' => strip_tags(wc_price( $refund_amount )),
                'reason' => $refund_request['refund_reason'] ?: __( 'No reason provided', 'multivendorx' ),
                'date' => $refund_request['date_created_gmt'],
                'status' => $status,
                'products' => implode(', ', $product_names),
                'store_name' => $store_name,
            ];
        }

        return $formatted_refunds;
    }

    /**
     * Update refund status (approve/reject)
     */
    public function update_item($request) {
        $nonce = $request->get_header('X-WP-Nonce');
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                ['status' => 403]
            );
        }

        $order_id = absint($request->get_param('order_id'));
        $status = sanitize_text_field($request->get_param('status'));
        $reject_reason = sanitize_text_field($request->get_param('reject_reason'));

        if (!$order_id) {
            return new \WP_Error(
                'invalid_order_id',
                __('Invalid order ID', 'multivendorx'),
                ['status' => 400]
            );
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new \WP_Error(
                'order_not_found',
                __('Order not found', 'multivendorx'),
                ['status' => 404]
            );
        }

        try {
            // Map status to WooCommerce order status
            $status_map = [
                'approved' => 'refund-approved',
                'rejected' => 'refund-rejected'
            ];

            if (!isset($status_map[$status])) {
                return new \WP_Error(
                    'invalid_status',
                    __('Invalid refund status', 'multivendorx'),
                    ['status' => 400]
                );
            }

            $wc_status = $status_map[$status];

            // Update order status
            $order->update_status($wc_status);

            // Store rejection reason if provided
            if ($status === 'rejected' && $reject_reason) {
                $order->update_meta_data('_refund_rejection_reason', $reject_reason);
                $order->save();
            }

            // Add order note
            $note = sprintf(
                __('Refund request %s.', 'multivendorx'),
                $status === 'approved' ? __('approved', 'multivendorx') : __('rejected', 'multivendorx')
            );
            
            if ($status === 'rejected' && $reject_reason) {
                $note .= ' ' . sprintf(__('Reason: %s', 'multivendorx'), $reject_reason);
            }

            $order->add_order_note($note);

            // If approved, you might want to process the actual refund here
            if ($status === 'approved') {
                // Add your refund processing logic here
                // This would typically create a WooCommerce refund
                do_action('multivendorx_refund_approved', $order_id);
            } else {
                do_action('multivendorx_refund_rejected', $order_id, $reject_reason);
            }

            return rest_ensure_response([
                'success' => true,
                'message' => sprintf(__('Refund request %s successfully', 'multivendorx'), $status),
                'order_id' => $order_id,
                'status' => $status
            ]);

        } catch (Exception $e) {
            return new \WP_Error(
                'update_failed',
                __('Failed to update refund status', 'multivendorx'),
                ['status' => 500]
            );
        }
    }

    public function get_vendor_parent_order_item_id( $item_id ) {
        global $wpdb;
        $vendor_item_id = $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->order_itemmeta} WHERE meta_key=%s AND order_item_id=%d", 'store_order_item_id', absint( $item_id ) ) );
        return $vendor_item_id;
    }
}