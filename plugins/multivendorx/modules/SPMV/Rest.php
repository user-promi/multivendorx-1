<?php
/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SPMV;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API SPMV controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rest {
    public function __construct() {
        add_action('woocommerce_rest_insert_product_object', array( $this, 'add_additional_data_in_product' ), 10, 3);
    }

    
    public function add_additional_data_in_product($product, $request, $creating) {
        if (!$creating) return;

        global $wpdb;

        $original_id = isset($request['original_id']) ? intval($request['original_id']) : 0;
        $duplicate_id = $product->get_id();

        if ( ! $original_id ) {
            return;
        }

        $table = $wpdb->prefix . Utill::TABLES['products_map'];

        $existing_map_id = get_post_meta($original_id, 'multivendorx_spmv_id', true);

        if ( empty($existing_map_id) ) {
            $map_data = json_encode([
                $original_id,
                $duplicate_id
            ]);

            // Insert row
            $wpdb->insert(
                $table,
                [
                    'product_map' => $map_data,
                ],
                [ '%s' ]
            );

            $insert_id = $wpdb->insert_id;

            if ( $insert_id ) {
                // Save insert id into duplicate product meta
                update_post_meta( $duplicate_id, 'multivendorx_spmv_id', $insert_id );
                update_post_meta( $original_id, 'multivendorx_spmv_id', $insert_id );
            }
        } else {
            // Fetch existing row
            $row = $wpdb->get_row(
                $wpdb->prepare("SELECT * FROM `$table` WHERE ID = %d", $existing_map_id)
            );

            if ( $row ) {
                $map_array = json_decode($row->product_map, true);

                if ( ! is_array($map_array) ) {
                    $map_array = [];
                }

                // Add duplicate product ID if not present
                if ( ! in_array($duplicate_id, $map_array) ) {
                    $map_array[] = $duplicate_id;
                }

                $wpdb->update(
                    $table,
                    [ 'product_map' => json_encode($map_array) ],
                    [ 'ID' => $existing_map_id ],
                    [ '%s' ],
                    [ '%d' ]
                );

                // Set same mapping ID to duplicate
                update_post_meta($duplicate_id, 'multivendorx_spmv_id', $existing_map_id);
            }
        }
    }
}