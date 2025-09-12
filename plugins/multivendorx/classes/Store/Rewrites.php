<?php

namespace MultiVendorX\Store;

defined('ABSPATH') || exit;

/**
 * Store Rewrites class
 *
 * @version		2.2.0
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class Rewrites {

    public $query_vars = [];
    public $custom_store_url = '';

    /**
     * Hook into the functions
     */
    public function __construct() {
        $this->custom_store_url = 'store';

        add_action( 'init', [ $this, 'register_rule' ] );
        add_filter( 'query_vars', [ $this, 'register_query_var' ] );
        add_filter( 'template_include', [ $this, 'store_template' ], 10 );
        add_filter( 'template_include', [ $this, 'store_review_template' ], 10 );
        add_filter( 'template_include', [ $this, 'dashboard_template' ], 10 );

        add_action( 'wp', [ $this, 'flash_rewrite_rules' ], 10 );
        // add_action( 'pre_get_posts', [ $this, 'store_query_filter' ] );

    }

    public function store_query_filter($query) {

        if ( is_admin() || ! $query->is_main_query() ) {
            return;
        }
    
    
        $store_slug = get_query_var( 'store' );
        if ( empty( $store_slug ) ) {
            return;
        }
    
        $store_obj = Store::get_store_by_slug( $store_slug );
       
    
        if ( ! $store_obj ) {
            return;
        }
    
        $store_id = $store_obj->get_id();

        if ( ! $store_id ) {
            return;
        }
    
        // convert main query into a product archive for this store
        $meta_query   = $query->get( 'meta_query', [] );
        $meta_query[] = [
            'key'     => 'multivendorx_store_id',
            'value'   => $store_id,
            'compare' => '=',
        ];
    
        $query->set( 'post_type', 'product' );
        $query->set( 'post_status', 'publish' );
        $query->set( 'meta_query', $meta_query );
        $query->set( 'posts_per_page', apply_filters( 'mvx_store_products_per_page',
            wc_get_default_products_per_row() * wc_get_default_product_rows_per_page() ) );
    }


    public function register_rule() {

        $rules = [
            [
                '^' . $this->custom_store_url . '/([^/]+)/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]',
                'top',
            ],
            [
                '^' . $this->custom_store_url . '/([^/]+)/page/([0-9]{1,})/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]',
                'top',
            ],
            [
                '^' . $this->custom_store_url . '/([^/]+)/reviews?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&store_review=true',
                'top',
            ],
            [
                '^' . $this->custom_store_url . '/([^/]+)/reviews/page/?([0-9]{1,})/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]&store_review=true',
                'top',
            ],
            [
                '^dashboard/?$',
                'index.php?pagename=dashboard',
                'top',
            ],
            [
                '^dashboard/([^/]+)/?([^/]*)/?$',
                'index.php?pagename=dashboard&tab=$matches[1]&subtab=$matches[2]',
                'top',
            ],
        ];

        $rules = apply_filters( 'multivendorx_rewrite_rules', $rules, $this );

        foreach ( $rules as $rule ) {
            add_rewrite_rule( $rule[0], $rule[1], $rule[2] );
        }
    }

    public function register_query_var( $vars ) {
        $vars[] = $this->custom_store_url;
        $vars[] = 'store_review';
        $vars[] = 'tab';
        $vars[] = 'subtab';

        foreach ( $this->query_vars as $var ) {
            $vars[] = $var;
        }

        return apply_filters( 'multivendorx_query_vars', $vars, $this );
    }

    public function store_template( $template ) {
        $store_name = get_query_var( $this->custom_store_url );

        if ( ! empty( $store_name ) ) {
            $store = Store::get_store_by_slug($store_name);

            if ( $store ) {
                 return MultiVendorX()->util->get_template( 'store.php', ['store_id' => $store->get_id()] );
            }
        }

        return $template;
    }

    public function store_review_template( $template ) {

        if ( get_query_var( 'store_review' ) ) {
            return MultiVendorX()->util->get_template( 'store-review.php', [] );
        }

        return $template;
    }

    public function dashboard_template( $template ) {
        $page     = get_query_var( 'tab' );

        if ( ! empty( $page ) ) {
            return MultiVendorX()->util->get_template( 'store-dashboard.php', [] );
        }

        return $template;
    }
    
    public function flash_rewrite_rules() {
        $this->register_rule();
        flush_rewrite_rules();
    }
}