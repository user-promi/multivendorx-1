<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Dashboard_Controller extends \WP_REST_Controller
{

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'endpoints';

    public function register_routes()
    {
        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
            [
                'methods' => \WP_REST_Server::READABLE,
                'callback' => [$this, 'get_items'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
            ],
        ]);
    }

    public function get_items_permissions_check($request)
    {
        return current_user_can('read');
    }

    public function get_items($request)
    {
        $endpoints = $this->all_endpoints();
        return rest_ensure_response($endpoints);
    }

    public function all_endpoints()
    {
        // Default endpoints
        $all_endpoints = array(
            'dashboard' => array(
                'name' => 'Dashboard',
                'icon' => 'adminlib-module',
                'slug' => 'dashboard',
                'submenu' => array(),
                'capability' => ['edit_products']
            ),
            'products' => array(
                'name' => 'Products',
                'slug' => 'products',
                'icon' => 'adminlib-single-product',
                'submenu' => array(),
                /*'submenu' => array(
                    array(
                        'key'  => 'products',
                        'name' => 'All Products',
                        'slug' => 'products',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ), array(
                        'key'  => 'edit',
                        'name' => 'Edit Product',
                        'slug' => 'edit',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ),
                ),*/
                'capability' => ['manage_products'],
                'capability-edit' => ['manage_products']
            ),
            'orders' => array(
                'name' => 'Orders',
                'slug' => 'orders',
                'icon' => 'adminlib-order',
                'submenu' => array(
                    array(
                        'key' => 'all-orders',
                        'name' => 'All Orders',
                        'slug' => 'all-orders',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ),
                    array(
                        'key' => 'refund',
                        'name' => 'Refund',
                        'slug' => 'refund',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key' => 'order-details',
                        'name' => 'Order Details',
                        'slug' => 'order-details',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    )
                ),
                'capability' => ['read_shop_orders']

            ),
            'coupons' => array(
                'name' => 'Coupons',
                'slug' => 'coupons',
                'icon' => 'adminlib-contact-form',
                'capability' => ['read_shop_coupons']
            ),
            'reports' => array(
                'name' => 'Stats / Report',
                'slug' => 'reports',
                'icon' => 'adminlib-report',
                'submenu' => array(
                    array(
                        'key' => 'overview',
                        'name' => 'Overview',
                        'slug' => 'overview',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                ),
                'capability' => ['read_shop_coupons']
            ),
            'finance' => array(
                'name' => 'Finance',
                'slug' => 'finance',
                'icon' => 'adminlib-finance',
                'submenu' => array(

                    array(
                        'key' => 'payouts',
                        'name' => 'Payout',
                        'slug' => 'payouts',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key' => 'transactions',
                        'name' => 'Transactions',
                        'slug' => 'transactions',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key' => 'commissions',
                        'name' => 'Commissions',
                        'slug' => 'commissions',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                ),
                'capability' => ['read_shop_coupons']
            ),
            'store_support' => array(
                'name' => 'Store Support',
                'icon' => 'adminlib-customer-service',
                'slug' => 'store-support',
                'submenu' => array(
                    array(
                        'key' => 'support-tickets',
                        'name' => 'Support Tickets',
                        'slug' => 'support-tickets',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                    array(
                        'key' => 'customer-questions',
                        'name' => 'Customer Questions',
                        'slug' => 'customer-questions',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key' => 'store-follower',
                        'name' => 'Store Follower',
                        'slug' => 'store-follower',
                        'capability' => ['read_products', 'edit_products', 'delete_products']
                    ),
                ),
                'capability' => ['manage_users']
            ),

            'settings' => array(
                'name' => 'Settings',
                'slug' => 'settings',
                'icon' => 'adminlib-setting',
                'capability' => ['read_products'],
                // 'submenu' => array(
                //     array(
                //         'key'  => 'general',
                //         'name' => 'General',
                //         'slug' => 'general',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'delete_products']
                //     ),
                //     array(
                //         'key'  => 'appearance',
                //         'name' => 'Appearance',
                //         'slug' => 'appearance',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'delete_products']
                //     ),
                //     array(
                //         'key'  => 'store-address-location',
                //         'name' => 'Business Address & Location',
                //         'slug' => 'store-address-location',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ),
                //      array(
                //         'key'  => 'contact-information',
                //         'name' => 'Contact Information',
                //         'slug' => 'contact-information',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ),
                //     array(
                //         'key'  => 'social-media',
                //         'name' => 'Social Media',
                //         'slug' => 'social-media',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ),                    
                //     array(
                //         'key'  => 'payment-configuration',
                //         'name' => 'Payment',
                //         'slug' => 'payment-configuration',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ),
                //     array(
                //         'key'  => 'shop-policies',
                //         'name' => 'Policies',
                //         'slug' => 'shop-policies',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ),
                //     array(
                //         'key'  => 'privacy',
                //         'name' => 'Privacy',
                //         'slug' => 'privacy',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ),
                //     array(
                //         'key'  => 'seo_visibility',
                //         'name' => 'SEO & visibility',
                //         'slug' => 'seo_visibility',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ),
                //     array(
                //         'key'  => 'shipping',
                //         'name' => 'Shipping',
                //         'slug' => 'shipping',
                //         'icon'    => 'adminlib-cart',
                //         'capability' => ['read_products', 'edit_products', 'upload_files']
                //     ), 
                //     ),
                'capability' => ['manage_products']
            ),
            'resources' => array(
                'name' => 'Resources',
                'icon' => 'adminlib-cart',
                'slug' => 'resources',
                'submenu' => array(
                    array(
                        'key' => 'documentation',
                        'name' => 'Documentation',
                        'slug' => 'documentation',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key' => 'tools',
                        'name' => 'Tools',
                        'slug' => 'tools',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
                    ),
                ),
                'capability' => ['manage_users']
            ),
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
