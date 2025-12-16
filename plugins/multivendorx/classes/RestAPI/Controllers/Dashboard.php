<?php
/**
 * Class Dashboard
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Dashboard Controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Dashboard extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'endpoints';

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
            )
        );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check( $request ) {
        // return current_user_can('read');
        return true;
    }

    /**
     * Get all items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items( $request ) {
        $menu_only = $request->get_param( 'menuOnly' );

        $endpoints = $this->all_endpoints();

        $other_endpoints = apply_filters(
            'dashboard_other_endpoints',
            array(
				'view-notifications' => array(
					'name'       => '',
					'icon'       => '',
					'slug'       => 'view-notifications',
					'submenu'    => array(),
					'capability' => array( 'edit_products' ),
					'filename'   => 'view-notifications',
				),
			)
        );

        if ( ! $menu_only ) {
            $endpoints = array_merge( $endpoints, $other_endpoints );
        }
        return rest_ensure_response( $endpoints );
    }

    /**
     * Get all endpoints.
     *
     * @return array
     */
    public function all_endpoints() {
        // Default endpoints.
        $all_endpoints = array(
            'dashboard'     => array(
                'name'       => 'Dashboard',
                'icon'       => 'adminlib-module',
                'slug'       => '',
                'submenu'    => array(),
                'capability' => array( 'create_stores' ),
            ),
            'products'      => array(
                'name'       => 'Products',
                'slug'       => 'products',
                'icon'       => 'adminlib-single-product',
                'submenu'    => array(),
                'capability' => array( 'manage_products' ),
            ),
            'coupons'       => array(
                'name'       => 'Coupons',
                'slug'       => 'coupons',
                'icon'       => 'adminlib-coupon',
                'capability' => array( 'read_shop_coupons' ),
            ),
            'sales'         => array(
                'name'       => 'Sales',
                'slug'       => 'sales',
                'icon'       => 'adminlib-sales',
                'submenu'    => array(
                    array(
                        'key'        => 'orders',
                        'name'       => 'Orders',
                        'slug'       => 'orders',
                        'capability' => array( 'read_shop_orders', 'edit_shop_orders', 'delete_shop_orders' ),
                    ),
                    array(
                        'key'        => 'refund',
                        'name'       => 'Refund',
                        'slug'       => 'refund',
                        'capability' => array( 'read_shop_orders', 'edit_shop_orders' ),
                        'module'     => 'marketplace-refund',
                    ),
                    array(
                        'key'        => 'commissions',
                        'name'       => 'Commissions',
                        'slug'       => 'commissions',
                        'capability' => array( 'read_shop_earning', 'view_commission_history' ),
                    ),
                ),
                'capability' => array( 'read_shop_orders' ),

            ),
            'wallet'        => array(
                'name'       => 'Wallet',
                'icon'       => 'adminlib-wallet',
                'slug'       => 'wallet',
                'submenu'    => array(
                    array(
                        'key'  => 'transactions',
                        'name' => 'Transactions',
                        'slug' => 'transactions',
                        'capability' => array( 'read_shop_earning', 'view_commission_history', 'edit_withdrawl_request' ),
                    ),
                    array(
                        'key'  => 'withdrawls',
                        'name' => 'Withdrawls',
                        'slug' => 'withdrawls',
                        'capability' => array( 'read_shop_earning', 'view_commission_history', 'edit_withdrawl_request' ),
                    ),
                ),
                'capability' => array( 'manage_payment' ),
            ),

            'store_support' => array(
                'name'       => 'Store Support',
                'icon'       => 'adminlib-customer-service',
                'slug'       => 'store-support',
                'submenu'    => array(
                    array(
                        'key'        => 'support-tickets',
                        'name'       => 'Support Tickets',
                        'slug'       => 'support-tickets',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons' ),
                        'module'     => 'customer-support',
                    ),
                    array(
                        'key'        => 'customer-questions',
                        'name'       => 'Customer Questions',
                        'slug'       => 'customer-questions',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                        'module'     => 'question-answer',
                    ),
                    array(
                        'key'        => 'store-followers',
                        'name'       => 'Store Followers',
                        'slug'       => 'store-followers',
                        'capability' => array( 'read_products', 'edit_products', 'delete_products' ),
                        'module'     => 'follow-store',
                    ),
                    array(
                        'key'        => 'store-review',
                        'name'       => 'Store Review',
                        'slug'       => 'store-review',
                        'capability' => array( 'read_products', 'edit_products', 'delete_products' ),
                    ),
                ),
                'capability' => array( 'manage_users' ),
            ),
            'reports'       => array(
                'name'       => 'Stats / Report',
                'slug'       => 'reports',
                'icon'       => 'adminlib-report',
                'submenu'    => array(
                    array(
                        'key'        => 'overview',
                        'name'       => 'Overview',
                        'slug'       => 'overview',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons' ),
                    ),
                ),
                'capability' => array( 'read_shop_coupons' ),
            ),
            'resources'     => array(
                'name'       => 'Resources',
                'icon'       => 'adminlib-resources',
                'slug'       => 'resources',
                'submenu'    => array(
                    array(
                        'key'        => 'documentation',
                        'name'       => 'Documentation',
                        'slug'       => 'documentation',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                    ),
                    array(
                        'key'        => 'tools',
                        'name'       => 'Tools',
                        'slug'       => 'tools',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons' ),
                    ),
                ),
                'capability' => array( 'manage_users' ),
            ),
            'settings'      => array(
                'name'       => 'Settings',
                'slug'       => 'settings',
                'icon'       => 'adminlib-setting',
                'capability' => array( 'create_stores' ),
            ),
        );

        $saved_endpoints = MultiVendorX()->setting->get_setting( 'menu_manager' );

        if ( ! empty( $saved_endpoints ) && is_array( $saved_endpoints ) ) {
            $visible_endpoints = array();
            foreach ( $saved_endpoints as $key => $endpoint ) {
                if ( isset( $endpoint['visible'] ) && $endpoint['visible'] ) {
                    $visible_endpoints[ $key ] = array_merge(
                        $all_endpoints[ $key ] ?? array(),
                        $endpoint
                    );
                }
            }
            return $visible_endpoints;
        }

        return $all_endpoints;
    }

}
