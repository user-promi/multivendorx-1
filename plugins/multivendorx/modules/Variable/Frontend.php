<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Variable;
use MultiVendorX\Utill;

/**
 * MultiVendorX Store Policy Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter( 'mvx_product_type_selector', array( $this, 'set_product_types' ), 10 );

        add_action( 'mvx_after_attribute_product_tabs_content', array( $this, 'mvx_product_variable_tab_content' ), 10, 3 );
    }

    public function set_product_types( $product_types ) {
        $afm_types             = array();
        $afm_types['variable'] = __( 'Variable product', 'multivendorx' );

        return array_merge( $product_types, $afm_types );
    }

    public function mvx_product_variable_tab_content( $self, $product_object, $post ) {
        MultiVendorX()->util->get_template(
            'product/views/html-product-data-variations.php',
            array(
				'self'           => $self,
				'product_object' => $product_object,
				'post'           => $post,
            )
        );
    }
}
