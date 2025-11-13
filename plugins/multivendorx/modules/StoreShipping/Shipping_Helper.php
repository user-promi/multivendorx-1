<?php
namespace MultiVendorX\StoreShipping;

defined('ABSPATH') || exit;

class Shipping_Helper {

    /**
     * Split WooCommerce cart into packages per store/vendor.
     */
    public static function split_cart_by_store($packages) {
        $new_packages = [];
        foreach (WC()->cart->get_cart() as $item_key => $item) {
            $product_id = $item['product_id'];
            $store_id   = get_post_meta($product_id, 'multivendorx_store_id', true);
            if (!$store_id) continue;

            if (!isset($new_packages[$store_id])) {
                $new_packages[$store_id] = [
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

            $new_packages[$store_id]['contents'][$item_key] = $item;
            $new_packages[$store_id]['contents_cost'] += $item['line_total'];
        }

        return array_values($new_packages);
    }
}
