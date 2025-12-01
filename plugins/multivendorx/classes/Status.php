<?php

namespace MultiVendorX;


defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Status class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */
class Status {

    public static function get_system_info() {

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    
        // Core debug data.
        if ( ! class_exists( 'WP_Debug_Data' ) ) {
            require_once ABSPATH . 'wp-admin/includes/class-wp-debug-data.php';
        }
    
        // Ensure core update functions are available
        if ( ! function_exists( 'get_core_updates' ) ) {
            require_once ABSPATH . 'wp-admin/includes/update.php';
        }
    
        $active_modules = MultiVendorX()->modules->get_active_modules() ?? [];
        
        $mvx = [
            'label'  => esc_html__( 'MultiVendorX', 'multivendorx' ),
            'fields' => [
                'version' => [
                    'label' => esc_html__( 'Version', 'multivendorx' ),
                    'value' => MultiVendorX()->version,
                ],
                'plugin_plan' => [
                    'label' => esc_html__( 'Plugin subscription plan', 'multivendorx' ),
                    'value' => apply_filters('mvx_current_subscription_plan', __('Free', 'multivendorx') ),
                ],
                'active_modules' => [
                    'label' => esc_html__( 'Active modules', 'multivendorx' ),
                    'value' => ! empty( $active_modules ) ? implode(", ", $active_modules) : __('None', 'multivendorx'),
                ]
            ],
        ];
    
        $core_data = \WP_Debug_Data::debug_data();
    
        // Keep only relevant data.
        $core_data = array_intersect_key(
            $core_data,
            array_flip(
                [
                    'wp-core',
                    'wp-dropins',
                    'wp-active-theme',
                    'wp-parent-theme',
                    'wp-mu-plugins',
                    'wp-plugins-active',
                    'wp-plugins-inactive',
                    'wp-server',
                    'wp-database',
                    'wp-constants',
                    'wp-filesystem',
                ]
            )
        );
    
        // Prepend MVX data
        $core_data = [ 'mvx' => $mvx ] + $core_data;
    
        return apply_filters( 'mvx_system_info_response', $core_data );
    }
    
}