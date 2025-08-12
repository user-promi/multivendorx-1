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
                    'manage_products' => true,
                    'manage_users' => true,
                    'upload_files' => true,
                )
            );
        }
    }
}