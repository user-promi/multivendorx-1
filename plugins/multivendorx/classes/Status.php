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
                    'value' => !empty($active_modules) ? implode(", ", $active_modules) : __('None', 'multivendorx'),
                ]
            ],
        ];
        
        return apply_filters( 'mvx_system_info_response', ['mvx' => $mvx] );
    }
}