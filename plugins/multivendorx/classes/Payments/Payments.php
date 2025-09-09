<?php

namespace MultiVendorX\Payments;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Payment class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */
class Payments {
    private $container = array();
    public $providers = array();
    public function __construct() {
        $this->init_classes();
        // $this->providers = apply_filters('multivendorx_payment_providers', $this->providers);

        add_action('init', [$this, 'load_all_providers']);

    }

    public function init_classes() {
        $this->container = array(
            'disbursement'  => new Disbursement(),
            'processor'     => new PaymentProcessor(),
        );
    }

    public function load_all_providers() {
        $this->providers = apply_filters('multivendorx_payment_providers', $this->providers);
    }


    public function get_all_payment_settings() {
        $all_settings = [];

        foreach ($this->providers as $provider) {
            $provider_obj = new $provider['class']();
            $all_settings[$provider['id']] = $provider_obj->get_settings();
        }

        return $all_settings;
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
                $provider_obj = new $provider['class']();
                $store_settings[$provider['id']] = $provider_obj->get_store_payment_settings();                
        }

        return $store_settings;
    }

}