<?php

namespace MultiVendorX\CountryShipping;

defined('ABSPATH') || exit;

class Shipping extends \WC_Shipping_Method {

    public function __construct() {
        // Unique ID for the shipping method
        $this->id                 = 'mvx_country_shipping_dummy';
        $this->method_title       = __( 'MVX Dummy Country Shipping', 'textdomain' );
        $this->method_description = __( 'A dummy shipping method for testing visibility.', 'textdomain' );

        // Load settings
        $this->init_form_fields();
        $this->init_settings();

        // Load options
        $this->enabled = $this->get_option('enabled');
        $this->title   = $this->get_option('title');
        $this->cost    = $this->get_option('cost');

        // Save admin settings
        add_action('woocommerce_update_options_shipping_' . $this->id, [$this, 'process_admin_options']);
    }

    public function init_form_fields() {
        $this->form_fields = [
            'enabled' => [
                'title'   => __('Enable/Disable', 'textdomain'),
                'type'    => 'checkbox',
                'label'   => __('Enable this shipping method', 'textdomain'),
                'default' => 'yes'
            ],
            'title' => [
                'title'       => __('Method Title', 'textdomain'),
                'type'        => 'text',
                'description' => __('Title shown to customers at checkout.', 'textdomain'),
                'default'     => __('MVX Standard Shipping', 'textdomain'),
                'desc_tip'    => true,
            ],
            'cost' => [
                'title'       => __('Shipping Cost', 'textdomain'),
                'type'        => 'price',
                'description' => __('Flat rate cost for testing.', 'textdomain'),
                'default'     => '15.00',
                'desc_tip'    => true,
            ],
        ];
    }

    public function calculate_shipping($package = []) {
        // Debug to confirm it's called
        file_put_contents(
            plugin_dir_path(__FILE__) . "/shipping_debug.log",
            date("d/m/Y H:i:s") . " - calculate_shipping() triggered\n",
            FILE_APPEND
        );

        $cost = floatval($this->cost ?: 0);

        $rate = [
            'id'    => $this->id . ':1',
            'label' => $this->title,
            'cost'  => $cost,
            'calc_tax' => 'per_order',
        ];

        // Register the rate
        $this->add_rate($rate);
    }
}
