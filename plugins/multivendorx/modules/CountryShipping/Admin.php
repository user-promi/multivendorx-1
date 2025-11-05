<?php
/**
 * MultiVendorX Admin class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\CountryShipping;

/**
 * MultiVendorX CountryShipping Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {

    public function __construct() {
        // Add filter to return all shipping methods for admin
        add_filter( 'multivendorx_get_all_shipping_methods', [ $this, 'get_all_shipping_methods' ] );
    }

    /**
     * Return all MultiVendorX shipping methods for admin panel
     *
     * @return array
     */
    public function get_all_shipping_methods() {
        
        return [
            [
                'id' => 'zone-wise-shipping',
                'icon' => 'adminlib-google',
                'label' => 'Zone based shipping',
                'openForm' => true,
                'desc' => 'Stores set different rates for different regions (like "East Coast" or "California").',
                'formFields' => [
                    [
                        'key' => 'client_id',
                        'type' => 'description',
                        'label' => 'Currently enabled zones',
                        'des' => '<span class="admin-badge yellow">North America</span>  <span class="admin-badge blue">North America</span>  <span class="admin-badge yellow">North America</span>  <span class="admin-badge red">North America</span>'
                    ],
                    [
                        'key' => 'client_id',
                        'type' => 'description',
                        'label' => ' ',
                        'des' => '<span class="admin-btn btn-purple"><i class="adminlib-plus-circle-o"></i>Add new Zone</span>'
                    ],
                ],
            ],
            [
                'id' => 'country-wise-shipping',
                'icon' => 'adminlib-twitter',
                'label' => 'Country-wise shipping',
                'openForm' => true,
                'desc' => 'Let store set specific shipping rates based on destination countries.',
                'enableOption' => true,
                'disableBtn' => true,
            ],
            [
                'id' => 'distance-based-shipping',
                'icon' => 'adminlib-facebook',
                'label' => 'Distance-based shipping',
                'openForm' => true,
                'desc' => 'Calculate shipping costs based on actual distance between locations.',
                'enableOption' => true,
                'disableBtn' => true,
            ],
        ];
    }
}
