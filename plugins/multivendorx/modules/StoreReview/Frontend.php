<?php
namespace MultiVendorX\StoreReview;

use MultiVendorX\FrontendScripts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Frontend {

    public function __construct() {
        add_filter( 'multivendorx_rewrite_rules', array( $this, 'add_review_rule' ), 10, 2 );
        add_filter( 'multivendorx_query_vars', array( $this, 'add_query_vars' ) );
        add_filter( 'multivendorx_store_tabs', array( $this, 'add_store_tab' ), 10, 2 );

        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
        add_action( 'woocommerce_order_item_meta_end', array( $this, 'multivendorx_add_store_review_button' ), 10, 3 );
    }

    public function enqueue_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-review-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-review-frontend-script' );
    }

    public function add_review_rule( $rules, $instance ) {
        $rules[] = array(
            '^' . $instance->custom_store_url . '/([^/]+)/reviews?$',
            'index.php?' . $instance->custom_store_url . '=$matches[1]&store_review=true',
            'top',
        );
        return $rules;
    }

    public function add_query_vars( $vars ) {
        $vars[] = 'store_review';
        return $vars;
    }

    public function add_store_tab( $tabs, $store_id ) {
        $tabs['reviews'] = array(
            'title' => __( 'Reviews', 'multivendorx' ),
            'url'   => $this->get_store_review_url( $store_id ),
        );
        return $tabs;
    }

    public function get_store_review_url( $store_id ) {
        return MultiVendorX()->store->storeutil->get_store_url( $store_id, 'reviews' );
    }


    public function multivendorx_add_store_review_button( $item_id, $item, $order ) {
        static $printed_stores = array(); // track already printed store IDs

        $product_id = $item->get_product_id();
        if ( ! $product_id ) {
            return;
        }

        // 🔹 Get store ID from product meta
        $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
        if ( ! $store_id ) {
            return;
        }

        $store_id = absint( $store_id );

        // 🔹 Avoid showing duplicate buttons for same store
        if ( in_array( $store_id, $printed_stores, true ) ) {
            return;
        }

        $printed_stores[] = $store_id;

        // 🔹 Generate review page link
        $review_url = MultiVendorX()->store->storeutil->get_store_url( $store_id, 'reviews' );

        // 🔹 Output default WooCommerce button
        echo '<div class="multivendorx-order-review-link">';
        echo '<a href="' . esc_url( $review_url ) . '" target="_blank" class="button alt">'
            . esc_html__( 'Leave a Review', 'multivendorx' ) .
            '</a>';
        echo '</div>';
    }
}
