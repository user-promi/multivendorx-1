<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Dashboard_Controller extends \WP_REST_Controller {
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
	protected $rest_base = 'endpoints';

    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
        ] );
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' );
    }

    public function get_items( $request ) {
        $endpoints = $this->all_endpoints();
        return rest_ensure_response($endpoints);
    }

   public function all_endpoints() {
        $endpoints = MultiVendorX()->setting->get_setting( 'menu_manager' );
        $all_endpoints = array(
            'dashboard' => array(
                'name'  => 'Dashboard',
                'slug'  => 'dashboard',
                'submenu' => array() // No submenu
            ),
            'products' => array(
                'name'  => 'Products',
                'slug'  => 'products',
                'submenu' => array(
                    array(
                        'name' => 'All Products',
                        'slug' => 'all-products',
                    ),
                    array(
                        'name' => 'Add Product',
                        'slug' => 'add-product',
                    )
                )
            ),
            'orders' => array(
                'name' => 'Orders',
                'slug' => 'orders',
                'submenu' => array(
                    array(
                        'name' => 'All Orders',
                        'slug' => 'all-orders',
                    )
                )
            ),
        );

        return !empty($endpoints) ? $endpoints : $all_endpoints;
    }

}