<?php
/**
 * Roles class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Roles class
 *
 * @class       Roles class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Roles {
    /**
     * Roles class construct function
     */
    public function __construct() {
        add_action( 'init', [ $this, 'multivendorx_add_custom_role' ] );
    }

    public function multivendorx_add_custom_role() {
        if ( ! get_role( 'store_owner' ) ) {
            add_role(
                'store_owner',
                'Store owner',
                array(
                    'read' => true,
                )
            );
        }
    }


    public static function get_all_custom_roles() {
        $custom_roles = [
            [
                'key'   => 'store_owner', 
                'label' =>  __('Store Owner', 'multivendorx')
            ],
            [
                'key'   => 'store_manager', 
                'label' =>  __('Store Manager', 'multivendorx')
            ],
            [
                'key'   => 'product_manager', 
                'label' =>  __('Product Manager', 'multivendorx')
            ],
            [
                'key'   => 'customer_support', 
                'label' =>  __('Customer Support', 'multivendorx')
            ],
            [
                'key'   => 'order_assistant', 
                'label' =>  __('Order Assistant', 'multivendorx')
            ],
        ];
        return $custom_roles;
    }
}