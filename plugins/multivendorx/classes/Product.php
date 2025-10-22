<?php
/**
 * Product class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Product class
 *
 * Adds a "Store" column to the products list in admin.
 *
 * @class   Product
 * @version PRODUCT_VERSION
 */
class Product {

    /**
     * Constructor: Add hooks.
     */
    public function __construct() {
        add_filter( 'manage_edit-product_columns', [ $this, 'add_store_column_to_product_list' ], 10 );
        add_action( 'manage_product_posts_custom_column', [ $this, 'display_store_column_content' ], 10, 2 );
    }

    /**
     * Add the 'Store' column header after 'Name'.
     *
     * @param array $columns Existing columns.
     * @return array Modified columns.
     */
    public function add_store_column_to_product_list( $columns ) {
        $new_columns = [];
        foreach ( $columns as $key => $title ) {
            $new_columns[ $key ] = $title;

            // Insert the custom column 'store_id' after 'name'
            if ( 'name' === $key ) {
                $new_columns['store_id'] = __( 'Store', 'multivendorx' );
            }
        }
        return $new_columns;
    }

    /**
     * Display the 'Store' column content for each product.
     *
     * @param string $column Column ID.
     * @param int    $post_id Product post ID.
     */
    public function display_store_column_content( $column, $post_id ) {
        if ( 'store_id' !== $column ) {
            return;
        }

        $store_id = get_post_meta( $post_id, 'multivendorx_store_id', true );

        if ( ! $store_id ) {
            echo '<span style="color: #999;">— N/A —</span>';
            return;
        }

        $store = new \MultiVendorX\Store\Store( $store_id );

        if ( $store ) {
            echo esc_html( $store->get( 'name' ) );
        } else {
            echo '<span style="color: #999;">— N/A —</span>';
        }
    }
}
