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

        add_action('init', [$this, 'load_all_providers']);

    }

    public function init_classes() {
        $this->container = array(
            'disbursement'  => new Disbursement(),
            'processor'     => new PaymentProcessor(),
            'custom_gateway' => new CustomPayment(),
            'bank_transfer' => new BankTransfer(),
            'cash' => new CashPayment(),
            'paypal_payout' => new PaypalPayout(),
            'stripe_connect' => new StripeConnect(),

        );
    }

    public function load_all_providers() {
        $this->providers = apply_filters('multivendorx_payment_providers', $this->providers);
    }


    public function get_all_payment_settings() {
        $all_settings = [];

        $providers = [
            [
                'id'    => 'custom-gateway',
                'name'  => 'Custom Gateway',
                'class' => 'MultiVendorX\\Payments\\CustomPayment'
            ],
            [
                'id'    => 'cash',
                'name'  => 'Cash',
                'class' => 'MultiVendorX\\Payments\\CashPayment'
            ],
            [
                'id'    => 'bank-transfer',
                'name'  => 'Bank Transfer',
                'class' => 'MultiVendorX\\Payments\\BankTransfer'
            ],
            [
                'id'    => 'paypal-payout',
                'name'  => 'Paypal Payout',
                'class' => 'MultiVendorX\\Payments\\PaypalPayout'
            ],
            [
                'id'    => 'stripe-connect',
                'name'  => 'Stripe Connect',
                'class' => 'MultiVendorX\\Payments\\StripeConnect'
            ]
            
        ];

        $this->providers = array_merge($this->providers ?? [], $providers);

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