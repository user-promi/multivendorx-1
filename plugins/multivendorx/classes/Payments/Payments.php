<?php

namespace MultiVendorX\Payments;
use MultiVendorX\Payments\Providers\MultiVendorX_PayPal_Payment;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Payment class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */
class Payments {
    private $providers = array();
    public function __construct() {
        // $this->providers = apply_filters('multivendorx_payment_providers', $this->providers);

        add_action('init', [$this, 'load_all_providers']);

    }

    public function load_all_providers() {
        $this->providers = apply_filters('multivendorx_payment_providers', $this->providers);
    }

    /**
     * Return all providers with their settings array
     */
    public function all_payment_providers() {
        $providers = [];

        foreach ($this->providers as $provider) {
            $provider = new $provider();
            $providers[$provider->get_id()] = $provider->get_settings();
        }

        return $providers;
    }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }


    public function get_all_store_payment_settings() {
        $store_settings = [];

        foreach ($this->providers as $provider) {
                $provider = new $provider();
                $settings = $provider->get_store_payment_settings();
                $store_settings[$provider->get_id()] = $settings;
                
        }

        return $store_settings;
    }


}