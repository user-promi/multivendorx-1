<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Variable;

use MultiVendorX\Store\Products;
use MultiVendorX\Utill;

/**
 * MultiVendorX Store Policy Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Ajax {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_action( 'wp_ajax_mvx_frontend_dashboard_add_product_attribute', array( $this, 'add_product_attribute_callback' ) );
        add_action( 'wp_ajax_mvx_frontend_dashboard_save_attributes', array( $this, 'save_attributes_callback' ) );

        add_action( 'wp_ajax_mvx_frontend_dashboard_load_variations', array( $this, 'load_variations_callback' ) );
        add_action( 'wp_ajax_mvx_frontend_dashboard_add_variation', array( $this, 'add_variation_callback' ) );
    }

    /**
     * Add an attribute row.
     */
    public function add_product_attribute_callback() {
        ob_start();

        check_ajax_referer( 'add-attribute', 'security' );

        $taxonomy = filter_input( INPUT_POST, 'taxonomy', FILTER_UNSAFE_RAW );
        $taxonomy = sanitize_text_field( $taxonomy );
        $i        = filter_input( INPUT_POST, 'i', FILTER_SANITIZE_NUMBER_INT );

        if ( ! current_user_can( 'edit_products' ) || ( ! apply_filters( 'vendor_can_add_custom_attribute', true ) && empty( $taxonomy ) ) ) {
            wp_die( -1 );
        }

        $metabox_class = array();
        $attribute     = new \WC_Product_Attribute();

        $attribute->set_id( wc_attribute_taxonomy_id_by_name( $taxonomy ) );
        $attribute->set_name( $taxonomy );
        $attribute->set_visible( apply_filters( 'woocommerce_attribute_default_visibility', 1 ) );
        $attribute->set_variation( apply_filters( 'woocommerce_attribute_default_is_variation', 0 ) );

        if ( $attribute->is_taxonomy() ) {
            $metabox_class[] = 'taxonomy';
            $metabox_class[] = $attribute->get_name();
        }
        $self = new Products();

        MultiVendorX()->util->get_template(
            'product/views/html-product-attribute.php',
            array(
                'attribute'     => $attribute,
                'metabox_class' => $metabox_class,
                'i'             => absint( $i ),
                'self'          => $self,
            )
        );

        wp_die();
    }

    /**
     * Save attributes
     */
    public function save_attributes_callback() {
        check_ajax_referer( 'save-attributes', 'security' );

        if ( ! current_user_can( 'edit_products' ) ) {
            wp_die( -1 );
        }

        $data_raw = filter_input( INPUT_POST, 'data', FILTER_UNSAFE_RAW );
        parse_str( $data_raw, $data );

        $attr_data = isset( $data['wc_attributes'] ) ? $data['wc_attributes'] : array();

        $product_id   = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $product_type = filter_input( INPUT_POST, 'product_type', FILTER_UNSAFE_RAW );
        $product_type = $product_type ? wc_clean( $product_type ) : 'simple';
        $product_type = $product_type ? wc_clean( $product_type ) : 'simple';

        $attributes = Products::prepare_attributes( $attr_data );
        $classname  = \WC_Product_Factory::get_product_classname( $product_id, $product_type );
        $product    = new $classname( $product_id );

        $product->set_attributes( $attributes );
        $product->save();
        wp_die();
    }

    /**
     * Load variations via AJAX.
     */
    public function load_variations_callback() {
        ob_start();

        check_ajax_referer( 'load-variations', 'security' );

        $product_id = filter_input( INPUT_POST, 'product_id', FILTER_SANITIZE_NUMBER_INT );

        if ( ! current_user_can( 'edit_products' ) || empty( $product_id ) ) {
            wp_die( -1 );
        }

        global $post, $MVX_pro;

        $per_page = filter_input( INPUT_POST, 'per_page', FILTER_SANITIZE_NUMBER_INT );
        $page     = filter_input( INPUT_POST, 'page', FILTER_SANITIZE_NUMBER_INT );

        $per_page = $per_page ? absint( $per_page ) : 10;
        $page     = $page ? absint( $page ) : 1;

        $loop           = 0;
        $post           = get_post( $product_id );
        $product_object = wc_get_product( $product_id );

        $variations = wc_get_products(
            array(
                'status'  => array( 'private', 'publish' ),
                'type'    => 'variation',
                'parent'  => $product_id,
                'limit'   => $per_page,
                'page'    => $page,
                'orderby' => array(
                    'menu_order' => 'ASC',
                    'ID'         => 'DESC',
                ),
                'return'  => 'objects',
            )
        );
        if ( $variations ) {
            foreach ( $variations as $variation_object ) {
                $variation_id   = $variation_object->get_id();
                $variation      = get_post( $variation_id );
                $variation_data = array_merge( array_map( 'maybe_unserialize', get_post_custom( $variation_id ) ), wc_get_product_variation_attributes( $variation_id ) );
                MultiVendorX()->util->get_template(
                    'product/views/html-product-variations.php',
                    array(
                        'variation_object' => $variation_object,
                        'variation_id'     => $variation_id,
                        'variation_data'   => $variation_data,
                        'variation'        => $variation,
                        'product_object'   => $product_object,
                    )
                );

                ++$loop;
            }
        }
        wp_die();
    }

    /**
     * Add variation via ajax function.
     */
    public function add_variation_callback() {
        check_ajax_referer( 'add-variation', 'security' );

        if ( ! current_user_can( 'edit_products' ) ) {
            wp_die( -1 );
        }

        global $post, $MVX_pro;

        $product_id = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $loop       = filter_input( INPUT_POST, 'loop', FILTER_SANITIZE_NUMBER_INT );

        $post                    = get_post( $product_id );
        $product_object          = wc_get_product( $product_id );
        $classname               = \WC_Product_Factory::get_product_classname( $product_id, 'variable' );
        $variable_product_object = new $classname( $product_id );
        $variation_object        = new \WC_Product_Variation();
        $variation_object->set_parent_id( $product_id );
        $variation_object->set_attributes(
            array_fill_keys(
                array_map( 'sanitize_title', array_keys( $variable_product_object->get_variation_attributes() ) ),
                ''
            )
        );

        $variation_id   = $variation_object->save();
        $variation      = get_post( $variation_id );
        $variation_data = array_merge( array_map( 'maybe_unserialize', get_post_custom( $variation_id ) ), wc_get_product_variation_attributes( $variation_id ) );

        MultiVendorX()->util->get_template(
            'product/views/html-product-variations.php',
            array(
                'variation_object' => $variation_object,
                'variation_id'     => $variation_id,
                'variation_data'   => $variation_data,
                'variation'        => $variation,
                'product_object'   => $product_object,
            )
        );

        wp_die();
    }
}
