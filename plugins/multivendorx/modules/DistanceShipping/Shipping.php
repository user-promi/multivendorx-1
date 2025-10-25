<?php

namespace MultiVendorX\DistanceShipping;

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
    $this->id                 = 'multivendorx_distance_shipping';
    $this->method_title       = __( 'Multivendorx Shipping by Distance', 'multivendorx' );
    $this->method_description = __( 'Enable stores to set marketplace shipping by distance range', 'multivendorx' );

    $this->enabled      = $this->get_option( 'enabled' );
    $this->title        = $this->get_option( 'title' );
    $this->tax_status   = $this->get_option( 'tax_status' );
    
    if( !$this->title ) $this->title = __( 'Shipping Cost', 'multivendorx' );

    $this->init();

    add_filter( 'woocommerce_package_rates', array(&$this, 'mvx_hide_admin_shipping' ), 100, 2 );
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
     * Calculate shipping for the current package
     */
    public function calculate_shipping( $package = array() ) {
        if ( ! apply_filters( 'mvx_is_allow_store_shipping', true ) ) return;
        if ( ! $this->is_method_enabled() ) return;

        $products = $package['contents'] ?? [];
        if ( empty( $products ) ) return;

        $mvx_user_location_lat = $package['mvx_user_location_lat'] ?? '';
        $mvx_user_location_lng = $package['mvx_user_location_lng'] ?? '';
        if ( ! $mvx_user_location_lat || ! $mvx_user_location_lng ) return;

        $seller_products = [];

        // Group products per store
        foreach ( $products as $product ) {
            $store_id = get_post_meta( $product['product_id'], 'multivendorx_store_id', true );
            if ( ! empty( $store_id ) && self::is_shipping_enabled_for_seller( $store_id ) ) {
                $seller_products[ (int) $store_id ][] = $product;
            }
        }

        if ( empty( $seller_products ) ) return;

        foreach ( $seller_products as $store_id => $products ) {

            // Get store meta
            $store = new \MultiVendorX\Store\Store( $store_id );
            $meta  = $store->meta_data;

            $store_lat            = $meta['location_lat'] ?? 0;
            $store_lng            = $meta['location_lng'] ?? 0;
            $default_cost         = floatval( $meta['distance_default_cost'] ?? 0 );
            $max_distance         = floatval( $meta['distance_max_km'] ?? 0 );
            $local_pickup_cost    = floatval( $meta['distance_local_pickup_cost'] ?? 0 );
            $free_shipping_amount = floatval( $meta['_free_shipping_amount'] ?? 0 );
            $distance_rules       = isset($meta['distance_rules']) ? json_decode($meta['distance_rules'], true) : [];

            if ( ! $store_lat || ! $store_lng ) continue;
            // Calculate distance
            $distance = self::mvx_get_latlng_distance( $mvx_user_location_lat, $mvx_user_location_lng, $store_lat, $store_lng, 'k' );

            if ( ! $distance ) continue;

            // Check max distance
            if ( $max_distance && $distance > $max_distance ) {
                wc_add_notice( __( 'Some cart item(s) are not deliverable to your location.', 'multivendorx' ), 'error' );
                continue;
            }

            // Calculate shipping per seller based on distance rules
            $store_amount = $this->calculate_per_seller( $products, $distance, $default_cost, $distance_rules, $free_shipping_amount, true );

            $tax_rate = ( $this->tax_status === 'none' ) ? false : '';
            $tax_rate = apply_filters( 'mvx_is_apply_tax_on_shipping_rates', $tax_rate );

            // Register shipping rate
            $rate = [
                'id'    => $this->id . ':' . $store_id,
                'label' => $this->title,
                'cost'  => $store_amount,
                'taxes' => $tax_rate,
            ];
            $this->add_rate( $rate );

            // Add local pickup if available
            if ( $local_pickup_cost ) {
                $pickup_rate = [
                    'id'    => 'local_pickup:' . $store_id,
                    'label' => apply_filters( 'mvx_local_pickup_shipping_option_label', __('Pickup from Store', 'multivendorx') . ' (' . $address . ')', $store_id ),
                    'cost'  => $local_pickup_cost,
                    'taxes' => $tax_rate,
                ];
                $this->add_rate( $pickup_rate );
            }
        }
    }

    /**
     * Calculate shipping per seller based on distance rules
     */
    public function calculate_per_seller( $products = [], $total_distance = 0, $default_cost = 0, $distance_rules = [], $free_shipping_amount = 0, $is_consider_free_threshold = false ) {
        $amount = floatval( $default_cost );

        // Calculate total product cost for free shipping
        $products_total_cost = 0;
        foreach ( $products as $product ) {
            $line_subtotal      = (float) $product['line_subtotal'];
            $line_total         = (float) $product['line_total'];
            $discount_total     = $line_subtotal - $line_total;
            $line_subtotal_tax  = (float) $product['line_subtotal_tax'];
            $line_total_tax     = (float) $product['line_tax'];
            $discount_tax_total = $line_subtotal_tax - $line_total_tax;

            $total = apply_filters( 'mvx_free_shipping_threshold_consider_tax', true ) ? $line_subtotal + $line_subtotal_tax : $line_subtotal;

            $products_total_cost += WC()->cart->display_prices_including_tax()
                ? round( $total - ( $discount_total + $discount_tax_total ), wc_get_price_decimals() )
                : round( $total - $discount_total, wc_get_price_decimals() );
        }

        // Free shipping check
        if ( $is_consider_free_threshold && $free_shipping_amount > 0 && $products_total_cost >= $free_shipping_amount ) {
            return apply_filters( 'mvx_shipping_distance_calculate_amount', 0, $products, $total_distance, $default_cost, $distance_rules );
        }

        // Apply distance rules
        if ( ! empty( $distance_rules ) ) {
            foreach ( $distance_rules as $rule ) {
                $max_distance = floatval( $rule['max_distance'] ?? 0 );
                $cost         = floatval( $rule['cost'] ?? 0 );

                if ( $total_distance <= $max_distance ) {
                    $amount = $cost;
                    break; // Stop at first matched rule
                }
            }
        }

        return apply_filters( 'mvx_shipping_distance_calculate_amount', $amount, $products, $total_distance, $default_cost, $distance_rules );
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
  function init_form_fields() {

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
          'default'       => __( 'Shipping Cost', 'multivendorx' ),
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
  
    /**
    * Check if shipping for this product is enabled
    *
    * @param  integet  $product_id
    *
    * @return boolean
    */
    public static function is_shipping_enabled_for_seller( $store_id ) {
        $store = new \MultiVendorX\Store\Store( $store_id );
        $shipping_options = $store->meta_data['shipping_options'] ?? '';
        return $shipping_options === 'shipping_by_distance';
    }
  
  /**
   * Hide Admin Shipping If vendor Shipping is available callback
   * @since 3.7
   * @param array $rates
   * @return array
   */
  public function mvx_hide_admin_shipping( $rates, $package ) {
    $free_shipping_available = false;
    $mvx_shipping = array();
    if( apply_filters( 'mvx_is_allow_hide_admin_shipping_for_vendor_shipping', true ) && isset( $package['vendor_id'] ) ) {
      if ($rates) {
        foreach ( $rates as $rate_id => $rate ) {
          if ( 'mvx_product_shipping_by_distance' === $rate->method_id ) {
            $id = explode(":", $rate_id, 2);
            $id = $id[0];
            if($id === 'free_shipping') {
              $free_shipping_available = apply_filters( 'mvx_is_allow_hide_other_shipping_if_free', true );
            }
            $mvx_shipping[ $rate_id ] = $rate;  
          }
        }
      }
      if($free_shipping_available) {
        foreach ( $mvx_shipping as $rate_id => $rate ) { 
          $id = explode(":", $rate_id, 2);
          $id = $id[0];
          if( !in_array( $id, array( 'free_shipping', 'local_pickup' ) ) ) {
            unset($mvx_shipping[$rate_id]);
          }
        }
      }

      if( apply_filters( 'mvx_is_allow_admin_shipping_if_no_vendor_shipping', false ) ) {
        $rates = array();
      }
    }
    return ! empty( $mvx_shipping ) ? $mvx_shipping : $rates;
  }
  
      /*
     * calculates the distance between two points (given the latitude/longitude of those points).
     * lat1, lon1 = Latitude and Longitude of point 1
     * lat2, lon2 = Latitude and Longitude of point 2
     * unit = the unit you desire for results            
      where: 'M' is statute miles (default)
      'K' is kilometers
      'N' is nautical miles
     */

     public static function mvx_get_latlng_distance($lat1, $lon1, $lat2, $lon2, $unit = 'M') {
        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        $unit = strtoupper($unit);

        if ($unit == "K") {
            return ($miles * 1.609344);
        } else if ($unit == "N") {
            return ($miles * 0.8684);
        } else {
            do_action('mvx_get_latlng_distance', $lat1, $lon1, $lat2, $lon2, $unit, $dist);
            return $miles;
        }
    }
}
