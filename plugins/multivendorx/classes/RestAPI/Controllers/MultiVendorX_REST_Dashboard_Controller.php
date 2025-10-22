<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;

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
            'coupons' => array(
                'name' => 'Coupons',
                'slug' => 'coupons',
                'icon' => 'adminlib-contact-form',
                'capability' => ['read_shop_coupons']
            ),
            'sales' => array(
                'name' => 'Sales',
                'slug' => 'sales',
                'icon' => 'adminlib-order',
                'submenu' => array(
                    array(
                        'key' => 'orders',
                        'name' => 'Orders',
                        'slug' => 'orders',
                        'capability' => ['read_shop_orders', 'edit_shop_orders', 'delete_shop_orders']
                    ),
                    array(
                        'key' => 'refund',
                        'name' => 'Refund',
                        'slug' => 'refund',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                    array(
                        'key' => 'commissions',
                        'name' => 'Commissions',
                        'slug' => 'commissions',
                        'capability' => ['read_shop_coupons', 'edit_shop_coupons']
                    ),
                ),
                'capability' => ['read_shop_orders']

            ),
            'transactions' => array(
                'key' => 'transactions',
                'name' => 'Transactions',
                'slug' => 'transactions',
                'icon' => 'adminlib-contact-form',
                'capability' => ['read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons']
            ),
            'payouts' => array(
                'key' => 'payouts',
                'name' => 'Payouts',
                'slug' => 'payouts',
                'icon' => 'adminlib-contact-form',
                'capability' => ['read_shop_coupons', 'edit_shop_coupons']
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


    public function get_current_page_and_submenu() {
        $current_user = wp_get_current_user();
        $capability_settings = MultiVendorX()->setting->get_setting(reset($current_user->roles));
        $store_ids = StoreUtil::get_stores_from_user_id($current_user->ID);
        $active_store = get_user_meta($current_user->ID, 'multivendorx_active_store', true);
        $all_endpoints = $this->all_endpoints();
        $div_id = '';
        $allowed = true;

        if (empty($active_store)) {
            update_user_meta($current_user->ID, 'multivendorx_active_store', reset($store_ids));
        }

        if (get_option('permalink_structure')) {
            $current_page = get_query_var('tab');
            $current_sub = get_query_var('subtab');
        } else {
            $current_page = filter_input(INPUT_GET, 'tab', FILTER_DEFAULT);
            $current_sub = filter_input(INPUT_GET, 'subtab', FILTER_DEFAULT);
        }

        if (empty($current_page)) {
            $current_page = 'dashboard';
        }

        // Auto-redirect if submenu exists
        if ($current_page && empty($current_sub)) {
            foreach ($all_endpoints as $section) {
                if ($section['slug'] === $current_page && !empty($section['submenu'])) {
                    $first_sub = $section['submenu'][0]['slug'];
                    wp_safe_redirect(StoreUtil::get_endpoint_url($current_page, $first_sub));
                    exit;
                }
            }
        }

        if ($current_page) {
            foreach ($all_endpoints as $key => $section) {
                if ($section['slug'] === $current_page) {
                    if (!empty($section['capability'])) {
                        $allowed = false;

                        foreach ($section['capability'] as $cap) {
                            if (current_user_can($cap) && in_array($cap, $capability_settings, true)) {
                                $allowed = true;
                                break;
                            }
                        }
                    }
                    if ($current_sub) {
                        if(empty($section['submenu'])) {
                            if (!empty($section['capability-'. $current_sub])) {
                                $allowed = false;
                                foreach ($section['capability-'. $current_sub] as $cap) {
                                    if (current_user_can($cap) && in_array($cap, $capability_settings, true)) {
                                        $allowed = true;
                                        break;
                                    }
                                }
                            }
                            $div_id = $current_sub;
                        } else {
                            foreach ($section['submenu'] as $submenu) {
                                if ($submenu['slug'] === $current_sub) {
                                    if (!empty($submenu['capability'])) {
                                        $allowed = false;
                                        foreach ($submenu['capability'] as $cap) {
                                            if (current_user_can($cap) && in_array($cap, $capability_settings, true)) {
                                                $allowed = true;
                                                break;
                                            }
                                        }
                                    }
                                    $div_id = $submenu['key'];
                                    break;
                                }
                            }
                        }
                    } else {
                        $div_id = $key;
                    }
                    break;
                }
            }
        }


        return [
            'active_store'  => $active_store,
            'current_page'  => $current_page,
            'current_sub'   => $current_sub,
            'div_id'        => $div_id,
            'allowed'        => $allowed,
        ];
    }

    public function call_edit_product_template() {
        $subtab = get_query_var('subtab');
        $value = get_query_var('value');

        if ($subtab === 'edit') {
            if (!empty($value)) {
                MultiVendorX()->store->products->call_edit_product();
            } else {
                if ( MultiVendorX()->setting->get_setting('category_pyramid_guide') == 'yes' ) {
                    MultiVendorX()->store->products->call_add_product();
                }
            }
        }
    }


}
