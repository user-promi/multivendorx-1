<?php
namespace MultiVendorX\StoreShipping;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

class Shipping_Helper {

    /**
     * Split WooCommerce cart into packages per store/vendor.
     */
    public static function split_cart_by_store( $packages ) {
        $new_packages = array();

        // Get user location from session
        $user_lat = WC()->session->get( '_mvx_user_location_lat' ) ?: '';
        $user_lng = WC()->session->get( '_mvx_user_location_lng' ) ?: '';

        foreach ( WC()->cart->get_cart() as $item_key => $item ) {
            $product_id = $item['product_id'];
            $store_id   = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
            if ( ! $store_id ) {
				continue;
            }

            if ( ! isset( $new_packages[ $store_id ] ) ) {
                $new_packages[ $store_id ] = array(
                    'contents'              => array(),
                    'contents_cost'         => 0,
                    'applied_coupons'       => WC()->cart->get_applied_coupons(),
                    'store_id'              => $store_id, // store ID
                    'destination'           => array(
                        'country'   => WC()->customer->get_shipping_country(),
                        'state'     => WC()->customer->get_shipping_state(),
                        'postcode'  => WC()->customer->get_shipping_postcode(),
                        'city'      => WC()->customer->get_shipping_city(),
                        'address'   => WC()->customer->get_shipping_address(),
                        'address_2' => WC()->customer->get_shipping_address_2(),
                    ),
                    'mvx_user_location_lat' => $user_lat,
                    'mvx_user_location_lng' => $user_lng,
                );
            }

            $new_packages[ $store_id ]['contents'][ $item_key ] = $item;
            $new_packages[ $store_id ]['contents_cost']        += $item['line_total'];
        }
        return array_values( $new_packages );
    }
}
