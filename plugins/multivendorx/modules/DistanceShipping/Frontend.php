<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\DistanceShipping;
use MultiVendorX\FrontendScripts;

/**
 * MultiVendorX Store Review Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter('multivendorx_store_shipping_options', array($this, 'add_shipping_options'));
        add_filter( 'woocommerce_checkout_fields', array( $this, 'mvx_checkout_user_location_fields' ), 50 );
        add_action( 'woocommerce_after_checkout_billing_form', array( $this, 'mvx_checkout_user_location_map' ), 50 );
        add_action( 'woocommerce_checkout_update_order_review', array( $this, 'mvx_checkout_user_location_session_set' ), 50 );
        add_action( 'woocommerce_checkout_update_order_meta', array( $this, 'mvx_checkout_user_location_save' ), 50 );

        // Load scripts
        add_action('wp_enqueue_scripts', array($this, 'load_scripts'));
    }

    /**
     * Load follow store JS scripts
     */
    public function load_scripts() {
        
        if ( $this->mvx_mapbox_api_enabled() ) {
            // Mapbox scripts
            wp_enqueue_script('mapbox-gl', 'https://api.mapbox.com/mapbox-gl-js/v2.17.0/mapbox-gl.js', array(), null, true);
            wp_enqueue_script('mapbox-geocoder', 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.min.js', array('mapbox-gl'), null, true);
            wp_enqueue_style('mapbox-gl-css', 'https://api.mapbox.com/mapbox-gl-js/v2.17.0/mapbox-gl.css');
            wp_enqueue_style('mapbox-geocoder-css', 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.css');
        } else {
            // Google Maps scripts
            $google_maps_api_key = MultiVendorX()->setting->get_setting('google_maps_api_key', '');
            if ( !empty($google_maps_api_key) ) {
                wp_enqueue_script('google-maps', 'https://maps.googleapis.com/maps/api/js?key=' . $google_maps_api_key . '&libraries=places', array(), null, true);
            }
        }
        
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script('multivendorx-distance-shipping-frontend-script');
        FrontendScripts::localize_scripts('multivendorx-distance-shipping-frontend-script');
    }

    /**
     * Add shipping options without changing existing ones
     *
     * @param array $existing_options
     * @return array
     */
    public function add_shipping_options($existing_options) {
        $new_options = array(
            (object) array(
                'key' => 'distance_by_shipping',
                'label' => __('Shipping by Distance', 'multivendorx'),
                'value' => 'distance_by_shipping'
            )
        );
        
        // Merge with existing options without overwriting
        return array_merge($existing_options, $new_options);
    }
    /**
     * Checkout User Location Field
     */
    public function mvx_checkout_user_location_fields( $fields ) {
        if( ! WC()->is_rest_api_request() ) {
            if( ( true === WC()->cart->needs_shipping() ) && apply_filters( 'mvx_is_allow_checkout_user_location', true ) ) {
                $user_location_filed = $this->mvx_mapbox_api_enabled() ? array('input-hidden') : array('form-row-wide');
                $fields['billing']['mvx_user_location'] = array(
                        'label'     => __( 'Delivery Location', 'multivendorx' ),
                        'placeholder'   => _x( 'Insert your address ..', 'placeholder', 'multivendorx' ),
                        'required'  => true,
                        'class'     => $user_location_filed,
                        'clear'     => true,
                        'priority'  => 999,
                        'value'     => WC()->session->get( '_mvx_user_location' )
                 );
                $fields['billing']['mvx_user_location_lat'] = array(
                        'required'  => false,
                        'class'     => array('input-hidden'),
                        'value'     => WC()->session->get( '_mvx_user_location_lat' )
                 );
                $fields['billing']['mvx_user_location_lng'] = array(
                        'required'  => false,
                        'class'     => array('input-hidden'),
                        'value'     => WC()->session->get( '_mvx_user_location_lng' )
                 );
            }
        }

     return $fields;
    }

    /**
     * Checkout User Location Map
     */
    public function mvx_checkout_user_location_map( $checkout ) {
        if( ( true === WC()->cart->needs_shipping() ) && apply_filters( 'mvx_is_allow_checkout_user_location', true )) {
            ?>
            <div class="woocommerce-billing-fields__field-wrapper">
                <div class="mvx-user-locaton-map" id="mvx-user-locaton-map" style="width: 100%; height: 300px;"></div>
            </div>
            <?php
        }
    }

    /**
     * Checkout User Location Field Save in Session
     */
    public function mvx_checkout_user_location_session_set( $post_data_raw ) {
        if( apply_filters( 'mvx_is_allow_checkout_user_location', true ) && mvx_is_module_active('distance-shipping') ) {
            parse_str( $post_data_raw, $post_data );
            if ( ! empty( $post_data['mvx_user_location'] ) ) {
                WC()->customer->set_props( array( 'mvx_user_location' => sanitize_text_field( $post_data['mvx_user_location'] ) ) );
                WC()->session->set( '_mvx_user_location', sanitize_text_field( $post_data['mvx_user_location'] ) );
            }
            if ( ! empty( $post_data['mvx_user_location_lat'] ) ) {
                WC()->session->set( '_mvx_user_location_lat', sanitize_text_field( $post_data['mvx_user_location_lat'] ) );
            }
            if ( ! empty( $post_data['mvx_user_location_lng'] ) ) {
                WC()->session->set( '_mvx_user_location_lng', sanitize_text_field( $post_data['mvx_user_location_lng'] ) );
            }
        }
    }
    /**
     * Checkout User Location Field Save
     */
    public function mvx_checkout_user_location_save( $order_id ) {
        if( apply_filters( 'mvx_is_allow_checkout_user_location', true ) && mvx_is_module_active('distance-shipping') ) {
            $order = wc_get_order($order_id);
            if ( ! empty( $_POST['mvx_user_location'] ) ) {
                $order->update_meta_data('_mvx_user_location', sanitize_text_field( $_POST['mvx_user_location'] ) );
            }
            if ( ! empty( $_POST['mvx_user_location_lat'] ) ) {
                $order->update_meta_data('_mvx_user_location_lat', sanitize_text_field( $_POST['mvx_user_location_lat'] ) );
            }
            if ( ! empty( $_POST['mvx_user_location_lng'] ) ) {
                $order->update_meta_data('_mvx_user_location_lng', sanitize_text_field( $_POST['mvx_user_location_lng'] ) );
            }
            $order->save();
        }
    }

    public function mvx_mapbox_api_enabled() {
        if ( MultiVendorX()->modules->is_active('geo-location') ) {
    
            $get_choose_map = MultiVendorX()->setting->get_setting('choose_map_api', '' ); // default as empty string
            $mapbox_api_key = MultiVendorX()->setting->get_setting('mapbox_api_key', '' ); // default as empty string
    

            // Check properly
            if ( !empty($mapbox_api_key) && $get_choose_map === 'mapbox_api_set' ) {
                return true;
            }
        }
        return false;
    }
    
    
}