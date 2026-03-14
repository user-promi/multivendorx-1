<?php
/**
 * MultiVendorX Elementor Admin
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor;

/**
 * MultiVendorX Elementor Admin class.
 *
 * @class       Admin class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Constructor.
     */
    public function __construct() {
        // Elementor support - Register custom document type
        add_action( 'elementor/documents/register', array( $this, 'register_elementor_document_type' ) );
        add_filter( 'multivendorx_store_elementor_template', array( $this, 'elementor_template_filter' ), 10 );
        // Add content in elementor template.
        add_action( 'save_post_elementor_library', array( $this, 'default_store_template' ), 10, 3 );
    }

    /**
     * Register custom Elementor document type
     */
    public function register_elementor_document_type( $documents_manager ) {
        $documents_manager->register_document_type( 'multivendorx-store', StoreDocument::class );
    }

    public function elementor_template_filter( $template ) {

        if ( ! did_action( 'elementor/loaded' ) ) {
            return $template;
        }

        $elementor_template_id = $this->get_elementor_template();

        if ( ! $elementor_template_id ) {
            return $template;
        }

        add_filter(
            'body_class',
            function ( $classes ) {
				$classes[] = 'elementor-page';
				return $classes;
			}
        );

        $canvas = MultiVendorX()->plugin_path . 'templates/elementor-canvas.php';
        return file_exists( $canvas ) ? $canvas : $template;
    }

    /**
     * Get active Elementor template for store
     */
    private function get_elementor_template() {
        if ( ! did_action( 'elementor/loaded' ) ) {
            return false;
        }

        // Find template with our custom document type
        $args = array(
            'post_type'      => 'elementor_library',
            'posts_per_page' => 1,
            'post_status'    => 'publish',
            'meta_query'     => array(
                array(
                    'key'   => '_elementor_template_type',
                    'value' => 'multivendorx-store',
                ),
            ),
        );

        $templates = get_posts( $args );
        return ! empty( $templates ) ? $templates[0]->ID : false;
    }

    public function default_store_template( $post_id, $post, $update ) {

        // Only for new templates
        if ( $update ) {
            return;
        }

        $template_type = get_post_meta( $post_id, '_elementor_template_type', true );
        if ( $template_type !== 'multivendorx-store' ) {
            return;
        }

        // Do not overwrite if already exists
        if ( get_post_meta( $post_id, '_elementor_data', true ) ) {
            return;
        }

        update_post_meta(
            $post_id,
            '_elementor_data',
            wp_slash( $this->get_default_store_elementor_data() )
        );

        update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
    }

    private function get_default_store_elementor_data() {

        $data = array(
        // store banner start
         array(
            'id'       => 'main-store-container-' . uniqid(),
            'elType'   => 'container',
            'settings' => array(
                'content_width'  => 'boxed',
                'flex_direction' => 'row',
                'gap'            => '10',
            ),
            'elements' => array(
                 array(
                    'id'         => 'store-logo-' . uniqid(),
                    'elType'     => 'widget',
                    'widgetType' => 'multivendorx_store_banner',
                    'elements'   => array(),
                ),
            )
        ), // store banner start

        // Main container
        array(
            'id'       => 'main-store-container-' . uniqid(),
            'elType'   => 'container',
            'settings' => array(
                'content_width'  => 'boxed',
                'flex_direction' => 'row',
                'gap'            => '10',
            ),
            'elements' => array(
                // store details container 
                array(
                    'id'       => 'secondary-container-' . uniqid(),
                    'elType'   => 'container',
                    'settings' => array(
                        'content_width'  => 'boxed',
                        'flex_direction' => 'row',  // This makes it a row container
                        'gap'            => '10',
                    ),
                    'elements' => array(
                        // Left container in the row
                        // Store Logo or Image widget in right container
                                array(
                                    'id'         => 'store-logo-' . uniqid(),
                                    'elType'     => 'widget',
                                    'widgetType' => 'multivendorx_store_logo',
                                    'settings'   => array(
                                        'image_size' => 'thumbnail',
                                        'align'      => 'center',
                                    ),
                                    'elements'   => array(),
                                ),
                        // Right container in the row
                        array(
                            'id'       => 'right-container-' . uniqid(),
                            'elType'   => 'container',
                            'settings' => array(
                                'content_width'  => 'boxed',
                                'flex_direction' => 'column',
                                'width'          => array(
                                    'size' => 50,
                                    'unit' => '%'
                                ),
                                'gap'            => '10',
                            ),
                            'elements' => array(
                                // Store Name widget
                                array(
                                    'id'         => 'store-name-' . uniqid(),
                                    'elType'     => 'widget',
                                    'widgetType' => 'multivendorx_store_name',
                                    'settings'   => array(
                                        'html_tag' => 'h1',
                                    ),
                                    'elements'   => array(),
                                ),
                                // Store info
                                array(
                                    'id'         => 'store-info-widget-' . uniqid(),
                                    'elType'     => 'widget',
                                    'widgetType' => 'multivendorx_store_info',
                                    'elements'   => array(),
                                ),
                                // Store Description
                                array(
                                    'id'         => 'store-description-' . uniqid(),
                                    'elType'     => 'widget',
                                    'widgetType' => 'multivendorx_store_description',
                                    'settings'   => array(
                                        'empty_text' => 'This store has not added a description yet.',
                                    ),
                                    'elements'   => array(),
                                ),                         
                            ),
                        ),
                    ),
                ),
                // right buttons container (right)
                array(
                    'id'       => 'secondary-container-' . uniqid(),
                    'elType'   => 'container',
                    'settings' => array(
                        'content_width'  => 'boxed',
                        'justify_content' => 'flex-end', 
                        'align_items' => 'center',
                        'gap'            => '10',
                    ),
                    'elements' => array(
                        // Store Follow Button Widget
                        array(
                            'id'         => 'store-follow-button-' . uniqid(),
                            'elType'     => 'widget',
                            'widgetType' => 'multivendorx_store_follow',
                            'settings'   => array(
                                'text' => 'Follow',
                            ),
                            'elements'   => array(),
                        ),
                    ),
                ),
            ),
        ),  // Main container end

        // store tab start
        array(
            'id'       => 'main-store-container-' . uniqid(),
            'elType'   => 'container',
            'settings' => array(
                'content_width'  => 'boxed',
                'gap'            => '10',
            ),
            'elements' => array(
                 array(
                    'id'         => 'multivendorx-store-tab-' . uniqid(),
                    'elType'     => 'widget',
                    'widgetType' => 'multivendorx_Store_Tab',
                    'elements'   => array(),
                ),
            )
        ), // store tab end
    );

        return wp_json_encode( $data );
    }
}
