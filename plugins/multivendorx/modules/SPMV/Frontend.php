<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SPMV;

use MultiVendorX\FrontendScripts;

/**
 * MultiVendorX SPMV Frontend class
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
        add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
    }

    public function frontend_scripts() {
        if ( is_woocommerce() ) {
            FrontendScripts::load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-single-product-multiple-vendor-script' );
            FrontendScripts::localize_scripts( 'multivendorx-single-product-multiple-vendor-script' );
        }
    }
}
