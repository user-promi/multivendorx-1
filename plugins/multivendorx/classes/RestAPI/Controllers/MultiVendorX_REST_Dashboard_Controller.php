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
        // Default endpoints
        $all_endpoints = array(
            'dashboard' => array(
                'name'    => 'Dashboard',
                'icon'    => 'adminlib-cart',
                'slug'    => 'dashboard',
                'submenu' => array(),
                'capability' => ['edit_products']
            ),
            'products' => array(
                'name'    => 'Store Setup',
                'slug'    => 'storesetup',
                'icon'    => 'adminlib-cart',
                'submenu' => array(
                    array(
                        'key'  => 'store-settings',
                        'name' => 'Store Settings',
                        'slug' => 'store-settings',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    array(
                        'key'  => 'vacation',
                        'name' => 'Vacation',
                        'slug' => 'vacation',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    array(
                        'key'  => 'vacation',
                        'name' => 'Vacation',
                        'slug' => 'vacation',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    array(
                        'key'  => 'verification',
                        'name' => 'Verification',
                        'slug' => 'verification',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    array(
                        'key'  => 'membership',
                        'name' => 'Membership Plan',
                        'slug' => 'membership',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    ),
                'capability' => ['manage_products']
            ),
            'products' => array(
                'name'    => 'Product Management',
                'slug'    => 'products',
                'icon'    => 'adminlib-cart',
                'submenu' => array(
                    array(
                        'key'  => 'all-products',
                        'name' => 'All Products',
                        'slug' => 'all-products',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    ),
                'capability' => ['manage_products']
            ),
            'products' => array(
                'name'    => 'Customer Interaction',
                'slug'    => 'customer-interaction',
                'icon'    => 'adminlib-cart',
                'submenu' => array(
                    array(
                        'key'  => 'customer-questions',
                        'name' => 'Customer Questions',
                        'slug' => 'all-products',
                        'icon'    => 'adminlib-cart',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                    ),
                'capability' => ['manage_products']
            ),
            'orders' => array(
                'name'    => 'Orders',
                'slug'    => 'orders',
                'icon'    => 'adminlib-cart',
                'submenu' => array(
                    array(
                        'key'  => 'all-orders',
                        'name' => 'All Orders',
                        'slug' => 'all-orders',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    )
                ),
                'capability' => ['read_shop_orders']

            ),
            'coupons' => array(
                'name'    => 'Coupons',
                'slug'    => 'coupons',
                'submenu' => array(
                    array(
                        'key'  => 'all-coupons',
                        'name' => 'All Coupons',
                        'slug' => 'all-coupons',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'add-coupons',
                        'name' => 'Add Coupons',
                        'slug' => 'add-coupons',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_coupons']
            ),
			'reports' => array(
                'name'    => 'Stats / Report',
                'slug'    => 'reports',
                'submenu' => array(
                    array(
                        'key'  => 'overview',
                        'name' => 'Overview',
                        'slug' => 'overview',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'banking overview',
                        'name' => 'Banking Overview',
                        'slug' => 'banking overview',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_coupons']
            ),
			'payments' => array(
                'name'    => 'Payments',
                'slug'    => 'payments',
                'submenu' => array(
                    array(
                        'key'  => 'withdrawl',
                        'name' => 'Withdrawal',
                        'slug' => 'withdrawl',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'history',
                        'name' => 'History',
                        'slug' => 'history',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key'  => 'refund',
                        'name' => 'Refund',
                        'slug' => 'refund',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_coupons']
            ),
			 'store_support' => array(
                'name'    => 'Support',
                'icon'    => 'adminlib-cart',
                'slug'    => 'store_support',
                'submenu' => array(
                    array(
                        'key'  => 'knowledgebase',
                        'name' => 'Knowledgebase',
                        'slug' => 'knowledgebase',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key'  => 'support-ticket',
                        'name' => 'Support Ticket',
                        'slug' => 'support-ticket',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                'capability' => ['manage_users']
            ),
             )
        );

        $saved_endpoints = MultiVendorX()->setting->get_setting('menu_manager');

        if (!empty($saved_endpoints) && is_array($saved_endpoints)) {
            $visible_endpoints = array();
            foreach ($saved_endpoints as $key => $endpoint) {
                if (isset($endpoint['visible']) && $endpoint['visible']) {
                    $visible_endpoints[$key] = array_merge(
                        $all_endpoints[$key] ?? [],
                        $endpoint
                    );
                }
            }
            return $visible_endpoints;
        }

        return $all_endpoints;
    }

}
