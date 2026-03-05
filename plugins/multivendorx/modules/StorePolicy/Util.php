<?php
/**
 * Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StorePolicy;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

/**
 * MultiVendorX Store Policy Util class
 *
 * @class       Util class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Util {

    /**
     * Get store policies with optional product-level overrides.
     *
     * @param int $store_id
     * @param int $product_id
     * @return array
     */
    public static function get_store_policies( $store_id = 0, $product_id = 0 ) {

        $policies = array();

        // Global defaults
        $values = array(
            'store_policy'        => MultiVendorX()->setting->get_setting( 'store_policy', '' ),
            'shipping_policy'     => MultiVendorX()->setting->get_setting( 'shipping_policy', '' ),
            'refund_policy'       => MultiVendorX()->setting->get_setting( 'refund_policy', '' ),
            'cancellation_policy' => MultiVendorX()->setting->get_setting( 'cancellation_policy', '' ),
        );

        /**
         * Product override
         */
        if ( $product_id ) {

            $product_meta = array(
                'shipping_policy'     => Utill::POST_META_SETTINGS['shipping_policy'],
                'refund_policy'       => Utill::POST_META_SETTINGS['refund_policy'],
                'cancellation_policy' => Utill::POST_META_SETTINGS['cancellation_policy'],
            );

            foreach ( $product_meta as $key => $meta_key ) {

                $override = get_post_meta( $product_id, $meta_key, true );

                if ( ! empty( $override ) ) {
                    $values[ $key ] = $override;
                }
            }

            if ( ! $store_id ) {
                $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
            }
        }

        /**
         * Store override
         */
        $allowed = array();

        if ( $store_id ) {

            $store   = new Store( $store_id );
            $allowed = MultiVendorX()->setting->get_setting( 'store_policy_override', array() );

            $store_meta = array(
                'store_policy'        => Utill::STORE_SETTINGS_KEYS['store_policy'],
                'shipping_policy'     => Utill::STORE_SETTINGS_KEYS['shipping_policy'],
                'refund_policy'       => Utill::STORE_SETTINGS_KEYS['refund_policy'],
                'cancellation_policy' => Utill::STORE_SETTINGS_KEYS['cancellation_policy'],
            );

            foreach ( $store_meta as $key => $meta_key ) {

                $type = str_replace( '_policy', '', $key );

                if ( ! in_array( $type, $allowed, true ) ) {
                    continue;
                }

                $override = $store->get_meta( $meta_key );

                if ( ! empty( $override ) ) {
                    $values[ $key ] = $override;
                }
            }
        }

        /**
         * Normalize response
         */

        foreach ( $values as $key => $value ) {

            $type = str_replace( '_policy', '', $key );

            if ( $store_id && ! in_array( $type, $allowed, true ) ) {
                continue;
            }

            if ( ! empty( $value ) ) {
                $policies[ $key ] = $value;
            }
        }

        return $policies;
    }
}
