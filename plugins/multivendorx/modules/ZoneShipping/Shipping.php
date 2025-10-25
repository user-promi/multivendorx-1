<?php

namespace MultiVendorX\ZoneShipping;
use MultiVendorX\ZoneShipping\Util;
use WC_Shipping_Zones;
defined('ABSPATH') || exit;

class Shipping extends \WC_Shipping_Method {

    public $default_option;
    public $default;
    public $fee_cost;
    
    public function __construct( $instance_id = 0 ) {
        $this->id                   = 'multivendorx_store_shipping';
        $this->instance_id          = absint( $instance_id );
        $this->method_title         = __( 'Store Shipping', 'multivendorx' );
        $this->method_description   = __( 'Charge varying rates based on user defined conditions', 'multivendorx' );
        $this->supports             = array( 'shipping-zones', 'instance-settings', 'instance-settings-modal' );
        $this->default              = "";

        // Initialize settings
        $this->init();

        //additional hooks for post-calculations settings
        add_filter( 'woocommerce_shipping_chosen_method', array( $this, 'select_default_rate' ), 10, 2 );
        add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
        add_filter( 'woocommerce_package_rates', array( $this, 'woocommerce_package_rates' ), 99, 2);
    }


    /**
    * Evaluate a cost from a sum/string.
    * @param  string $sum
    * @param  array  $args
    * @return string
    */
    protected function evaluate_cost( $sum, $args = array() ) {
        include_once( WC()->plugin_path() . '/includes/libraries/class-wc-eval-math.php' );
    
        // Allow 3rd parties to process shipping cost arguments
        $args           = apply_filters( 'woocommerce_evaluate_shipping_cost_args', $args, $sum, $this );
        $locale         = localeconv();
        $decimals       = array( wc_get_price_decimal_separator(), $locale['decimal_point'], $locale['mon_decimal_point'], ',' );
        $this->fee_cost = $args['cost'];
    
        // Expand shortcodes
        add_shortcode( 'fee', array( $this, 'fee' ) );
    
        $sum = do_shortcode( str_replace(
          array('[qty]', '[cost]'),
          array($args['qty'], $args['cost']),
          $sum
        ) );
    
        remove_shortcode( 'fee', array( $this, 'fee' ) );
    
        // Remove whitespace from string
        $sum = preg_replace( '/\s+/', '', $sum );
    
        // Remove locale from string
        $sum = str_replace( $decimals, '.', $sum );
    
        // Trim invalid start/end characters
        $sum = rtrim( ltrim( $sum, "\t\n\r\0\x0B+*/" ), "\t\n\r\0\x0B+-*/" );
    
        // Do the math (FIXED: global namespace)
        return $sum ? \WC_Eval_Math::evaluate( $sum ) : 0;
    }
    

    /**
    * Work out fee (shortcode).
    * @param  array $atts
    * @return string
    */
    public function fee( $atts ) {
        $atts = shortcode_atts( array(
            'percent' => '',
            'min_fee' => '',
            'max_fee' => '',
        ), $atts, 'fee' );

        $calculated_fee = 0;

        if ( $atts['percent'] ) {
            $calculated_fee = $this->fee_cost * ( floatval( $atts['percent'] ) / 100 );
        }

        if ( $atts['min_fee'] && $calculated_fee < $atts['min_fee'] ) {
            $calculated_fee = $atts['min_fee'];
        }

        if ( $atts['max_fee'] && $calculated_fee > $atts['max_fee'] ) {
            $calculated_fee = $atts['max_fee'];
        }

        return $calculated_fee;
    }

    /**
    * Get items in package.
    * @param  array $package
    * @return int
    */
    public function get_package_item_qty( $package ) {
        $total_quantity = 0;
        foreach ( $package['contents'] as $item_id => $values ) {
            if ( $values['quantity'] > 0 && $values['data']->needs_shipping() ) {
                $total_quantity += $values['quantity'];
            }
        }
        return $total_quantity;
    }

    /**
    * Finds and returns shipping classes and the products with said class.
    *
    * @param mixed $package
    *
    * @return array
    */
    public function find_shipping_classes( $package ) {
        $found_shipping_classes = array();
        
        foreach ( $package['contents'] as $item_id => $values ) {
            if ( $values['data']->needs_shipping() ) {
                $found_class = $values['data']->get_shipping_class();

                if ( ! isset( $found_shipping_classes[ $found_class ] ) ) {
                    $found_shipping_classes[ $found_class ] = array();
                }

                $found_shipping_classes[ $found_class ][ $item_id ] = $values;
            }
        }

        return $found_shipping_classes;
    }

    /**
    * init function.
    * initialize variables to be used
    *
    * @access public
    * @return void
    */
    public function init() {
        $this->instance_form_fields = array(
            'title' => array(
                'title'         => __( 'Method title', 'multivendorx' ),
                'type'          => 'text',
                'description'   => __( 'This controls the title which the user sees during checkout.', 'multivendorx' ),
                'default'       => __( 'Store Shipping', 'multivendorx' ),
                'desc_tip'      => true,
            ),
            'tax_status' => array(
                'title'         => __( 'Tax status', 'multivendorx' ),
                'type'          => 'select',
                'class'         => 'wc-enhanced-select',
                'default'       => 'taxable',
                'options'       => array(
                    'taxable'   => __( 'Taxable', 'multivendorx' ),
                    'none'      => _x( 'None', 'Tax status', 'multivendorx' ),
                ),
            )
        );

        $this->title                = $this->get_option( 'title' );
        $this->tax_status           = $this->get_option( 'tax_status' );
    }

    /**
    * calculate_shipping function.
    *
    * @access public
    * @param array $package (default: array())
    * @return void
    */
    public function calculate_shipping( $package = array() ) {
        $rates = array();

        // Group products by store ID
        $products = $package['contents'];
        $seller_products = [];
    
        foreach ( $products as $product ) {
            $id = $product['product_id'];
            $store_id = get_post_meta( $id, 'multivendorx_store_id', true );
    
            if ( ! empty( $store_id ) ) {
                $seller_products[ (int) $store_id ][] = $product;
            }
        }
    
        if ( empty( $seller_products ) ) {
            return; // no store info found
        }

        // Loop through each store
        foreach ( $seller_products as $store_id => $products ) {
            $zone = WC_Shipping_Zones::get_zone_matching_package( $package );

            // Get shipping methods for this store
            $shipping_methods = Util::get_shipping_methods( $zone->get_id(), $store_id );

            if ( empty( $shipping_methods ) ) {
                continue;
            }
            // Filter shipping methods (optional)
            $shipping_methods = apply_filters('mvx_get_shipping_methods_for_shipping_address', $shipping_methods, $package, $store_id );
            foreach ( $shipping_methods as $key => $method ) {
                $tax_rate = ( $method['settings']['tax_status'] == 'none' ) ? false : '';
                $has_costs = false;
                $cost = 0;
    
                if ( 'yes' != $method['enabled'] ) {
                    continue;
                }
    
                // Flat rate shipping
                if ( $method['id'] == 'flat_rate' ) {
                    $setting_cost = isset( $method['settings']['cost'] ) ? stripslashes_deep( $method['settings']['cost'] ) : '';
    
                    if ( '' !== $setting_cost ) {
                        $has_costs = true;
                        $cost = $this->evaluate_cost( $setting_cost, array(
                            'qty'  => $this->get_package_item_qty( $package ),
                            'cost' => $package['contents_cost'],
                        ) );
                    }
    
                    // Shipping class costs
                    $shipping_classes = WC()->shipping->get_shipping_classes();
                    if ( ! empty( $shipping_classes ) ) {
                        $found_shipping_classes = $this->find_shipping_classes( $package );
                        $highest_class_cost = 0;
                        $calculation_type = ! empty( $method['settings']['calculation_type'] ) ? $method['settings']['calculation_type'] : 'class';
    
                        foreach ( $found_shipping_classes as $shipping_class => $products_in_class ) {
                            $shipping_class_term = get_term_by( 'slug', $shipping_class, 'product_shipping_class' );
                            $class_cost_string = $shipping_class_term && $shipping_class_term->term_id
                                ? ( ! empty( $method['settings']['class_cost_' . $shipping_class_term->term_id] ) ? stripslashes_deep( $method['settings']['class_cost_' . $shipping_class_term->term_id] ) : '' )
                                : ( ! empty( $method['settings']['no_class_cost'] ) ? $method['settings']['no_class_cost'] : '' );
    
                            if ( '' === $class_cost_string ) {
                                continue;
                            }
    
                            $has_costs = true;
    
                            $class_cost = $this->evaluate_cost( $class_cost_string, array(
                                'qty'  => array_sum( wp_list_pluck( $products_in_class, 'quantity' ) ),
                                'cost' => array_sum( wp_list_pluck( $products_in_class, 'line_total' ) ),
                            ) );
    
                            if ( 'class' === $calculation_type ) {
                                $cost += $class_cost;
                            } else {
                                $highest_class_cost = max( $highest_class_cost, $class_cost );
                            }
                        }
    
                        if ( 'order' === $calculation_type && $highest_class_cost ) {
                            $cost += $highest_class_cost;
                        }
                    }
    
                } elseif ( 'free_shipping' == $method['id'] ) {
                    $is_available = self::free_shipping_is_available( $package, $method );
    
                    if ( $is_available ) {
                        $cost = '0';
                        $has_costs = true;
                    }
                } else { // local pickup or other methods
                    if ( isset( $method['settings']['cost'] ) && $method['settings']['cost'] != '' ) {
                        $has_costs = true;
                        $cost = $method['settings']['cost'];
                    }
                }
    
                if ( ! $has_costs ) {
                    continue;
                }
    
                $rates[] = array(
                    'id'          => $this->get_method_rate_id( $method ),
                    'label'       => $method['title'],
                    'cost'        => $cost,
                    'description' => ! empty( $method['settings']['description'] ) ? $method['settings']['description'] : '',
                    'taxes'       => $tax_rate,
                    'default'     => 'off'
                );
            }
        }
    
        // Apply filters
        $rates = apply_filters('mvx_get_rates_for_custom_shipping', $rates, $package);
    
        // Send rates to WooCommerce
        if ( is_array( $rates ) && count( $rates ) > 0 ) {
            foreach ( $rates as $rate ) {
                $this->add_rate( apply_filters( 'multivendorx_store_before_add_shipping_rates', $rate, $package ) );
            }
        }
    }
    

    /**
    * See if free shipping is available based on the package and cart.
    *
    * @param array $package Shipping package.
    *
    * @return bool
    */
    public static function free_shipping_is_available( $package, $method ) {
        if (isset( $method['settings']['requires'] ) && $method['settings']['requires'] == 'coupon') {
            $coupon_code = $package['applied_coupons'] ? reset($package['applied_coupons']) : '';
            $coupon = new WC_Coupon( $coupon_code );
            $is_free_shipping_enabled = $coupon->get_free_shipping();
            if ($is_free_shipping_enabled) {
                return true;
            }
        } else {
            $has_met_min_amount = false;
            $min_amount = ! empty( $method['settings']['min_amount'] ) ? $method['settings']['min_amount'] : 0;

            $line_subtotal      = wp_list_pluck( $package['contents'], 'line_subtotal', null );
            $line_total         = wp_list_pluck( $package['contents'], 'line_total', null );
            $discount_total     = array_sum( $line_subtotal ) - array_sum( $line_total );
            $line_subtotal_tax  = wp_list_pluck( $package['contents'], 'line_subtotal_tax', null );
            $line_total_tax     = wp_list_pluck( $package['contents'], 'line_tax', null );
            $discount_tax_total = array_sum( $line_subtotal_tax ) - array_sum( $line_total_tax );

            $total = array_sum( $line_subtotal ) + array_sum( $line_subtotal_tax );

            if ( WC()->cart->display_prices_including_tax() ) {
            $total = round( $total - ( $discount_total + $discount_tax_total ), wc_get_price_decimals() );
            } else {
            $total = round( $total - $discount_total, wc_get_price_decimals() );
            }

            if ( $total >= $min_amount ) {
            $has_met_min_amount = true;
            }
            return apply_filters( 'mvx_shipping_free_shipping_is_available', $has_met_min_amount, $package, $method );
        }
    }


    /**
    * Is available in specific zone locations
    *
    * @since 1.0.0
    *
    * @return void
    */
    public function is_available( $package ) {
        //Extract products from the package
        $products = isset( $package['contents'] ) ? $package['contents'] : [];
    
        if ( empty( $products ) ) {
            return false;
        }
    
        //Try to get the store ID from the first product in the package
        $store_id = '';
        foreach ( $products as $product ) {
            $product_id = isset( $product['product_id'] ) ? $product['product_id'] : 0;
            if ( $product_id ) {
                $store_id = get_post_meta( $product_id, 'multivendorx_store_id', true );
                if ( ! empty( $store_id ) ) {
                    break; // found one
                }
            }
        }
    
        //No store ID found → not available
        if ( empty( $store_id ) ) {
            return false;
        }
    
        //Extract destination info
        $destination = isset( $package['destination'] ) ? $package['destination'] : [];
        $destination_country  = isset( $destination['country'] )  ? $destination['country']  : '';
        $destination_state    = isset( $destination['state'] )    ? $destination['state']    : '';
        $destination_city     = isset( $destination['city'] )     ? $destination['city']     : '';
        $destination_postcode = isset( $destination['postcode'] ) ? trim( $destination['postcode'] ) : '';
    
        //Get matching shipping zone
        $zone = WC_Shipping_Zones::get_zone_matching_package( $package );
    
        //Get location restrictions for this store in this zone
        $locations = Util::get_locations( $zone->get_id(), (int) $store_id );
    
        //If no locations are set → available everywhere
        if ( empty( $locations ) ) {
            return true;
        }
    
        //Group locations by type
        $location_group = [];
        foreach ( $locations as $location ) {
            if ( isset( $location['type'] ) && isset( $location['code'] ) ) {
                $location_group[ $location['type'] ][] = $location;
            }
        }
    
        $is_available = false;
    
        //Country check
        if ( isset( $location_group['country'] ) ) {
            $country_array = wp_list_pluck( $location_group['country'], 'code' );
            if ( ! in_array( $destination_country, $country_array, true ) ) {
                return false;
            }
            $is_available = true;
        }
    
        //State check
        if ( isset( $location_group['state'] ) ) {
            $states = wp_list_pluck( $location_group['state'], 'code' );
            $state_array = array_map( [ $this, 'split_state_code' ], $states );
            if ( ! in_array( $destination_state, $state_array, true ) ) {
                return false;
            }
            $is_available = true;
        }
    
        //City check
        if ( isset( $location_group['city'] ) ) {
            $city_array = wp_list_pluck( $location_group['city'], 'code' );
            if ( ! in_array( $destination_city, $city_array, true ) ) {
                return false;
            }
            $is_available = true;
        }
    
        //Postcode check
        if ( isset( $location_group['postcode'] ) ) {
            $postcode_array = wp_list_pluck( $location_group['postcode'], 'code' );
            $postcode_array = array_map( 'trim', $postcode_array );
            if ( ! in_array( $destination_postcode, $postcode_array, true ) ) {
                return false;
            }
            $is_available = true;
        }
    
        return $is_available;
    }
    

    /**
    * Split state code from country:state string
    *
    * @param string $value [like: IN:WB]
    *
    * @return string [like: WB ]
    */
    public function split_state_code( $value ) {
        $state_code = explode( ':', $value );
        return $state_code[1];
    }

    /**
    * alter the default rate if one is chosen in settings.
    *
    * @access public
    *
    *  @param mixed $package
    *
    * @return bool
    */
    public function select_default_rate( $chosen_method, $_available_methods ) {
        //Select the 'Default' method from WooCommerce settings
        if( is_array($_available_methods) && array_key_exists( $this->default, $_available_methods ) ) {
            return $this->default;
        }

        return $chosen_method;
    }

    /**
    * Hide shipping rates when free shipping is available.
    * Updated to support WooCommerce 2.6 Shipping Zones.
    *
    * @access public
    *
    * @param array $rates Array of rates found for the package.
    *
    * @return array
    */
    public function hide_shipping_when_free_is_available( $rates ) {
        if( $this->hide_method !== 'yes' ) return $rates;

        // determine if free shipping is available
        $free_shipping = false;
        foreach ( $rates as $rate_id => $rate ) {
            if ( 'free_shipping' === $rate->method_id ) {
                $free_shipping = true;
                break;
            }
        }
        // if available, remove all options from this method
        if( $free_shipping ) {
            foreach ( $rates as $rate_id => $rate ) {
                if ( $this->id === $rate->method_id && strpos( $rate_id, $this->id . ':' . $this->instance_id . '-') !== false ) {
                    unset( $rates[ $rate_id ] );
                }
            }
        }

        return $rates;
    }

    /**
    * Hide shipping rates when one has option enabled.
    *
    * @access public
    *
    * @param array $rates Array of rates found for the package.
    *
    * @return array
    */
    public function hide_other_options( $rates ) {
        $hide_key = false;

        // return if no rates have been added
        if( ! isset( $rates ) || empty( $rates ) ) {
            return $rates;
        }

        // cycle through available rates
        foreach( $rates as $key => $rate ) {
            if( $rate['hide_ops'] === 'on' ) {
                $hide_key = $key;
            }
        }

        if( $hide_key ) {
            return array( $hide_key => $rates[ $hide_key ] );
        }

        return $rates;
    }

    /**
    * Get shipping method id
    *
    * @since 3.2.2
    *
    * @return void
    */
    public function get_method_rate_id( $method ) {
        return apply_filters( 'multivendorx_get_store_shipping_method_id', $method['id'] . ':' . $method['instance_id'] );
    }

    public function woocommerce_package_rates( $rates, $package ) {

        //Get products from the package
        $products = isset( $package['contents'] ) ? $package['contents'] : [];
    
        if ( empty( $products ) ) {
            return $rates;
        }
    
        //Try to extract the store ID from any product in the package
        $store_id = '';
        foreach ( $products as $product ) {
            if ( isset( $product['product_id'] ) ) {
                $id = $product['product_id'];
                $store_id = get_post_meta( $id, 'multivendorx_store_id', true );
                if ( ! empty( $store_id ) ) {
                    break;
                }
            }
        }
    
        //If no store found, keep all rates (don’t modify)
        if ( empty( $store_id ) ) {
            return $rates;
        }
    
        //Allow developers to disable filtering logic if needed
        if ( ! apply_filters( 'multivendorx_allow_supported_shipping_in_store_shipping_package', true, $package, $store_id ) && $rates ) {
    
            //Keep only MultiVendorX store shipping methods
            foreach ( $rates as $key => $shipping_rate ) {
                if ( $shipping_rate->method_id !== 'multivendorx_store_shipping' ) {
                    unset( $rates[ $key ] );
                }
            }
        }
    
        return $rates;
    }
}
