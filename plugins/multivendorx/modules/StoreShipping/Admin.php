<?php
/**
 * MultiVendorX Admin class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

/**
 * MultiVendorX StoreShipping Admin class
 *
 * @class       Admin class
 * @version     6.0.3
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
        
        // Return shipping method structure
        return [
            [
                'id' => 'zone-wise-shipping',
                'icon' => 'adminlib-zone-wise-shipping',
                'label' => 'Zone based shipping',
                'disableBtn'=> true,
                'enableOption' => true,
                'desc' => 'Stores can configure multiple shipping zones.',
                // 'formFields' => [
                //     [
                //         'key' => 'zones',
                //         'type' => 'nested',
                //         'label' => 'Add Shipping Zones',
                //         'addButtonLabel' => 'Add Zone',
                //         'deleteButtonLabel' => 'Delete Zone',
                //         'single' => false,
                //         'nestedFields' => [
                //             [
                //                 'key' => 'zone_name',
                //                 'type' => 'text',
                //                 'label' => 'Zone Name',
                //                 'placeholder' => 'e.g. North America'
                //             ],
                //             [
                //                 'key' => 'zone_countries',
                //                 'type' => 'dropdown',
                //                 'label' => 'Countries / Regions',
                //                 'treeSelect' => true,
                //                 // 'options' => $country_tree,
                //             ],
                //         ]
                //     ]
                // ]
            ],
            [
                'icon' => 'adminlib-country-shipping',
                'id' => 'country-wise-shipping',
                'label' => 'Country-wise shipping',
                'disableBtn'=> true,
                'enableOption' => true,
                'desc'      => 'Let store set specific shipping rates based on destination countries.',
                'formFields' => [
                    [
                        'key'         => 'country_shipping_method_name',
                        'type'        => 'text',
                        'label'       => 'Method name',
                        'placeholder' => 'Enter Name',
                    ],
                ]
            ],
            [
                'icon' => 'adminlib-distance-shipping',
                'id' => 'distance-based-shipping',
                'label' => 'Distance-based shipping',
                'disableBtn'=> true,
                'enableOption' => true,
                'desc'      => 'Calculate shipping costs based on actual distance between locations.',
                'formFields' => [
                    [
                        'key'         => 'distance_shipping_method_name',
                        'type'        => 'text',
                        'label'       => 'Method name',
                        'placeholder' => 'Enter Name',
                    ],
                ]
            ]
        ];
    }
}
