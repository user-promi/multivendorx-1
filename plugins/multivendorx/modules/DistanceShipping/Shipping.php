<?php

namespace MultiVendorX\DistanceShipping;

defined('ABSPATH') || exit;

class Shipping extends \WC_Shipping_Method {

    /**
     * Constructor for the shipping class.
     *
     * @access public
     * @return void
     */
    public function __construct() {
        $this->id                 = 'multivendorx_product_shipping_by_distance';
        $this->method_title       = __( 'MultivendorX Shipping by Distance', 'multivendorx' );
        $this->method_description = __( 'Enable vendors to set marketplace shipping by distance range.', 'multivendorx' );

        $this->enabled    = $this->get_option( 'enabled' );
        $this->title      = $this->get_option( 'title' );
        $this->tax_status = $this->get_option( 'tax_status' );

        if ( ! $this->title ) {
            $this->title = __( 'Shipping Cost', 'multivendorx' );
        }

        $this->init();
    }

    /**
     * Initialize settings.
     *
     * @access public
     * @return void
     */
    public function init() {
        // Load the settings API
        $this->init_form_fields();
        $this->init_settings();

        // Save settings in admin
        add_action( 'woocommerce_update_options_shipping_' . $this->id, [ $this, 'process_admin_options' ] );
    }

    /**
     * Initialize Gateway Settings Form Fields.
     *
     * @access public
     * @return void
     */
    public function init_form_fields() {
        $this->form_fields = [
            'enabled' => [
                'title'       => __( 'Enable/Disable', 'multivendorx' ),
                'type'        => 'checkbox',
                'label'       => __( 'Enable Shipping', 'multivendorx' ),
                'default'     => 'yes',
            ],
            'title' => [
                'title'       => __( 'Method Title', 'multivendorx' ),
                'type'        => 'text',
                'description' => __( 'This controls the title which the user sees during checkout.', 'multivendorx' ),
                'default'     => __( 'Shipping Cost', 'multivendorx' ),
                'desc_tip'    => true,
            ],
            'tax_status' => [
                'title'   => __( 'Tax Status', 'multivendorx' ),
                'type'    => 'select',
                'default' => 'taxable',
                'options' => [
                    'taxable' => __( 'Taxable', 'multivendorx' ),
                    'none'    => _x( 'None', 'Tax status', 'multivendorx' ),
                ],
            ],
        ];
    }
}
