<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Commission_Controller extends \WP_REST_Controller {
    
	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'commission';

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
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'manage_options' )|| current_user_can( 'edit_stores' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('manage_options')||current_user_can( 'edit_stores' );
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
    
        $limit   = max( intval( $request->get_param( 'row' ) ), 10 );
        $page    = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset  = ( $page - 1 ) * $limit;
        $count   = $request->get_param( 'count' );
        $storeId = $request->get_param( 'store_id' );
    
        // Prepare filter for CommissionUtil
        $filter = array(
            'perpage' => $limit,
            'page'    => $page,
        );
    
        if ( ! empty( $storeId ) ) {
            $filter['store_id'] = intval( $storeId );
        }
    
        // Fetch commissions
        $commissions = CommissionUtil::get_commissions(
            $filter,
            false // return stdClass instead of Commission object
        );
    
        if ( $count ) {
            global $wpdb;
            $table_name  = "{$wpdb->prefix}" . Utill::TABLES['commission'];
            
            if ( ! empty( $storeId ) ) {
                $total_count = $wpdb->get_var( $wpdb->prepare(
                    "SELECT COUNT(*) FROM $table_name WHERE store_id = %d",
                    $storeId
                ));
            } else {
                $total_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
            }
    
            return rest_ensure_response( (int) $total_count );
        }
    
        $formatted_commissions = array();
    
        foreach ( $commissions as $commission ) {
            $store      = new Store( $commission->store_id );
            $store_name = $store ? $store->get('name') : '';
    
            $formatted_commissions[] = apply_filters(
                'multivendorx_commission',
                array(
                    'id'                  => (int) $commission->ID,
                    'orderId'             => (int) $commission->order_id,
                    'storeId'             => (int) $commission->store_id,
                    'storeName'           => $store_name,
                    'totalOrderAmount'    => $commission->total_order_amount,
                    'commissionAmount'    => $commission->commission_amount,
                    'facilitatorFee'      => $commission->facilitator_fee,
                    'gatewayFee'          => $commission->gateway_fee,
                    'shippingAmount'      => $commission->shipping_amount,
                    'taxAmount'           => $commission->tax_amount,
                    'shippingTaxAmount'   => $commission->shipping_tax_amount,
                    'discountAmount'      => $commission->discount_amount,
                    'commissionTotal'     => $commission->commission_total,
                    'commissionRefunded'  => $commission->commission_refunded,
                    'currency'            => $commission->currency,
                    'status'              => $commission->status,
                    'commissionNote'      => $commission->commission_note,
                    'createdAt'           => $commission->created_at,
                    'updatedAt'           => $commission->updated_at,
                )
            );
        }
    
        return rest_ensure_response( $formatted_commissions );
    }
    
    public function get_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        // Get commission ID from request
        $id = absint( $request->get_param( 'id' ) );
    
        // Fetch raw commission data (stdClass)
        $commission = \MultiVendorX\Commission\CommissionUtil::get_commission_db( $id );
    
        if ( ! $commission || empty( $commission->ID ) ) {
            return new \WP_Error(
                'not_found',
                __( 'Commission not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // Validate order ID
        if ( empty( $commission->order_id ) ) {
            return new \WP_Error(
                'missing_order',
                __( 'Order ID missing in commission data', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        $order_id = absint( $commission->order_id );
        $order    = wc_get_order( $order_id );
    
        if ( ! $order ) {
            return new \WP_Error(
                'order_not_found',
                __( 'Order not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // Build line items
        $items = [];
        foreach ( $order->get_items() as $item_id => $item ) {
            $product = $item->get_product();
    
            $items[] = [
                'product_id' => $item->get_product_id(),
                'name'       => $item->get_name(),
                'sku'        => $product ? $product->get_sku() : '',
                'price'      => wc_price( $order->get_item_subtotal( $item, false, true ) ),
                'qty'        => $item->get_quantity(),
                'total'      => wc_price( $order->get_line_total( $item, true, true ) ),
            ];
        }
    
        // Prepare response
        $response = [
            'commission_id' => absint( $commission->ID ),
            'order_id'      => $order_id,
            'vendor_id'     => absint( $commission->store_id ),
            'status'        => $commission->status,
            'amount'        => wc_price( $commission->commission_amount ),
            'shipping'      => wc_price( $commission->shipping_amount ),
            'tax'           => wc_price( $commission->tax_amount ),
            'total'         => wc_price( $commission->commission_total ),
            'note'          => $commission->commission_note,
            'created'       => $commission->created_at,
            'items'         => $items,
        ];
    
        return rest_ensure_response( $response );
    }
    
    
    
    
    
}