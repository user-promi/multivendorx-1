<?php

namespace MultiVendorX\CountryShipping;

defined('ABSPATH') || exit;

class Shipping extends \WC_Shipping_Method {

    /**
    * Constructor for your shipping class
    *
    * @access public
    *
    * @return void
    */
    public function __construct() {
        $this->id                 = 'multivendorx_product_shipping_by_country';
        $this->method_title       = __( 'Multivendorx Shipping by Country', 'multivendorx' );
        $this->method_description = __( 'Enable vendors to set marketplace shipping per country', 'multivendorx' );

        $this->enabled      = $this->get_option( 'enabled' );
        $this->title        = $this->get_option( 'title' );
        $this->tax_status   = $this->get_option( 'tax_status' );
        
        if( !$this->title ) $this->title = __( 'Shipping Cost', 'multivendorx' );

        $this->init();
    }


    /**
     * Init your settings
    *
    * @access public
    * @return void
    */
    function init() {
        // Load the settings API
        $this->init_form_fields();
        $this->init_settings();

        // Save settings in admin if you have any defined
        add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
    }

    /**
     * Checking is gateway enabled or not
    *
    * @return boolean [description]
    */
    public function is_method_enabled() {
        return $this->enabled == 'yes';
    }

    /**
     * Initialise Gateway Settings Form Fields
    *
    * @access public
    * @return void
    */
    public function init_form_fields() {

        $this->form_fields = array(
            'enabled' => array(
                'title'         => __( 'Enable/Disable', 'multivendorx' ),
                'type'          => 'checkbox',
                'label'         => __( 'Enable Shipping', 'multivendorx' ),
                'default'       => 'yes'
            ),
            'title' => array(
                'title'         => __( 'Method Title', 'multivendorx' ),
                'type'          => 'text',
                'description'   => __( 'This controls the title which the user sees during checkout.', 'multivendorx' ),
                'default'       => __( 'Regular Shipping', 'multivendorx' ),
                'desc_tip'      => true,
            ),
            'tax_status' => array(
                'title'         => __( 'Tax Status', 'multivendorx' ),
                'type'          => 'select',
                'default'       => 'taxable',
                'options'       => array(
                    'taxable'   => __( 'Taxable', 'multivendorx' ),
                    'none'      => _x( 'None', 'Tax status', 'multivendorx' )
                ),
            ),

        );
    }

    public function calculate_shipping($packages = []) {
        $products = $packages['contents'];
        $destination_country = isset( $packages['destination']['country'] ) ? $packages['destination']['country'] : '';
        $destination_state = isset( $packages['destination']['state'] ) ? $packages['destination']['state'] : '';
        
        $amount = 0.0;
        
        if ( ! $this->is_method_enabled() ) {
           return;
        }
        
        if ( $products ) {
            $amount = $this->calculate_per_seller( $products, $destination_country, $destination_state );
            file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: : " . var_export($amount, true) . "\n", FILE_APPEND);
            $tax_rate  = ( $this->tax_status == 'none' ) ? false : '';
            $tax_rate  = apply_filters( 'multivendorx_is_apply_tax_on_shipping_rates', $tax_rate );
            
            if( !$amount ) {
              $this->title = __('Free Shipping', 'multivendorx');
            }
       
            $rate = array(
                'id'    => $this->id . ':1',
                'label' => $this->title,
                'cost'  => $amount,
                'taxes' => $tax_rate
            );
       
            // Register the rate
            $this->add_rate( $rate );
            
            $this->maybe_add_local_pickup_rate( $products, $tax_rate );
          }
    }

    /**
    * Check if shipping for this product is enabled
    *
    * @param  integet  $product_id
    *
    * @return boolean
    */
    public static function is_shipping_enabled_for_seller( $store_id ) {

        // Load the store object
        $store = new \MultiVendorX\Store\Store( $store_id );
    
        // Check store meta for shipping options
        $shipping_options = $store->meta_data['shipping_options'] ?? '';
    
        if ( $shipping_options === 'shipping_by_country' ) {
            return true;
        }

        return false;
    }
    

    /**
     * Calculate shipping per seller
     *
     * @param  array   $products
     * @param  string  $destination_country
     * @param  string  $destination_state
     * @param  bool    $is_consider_free_threshold
     *
     * @return float
     */
    public function calculate_per_seller( $products, $destination_country, $destination_state, $is_consider_free_threshold = false ) {
        $amount = 0.0;
        $price  = array();
        $seller_products = array();
    
        // Group products by store
        foreach ( $products as $product ) {
            $id       = $product['product_id'];
            $store_id = get_post_meta( $id, 'multivendorx_store_id', true );
    
            if ( ! empty( $store_id ) ) {
                $seller_products[ (int) $store_id ][] = $product;
            }
        }
    
        if ( $seller_products ) {
            foreach ( $seller_products as $store_id => $products ) {
    
                if ( ! self::is_shipping_enabled_for_seller( $store_id ) ) {
                    continue;
                }
    
                $store = new \MultiVendorX\Store\Store( $store_id );
                $meta  = $store->meta_data; // All store meta data
    
                $multivendorx_free_shipping_amount = isset( $meta['_free_shipping_amount'] ) ? $meta['_free_shipping_amount'] : '';
                $multivendorx_free_shipping_amount = apply_filters( 'multivendorx_free_shipping_minimum_order_amount', $multivendorx_free_shipping_amount, $store_id );
    
                $default_shipping_price     = isset( $meta['multivendorx_shipping_type_price'] ) ? $meta['multivendorx_shipping_type_price'] : 0;
                $default_shipping_add_price = isset( $meta['multivendorx_additional_product'] ) ? $meta['multivendorx_additional_product'] : 0;
                $default_shipping_qty_price = isset( $meta['multivendorx_additional_qty'] ) ? $meta['multivendorx_additional_qty'] : 0;
    
                $downloadable_count  = 0;
                $products_total_cost = 0;
    
                foreach ( $products as $product ) {
                    // Check virtual/downloadable
                    if ( isset( $product['variation_id'] ) ) {
                        $is_virtual      = get_post_meta( $product['variation_id'], '_virtual', true );
                        $is_downloadable = get_post_meta( $product['variation_id'], '_downloadable', true );
                    } else {
                        $is_virtual      = get_post_meta( $product['product_id'], '_virtual', true );
                        $is_downloadable = get_post_meta( $product['product_id'], '_downloadable', true );
                    }
    
                    if ( $is_virtual === 'yes' || $is_downloadable === 'yes' ) {
                        $downloadable_count++;
                        continue;
                    }
    
                    // Check if product overrides shipping
                    if ( get_post_meta( $product['product_id'], '_overwrite_shipping', true ) === 'yes' ) {
                        $shipping_qty_price = get_post_meta( $product['product_id'], '_additional_qty', true );
                        $price[ $store_id ]['addition_price'][] = get_post_meta( $product['product_id'], '_additional_price', true );
                    } else {
                        $shipping_qty_price = $default_shipping_qty_price;
                        $price[ $store_id ]['addition_price'][] = 0;
                    }
    
                    $price[ $store_id ]['default'] = floatval( $default_shipping_price );
    
                    // Additional quantity price
                    if ( $product['quantity'] > 1 ) {
                        $price[ $store_id ]['qty'][] = ( ( $product['quantity'] - 1 ) * floatval( $shipping_qty_price ) );
                    } else {
                        $price[ $store_id ]['qty'][] = 0;
                    }
    
                    // Calculate total product cost
                    $line_subtotal      = (float) $product['line_subtotal'];
                    $line_total         = (float) $product['line_total'];
                    $discount_total     = $line_subtotal - $line_total;
                    $line_subtotal_tax  = (float) $product['line_subtotal_tax'];
                    $line_total_tax     = (float) $product['line_tax'];
                    $discount_tax_total = $line_subtotal_tax - $line_total_tax;
    
                    if ( apply_filters( 'multivendorx_free_shipping_threshold_consider_tax', true ) ) {
                        $total = $line_subtotal + $line_subtotal_tax;
                    } else {
                        $total = $line_subtotal;
                    }
    
                    if ( WC()->cart->display_prices_including_tax() ) {
                        $products_total_cost += round( $total - ( $discount_total + $discount_tax_total ), wc_get_price_decimals() );
                    } else {
                        $products_total_cost += round( $total - $discount_total, wc_get_price_decimals() );
                    }
                }
                // Check free shipping threshold
                if ( $multivendorx_free_shipping_amount && ( $multivendorx_free_shipping_amount <= $products_total_cost ) ) {
                    return apply_filters( 'multivendorx_shipping_country_calculate_amount', 0, $price, $products, $destination_country, $destination_state );
                }
    
                // Additional product cost
                $price[ $store_id ]['add_product'] = count( $products ) > 1 
                    ? floatval( $default_shipping_add_price ) * ( count( $products ) - ( 1 + $downloadable_count ) ) 
                    : 0;
    
                // -------------------------
                // Country/State rates logic
                // -------------------------
                $mvx_shipping_rates = isset($meta['multivendorx_shipping_rates']) ? json_decode($meta['multivendorx_shipping_rates'], true) : [];
                $state_rate = 0;
                $country_rate = null;
                $everywhere_rate = null;
    
                foreach ($mvx_shipping_rates as $rate) {
                    if ($rate['country'] === $destination_country) {
                        $country_rate = $rate;
                        break;
                    }
                    if ($rate['country'] === 'everywhere') {
                        $everywhere_rate = $rate;
                    }
                }
    
                if ($country_rate) {
                    if ($destination_state && !empty($country_rate['states'])) {
                        $state_found = false;
                        foreach ($country_rate['states'] as $state) {
                            if ($state['state'] === $destination_state) {
                                $state_rate = floatval($state['cost']);
                                $state_found = true;
                                break;
                            }
                        }
                        if (!$state_found && isset($everywhere_rate)) {
                            $state_rate = floatval($everywhere_rate['cost']);
                        }
                    } else {
                        $state_rate = floatval($country_rate['cost']);
                    }
                } elseif ($everywhere_rate) {
                    $state_rate = floatval($everywhere_rate['cost']);
                }
    
                $price[$store_id]['state_rates'] = $state_rate;
            }
        }
    
        // Sum up total shipping amount
        if ( ! empty( $price ) ) {
            foreach ( $price as $s_id => $value ) {
                $amount += ( ( isset( $value['addition_price'] ) ? array_sum( $value['addition_price'] ) : 0 ) 
                            + ( isset( $value['default'] ) ? $value['default'] : 0 ) 
                            + ( isset( $value['qty'] ) ? array_sum( $value['qty'] ) : 0 ) 
                            + $value['add_product'] 
                            + ( isset( $value['state_rates'] ) ? $value['state_rates'] : 0 ) );
            }
        }
    
        return apply_filters( 'multivendorx_shipping_country_calculate_amount', $amount, $price, $products, $destination_country, $destination_state );
    }
    
    
    /**
     * Add Local Pickup rate per vendor if enabled.
     *
     * @param int    $vendor_id
     * @param array  $products
     * @param string $destination_country
     * @param string $destination_state
     * @param mixed  $tax_rate
     *
     * @return void
     */
    public function maybe_add_local_pickup_rate( $products, $tax_rate = false ) {

        $seller_products = array();
    
        // Group products by store
        foreach ( $products as $product ) {
            $id       = $product['product_id'];
            $store_id = get_post_meta( $id, 'multivendorx_store_id', true );
    
            if ( ! empty( $store_id ) ) {
                $seller_products[ (int) $store_id ][] = $product;
            }
        }
        if ( $seller_products ) {
            foreach ( $seller_products as $store_id => $products ) {
    
                if ( ! self::is_shipping_enabled_for_seller( $store_id ) ) {
                    continue;
                }
    
                $store = new \MultiVendorX\Store\Store( $store_id );
                $meta  = $store->meta_data; // All store meta data

                $local_pickup_cost  = isset( $meta['_local_pickup_cost'] ) ? $meta['_local_pickup_cost'] : 0;

                if( $local_pickup_cost ) {
                    $rate = array(
                        'id'    => 'local_pickup:1',
                        'label' => __('Pickup from Store', 'multivendorx'),
                        'cost'  => $local_pickup_cost,
                        'taxes' => $tax_rate
                    );
               
                    // Register the rate
                    $this->add_rate( $rate );
                  }
            }
        }
        
    }


}
