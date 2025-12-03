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

        if ( ! current_user_can( 'edit_products' ) || ( ! apply_filters( 'vendor_can_add_custom_attribute', true ) && empty( sanitize_text_field( $_POST['taxonomy'] ) ) ) ) {
            wp_die( -1 );
        }

        $i             = absint( $_POST['i'] );
        $metabox_class = array();
        $attribute     = new \WC_Product_Attribute();

        $attribute->set_id( wc_attribute_taxonomy_id_by_name( sanitize_text_field( $_POST['taxonomy'] ) ) );
        $attribute->set_name( sanitize_text_field( $_POST['taxonomy'] ) );
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
				'i'             => $i,
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

        parse_str( $_POST['data'], $data );

        $attr_data = isset( $data['wc_attributes'] ) ? $data['wc_attributes'] : array();

        $attributes   = Products::prepare_attributes( $attr_data );
        $product_id   = absint( $_POST['post_id'] );
        $product_type = ! empty( $_POST['product_type'] ) ? wc_clean( $_POST['product_type'] ) : 'simple';
        $classname    = \WC_Product_Factory::get_product_classname( $product_id, $product_type );
        $product      = new $classname( $product_id );

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

        if ( ! current_user_can( 'edit_products' ) || empty( $_POST['product_id'] ) ) {
            wp_die( -1 );
        }

        // Set $post global so its available, like within the admin screens
        global $post, $MVX_pro;

        $loop           = 0;
        $product_id     = absint( $_POST['product_id'] );
        $post           = get_post( $product_id );
        $product_object = wc_get_product( $product_id );
        $per_page       = ! empty( $_POST['per_page'] ) ? absint( $_POST['per_page'] ) : 10;
        $page           = ! empty( $_POST['page'] ) ? absint( $_POST['page'] ) : 1;
        $variations     = wc_get_products(
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
                $variation_data = array_merge( array_map( 'maybe_unserialize', get_post_custom( $variation_id ) ), wc_get_product_variation_attributes( $variation_id ) ); // kept for BW compatibility.
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

        global $post, $MVX_pro; // Set $post global so its available, like within the admin screens.

        $product_id     = intval( $_POST['post_id'] );
        $post           = get_post( $product_id );
        $loop           = intval( $_POST['loop'] );
        $product_object = wc_get_product( $product_id );
        $classname      = \WC_Product_Factory::get_product_classname( $product_id, 'variable' );
        // if the saved product type is not variation, it will return a variation class object
        $variable_product_object = new $classname( $product_id );
        $variation_object        = new \WC_Product_Variation();
        $variation_object->set_parent_id( $product_id );
        $variation_object->set_attributes( array_fill_keys( array_map( 'sanitize_title', array_keys( $variable_product_object->get_variation_attributes() ) ), '' ) );
        $variation_id   = $variation_object->save();
        $variation      = get_post( $variation_id );
        $variation_data = array_merge( array_map( 'maybe_unserialize', get_post_custom( $variation_id ) ), wc_get_product_variation_attributes( $variation_id ) ); // kept for BW compatibility.
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
