<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

/**
 * MultiVendorX Store Review Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter('multivendorx_store_shipping_options', array($this, 'add_shipping_options'));
    }

    /**
     * Add shipping options without changing existing ones
     *
     * @param array $existing_options
     * @return array
     */
    public function add_shipping_options($existing_options) {

        // Get all shipping module settings
        $settings = MultiVendorX()->setting->get_setting('shipping_modules');
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: settings: " . var_export($settings, true) . "\n", FILE_APPEND);

        // Check if country-wise shipping is enabled
        $country_shipping_enabled = isset($settings['country-wise-shipping']['enable']) 
            ? $settings['country-wise-shipping']['enable'] 
            : false;
    
        // Only add if country-wise shipping is enabled
        if ($country_shipping_enabled) {
            $new_options = array(
                (object) array(
                    'key'   => 'shipping_by_country',
                    'label' => __('Shipping by Country', 'multivendorx'),
                    'value' => 'shipping_by_country'
                )
            );
    
            // Merge with existing options without overwriting
            $existing_options = array_merge($existing_options, $new_options);
        }

        $distance_based_shipping = isset($settings['distance-based-shipping']['enable']) 
        ? $settings['distance-based-shipping']['enable'] 
        : false;

        // Only add if country-wise shipping is enabled
        if ($distance_based_shipping) {
            $new_options = array(
                (object) array(
                    'key' => 'shipping_by_distance',
                    'label' => __('Shipping by Distance', 'multivendorx'),
                    'value' => 'shipping_by_distance'
                )
            );
    
            // Merge with existing options without overwriting
            $existing_options = array_merge($existing_options, $new_options);
        }

        // Return existing options if module not enabled
        return $existing_options;
    }
    

}