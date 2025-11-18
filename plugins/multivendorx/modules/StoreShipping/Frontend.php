<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;
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

        //Checkout fields and map
        add_filter('woocommerce_checkout_fields', [$this, 'mvx_checkout_user_location_fields'], 50);
        add_action('woocommerce_after_checkout_billing_form', [$this, 'mvx_checkout_user_location_map'], 50);

        // // Save session & order meta
        add_action('woocommerce_checkout_update_order_review', [$this, 'mvx_checkout_user_location_session_set'], 50);
        add_action('woocommerce_checkout_update_order_meta', [$this, 'mvx_checkout_user_location_save'], 50);

        // // Load Google Maps JS
        add_action('wp_enqueue_scripts', [$this, 'load_scripts']);
        add_filter('woocommerce_cart_shipping_packages', [$this, 'add_user_location_to_shipping_package']);

    }

    /**
     * Add shipping options without changing existing ones
     *
     * @param array $existing_options
     * @return array
     */
    public function add_shipping_options($existing_options) {

        // Get all shipping module settings
        $settings = MultiVendorX()->setting->get_setting('shipping_modules');

        // Check if country-wise shipping is enabled
        $country_shipping_enabled = isset($settings['country-wise-shipping']['enable']) 
            ? $settings['country-wise-shipping']['enable'] 
            : false;
    
        // Only add if country-wise shipping is enabled
        if ($country_shipping_enabled) {
            $new_options = array(
                (object) array(
                    'key'   => 'shipping_by_country',
                    'label' => __('Shipping by Country', 'multivendorx'),
                    'value' => 'shipping_by_country'
                )
            );
    
            // Merge with existing options without overwriting
            $existing_options = array_merge($existing_options, $new_options);
        }

        $distance_based_shipping = isset($settings['distance-based-shipping']['enable']) 
        ? $settings['distance-based-shipping']['enable'] 
        : false;

        // Only add if country-wise shipping is enabled
        if ($distance_based_shipping) {
            $new_options = array(
                (object) array(
                    'key' => 'shipping_by_distance',
                    'label' => __('Shipping by Distance', 'multivendorx'),
                    'value' => 'shipping_by_distance'
                )
            );
    
            // Merge with existing options without overwriting
            $existing_options = array_merge($existing_options, $new_options);
        }

        $zone_wise_shipping = isset($settings['zone-wise-shipping']['enable']) 
        ? $settings['zone-wise-shipping']['enable'] 
        : false;

        // Only add if country-wise shipping is enabled
        if ($zone_wise_shipping) {
            $new_options = array(
                (object) array(
                    'key' => 'shipping_by_zone',
                    'label' => __('Shipping by Zone', 'multivendorx'),
                    'value' => 'shipping_by_zone'
                )
            );
    
            // Merge with existing options without overwriting
            $existing_options = array_merge($existing_options, $new_options);
        }

        // Return existing options if module not enabled
        return $existing_options;
    }

    public function mvx_checkout_user_location_fields($fields) {

        // show ONLY when distance-based shipping is used
        if (
            WC()->cart->needs_shipping() 
            && apply_filters('mvx_is_allow_checkout_user_location', true)
            && $this->cart_has_distance_shipping()
        ) {
    
            $fields['billing']['mvx_user_location'] = [
                'label'       => __('Delivery Location', 'multivendorx'),
                'placeholder' => _x('Insert your address ..', 'placeholder', 'multivendorx'),
                'required'    => true,
                'class'       => ['form-row-wide'],
                'clear'       => true,
                'priority'    => 999,
                'value'       => WC()->session->get('_mvx_user_location'),
                'type'        => 'text',
                'name'        => 'mvx_user_location',
            ];
    
            $fields['billing']['mvx_user_location_lat'] = [
                'required' => false,
                'class'    => ['input-hidden'],
                'value'    => WC()->session->get('_mvx_user_location_lat'),
                'type'     => 'hidden',
                'name'     => 'mvx_user_location_lat',
            ];
    
            $fields['billing']['mvx_user_location_lng'] = [
                'required' => false,
                'class'    => ['input-hidden'],
                'value'    => WC()->session->get('_mvx_user_location_lng'),
                'type'     => 'hidden',
                'name'     => 'mvx_user_location_lng',
            ];
        }
    
        return $fields;
    }
    
    

    public function mvx_checkout_user_location_map($checkout) {
        if ((true === WC()->cart->needs_shipping()) && apply_filters('mvx_is_allow_checkout_user_location', true)) {
            echo '<div class="woocommerce-billing-fields__field-wrapper">';
            echo '<div id="mvx-user-locaton-map" style="width:100%; height:18.75rem; margin-bottom:1.25rem;"></div>';
            echo '</div>';
            ?>
            <style>
                /*Ensure map always visible even if inline CSS fails */
                #mvx-user-locaton-map {
                    width: 100%;
                    min-height: 300px;
                    margin-bottom: 20px;
                }
            </style>
            <?php
        }
    }
    

    public function mvx_checkout_user_location_session_set($post_data_raw) {
        parse_str($post_data_raw, $post_data);
        if (!empty($post_data['mvx_user_location'])) {
            WC()->session->set('_mvx_user_location', sanitize_text_field($post_data['mvx_user_location']));
        }
        if (!empty($post_data['mvx_user_location_lat'])) {
            WC()->session->set('_mvx_user_location_lat', sanitize_text_field($post_data['mvx_user_location_lat']));
        }
        if (!empty($post_data['mvx_user_location_lng'])) {
            WC()->session->set('_mvx_user_location_lng', sanitize_text_field($post_data['mvx_user_location_lng']));
        }
    }

    public function mvx_checkout_user_location_save($order_id) {
        $order = wc_get_order($order_id);
        if (!empty($_POST['mvx_user_location'])) {
            $order->update_meta_data('_mvx_user_location', sanitize_text_field($_POST['mvx_user_location']));
        }
        if (!empty($_POST['mvx_user_location_lat'])) {
            $order->update_meta_data('_mvx_user_location_lat', sanitize_text_field($_POST['mvx_user_location_lat']));
        }
        if (!empty($_POST['mvx_user_location_lng'])) {
            $order->update_meta_data('_mvx_user_location_lng', sanitize_text_field($_POST['mvx_user_location_lng']));
        }
        $order->save();
    }

    public function load_scripts() {
        // Check if distance-based shipping module is enabled
        $settings = MultiVendorX()->setting->get_setting('shipping_modules', []);
        $distance_enabled = $settings['distance-based-shipping']['enable'] ?? false;
    
        // Load map ONLY when distance module enabled AND cart contains distance shipping store
        if ( $distance_enabled && $this->cart_has_distance_shipping() ) {
    
            $google_maps_api_key = MultiVendorX()->setting->get_setting('google_api_key', '');
            if (!empty($google_maps_api_key)) {
                wp_enqueue_script(
                    'google-maps',
                    'https://maps.googleapis.com/maps/api/js?key=' . $google_maps_api_key . '&libraries=places',
                    array('jquery'),
                    null,
                    true
                );
            }
    
            // Load addon frontend scripts
            FrontendScripts::load_scripts();
            FrontendScripts::enqueue_script('multivendorx-store-shipping-frontend-script');
            FrontendScripts::localize_scripts('multivendorx-store-shipping-frontend-script');
        }
    }
    
    /**
     * Inject user location into shipping packages
     */
    public function add_user_location_to_shipping_package($packages) {
        foreach ($packages as $i => $package) {
            $packages[$i]['mvx_user_location']     = WC()->session->get('_mvx_user_location');
            $packages[$i]['mvx_user_location_lat'] = WC()->session->get('_mvx_user_location_lat');
            $packages[$i]['mvx_user_location_lng'] = WC()->session->get('_mvx_user_location_lng');
        }
        return $packages;
    }

    /**
     * Check if any product in cart belongs to a vendor using distance-based shipping.
     */
    public function cart_has_distance_shipping() {
        if ( empty(WC()->cart) ) return false;

        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $product_id = $cart_item['product_id'];
            $store_id   = get_post_meta($product_id, 'multivendorx_store_id', true);

            if ( $store_id ) {
                $store = new \MultiVendorX\Store\Store($store_id);
                $shipping_type = $store->meta_data['shipping_options'] ?? '';

                if ( $shipping_type === 'shipping_by_distance' ) {
                    return true;
                }
            }
        }
        return false;
    }

}