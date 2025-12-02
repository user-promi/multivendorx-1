<?php

namespace MultiVendorX\Order;

use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Order Frontend class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */

class Frontend {
    public function __construct() {
        // customer's order list (my account)
        add_filter( 'woocommerce_my_account_my_orders_query', array( $this, 'woocommerce_my_account_my_orders_query' ), 99 );
        add_filter( 'woocommerce_account_orders_columns', array( $this, 'woocommerce_my_account_my_orders_columns' ), 99 );
        add_action( 'woocommerce_my_account_my_orders_column_mvx_suborder', array( $this, 'woocommerce_my_account_my_orders_column_mvx_suborder' ), 99 );

        add_filter( 'woocommerce_customer_available_downloads', array( $this, 'woocommerce_customer_available_downloads' ), 99 );
    }


    public function woocommerce_my_account_my_orders_query( $query ) {
        if ( ! isset( $query['post_parent'] ) ) {
            $query['post_parent'] = 0;
        }
        return $query;
    }

    public function woocommerce_my_account_my_orders_columns( $columns ) {
        $suborder_column['mvx_suborder'] = __( 'Suborders', 'multivendorx' );
        $columns                         = array_slice( $columns, 0, 1, true ) + $suborder_column + array_slice( $columns, 1, count( $columns ) - 1, true );
        return $columns;
    }

    public function woocommerce_my_account_my_orders_column_mvx_suborder( $order ) {
        $mvx_suborders = MultiVendorX()->order->get_suborders( $order->get_id(), array( 'type' => 'shop_order' ) );

        if ( $mvx_suborders ) {
            echo '<ul class="mvx-order-vendor" style="margin:0px;list-style:none;">';
            foreach ( $mvx_suborders as $suborder ) {
                $vendor    = Store::get_store_by_id( $suborder->get_meta( Utill::POST_META_SETTINGS['store_id'], true ) );
                $order_uri = esc_url( $suborder->get_view_order_url() );
                printf(
                    '<li><strong><a href="%s" title="%s">#%s</a></strong> &ndash; <small class="mvx-order-for-vendor">%s %s</small></li>',
                    $order_uri,
                    sanitize_title( $suborder->get_status() ),
                    $suborder->get_order_number(),
                    _x( 'for', 'Order table details', 'multivendorx' ),
                    $vendor->get( 'name' )
                );
                do_action( 'mvx_after_suborder_details', $suborder );
            }
            echo '<ul>';
        } else {
            echo '<span class="na">&ndash;</span>';
        }
    }

    public function woocommerce_customer_available_downloads( $downloads ) {
        $parent_downloads = array();
        foreach ( $downloads as $download ) {
            if ( ! wp_get_post_parent_id( $download['order_id'] ) ) {
                $parent_downloads[] = $download;
            }
        }
        return $parent_downloads;
    }
}
