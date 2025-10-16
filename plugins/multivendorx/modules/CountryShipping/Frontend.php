<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\CountryShipping;

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
        $new_options = array(
            (object) array(
                'key' => 'shipping_by_country',
                'label' => __('Shipping by Country', 'multivendorx'),
                'value' => 'shipping_by_country'
            )
        );
        
        // Merge with existing options without overwriting
        return array_merge($existing_options, $new_options);
    }

}