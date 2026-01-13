<?php
namespace MultiVendorX\WPML;

use MultiVendorX\Utill;

class Admin {

    public function __construct() {
        add_action( 'wp', array( $this, 'disable_wpml_switcher_on_dashboard' ), 99 );
    }

    /**
     * Disable WPML language switcher on multivendorx React store dashboard
     */
    public function disable_wpml_switcher_on_dashboard() {

        if ( ! Utill::is_store_dashboard() ) {
            return;
        }

        add_filter( 'icl_ls_languages', '__return_empty_array' );
    }
}
