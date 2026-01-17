<?php
namespace MultiVendorX;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

class Coupon {

    public function __construct() {

        // Cart-level validity
        add_filter(
            'woocommerce_coupon_is_valid',
            array( $this, 'validate_store_coupon' ),
            10,
            2
        );

        // REMOVE non-store products from coupon scope (KEY FIX)
        add_filter(
            'woocommerce_coupon_get_discountable_items',
            array( $this, 'filter_discountable_items_by_store' ),
            10,
            2
        );

        // Custom error
        add_filter(
            'woocommerce_coupon_error',
            array( $this, 'store_coupon_error_message' ),
            10,
            3
        );
    }

    /**
     * Coupon is valid only if at least one product
     * from the same store exists in cart.
     */
    public function validate_store_coupon( $valid, $coupon ) {

        $coupon_store_id = get_post_meta(
            $coupon->get_id(),
            Utill::POST_META_SETTINGS['store_id'],
            true
        );

        // Admin coupon
        if ( empty( $coupon_store_id ) ) {
            return $valid;
        }

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_store_id = get_post_meta(
                $item['product_id'],
                Utill::POST_META_SETTINGS['store_id'],
                true
            );

            if ( (int) $product_store_id === (int) $coupon_store_id ) {
                return true;
            }
        }

        return false;
    }

    /**
     * CRITICAL:
     * Remove non-store products from coupon calculation scope
     */
    public function filter_discountable_items_by_store( $items, $coupon ) {

        $coupon_store_id = get_post_meta(
            $coupon->get_id(),
            Utill::POST_META_SETTINGS['store_id'],
            true
        );

        // Admin coupon → do not filter
        if ( empty( $coupon_store_id ) ) {
            return $items;
        }

        foreach ( $items as $cart_item_key => $item ) {

            $product_store_id = get_post_meta(
                $item['product_id'],
                Utill::POST_META_SETTINGS['store_id'],
                true
            );

            if ( (int) $product_store_id !== (int) $coupon_store_id ) {
                unset( $items[ $cart_item_key ] );
            }
        }

        return $items;
    }

    /**
     * Custom error message
     */
    public function store_coupon_error_message( $message, $error_code, $coupon ) {

        if ( $error_code === \WC_Coupon::E_WC_COUPON_NOT_APPLICABLE ) {
            return __(
                'This coupon is only applicable to products from the same store.',
                'multivendorx'
            );
        }

        return $message;
    }
}
