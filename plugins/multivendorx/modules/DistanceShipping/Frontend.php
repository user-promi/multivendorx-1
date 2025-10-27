<?php
namespace MultiVendorX\DistanceShipping;
use MultiVendorX\FrontendScripts;

defined('ABSPATH') || exit;

class Frontend {

    public function __construct() {
        add_filter('multivendorx_store_shipping_options', array($this, 'add_shipping_options'));

        // Checkout fields and map
        add_filter('woocommerce_checkout_fields', [$this, 'mvx_checkout_user_location_fields'], 50);
        add_action('woocommerce_after_checkout_billing_form', [$this, 'mvx_checkout_user_location_map'], 50);

        // Save session & order meta
        add_action('woocommerce_checkout_update_order_review', [$this, 'mvx_checkout_user_location_session_set'], 50);
        add_action('woocommerce_checkout_update_order_meta', [$this, 'mvx_checkout_user_location_save'], 50);

        // Load Google Maps JS
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
        $new_options = array(
            (object) array(
                'key' => 'shipping_by_distance',
                'label' => __('Shipping by Distance', 'multivendorx'),
                'value' => 'shipping_by_distance'
            )
        );
        
        // Merge with existing options without overwriting
        return array_merge($existing_options, $new_options);
    }
    public function mvx_checkout_user_location_fields($fields) {
        if ((true === WC()->cart->needs_shipping()) && apply_filters('mvx_is_allow_checkout_user_location', true)) {
    
            // Visible input for address
            $fields['billing']['mvx_user_location'] = [
                'label'       => __('Delivery Location', 'multivendorx'),
                'placeholder' => _x('Insert your address ..', 'placeholder', 'multivendorx'),
                'required'    => true,
                'class'       => ['form-row-wide'],
                'clear'       => true,
                'priority'    => 999,
                'value'       => WC()->session->get('_mvx_user_location'),
                'type'        => 'text',
                'name'        => 'mvx_user_location', // ✅ must have
            ];
    
            // Hidden fields for lat/lng
            $fields['billing']['mvx_user_location_lat'] = [
                'required' => false,
                'class'    => ['input-hidden'],
                'value'    => WC()->session->get('_mvx_user_location_lat'),
                'type'     => 'hidden',
                'name'     => 'mvx_user_location_lat', // ✅ must have
            ];
            $fields['billing']['mvx_user_location_lng'] = [
                'required' => false,
                'class'    => ['input-hidden'],
                'value'    => WC()->session->get('_mvx_user_location_lng'),
                'type'     => 'hidden',
                'name'     => 'mvx_user_location_lng', // ✅ must have
            ];
        }
    
        return $fields;
    }
    

    public function mvx_checkout_user_location_map($checkout) {
        if ((true === WC()->cart->needs_shipping()) && apply_filters('mvx_is_allow_checkout_user_location', true)) {
            echo '<div class="woocommerce-billing-fields__field-wrapper">';
            echo '<div id="mvx-user-locaton-map" style="width:100%;height:300px;margin-bottom:20px;"></div>';
            echo '</div>';
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
        $google_maps_api_key = MultiVendorX()->setting->get_setting('google_api_key', '');
        if (!empty($google_maps_api_key)) {
            wp_enqueue_script('google-maps', 'https://maps.googleapis.com/maps/api/js?key=' . $google_maps_api_key . '&libraries=places', ['jquery'], null, true);
        }

        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script('multivendorx-distance-shipping-frontend-script');
        FrontendScripts::localize_scripts('multivendorx-distance-shipping-frontend-script');
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
}
