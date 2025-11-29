<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SPMV;

use MultiVendorX\Utill;

/**
 * MultiVendorX SPMV Util class
 *
 * @class       Util class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Util {

    public static function fetch_products_map( $map_id ) {
        global $wpdb;

        $table   = "{$wpdb->prefix}" . Utill::TABLES['products_map'];
        $results = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE product_map_id=%d", $map_id ) );
        return $results;
    }

    public static function mvx_spmv_products_map( $data = array(), $action = 'insert' ) {
        global $wpdb;
        if ( $data ) {
            $table = "{$wpdb->prefix}" . Utill::TABLES['products_map'];
            if ( $action == 'insert' ) {
                $wpdb->insert( $table, $data );
                if ( ! isset( $data['product_map_id'] ) ) {
                    $inserted_id = $wpdb->insert_id;
                    $wpdb->update( esc_sql( $table ), array( 'product_map_id' => $inserted_id ), array( 'product_id' => $data['product_id'] ) );
                    return $inserted_id;
                } else {
                    return $data['product_map_id'];
                }
            } else {
                do_action( 'mvx_spmv_products_map_do_action', $action, $data );
                return false;
            }
        }
        return false;
    }
}
