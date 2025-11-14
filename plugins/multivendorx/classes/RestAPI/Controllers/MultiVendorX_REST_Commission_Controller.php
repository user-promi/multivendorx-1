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
    
        // Check if CSV download is requested
        $format = $request->get_param( 'format' );
        if ( $format === 'csv' ) {
            return $this->download_csv( $request );
        }

        if ( $format === 'reports' ) {
            $top_stores = $request->get_param( 'top_stores' );
            
            if( $top_stores ) return CommissionUtil::get_commission_summary_for_store( null, $top_stores, $top_stores);

            return CommissionUtil::get_commission_summary_for_store();
        }

        $limit   = max( intval( $request->get_param( 'row' ) ), 10 );
        $page    = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset  = ( $page - 1 ) * $limit;
        $count   = $request->get_param( 'count' );
        $storeId = $request->get_param( 'store_id' );
        $status = $request->get_param( 'status' );
        $start_date = date('Y-m-d 00:00:00', strtotime(sanitize_text_field($request->get_param('startDate'))));
        $end_date   = date('Y-m-d 23:59:59', strtotime(sanitize_text_field($request->get_param('endDate'))));
        
        // ADD THESE LINES FOR SORTING
        $orderBy   = sanitize_text_field( $request->get_param( 'orderBy' ) );
        $order     = sanitize_text_field( $request->get_param( 'order' ) );
    
        // Prepare filter for CommissionUtil
        $filter = array(
            'perpage' => $limit,
            'page'    => $page,
        );
    
        if ( ! empty( $storeId ) ) {
            $filter['store_id'] = intval( $storeId );
        }
    
        if ( ! empty( $status ) ) {
            $filter['status'] = $status;
        }
    
        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $filter['created_at'] = array(
                'compare' => 'BETWEEN',
                'value'   => array( $start_date, $end_date ),
            );
        }
    
        // ADD SORTING TO FILTER
        if ( ! empty( $orderBy ) && ! empty( $order ) ) {
            $filter['orderBy'] = $orderBy;
            $filter['order']   = $order;
        }
    
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
        // Rest of your existing code remains the same...
        $commissions = CommissionUtil::get_commissions(
            $filter,
            false
        );
    
    
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
                    'marketplaceFee'      => $commission->marketplace_fee,
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

        // Prepare base filter (for store-specific counts)
        $base_filter = [];
        if ( ! empty( $storeId ) && !current_user_can('manage_options') ) {
            $base_filter['store_id'] = intval( $storeId );
        }

        // Status-wise counts with store/date filters applied
        $all                 = CommissionUtil::get_commissions( $base_filter, true, true );
        $paid                = CommissionUtil::get_commissions( array_merge( $base_filter, ['status' => 'paid'] ), true, true );
        $refunded            = CommissionUtil::get_commissions( array_merge( $base_filter, ['status' => 'refunded'] ), true, true );
        $partially_refunded  = CommissionUtil::get_commissions( array_merge( $base_filter, ['status' => 'partially_refunded'] ), true, true );
        $cancelled           = CommissionUtil::get_commissions( array_merge( $base_filter, ['status' => 'cancelled'] ), true, true );
        
        $response = [
            'commissions'        => $formatted_commissions,
            'all'                => $all,
            'paid'               => $paid,
            'refunded'           => $refunded,
            'partially_refunded' => $partially_refunded,
            'cancelled'          => $cancelled,
        ];
        return rest_ensure_response( $response );
    }

    private function download_csv( $request ) {
        $storeId    = $request->get_param( 'store_id' );
        $status     = $request->get_param( 'status' );
        $ids        = $request->get_param( 'ids' );
        $start_date = sanitize_text_field( $request->get_param( 'startDate' ) );
        $end_date   = sanitize_text_field( $request->get_param( 'endDate' ) );
        $page       = $request->get_param( 'page' );
        $per_page   = $request->get_param( 'row' );
    
        // Prepare filter for CommissionUtil - NO pagination by default
        $filter = array();
        
        if ( ! empty( $storeId ) ) {
            $filter['store_id'] = intval( $storeId );
        }
        
        if ( ! empty( $status ) ) {
            $filter['status'] = $status;
        }
        
        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $filter['created_at'] = array(
                'compare' => 'BETWEEN',
                'value'   => array( date('Y-m-d 00:00:00', strtotime($start_date)), date('Y-m-d 23:59:59', strtotime($end_date)) ),
            );
        }
    
        // If specific IDs are requested (selected rows from bulk action)
        if ( ! empty( $ids ) ) {
            $filter['id__in'] = array_map( 'intval', explode( ',', $ids ) );
        } 
        // If pagination parameters are provided (current page export from bulk action)
        elseif ( ! empty( $page ) && ! empty( $per_page ) ) {
            $filter['perpage'] = intval( $per_page );
            $filter['page']    = intval( $page );
        }
        // Otherwise, export ALL data with current filters (no pagination - from Export All button)
    
        // Fetch commissions
        $commissions = \MultiVendorX\Commission\CommissionUtil::get_commissions( $filter, false );
        
        if ( empty( $commissions ) ) {
            return new \WP_Error( 'no_data', __( 'No commission data found.', 'multivendorx' ), array( 'status' => 404 ) );
        }
    
        // CSV headers
        $headers = array(
            'ID', 
            'Order ID', 
            'Store Name', 
            'Total Order Amount', 
            'Commission Amount',
            'Facilitator Fee', 
            'Gateway Fee', 
            'Shipping Amount', 
            'Tax Amount',
            'Commission Total', 
            'Status', 
            'Created At',
            'Commission Refunded',
            'Currency'
        );
    
        // Build CSV data
        $csv_output = fopen( 'php://output', 'w' );
        ob_start();
        
        // Add BOM for UTF-8 compatibility
        fwrite($csv_output, "\xEF\xBB\xBF");
        
        fputcsv( $csv_output, $headers );
    
        foreach ( $commissions as $commission ) {
            $store = new \MultiVendorX\Store\Store( $commission->store_id );
            $store_name = $store ? $store->get('name') : '';
    
            fputcsv( $csv_output, array(
                $commission->ID,
                $commission->order_id,
                $store_name,
                $commission->total_order_amount,
                $commission->commission_amount,
                $commission->facilitator_fee,
                $commission->gateway_fee,
                $commission->shipping_amount,
                $commission->tax_amount,
                $commission->commission_total,
                $commission->status,
                $commission->created_at,
                $commission->commission_refunded,
                $commission->currency,
            ));
        }
    
        fclose( $csv_output );
        $csv = ob_get_clean();
    
        // Determine filename based on context
        $filename = 'commissions_';
        if ( ! empty( $ids ) ) {
            $filename .= 'selected_';
        } elseif ( ! empty( $page ) ) {
            $filename .= 'page_' . $page . '_';
        } else {
            $filename .= 'all_';
        }
        $filename .= date( 'Y-m-d' ) . '.csv';
    
        // Send headers for browser download
        header( 'Content-Type: text/csv; charset=UTF-8' );
        header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
        header( 'Pragma: no-cache' );
        header( 'Expires: 0' );
    
        echo $csv;
        exit;
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
            'store_id'      => absint( $commission->store_id ),
            'status'        => $commission->status,
            'amount'        => wc_format_decimal( $commission->commission_amount, 2 ),
            'shipping'      => wc_format_decimal( $commission->shipping_amount, 2 ),
            'tax'           => wc_format_decimal( $commission->tax_amount, 2 ),
            'total'         => wc_format_decimal( $commission->commission_total, 2 ),
            'commission_refunded'  => $commission->commission_refunded,
            'note'          => $commission->commission_note,
            'created'       => $commission->created_at,
            'items'         => $items,
        ];
        
    
        return rest_ensure_response( $response );
    }
}