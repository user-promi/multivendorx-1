<?php
/**
 * Class Dashboard
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

/**
 * MultiVendorX REST API Dashboard Controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Dashboard extends \WP_REST_Controller
{

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'endpoints';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes()
    {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => [$this, 'get_items'],
                    'permission_callback' => [$this, 'get_items_permissions_check'],
                ],
            ]
        );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check($request)
    {
        // return current_user_can('read');
        return true;
    }

    /**
     * Get all items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items($request)
    {
        $menu_only = $request->get_param('menuOnly');

        $endpoints = $this->all_endpoints();

        $other_endpoints = apply_filters(
            'dashboard_other_endpoints',
            [
                'view-notifications' => [
                    'name'       => '',
                    'icon'       => '',
                    'slug'       => 'view-notifications',
                    'submenu'    => [],
                    'capability' => ['edit_products'],
                    'filename'   => 'view-notifications',
                ],
            ]
        );

        if (! $menu_only) {
            $endpoints = array_merge($endpoints, $other_endpoints);
        }
        return rest_ensure_response($endpoints);
    }

    /**
     * Get all endpoints.
     *
     * @return array
     */
    public function all_endpoints()
    {
        // Default endpoints.
        $all_endpoints = [
            'dashboard'     => [
                'name'       => 'Dashboard',
                'icon'       => 'adminlib-module',
                'slug'       => '',
                'submenu'    => [],
                'capability' => ['create_stores'],
            ],
            'products'      => [
                'name'       => 'Products',
                'slug'       => 'products',
                'icon'       => 'adminlib-single-product',
                'submenu'    => [],
                'capability' => ['manage_products'],
            ],
            'coupons'       => [
                'name'       => 'Coupons',
                'slug'       => 'coupons',
                'icon'       => 'adminlib-coupon',
                'capability' => ['read_shop_coupons'],
            ],
            'sales'         => [
                'name'       => 'Sales',
                'slug'       => 'sales',
                'icon'       => 'adminlib-sales',
                'submenu'    => [
                    [
                        'key'        => 'orders',
                        'name'       => 'Orders',
                        'slug'       => 'orders',
                        'capability' => ['view_shop_orders', 'edit_shop_orders', 'delete_shop_orders', 'add_shop_orders_note'],
                    ],
                    [
                        'key'        => 'refund',
                        'name'       => 'Refund',
                        'slug'       => 'refund',
                        'capability' => ['view_shop_orders', 'edit_shop_orders'],
                        'module'     => 'marketplace-refund',
                    ],
                    [
                        'key'        => 'commissions',
                        'name'       => 'Commissions',
                        'slug'       => 'commissions',
                        'capability' => ['view_commission_history'],
                    ],
                ],
                'capability' => ['view_shop_orders', 'view_commission_history'],

            ],
            'wallet'        => [
                'name'       => 'Wallet',
                'icon'       => 'adminlib-wallet',
                'slug'       => 'wallet',
                'submenu'    => [
                    [
                        'key'        => 'transactions',
                        'name'       => 'Transactions',
                        'slug'       => 'transactions',
                        'capability' => ['read_shop_earning', 'view_transactions'],
                    ],
                    [
                        'key'        => 'withdrawls',
                        'name'       => 'Withdrawls',
                        'slug'       => 'withdrawls',
                        'capability' => ['read_shop_earning', 'edit_withdrawl_request'],
                    ],
                ],
                'capability' => ['edit_withdrawl_request'],
            ],

            'store_support' => [
                'name'       => 'Store Support',
                'icon'       => 'adminlib-customer-service',
                'slug'       => 'store-support',
                'submenu'    => [
                    [
                        'key'        => 'support-tickets',
                        'name'       => 'Support Tickets',
                        'slug'       => 'support-tickets',
                        'capability' => ['view_support_tickets', 'reply_support_tickets'],
                        'module'     => 'customer-support',
                    ],
                    [
                        'key'        => 'customer-questions',
                        'name'       => 'Customer Questions',
                        'slug'       => 'customer-questions',
                        'capability' => ['view_customer_questions', 'reply_customer_questions'],
                        'module'     => 'question-answer',
                    ],
                    [
                        'key'        => 'store-followers',
                        'name'       => 'Store Followers',
                        'slug'       => 'store-followers',
                        'capability' => ['view_store_followers'],
                        'module'     => 'follow-store',
                    ],
                    [
                        'key'        => 'store-review',
                        'name'       => 'Store Review',
                        'slug'       => 'store-review',
                        'capability' => ['view_store_reviews', 'reply_store_reviews'],
                    ],
                ],
                'capability' => ['manage_users'],
            ],
            'reports'       => [
                'name'       => 'Stats / Report',
                'slug'       => 'reports',
                'icon'       => 'adminlib-report',
                'submenu'    => [
                    [
                        'key'        => 'overview',
                        'name'       => 'Overview',
                        'slug'       => 'overview',
                        'capability' => ['view_store_reports', 'export_store_reports'],
                    ],
                ],
                'capability' => ['read_shop_coupons'],
            ],
            'resources'     => [
                'name'       => 'Resources',
                'icon'       => 'adminlib-resources',
                'slug'       => 'resources',
                'submenu'    => [
                    [
                        'key'        => 'documentation',
                        'name'       => 'Documentation',
                        'slug'       => 'documentation',
                        'capability' => ['view_documentation'],
                    ],
                    [
                        'key'        => 'tools',
                        'name'       => 'Tools',
                        'slug'       => 'tools',
                        'capability' => ['access_tools'],
                    ],
                ],
                'capability' => ['manage_users'],
            ],
            'settings'      => [
                'name'       => 'Settings',
                'slug'       => 'settings',
                'icon'       => 'adminlib-setting',
                'capability' => ['manage_store_settings'],
            ],
        ];

        $saved_endpoints = MultiVendorX()->setting->get_setting('menu_manager');

        if (! empty($saved_endpoints) && is_array($saved_endpoints)) {
            $visible_endpoints = [];
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
