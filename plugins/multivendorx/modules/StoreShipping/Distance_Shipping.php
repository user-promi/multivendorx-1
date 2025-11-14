<?php

namespace MultiVendorX\StoreShipping;

defined('ABSPATH') || exit;

class Distance_Shipping extends \WC_Shipping_Method {

    /**
     * Constructor for the shipping class
     */
    public function __construct() {
        $this->id                 = 'multivendorx_distance_shipping';
        $this->method_title       = __( 'Multivendorx Shipping by Distance', 'multivendorx' );
        $this->method_description = __( 'Enable vendors to set marketplace shipping by distance range', 'multivendorx' );

        $shipping_modules = MultiVendorX()->setting->get_setting('shipping_modules', []);
        $distance_based_shipping = $shipping_modules['distance-based-shipping'] ?? [];

        $this->enabled = (!empty($distance_based_shipping['enable']) && $distance_based_shipping['enable']) ? 'yes' : 'no';

        $this->title      = $this->get_option( 'title' );
        $taxable_shipping = MultiVendorX()->setting->get_setting('taxable', []);

        $this->tax_status = (!empty($taxable_shipping) && in_array('taxable', $taxable_shipping))? 'taxable': 'none';

        if ( ! $this->title ) {
            $this->title = __( 'Shipping Cost', 'multivendorx' );
        }

        $this->init();
    }

    /**
     * Initialize settings
     */
    public function init() {
        // $this->init_form_fields();
        // $this->init_settings();

        add_filter( 'woocommerce_cart_shipping_packages', ['MultiVendorX\StoreShipping\Shipping_Helper', 'split_cart_by_store'] );

        // add_filter( 'woocommerce_cart_shipping_packages', [ $this, 'multivendorx_split_cart_by_store' ] );
        add_action( 'woocommerce_cart_calculate_fees', [ $this, 'multivendorx_force_shipping_recalculation' ], 20, 1 );
        add_action( 'woocommerce_update_options_shipping_' . $this->id, [ $this, 'process_admin_options' ] );
    }

    /**
     * Force WooCommerce to recalculate shipping
     */
    public function multivendorx_force_shipping_recalculation() {
        WC()->cart->calculate_shipping();
    }

    /**
     * Split cart items by store
     */
    public function multivendorx_split_cart_by_store( $packages ) {
        $new_packages = [];

        foreach ( WC()->cart->get_cart() as $item_key => $item ) {
            $product_id = $item['product_id'];
            $store_id   = get_post_meta( $product_id, 'multivendorx_store_id', true );

            if ( ! $store_id ) continue;

            if ( ! isset( $new_packages[ $store_id ] ) ) {
                $new_packages[ $store_id ] = [
                    'contents'        => [],
                    'contents_cost'   => 0,
                    'applied_coupons' => WC()->cart->get_applied_coupons(),
                    'destination'     => [
                        'country'   => WC()->customer->get_shipping_country(),
                        'state'     => WC()->customer->get_shipping_state(),
                        'postcode'  => WC()->customer->get_shipping_postcode(),
                        'city'      => WC()->customer->get_shipping_city(),
                        'address'   => WC()->customer->get_shipping_address(),
                        'address_2' => WC()->customer->get_shipping_address_2(),
                    ],
                ];
            }

            $new_packages[ $store_id ]['contents'][ $item_key ] = $item;
            $new_packages[ $store_id ]['contents_cost'] += $item['line_total'];
        }

        return array_values( $new_packages );
    }

    /**
     * Check if shipping is enabled
     */
    public function is_method_enabled() {
        return $this->enabled == 'yes';
    }

    /**
     * Initialize admin form fields
     */
    public function init_form_fields() {
        $this->form_fields = [
            'enabled' => [
                'title'   => __( 'Enable/Disable', 'multivendorx' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable Shipping', 'multivendorx' ),
                // 'default' => 'yes',
            ],
            'title' => [
                'title'       => __( 'Method Title', 'multivendorx' ),
                'type'        => 'text',
                'description' => __( 'This controls the title which the user sees during checkout.', 'multivendorx' ),
                'default'     => __( 'Regular Shipping', 'multivendorx' ),
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

    /**
     * Calculate shipping for each store
     */
    public function calculate_shipping( $package = [] ) {
        if ( empty( $package['contents'] ) ) return;
        $products = $package['contents'];
        $mvx_user_location_lat = $package['mvx_user_location_lat'] ?? '';
        $mvx_user_location_lng = $package['mvx_user_location_lng'] ?? '';

        if ( ! $mvx_user_location_lat || ! $mvx_user_location_lng ) return;

        $seller_products = [];

        foreach ( $products as $product ) {
            $store_id = get_post_meta( $product['product_id'], 'multivendorx_store_id', true );
            if ( ! empty( $store_id ) && self::is_shipping_enabled_for_seller( $store_id ) ) {
                $seller_products[ (int) $store_id ][] = $product;
            }
        }

        if ( empty( $seller_products ) ) return;

        foreach ( $seller_products as $store_id => $products ) {
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

            $distance = self::mvx_get_latlng_distance( $mvx_user_location_lat, $mvx_user_location_lng, $store_lat, $store_lng, 'k' );
            if ( ! $distance ) continue;

            if ( $max_distance && $distance > $max_distance ) {
                wc_add_notice( __( 'Some cart item(s) are not deliverable to your location.', 'multivendorx' ), 'error' );
                continue;
            }

            $store_amount = $this->calculate_per_seller( $products, $distance, $default_cost, $distance_rules, $free_shipping_amount, true );

            $tax_rate = ( $this->tax_status == 'none' ) ? false : '';
            $tax_rate = apply_filters( 'multivendorx_is_apply_tax_on_shipping_rates', $tax_rate );

            $rate = [
                'id'    => $this->id . ':' . $store_id,
                'label' => $this->title,
                'cost'  => $store_amount,
                'taxes' => $tax_rate,
            ];
            $this->add_rate( $rate );

            $this->maybe_add_local_pickup_rate( $store_id, $local_pickup_cost, $tax_rate );
        }
    }

    /**
     * Add local pickup rate
     */
    public function maybe_add_local_pickup_rate( $store_id, $local_pickup_cost = 0, $tax_rate = false ) {
        if ( ! $local_pickup_cost ) return;

        $rate = [
            'id'    => 'local_pickup:' . $store_id,
            'label' => __( 'Pickup from Store', 'multivendorx' ),
            'cost'  => $local_pickup_cost,
            'taxes' => $tax_rate,
        ];

        $this->add_rate( $rate );
    }

    /**
     * Check if shipping is enabled for a seller
     */
    public static function is_shipping_enabled_for_seller( $store_id ) {
        $store = new \MultiVendorX\Store\Store( $store_id );
        $shipping_options = $store->meta_data['shipping_options'] ?? '';
        return $shipping_options === 'shipping_by_distance';
    }

    /**
     * Distance calculation (Haversine formula)
     */
    public static function mvx_get_latlng_distance( $lat1, $lon1, $lat2, $lon2, $unit = 'M' ) {
        $theta = $lon1 - $lon2;
        $dist = sin( deg2rad( $lat1 ) ) * sin( deg2rad( $lat2 ) ) + cos( deg2rad( $lat1 ) ) * cos( deg2rad( $lat2 ) ) * cos( deg2rad( $theta ) );
        $dist = acos( $dist );
        $dist = rad2deg( $dist );
        $miles = $dist * 60 * 1.1515;
        $unit = strtoupper( $unit );

        if ( $unit == "K" ) {
            return ( $miles * 1.609344 );
        } elseif ( $unit == "N" ) {
            return ( $miles * 0.8684 );
        } else {
            do_action( 'multivendorx_get_latlng_distance', $lat1, $lon1, $lat2, $lon2, $unit, $dist );
            return $miles;
        }
    }

    /**
     * Shipping cost calculation logic (unchanged)
     */
    public function calculate_per_seller( $products = [], $total_distance = 0, $default_cost = 0, $distance_rules = [], $free_shipping_amount = 0, $is_consider_free_threshold = false ) {
        $amount = floatval( $default_cost );

        $products_total_cost = 0;
        foreach ( $products as $product ) {
            $line_subtotal      = (float) $product['line_subtotal'];
            $line_total         = (float) $product['line_total'];
            $discount_total     = $line_subtotal - $line_total;
            $line_subtotal_tax  = (float) $product['line_subtotal_tax'];
            $line_total_tax     = (float) $product['line_tax'];
            $discount_tax_total = $line_subtotal_tax - $line_total_tax;

            $total = apply_filters( 'multivendorx_free_shipping_threshold_consider_tax', true ) ? $line_subtotal + $line_subtotal_tax : $line_subtotal;

            $products_total_cost += WC()->cart->display_prices_including_tax()
                ? round( $total - ( $discount_total + $discount_tax_total ), wc_get_price_decimals() )
                : round( $total - $discount_total, wc_get_price_decimals() );
        }

        if ( $is_consider_free_threshold && $free_shipping_amount > 0 && $products_total_cost >= $free_shipping_amount ) {
            return apply_filters( 'multivendorx_shipping_distance_calculate_amount', 0, $products, $total_distance, $default_cost, $distance_rules );
        }

        if ( ! empty( $distance_rules ) ) {
            foreach ( $distance_rules as $rule ) {
                $max_distance = floatval( $rule['max_distance'] ?? 0 );
                $cost         = floatval( $rule['cost'] ?? 0 );

                if ( $total_distance <= $max_distance ) {
                    $amount = $cost;
                    break;
                }
            }
        }

        return apply_filters( 'multivendorx_shipping_distance_calculate_amount', $amount, $products, $total_distance, $default_cost, $distance_rules );
    }
}