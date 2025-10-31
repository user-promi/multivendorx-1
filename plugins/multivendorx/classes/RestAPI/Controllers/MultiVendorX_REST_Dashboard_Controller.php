<?php

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Dashboard_Controller extends \WP_REST_Controller {


    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'endpoints';

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

    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' );
    }

    public function get_items( $request ) {
        $endpoints = $this->all_endpoints();
        return rest_ensure_response( $endpoints );
    }

    public function all_endpoints() {
        // Default endpoints
        $all_endpoints = array(
            'dashboard'     => array(
                'name'       => 'Dashboard',
                'icon'       => 'adminlib-module',
                'slug'       => 'dashboard',
                'submenu'    => array(),
                'capability' => array( 'edit_products' ),
            ),
            'products'      => array(
                'name'            => 'Products',
                'slug'            => 'products',
                'icon'            => 'adminlib-single-product',
                'submenu'         => array(),
                /*
                'submenu' => array(
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
                'capability'      => array( 'manage_products' ),
                'capability-edit' => array( 'manage_products' ),
            ),
            'coupons'       => array(
                'name'       => 'Coupons',
                'slug'       => 'coupons',
                'icon'       => 'adminlib-contact-form',
                'capability' => array( 'read_shop_coupons' ),
            ),
            'sales'         => array(
                'name'       => 'Sales',
                'slug'       => 'sales',
                'icon'       => 'adminlib-order',
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
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                    ),
                    array(
                        'key'        => 'commissions',
                        'name'       => 'Commissions',
                        'slug'       => 'commissions',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                    ),
                ),
                'capability' => array( 'read_shop_orders' ),
            ),
            'wallet'         => array(
                'name'       => 'Wallet',
                'slug'       => 'wallet',
                'icon'       => 'adminlib-order',
                'submenu'    => array(
                    'transactions'  => array(
                        'key'        => 'transactions',
                        'name'       => 'Transactions',
                        'slug'       => 'transactions',
                        'icon'       => 'adminlib-contact-form',  
                     ),
                     'withdrawls'    => array(
                        'key'        => 'withdrawls',
                        'name'       => 'Withdrawls',
                        'slug'       => 'withdrawls',
                        'icon'       => 'adminlib-contact-form',              
                    ),          
                )
                'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
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
					),
					array(
						'key'        => 'customer-questions',
						'name'       => 'Customer Questions',
						'slug'       => 'customer-questions',
						'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
					),
					array(
						'key'        => 'store-follower',
						'name'       => 'Store Follower',
						'slug'       => 'store-follower',
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
                'icon'       => 'adminlib-cart',
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
                'capability' => array( 'read_products' ),
                // 'submenu' => array(
                // array(
                // 'key'  => 'general',
                // 'name' => 'General',
                // 'slug' => 'general',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'delete_products']
                // ),
                // array(
                // 'key'  => 'appearance',
                // 'name' => 'Appearance',
                // 'slug' => 'appearance',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'delete_products']
                // ),
                // array(
                // 'key'  => 'store-address-location',
                // 'name' => 'Business Address & Location',
                // 'slug' => 'store-address-location',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // array(
                // 'key'  => 'contact-information',
                // 'name' => 'Contact Information',
                // 'slug' => 'contact-information',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // array(
                // 'key'  => 'social-media',
                // 'name' => 'Social Media',
                // 'slug' => 'social-media',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // array(
                // 'key'  => 'payment-configuration',
                // 'name' => 'Payment',
                // 'slug' => 'payment-configuration',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // array(
                // 'key'  => 'shop-policies',
                // 'name' => 'Policies',
                // 'slug' => 'shop-policies',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // array(
                // 'key'  => 'privacy',
                // 'name' => 'Privacy',
                // 'slug' => 'privacy',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // array(
                // 'key'  => 'seo_visibility',
                // 'name' => 'SEO & visibility',
                // 'slug' => 'seo_visibility',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // array(
                // 'key'  => 'shipping',
                // 'name' => 'Shipping',
                // 'slug' => 'shipping',
                // 'icon'    => 'adminlib-cart',
                // 'capability' => ['read_products', 'edit_products', 'upload_files']
                // ),
                // ),
                'capability' => array( 'manage_products' ),
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


    // public function get_current_page_and_submenu() {
    //     $current_user        = wp_get_current_user();
    //     $capability_settings = MultiVendorX()->setting->get_setting( reset( $current_user->roles ), array() );
    //     $store_ids           = StoreUtil::get_stores_from_user_id( $current_user->ID );
    //     $active_store        = get_user_meta( $current_user->ID, 'multivendorx_active_store', true );
    //     $all_endpoints       = $this->all_endpoints();
    //     $div_id              = 'dashboard';
    //     $allowed             = true;
    //     $store               = new Store( $active_store );
    //     $store_status        = $store->get( 'status' );

    //     if (empty($store_ids)) {
    //         $error_msg = "No active store select for this user.";
    //         return array(
    //             'error_msg'    => $error_msg,
    //         );
    //     } else {
    //         if ( empty( $active_store ) ) {
    //             update_user_meta( $current_user->ID, 'multivendorx_active_store', reset( $store_ids ) );
    //         }
    //     }

    //     if ( get_option( 'permalink_structure' ) ) {
    //         $current_page = get_query_var( 'tab' ) ?? 'dashboard';
    //         $current_sub  = get_query_var( 'subtab' );
    //     } else {
    //         $current_page = filter_input( INPUT_GET, 'tab', FILTER_DEFAULT ) ?? 'dashboard';
    //         $current_sub  = filter_input( INPUT_GET, 'subtab', FILTER_DEFAULT );
    //     }

    //     // Auto-redirect if submenu exists
    //     if ( $current_page && empty( $current_sub ) ) {
    //         foreach ( $all_endpoints as $section ) {
    //             if ( $section['slug'] === $current_page && ! empty( $section['submenu'] ) ) {
    //                 $first_sub = $section['submenu'][0]['slug'];
    //                 wp_safe_redirect( StoreUtil::get_endpoint_url( $current_page, $first_sub ) );
    //                 exit;
    //             }
    //         }
    //     }

    //     if ( $current_page ) {
    //         foreach ( $all_endpoints as $key => $section ) {
    //             if ( $section['slug'] !== $current_page ) {
    //                 continue;
    //             }

    //             // Helper function to check user capability.
    //             $has_capability = function( $caps ) use ( $capability_settings ) {
    //                 foreach ( (array) $caps as $cap ) {
    //                     if ( current_user_can( $cap ) && in_array( $cap, $capability_settings, true ) ) {
    //                         return true;
    //                     }
    //                 }
    //                 return false;
    //             };

    //             if ( ! empty( $section['capability'] ) ) {
    //                 $allowed = $has_capability( $section['capability'] );
    //             }

    //             // Handle submenu.
    //             if ( $current_sub ) {
    //                 if ( empty( $section['submenu'] ) ) {
    //                     // Capability defined at section-sub level.
    //                     $sub_caps_key = 'capability-' . $current_sub;
    //                     if ( ! empty( $section[ $sub_caps_key ] ) ) {
    //                         $allowed = $has_capability( $section[ $sub_caps_key ] );
    //                     }
    //                     $div_id = $current_sub;
    //                 } else {
    //                     // Find matching submenu.
    //                     foreach ( $section['submenu'] as $submenu ) {
    //                         if ( $submenu['slug'] === $current_sub ) {
    //                             if ( ! empty( $submenu['capability'] ) ) {
    //                                 $allowed = $has_capability( $submenu['capability'] );
    //                             }
    //                             $div_id = $submenu['key'];
    //                             break;
    //                         }
    //                     }
    //                 }
    //             } else {
    //                 $div_id = $key;
    //             }

    //             break;
    //         }
    //     }

    //     switch ( $store_status ) {
    //         case 'pending':
    //             $error_msg = 'Waiting for approval your store is pending';
    //             break;
    
    //         case 'locked':
    //             $error_msg = 'Your account has been suspended by the admin';
    //             break;

    //         case 'reject':
    //             $error_msg = 'The application is rejected';
    //             break;

    //         default:
    //             if ( ! $div_id || ! $allowed ) {
    //                 $error_msg = 'You do not have permission to access this section.';
    //                 break;
    //             }

    //             if ( $div_id === 'edit' ) {
    //                 ob_start();
    //                 $this->call_edit_product_template();
    //                 $content = ob_get_clean();
    //             } else {
    //                 $id = $div_id;
    //             }
    //             break;
    //     }

    //     return array(
    //         'active_store' => $active_store,
    //         'current_page' => $current_page,
    //         'current_sub'  => $current_sub,
    //         'error_msg'    => $error_msg,
    //         'id'           => $id,
    //         'content'      => $content,
    //     );
    // }

    public function call_edit_product_template(): void {
        $subtab = get_query_var( 'subtab' );
        $value  = get_query_var( 'value' );

        if ( $subtab === 'edit' ) {
            if ( ! empty( $value ) ) {
                MultiVendorX()->store->products->call_edit_product();
            } elseif ( MultiVendorX()->setting->get_setting( 'category_pyramid_guide' ) == 'yes' || MultiVendorX()->modules->is_active( 'spmv' ) ) {
                    MultiVendorX()->store->products->call_add_product();
            }
        }
    }

    public function get_current_page_and_submenu(): array {
        $current_user        = wp_get_current_user();
        $store_ids           = StoreUtil::get_stores_from_user_id($current_user->ID);
        $active_store        = get_user_meta($current_user->ID, 'multivendorx_active_store', true);
        $store               = new Store($active_store);
        $store_status        = $store->get('status');
        $capability_settings = MultiVendorX()->setting->get_setting(reset($current_user->roles), []);
        $all_endpoints       = $this->all_endpoints();

        // Early exit if no store found.
        if (empty($store_ids)) {
            return ['error_msg' => esc_html__('No active store selected for this user.', 'multivendorx')];
        }

        // Ensure active store is set.
        if (empty($active_store)) {
            update_user_meta($current_user->ID, 'multivendorx_active_store', reset($store_ids));
            $active_store = reset($store_ids);
        }

        // Get sanitized current page and subtab.
        [$current_page, $current_sub] = $this->get_tab_and_subtab();

        // Auto-redirect if submenu exists but not specified.
        if ($current_page && empty($current_sub)) {
            foreach ($all_endpoints as $section) {
                if ($section['slug'] === $current_page && !empty($section['submenu'])) {
                    $first_sub = $section['submenu'][0]['slug'];
                    wp_safe_redirect(StoreUtil::get_endpoint_url($current_page, $first_sub));
                    exit;
                }
            }
        }

        $div_id = 'dashboard';
        $allowed = true;
        $error_msg = '';
        $content = '';

        // Resolve the current section and capability check.
        foreach ($all_endpoints as $key => $section) {
            if ($section['slug'] !== $current_page) {
                continue;
            }

            $allowed = $this->user_has_section_capability($section, $capability_settings);

            if ($current_sub) {
                [$div_id, $allowed] = $this->resolve_submenu_access($section, $current_sub, $capability_settings);
            } else {
                $div_id = $key;
            }

            break;
        }

        // Handle store status restrictions.
        // $error_msg = $this->get_store_status_message($store_status, $allowed, $div_id);

        // // Load page content for special pages like 'edit'.
        // if (empty($error_msg) ) {
        //     $content = $this->get_page_content($div_id);
        // } else {
        //     $id = $div_id;
        // }

        // return [
        //     'active_store' => $active_store,
        //     'current_page' => $current_page,
        //     'current_sub'  => $current_sub,
        //     'error_msg'    => $error_msg,
        //     'id'           => $id,
        //     'content'      => $content,
        // ];

        switch ($store_status) {
            case 'pending':
                $error_msg = 'Waiting for approval. Your store is pending.';
                break;

            case 'suspended':
                $error_msg = 'Your account has been suspended by the admin.';
                break;

            case 'reject':
                $error_msg = 'The application has been rejected.';
                break;

            default:
                if (!$allowed) {
                    $error_msg = 'You do not have permission to access this section.';
                    break;
                }

                if ($div_id === 'edit') {
                    $content = $this->get_page_content($div_id);
                } else {
                    $id = $div_id;
                }
                break;
        }

        return [
            'active_store' => $active_store,
            'current_page' => $current_page,
            'current_sub'  => $current_sub,
            'error_msg'    => $error_msg,
            'id'           => $id,
            'content'      => $content,
        ];
        
    }

    /**
     * Retrieve sanitized tab and subtab.
     */
    private function get_tab_and_subtab(): array {
        if ( get_option( 'permalink_structure' ) ) {
            $tab = sanitize_key(get_query_var('tab') ?: 'dashboard');
            $sub = sanitize_key(get_query_var('subtab'));
        } else {
            $tab = filter_input( INPUT_GET, 'tab', FILTER_DEFAULT ) ?? 'dashboard';
            $sub  = filter_input( INPUT_GET, 'subtab', FILTER_DEFAULT );
        }
        return [$tab, $sub];
    }

    /**
     * Check user capability for a section.
     */
    private function user_has_section_capability(array $section, array $capability_settings): bool {
        if (empty($section['capability'])) {
            return true;
        }

        foreach ((array) $section['capability'] as $cap) {
            if (current_user_can($cap) && in_array($cap, $capability_settings, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolve submenu access and ID.
     */
    private function resolve_submenu_access(array $section, string $current_sub, array $capability_settings): array {
        $id      = $current_sub;
        $allowed = true;

        if (!empty($section['submenu'])) {
            foreach ($section['submenu'] as $submenu) {
                if ($submenu['slug'] === $current_sub) {
                    $allowed = empty($submenu['capability'])
                        ? true
                        : $this->user_has_section_capability($submenu, $capability_settings);
                    $id = $submenu['key'] ?? $current_sub;
                    break;
                }
            }
        } else {
            $sub_cap_key = 'capability-' . $current_sub;
            if (!empty($section[$sub_cap_key])) {
                $allowed = $this->user_has_section_capability(['capability' => $section[$sub_cap_key]], $capability_settings);
            }
        }

        return [$id, $allowed];
    }

    /**
     * Load content for special pages.
     */
    private function get_page_content(string $id): ?string {
        if ('edit' === $id) {
            ob_start();
            $this->call_edit_product_template();
            return ob_get_clean();
        }

        return null;
    }

}
