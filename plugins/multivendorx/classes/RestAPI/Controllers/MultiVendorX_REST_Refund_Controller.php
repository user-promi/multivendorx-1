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

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
            // [
            //     'methods'             => \WP_REST_Server::READABLE,
            //     'callback'            => [ $this, 'get_items' ],
            //     'permission_callback' => [ $this, 'get_items_permissions_check' ],
            // ],
            // [
            //     'methods'             => \WP_REST_Server::CREATABLE,
            //     'callback'            => [ $this, 'create_item' ],
            //     'permission_callback' => [ $this, 'create_item_permissions_check' ],
            // ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
            ],
        ] );

        // register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
        //     [
        //         'methods'             => \WP_REST_Server::READABLE,
        //         'callback'            => [$this, 'get_item'],
        //         'permission_callback' => [$this, 'get_items_permissions_check'],
        //         'args'                => [
        //             'id' => ['required' => true],
        //         ],
        //     ],
        //     [
        //         'methods'             => \WP_REST_Server::EDITABLE,
        //         'callback'            => [$this, 'update_item'],
        //         'permission_callback' => [$this, 'update_item_permissions_check'],
        //     ],
        // ]);
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' );
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'edit_shop_orders' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('edit_shop_orders');
    }

    public function update_item($request) {
        $refund_info = $request->get_param('payload');

        $order_id = $refund_info['orderId'] ? absint($refund_info['orderId']) : 0;
        $refund_amount = wc_format_decimal($refund_info['refundAmount'], wc_get_price_decimals());
        // $refunded_amount = wc_format_decimal(sanitize_text_field(wp_unslash($_POST['refunded_amount'])), wc_get_price_decimals());
        $items = $refund_info['items'] ?? [];
        $refund_reason = sanitize_text_field($refund_info['reason']);
        $restock_refunded_items = 'true' === $refund_info['restock'];
        $refund = false;
        $response_data = array();

        try {
            $order = wc_get_order($order_id);

            $parent_order_id = $order->get_parent_id();
            $parent_order = wc_get_order( $parent_order_id );
            $parent_items_ids = array_keys($parent_order->get_items( array( 'line_item', 'fee', 'shipping' ) ));

            $order_items = $order->get_items();
            $max_refund = wc_format_decimal($order->get_total() - $order->get_total_refunded(), wc_get_price_decimals());

            if (!$refund_amount || $max_refund < $refund_amount || $refund_amount < 0) {
                return new \WP_Error('invalid_amount', __('Invalid refund amount.', 'multivendorx'), ['status' => 400]);
            }

            // if ($refunded_amount !== wc_format_decimal($order->get_total_refunded(), wc_get_price_decimals())) {
            //     throw new \Exception(__('Error processing refund. Please try again.', 'multivendorx'));
            // }

            // Prepare line items which we are refunding.
            $line_items = array();
            $parent_line_items = array();

            $item_keys = array_keys($items);

            foreach ($item_keys as $item_id) {
                $line_items[$item_id] = array(
                    'qty' => 0,
                    'refund_total' => 0,
                    'refund_tax' => array(),
                );
                $parent_item_id = $this->get_vendor_parent_order_item_id($item_id);
                if( $parent_item_id && in_array($parent_item_id, $parent_items_ids) ){
                    $parent_line_items[$parent_item_id] = array(
                        'qty' => 0,
                        'refund_total' => 0,
                        'refund_tax' => array(),
                    );
                }
            }

            foreach ($items as $item_id => $value) {
                $line_items[$item_id]['qty'] = max($value['qty'], 0);
                $line_items[$item_id]['refund_total'] = wc_format_decimal($value['total']);

                $parent_item_id = $this->get_vendor_parent_order_item_id($item_id);
                if( $parent_item_id && in_array($parent_item_id, $parent_items_ids) ){
                    $parent_line_items[$parent_item_id]['qty'] = max($value['qty'], 0);
                    $parent_line_items[$parent_item_id]['refund_total'] = wc_format_decimal($value['total']);
                }
            }


            // foreach ($line_item_tax_totals as $item_id => $tax_totals) {
            //     $line_items[$item_id]['refund_tax'] = array_filter(array_map('wc_format_decimal', $tax_totals));
                
            //     $parent_item_id = $this->get_vendor_parent_order_item_id($item_id);
            //     if( $parent_item_id && in_array($parent_item_id, $parent_items_ids) ){
            //         $parent_line_items[$parent_item_id]['refund_tax'] = array_filter(array_map('wc_format_decimal', $tax_totals));
            //     }
            // }

            if ( $line_items ) {
                // Create the refund object.
                $refund = wc_create_refund(
                        array(
                            'amount' => $refund_amount,
                            'reason' => $refund_reason,
                            'order_id' => $order_id,
                            'line_items' => $line_items,
                            'refund_payment' => false,
                            'restock_items' => $restock_refunded_items,
                        )
                );  
            }
            
            if( !empty($parent_line_items) ){
                if (apply_filters('mvx_allow_refund_parent_order', true)) {
                    $parent_refund = wc_create_refund(
                            array(
                                'amount' => $refund_amount,
                                'reason' => $refund_reason,
                                'order_id' => $parent_order_id,
                                'line_items' => $parent_line_items,
                                'refund_payment' => false,
                                'restock_items' => $restock_refunded_items,
                            )
                    );
                }
            }

            if (is_wp_error($refund)) {
                return new \WP_Error('refund_failed', $refund->get_error_message(), ['status' => 400]);
            }
            if (is_wp_error($parent_refund)) {
                return new \WP_Error('refund_failed', $parent_refund->get_error_message(), ['status' => 400]);
            }
            
            do_action( 'mvx_order_refunded', $order_id, $refund->get_id() );

            if (did_action('woocommerce_order_fully_refunded')) {
                $response_data['status'] = 'fully_refunded';
            }

            return rest_ensure_response([
                'success' => true,
                'response_data' => $response_data,
            ]);
        } catch (Exception $e) {
            return new \WP_Error('refund_failed', __('Refund Failed', 'multivendorx'), ['status' => 400]);
        }
    }

    public function get_vendor_parent_order_item_id( $item_id ) {
        global $wpdb;
        $vendor_item_id = $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->order_itemmeta} WHERE meta_key=%s AND order_item_id=%d", 'store_order_item_id', absint( $item_id ) ) );
        // check for shipping
        // if( !$vendor_item_id ){
        //     $vendor_item_id = $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->order_itemmeta} WHERE meta_key=%s AND order_item_id=%d", '_vendor_order_shipping_item_id', absint( $item_id ) ) );
        // }
        return $vendor_item_id;
    }
}