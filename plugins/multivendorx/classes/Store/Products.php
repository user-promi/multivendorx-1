<?php

namespace MultiVendorX\Store;

use MultiVendorX\FrontendScripts;

defined( 'ABSPATH' ) || exit;

/**
 * Store Products class
 *
 * @version     2.2.0
 * @package     MultiVendorX
 * @author      MultiVendorX
 */

class Products {
    public $product_id     = '';
    public $product_object = null;
    public $post_object    = null;
    public $is_update      = false;
    public $is_spmv        = false;
    private $no_cap        = false;
    private $error_msg     = '';

    public function __construct() {

        add_action( 'template_redirect', array( $this, 'redirect_edit_product_page' ) );
        // add_filter('product_type_selector', array(&$this, 'mvx_product_type_selector'), 10, 1);
        // add_filter('product_type_options', array(&$this, 'mvx_product_type_options'), 10);

        // check support for virtual and downloadable
        add_filter( 'mvx_product_type_options', array( $this, 'mvx_set_product_type_options' ), 99 );
    }


    private function product_capablity_check( $action = 'add', $product_id = '' ) {
        $current_user_id       = get_current_user_id();
        $current_user_store_id = get_user_meta( $current_user_id, 'multivendorx_active_store', true );
        $product_vendor        = StoreUtil::get_products_vendor( $product_id );

        if ( $product_vendor && $current_user_store_id !== $product_vendor->get_id() ) {
            $this->error_msg = __( 'You do not have permission to view this content. Please contact site administrator.', 'multivendorx' );
            return false;
        }
        if ( ! empty( wc_get_product_types() ) ) {
            switch ( $action ) {
                case 'add':
                    if ( ! ( current_user_can( 'edit_products' ) ) ) {
                        $this->error_msg = __( 'You do not have enough permission to submit a new coupon. Please contact site administrator.', 'multivendorx' );
                        return false;
                    }
                    return true;
                case 'edit':
                    // if ( $product_id && StoreUtil::get_products_vendor( $product_id ) ) {
                    if ( $product_id ) {
                        $product = wc_get_product( $product_id );
                        if ( $product->get_status() === 'trash' ) {
                            $this->error_msg = __( 'You can&#8217;t edit this item because it is in the Trash. Please restore it and try again.', 'multivendorx' );
                            return false;
                        }
                        if ( $product->get_status() === 'publish' || $product->get_status() === 'auto-draft' ) {
                            if ( ! current_user_can( 'publish_products' ) ) {
                                $this->error_msg = __( 'Sorry, you are not allowed to edit this item.', 'multivendorx' );
                                return false;
                            }
                        } elseif ( ! current_user_can( 'edit_products' ) ) {
                                $this->error_msg = __( 'Sorry, you are not allowed to edit this item.', 'multivendorx' );
                                return false;
                        }
                        return true;
                    }
                    $this->error_msg = __( 'You attempted to edit an item that doesn&#8217;t exist. Perhaps it was deleted?', 'multivendorx' );
                    return false;
            }
        } else {
            $this->error_msg = __( 'No allowed Product types found. Please contact site administrator.', 'multivendorx' );
        }
        return false;
    }

    private function product_no_caps_notice() {
        ob_start();
        ?>
        <div class="col-md-12">
            <div class="panel panel-default">
                <?php echo $this->error_msg; ?>
            </div>
        </div>
        <?php
        return;
    }

    public function create_product_draft( $post_type ) {
        $current_user_store_id = get_user_meta( get_current_user_id(), 'multivendorx_active_store', true );
        $store                 = Store::get_store_by_id( $current_user_store_id );

        if ( $store->get( 'status' ) == 'under_review' && in_array( 'restrict_new_product_uploads', MultiVendorX()->setting->get_setting( 'restriction_for_under_review', array() ) ) ) {
            return false;
        }
        if ( $current_user_store_id ) {
            $post_id = wp_insert_post(
                array(
					'post_title'  => __( 'Auto Draft', 'multivendorx' ),
					'post_type'   => $post_type,
					'post_status' => 'auto-draft',
                )
            );
            return $post_id;
        }
        return false;
    }

    public function redirect_edit_product_page() {
        $subtab     = get_query_var( 'element' );
        $context_id = get_query_var( 'context_id' );

        if ( $subtab === 'edit' &&
            empty( $context_id ) && (
            ! MultiVendorX()->setting->get_setting( 'category_pyramid_guide' ) ||
            MultiVendorX()->setting->get_setting( 'category_pyramid_guide' ) === 'no' ) &&
            MultiVendorX()->modules->is_active( 'spmv' ) == false ) {
                $product_id = $this->create_product_draft( 'product' );
			if ( $product_id ) {
				wp_safe_redirect( StoreUtil::get_endpoint_url( 'products', 'edit', $product_id ) );
			} else {
				wp_safe_redirect( StoreUtil::get_endpoint_url( 'products' ) );
			}
                exit;
        }
    }

    public function call_add_product() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-product-classify-script' );
        FrontendScripts::localize_scripts( 'multivendorx-product-classify-script' );

        MultiVendorX()->util->get_template( 'product/add-product.php', array( 'self' => $this ) );
    }

    public function call_edit_product() {

        global $wp;

        $this->product_id = $wp->query_vars['context_id'];

        if ( $this->product_id ) {
            $this->product_object = wc_get_product( $this->product_id );
            $this->post_object    = get_post( $this->product_id );
        }

        // else {
        // $this->product_object = new \WC_Product();
        // $this->post_object = $this->create_product_draft( 'product' );
        // $this->product_id = $this->post_object ? $this->post_object->ID : '';
        // }

        $downloadable_contents = array();
        $downloadable_files    = $this->product_object->get_downloads( 'edit' );
        if ( $downloadable_files ) {
            foreach ( $downloadable_files as $key => $file ) {
                $downloadable_contents[] = array(
                    'key'  => $key,
                    'file' => esc_attr( $file['file'] ),
                    'name' => esc_attr( $file['name'] ),
                );
            }
        }

        $edit_product_params = apply_filters(
            'mvx_advance_product_script_params',
            array(
				'ajax_url'                            => admin_url( 'admin-ajax.php' ),
				'product_id'                          => $this->product_id,
				'search_products_nonce'               => wp_create_nonce( 'search-products' ),
				'add_attribute_nonce'                 => wp_create_nonce( 'add-attribute' ),
				'save_attributes_nonce'               => wp_create_nonce( 'save-attributes' ),
				'add_variation_nonce'                 => wp_create_nonce( 'add-variation' ),
				'link_variation_nonce'                => wp_create_nonce( 'link-variations' ),
				'delete_variations_nonce'             => wp_create_nonce( 'delete-variations' ),
				'load_variations_nonce'               => wp_create_nonce( 'load-variations' ),
				'save_variations_nonce'               => wp_create_nonce( 'save-variations' ),
				'bulk_edit_variations_nonce'          => wp_create_nonce( 'bulk-edit-variations' ),
				'save_product_nonce'                  => wp_create_nonce( 'save-product' ),
				'product_data_tabs'                   => json_encode( $this->get_product_data_tabs() ),
				'default_product_types'               => json_encode( $this->mvx_default_product_types() ),
				'product_types'                       => json_encode( wc_get_product_types() ),
				'product_type'                        => $this->product_object->get_type(),
				'downloadable_files'                  => json_encode( $downloadable_contents ),
				'attributes'                          => $this->product_object->get_attributes( 'edit' ),
				'custom_attribute'                    => apply_filters( 'vendor_can_add_custom_attribute', true ),
				'new_attribute_prompt'                => esc_js( __( 'Enter a name for the new attribute term:', 'multivendorx' ) ),
				'remove_attribute'                    => esc_js( __( 'Remove this attribute?', 'multivendorx' ) ),
				'woocommerce_placeholder_img_src'     => wc_placeholder_img_src(),
				'i18n_link_all_variations'            => esc_js( sprintf( __( 'Are you sure you want to link all variations? This will create a new variation for each and every possible combination of variation attributes (max %d per run).', 'multivendorx' ), defined( 'WC_MAX_LINKED_VARIATIONS' ) ? WC_MAX_LINKED_VARIATIONS : 50 ) ),
				'i18n_enter_a_value'                  => esc_js( __( 'Enter a value', 'multivendorx' ) ),
				'i18n_enter_menu_order'               => esc_js( __( 'Variation menu order (determines position in the list of variations)', 'multivendorx' ) ),
				'i18n_enter_a_value_fixed_or_percent' => esc_js( __( 'Enter a value (fixed or %)', 'multivendorx' ) ),
				'i18n_delete_all_variations'          => esc_js( __( 'Are you sure you want to delete all variations? This cannot be undone.', 'multivendorx' ) ),
				'i18n_last_warning'                   => esc_js( __( 'Last warning, are you sure?', 'multivendorx' ) ),
				'i18n_choose_image'                   => esc_js( __( 'Choose an image', 'multivendorx' ) ),
				'i18n_set_image'                      => esc_js( __( 'Set variation image', 'multivendorx' ) ),
				'i18n_variation_added'                => esc_js( __( 'variation added', 'multivendorx' ) ),
				'i18n_variations_added'               => esc_js( __( 'variations added', 'multivendorx' ) ),
				'i18n_no_variations_added'            => esc_js( __( 'No variations added', 'multivendorx' ) ),
				'i18n_remove_variation'               => esc_js( __( 'Are you sure you want to remove this variation?', 'multivendorx' ) ),
				'i18n_scheduled_sale_start'           => esc_js( __( 'Sale start date (YYYY-MM-DD format or leave blank)', 'multivendorx' ) ),
				'i18n_scheduled_sale_end'             => esc_js( __( 'Sale end date (YYYY-MM-DD format or leave blank)', 'multivendorx' ) ),
				'i18n_edited_variations'              => esc_js( __( 'Save changes before changing page?', 'multivendorx' ) ),
				'i18n_variation_count_single'         => esc_js( __( '%qty% variation', 'multivendorx' ) ),
				'i18n_variation_count_plural'         => esc_js( __( '%qty% variations', 'multivendorx' ) ),
				'variations_per_page'                 => absint( apply_filters( 'woocommerce_admin_meta_boxes_variations_per_page', 15 ) ),
				'mon_decimal_point'                   => wc_get_price_decimal_separator(),
				'add_tags'                            => apply_filters( 'mvx_vendor_can_add_product_tag', true, get_current_user_id() ),
				'dashboard_nonce'                     => wp_create_nonce( 'mvx-dashboard' ),
            )
        );

        wp_enqueue_editor();
        // Support for media
        wp_enqueue_media();
        wp_enqueue_script( 'selectWoo' );

        wp_enqueue_script( 'multivendorx-store-products-script', MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name() . 'js/' . MULTIVENDORX_PLUGIN_SLUG . '-store-products.min.js', array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'react-jsx-runtime', 'jquery-ui-datepicker' ), MultiVendorX()->version );

        wp_localize_script( 'multivendorx-store-products-script', 'mvx_advance_product_params', $edit_product_params );

        // do_action( 'mvx_edit_product_template_load', $this->product_id, $this->product_object, $this->post_object );
        MultiVendorX()->util->get_template(
            'product/edit-product.php',
            array(
				'self'           => $this,
				'product_object' => $this->product_object,
				'post'           => $this->post_object,
            )
        );
    }

    /**
     * Get Vendor Product Types
     *
     * @param product_types
     * @return product_types
     */
    public function mvx_product_type_selector( $product_types ) {
        // check against simple virtual module ... product type selector
        // if ($product_types) {
        // foreach ($product_types as $product_type => $value) {
        // $vendor_can = mvx_is_product_type_avaliable($product_type);
        // if (!$vendor_can) {
        // unset($product_types[$product_type]);
        // }
        // }
        // }
        return apply_filters( 'mvx_product_type_selector', $product_types );
    }

    /**
     * Get Vendor Product Types Options
     *
     * @param product_type_options
     * @return product_type_options
     */
    public function mvx_product_type_options( $product_type_options ) {
        $product_type_settings = MultiVendorX()->setting->get_setting( 'type_options' );
        if ( $product_type_options ) {
            foreach ( $product_type_options as $product_type_option => $value ) {
                if ( ! in_array( $product_type_option, $product_type_settings ) ) {
                    unset( $product_type_options[ $product_type_option ] );
                }
            }
        }
        return $product_type_options;
    }

    public function mvx_set_product_type_options( $option ) {
        $product_type_option = MultiVendorX()->setting->get_setting( 'type_options', array() );
        foreach ( $option as $key => $val ) {
            if ( ! in_array( $key, $product_type_option ) ) {
                unset( $option[ $key ] );
            }
        }
        return $option;
    }

    function mvx_is_allowed_product_type() {
        $product_types = $this->mvx_get_product_types();
        foreach ( func_get_args() as $arg ) {
            // typecast normal string params to array
            $a_arg = (array) $arg;
            foreach ( $a_arg as $key ) {
                if ( apply_filters( 'mvx_is_allowed_product_type_check', array_key_exists( $key, $product_types ), $key, $product_types ) ) {
                    return true;
                }
            }
        }
        return false;
    }

    function mvx_get_product_types() {
        return apply_filters( 'mvx_product_type_selector', $this->mvx_default_product_types() );
    }

    public function mvx_default_product_types() {
        return array(
            'simple' => __( 'Simple product', 'multivendorx' ),
        );
    }

    public function filter_variation_attributes( $attribute ) {
        return true === $attribute->get_variation();
    }

    public static function prepare_set_attributes( $all_attributes, $key_prefix = 'attribute_', $data = '', $index = null ) {
        $attributes = array();

        if ( $all_attributes ) {
            foreach ( $all_attributes as $attribute ) {
                if ( $attribute->get_variation() ) {
                    $attribute_key = sanitize_title( $attribute->get_name() );

                    if ( ! is_null( $index ) ) {
                        $value = isset( $data[ $key_prefix . $attribute_key ][ $index ] ) ? wp_unslash( $data[ $key_prefix . $attribute_key ][ $index ] ) : '';
                    } else {
                        $value = isset( $data[ $key_prefix . $attribute_key ] ) ? wp_unslash( $data[ $key_prefix . $attribute_key ] ) : '';
                    }

                    if ( $attribute->is_taxonomy() ) {
                        // Don't use wc_clean as it destroys sanitized characters.
                        $value = sanitize_title( $value );
                    } else {
                        $value = html_entity_decode( wc_clean( $value ), ENT_QUOTES, get_bloginfo( 'charset' ) ); // WPCS: sanitization ok.
                    }

                    $attributes[ $attribute_key ] = $value;
                }
            }
        }

        return $attributes;
    }

    public static function save_product_variations( $post_id, $data ) {
        $errors = array();
        if ( isset( $data['variable_post_id'] ) ) {
            $parent = wc_get_product( $post_id );
            $parent->set_default_attributes( self::prepare_set_attributes( $parent->get_attributes(), 'default_attribute_', $data ) );
            $parent->save();

            $max_loop   = max( array_keys( $data['variable_post_id'] ) );
            $data_store = $parent->get_data_store();
            $data_store->sort_all_product_variations( $parent->get_id() );

            for ( $i = 0; $i <= $max_loop; $i++ ) {
                if ( ! isset( $data['variable_post_id'][ $i ] ) ) {
                    continue;
                }
                $variation_id = absint( $data['variable_post_id'][ $i ] );
                $variation    = new \WC_Product_Variation( $variation_id );
                $stock        = null;

                // Handle stock changes.
                if ( isset( $data['variable_stock'], $data['variable_stock'][ $i ] ) ) {
                    if ( isset( $data['variable_original_stock'], $data['variable_original_stock'][ $i ] ) && wc_stock_amount( $variation->get_stock_quantity( 'edit' ) ) !== wc_stock_amount( $data['variable_original_stock'][ $i ] ) ) {
                        /* translators: 1: product ID 2: quantity in stock */
                        $errors[] = sprintf( __( 'The stock has not been updated because the value has changed since editing. Product %1$d has %2$d units in stock.', 'multivendorx' ), $variation->get_id(), $variation->get_stock_quantity( 'edit' ) );
                    } else {
                        $stock = wc_stock_amount( $data['variable_stock'][ $i ] );
                    }
                }

                $error = $variation->set_props(
                    array(
                        'status'            => isset( $data['variable_enabled'][ $i ] ) ? 'publish' : 'private',
                        'menu_order'        => wc_clean( $data['variation_menu_order'][ $i ] ),
                        'regular_price'     => wc_clean( $data['variable_regular_price'][ $i ] ),
                        'sale_price'        => wc_clean( $data['variable_sale_price'][ $i ] ),
                        'virtual'           => isset( $data['variable_is_virtual'][ $i ] ),
                        'downloadable'      => isset( $data['variable_is_downloadable'][ $i ] ),
                        'date_on_sale_from' => wc_clean( $data['variable_sale_price_dates_from'][ $i ] ),
                        'date_on_sale_to'   => wc_clean( $data['variable_sale_price_dates_to'][ $i ] ),
                        'description'       => wp_kses_post( $data['variable_description'][ $i ] ),
                        'download_limit'    => wc_clean( $data['variable_download_limit'][ $i ] ),
                        'download_expiry'   => wc_clean( $data['variable_download_expiry'][ $i ] ),
                        'downloads'         => self::prepare_downloads(
                            isset( $data['_wc_variation_file_names'][ $variation_id ] ) ? $data['_wc_variation_file_names'][ $variation_id ] : array(),
                            isset( $data['_wc_variation_file_urls'][ $variation_id ] ) ? $data['_wc_variation_file_urls'][ $variation_id ] : array(),
                            isset( $data['_wc_variation_file_hashes'][ $variation_id ] ) ? $data['_wc_variation_file_hashes'][ $variation_id ] : array()
                        ),
                        'manage_stock'      => isset( $data['variable_manage_stock'][ $i ] ),
                        'stock_quantity'    => $stock,
                        'backorders'        => isset( $data['variable_backorders'], $data['variable_backorders'][ $i ] ) ? wc_clean( $data['variable_backorders'][ $i ] ) : null,
                        'stock_status'      => wc_clean( $data['variable_stock_status'][ $i ] ),
                        'image_id'          => wc_clean( $data['upload_image_id'][ $i ] ),
                        'attributes'        => self::prepare_set_attributes( $parent->get_attributes(), 'attribute_', $data, $i ),
                        'sku'               => isset( $data['variable_sku'][ $i ] ) ? wc_clean( $data['variable_sku'][ $i ] ) : '',
                        'global_unique_id'  => isset( $data['variable_global_unique_id'][ $i ] ) ? wc_clean( wp_unslash( $data['variable_global_unique_id'][ $i ] ) ) : '',
                        'weight'            => isset( $data['variable_weight'][ $i ] ) ? wc_clean( $data['variable_weight'][ $i ] ) : '',
                        'length'            => isset( $data['variable_length'][ $i ] ) ? wc_clean( $data['variable_length'][ $i ] ) : '',
                        'width'             => isset( $data['variable_width'][ $i ] ) ? wc_clean( $data['variable_width'][ $i ] ) : '',
                        'height'            => isset( $data['variable_height'][ $i ] ) ? wc_clean( $data['variable_height'][ $i ] ) : '',
                        'shipping_class_id' => wc_clean( $data['variable_shipping_class'][ $i ] ),
                        'tax_class'         => isset( $data['variable_tax_class'][ $i ] ) ? wc_clean( $data['variable_tax_class'][ $i ] ) : null,
                    )
                );

                if ( is_wp_error( $error ) ) {
                    $errors[] = $error->get_error_message();
                }

                $variation->save();

                do_action( 'woocommerce_save_product_variation', $variation_id, $i );
            }
        }
        return $errors;
    }

    public static function prepare_downloads( $file_names, $file_urls, $file_hashes ) {
        $downloads = array();

        if ( ! empty( $file_urls ) ) {
            $file_url_size = sizeof( $file_urls );

            for ( $i = 0; $i < $file_url_size; $i++ ) {
                if ( ! empty( $file_urls[ $i ] ) ) {
                    $downloads[] = array(
                        'name'        => wc_clean( $file_names[ $i ] ),
                        'file'        => wp_unslash( trim( $file_urls[ $i ] ) ),
                        'download_id' => wc_clean( $file_hashes[ $i ] ),
                    );
                }
            }
        }
        return $downloads;
    }


    public static function prepare_attributes( $attributes ) {
        // Attributes
        $product_attributes = array();
        if ( ! empty( $attributes ) ) {
            foreach ( $attributes as $attribute ) {
                if ( ! empty( $attribute['name'] ) ) {
                    $attribute_id        = 0;
                    $attribute_name      = wc_clean( $attribute['name'] );
                    $attribute_position  = wc_clean( $attribute['position'] );
                    $attribute_visible   = isset( $attribute['visibility'] );
                    $attribute_variation = isset( $attribute['variation'] );

                    if ( isset( $attribute['tax_name'] ) ) {
                        $attribute_id = wc_attribute_taxonomy_id_by_name( $attribute['tax_name'] );
                    }

                    if ( isset( $attribute['value'] ) ) {
                        $options = is_array( $attribute['value'] ) ? $attribute['value'] : stripslashes( $attribute['value'] );
                    } else {
                        $options = '';
                    }

                    if ( is_array( $options ) ) {
                        // Term ids sent as array.
                        $options = wp_parse_id_list( $options );
                    } else {
                        // Terms or text sent in textarea.
                        $options = 0 < $attribute_id ? wc_sanitize_textarea( wc_sanitize_term_text_based( $options ) ) : wc_sanitize_textarea( $options );
                        $options = wc_get_text_attributes( $options );
                    }

                    if ( empty( $options ) ) {
                        continue;
                    }

                    $attribute = new \WC_Product_Attribute();
                    $attribute->set_id( $attribute_id );
                    $attribute->set_name( $attribute_name );
                    $attribute->set_options( $options );
                    $attribute->set_position( $attribute_position );
                    $attribute->set_visible( $attribute_visible );
                    $attribute->set_variation( $attribute_variation );
                    $product_attributes[] = $attribute;
                }
            }
        }
        return $product_attributes;
    }

    public function get_product_type_options() {
        return apply_filters(
            'mvx_product_type_options',
            array(
				'virtual'      => array(
					'id'            => '_virtual',
					'wrapper_class' => 'show_if_simple',
					'label'         => __( 'Virtual', 'multivendorx' ),
					'description'   => __( 'Virtual products are intangible and are not shipped.', 'multivendorx' ),
					'default'       => 'no',
				),
				'downloadable' => array(
					'id'            => '_downloadable',
					'wrapper_class' => 'show_if_simple',
					'label'         => __( 'Downloadable', 'multivendorx' ),
					'description'   => __( 'Downloadable products give access to a file upon purchase.', 'multivendorx' ),
					'default'       => 'no',
				),
            )
        );
    }

    /**
     * Return array of tabs to show.
     *
     * @return array
     */
    public function get_product_data_tabs() {
        $tabs = apply_filters(
            'mvx_product_data_tabs',
            array(
				'general'        => array(
					'label'    => __( 'General', 'multivendorx' ),
					'target'   => 'general_product_data',
					'class'    => array( 'hide_if_grouped', 'show_if_simple', 'show_if_external' ),
					'priority' => 10,
				),
				'inventory'      => array(
					'label'    => __( 'Inventory', 'multivendorx' ),
					'target'   => 'inventory_product_data',
					'class'    => array( 'show_if_simple', 'show_if_variable', 'show_if_grouped', 'show_if_external' ),
					'priority' => 20,
				),
				'shipping'       => array(
					'label'    => __( 'Shipping', 'multivendorx' ),
					'target'   => 'shipping_product_data',
					'class'    => array( 'hide_if_virtual', 'hide_if_grouped', 'hide_if_external' ),
					'priority' => 30,
				),
				'linked_product' => array(
					'label'    => __( 'Linked Products', 'multivendorx' ),
					'target'   => 'linked_product_data',
					'class'    => array(),
					'priority' => 40,
				),
				'attribute'      => array(
					'label'    => __( 'Attributes', 'multivendorx' ),
					'target'   => 'product_attributes_data',
					'class'    => array(),
					'priority' => 50,
				),
				'variations'     => array(
					'p_type'   => 'variable',
					'label'    => __( 'Variations', 'multivendorx' ),
					'target'   => 'variable_product_options',
					'class'    => array( 'show_if_variable' ),
					'priority' => 60,
				),
				'advanced'       => array(
					'label'    => __( 'Advanced', 'multivendorx' ),
					'target'   => 'advanced_product_data',
					'class'    => array(),
					'priority' => 70,
				),
            )
        );

        // Sort tabs based on priority.
        uasort( $tabs, array( __CLASS__, 'product_data_tabs_sort' ) );

        $other_tabs     = apply_filters( 'mvx_product_extra_tabs_added', array( 'shipping', 'variations' ) );
        $product_fileds = MultiVendorX()->setting->get_setting( 'products_fields', array() );
        $default_types  = array( 'general', 'inventory', 'linked_product', 'attribute', 'advanced', 'policies' );
        foreach ( $tabs as $key_tabs => $value_tabs ) {
            if ( is_array( $other_tabs ) && in_array( $key_tabs, $other_tabs ) ) {
				continue;
            }
        }

        if ( $default_types && ! empty( $default_types ) ) {
            foreach ( $default_types as $key_types => $value_types ) {
                if ( ! in_array( $value_types, $product_fileds ) ) {
                    unset( $tabs[ $value_types ] );
                }
            }
        } else {
            unset( $tabs['general'], $tabs['inventory'], $tabs['linked_product'], $tabs['attribute'], $tabs['advanced'] );
        }

        return $tabs;
    }

    /**
     * Callback to sort product data tabs on priority.
     *
     * @since 3.1.0
     * @param int $a First item.
     * @param int $b Second item.
     *
     * @return bool
     */
    private static function product_data_tabs_sort( $a, $b ) {
        if ( ! isset( $a['priority'], $b['priority'] ) ) {
            return -1;
        }

        if ( $a['priority'] == $b['priority'] ) {
            return 0;
        }

        return $a['priority'] < $b['priority'] ? -1 : 1;
    }

    function mvx_get_product_terms_HTML( $taxonomy, $id = null, $add_cap = false, $hierarchical = true ) {
        $terms         = array();
        $product_terms = get_terms(
            apply_filters(
                "mvx_get_product_terms_{$taxonomy}_query_args",
                array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
					'orderby'    => 'name',
					'parent'     => 0,
					'fields'     => 'id=>name',
                )
            )
        );
        if ( ( empty( $product_terms ) || is_wp_error( $product_terms ) ) && ! $add_cap ) {
            return false;
        }
        $term_id_list = wp_get_post_terms( $id, $taxonomy, array( 'fields' => 'ids' ) );
        if ( ! empty( $term_id_list ) && ! is_wp_error( $term_id_list ) ) {
            $terms = $term_id_list;
        } else {
            $terms = array();
        }
        $terms = isset( $_POST['tax_input'][ $taxonomy ] ) ? wp_parse_id_list( $_POST['tax_input'][ $taxonomy ] ) : $terms;
        $terms = apply_filters( 'mvx_get_product_terms_html_selected_terms', $terms, $taxonomy, $id );
        if ( $hierarchical ) {
            return $this->generate_hierarchical_taxonomy_html( $taxonomy, $product_terms, $terms, $add_cap );
        } else {
            return $this->generate_non_hierarchical_taxonomy_html( $taxonomy, $product_terms, $terms, $add_cap );
        }
    }
    function generate_non_hierarchical_taxonomy_html( $taxonomy, $product_terms, $seleted_terms, $add_cap ) {
        $html = '';
        if ( ! empty( $product_terms ) || $add_cap ) {
            ob_start();
            ?>
            <select multiple = "multiple" data-placeholder = "<?php esc_attr_e( 'Select', 'multivendorx' ); ?>" class = "multiselect form-control <?php echo $taxonomy; ?>" name = "tax_input[<?php echo $taxonomy; ?>][]">
                <?php
                foreach ( $product_terms as $term_id => $term_name ) {
                    echo '<option value="' . $term_id . '" ' . selected( in_array( $term_id, $seleted_terms ), true, false ) . '>' . $term_name . '</option>';
                }
                ?>
            </select>
            <?php
            $html = ob_get_clean();
        }
        return $html;
    }
    function generate_hierarchical_taxonomy_html( $taxonomy, $terms, $post_terms, $add_cap, $level = 0, $max_depth = 2 ) {
        $max_depth      = apply_filters( 'mvx_generate_hierarchical_taxonomy_html_max_depth', 5, $taxonomy, $terms, $post_terms, $level );
        $tax_html_class = ( $level == 0 ) ? 'category taxonomy-widget ' . $taxonomy . ' level-' . $level : '';
        $tax_html       = '<ul class="' . $tax_html_class . '">';
        foreach ( $terms as $term_id => $term_name ) {
            $child_html = '';
            if ( $max_depth > $level ) {
                $child_terms = get_terms(
                    apply_filters(
                        "mvx_get_product_terms_{$taxonomy}_query_args",
                        array(
							'taxonomy'   => $taxonomy,
							'hide_empty' => false,
							'orderby'    => 'name',
							'parent'     => absint( $term_id ),
							'fields'     => 'id=>name',
                        )
                    )
                );
                if ( ! empty( $child_terms ) && ! is_wp_error( $child_terms ) ) {
                    $child_html = $this->generate_hierarchical_taxonomy_html( $taxonomy, $child_terms, $post_terms, $add_cap, $level + 1 );
                }
            }

            $tax_html .= '<li><label><input type="checkbox" name="tax_input[' . $taxonomy . '][]" value="' . $term_id . '" ' . checked( in_array( $term_id, $post_terms ), true, false ) . '> ' . $term_name . '</label>' . $child_html . '</li>';
        }
        $tax_html .= '</ul>';
        if ( $add_cap ) {
            $label = '';
            switch ( $taxonomy ) {
                case 'product_cat':
                    $label = __( 'Add new product category', 'multivendorx' );
                    break;
                default:
                    $label = __( 'Add new item', 'multivendorx' );
            }
            $tax_html .= '<a href="#">' . $label . '</a>';
        }
        return $tax_html;
    }

    public static function mvx_list_categories( $args = array() ) {
        global $wp_version;
        $defaults = array(
            'orderby'           => 'name',
            'order'             => 'ASC',
            'hide_empty'        => true,
            'exclude'           => array(),
            'exclude_tree'      => array(),
            'include'           => array(),
            'number'            => '',
            'fields'            => 'all',
            'slug'              => '',
            'parent'            => 0,
            'hierarchical'      => true,
            'child_of'          => 0,
            'childless'         => false,
            'get'               => '',
            'name__like'        => '',
            'description__like' => '',
            'pad_counts'        => false,
            'offset'            => '',
            'search'            => '',
            'show_count'        => false,
            'taxonomy'          => 'product_cat',
            'show_option_none'  => __( 'No categories', 'multivendorx' ),
            'style'             => 'list',
            'selected'          => '',
            'list_class'        => '',
            'cat_link'          => false,
            'cache_domain'      => 'core',
            'html_list'         => false,
            'echo'              => false,
        );

        $r = apply_filters( 'mvx_before_list_categories_query_args', wp_parse_args( $args, $defaults ), $args );

        $taxonomy = $r['taxonomy'];

        if ( ! taxonomy_exists( $taxonomy ) ) {
            return false;
        }

        if ( version_compare( $wp_version, '4.5.0', '>=' ) ) {
            // Since 4.5.0, taxonomies should be passed via the ‘taxonomy’ argument in the $args array
            $categories = get_terms( $r );
        } else {
            // Prior to 4.5.0, the first parameter of get_terms() was a taxonomy or list of taxonomies
            $categories = get_terms( $taxonomy, $r );
        }

        if ( is_wp_error( $categories ) ) {
            $categories = array();
        } else {
            $categories = (array) $categories;
            foreach ( array_keys( $categories ) as $k ) {
                _make_cat_compat( $categories[ $k ] );
            }
        }
        // for No html output
        if ( ! $r['html_list'] ) {
            return $categories;
        }

        $output     = '';
        $list_class = apply_filters( 'mvx_list_categories_list_style_classes', $r['list_class'] );
        if ( empty( $categories ) ) {
            if ( ! empty( $r['show_option_none'] ) ) {
                if ( 'list' == $r['style'] ) {
                    $output .= '<li class="' . $list_class . ' cat-item-none">' . $r['show_option_none'] . '</li>';
                } else {
                    $output .= $r['show_option_none'];
                }
            }
        } else {
            foreach ( $categories as $key => $cat ) {
                $list_class  = empty( $r['list_class'] ) ? 'cat-item cat-item-' . $cat->term_id : $r['list_class'] . ' cat-item cat-item-' . $cat->term_id;
                $child_terms = get_term_children( $cat->term_id, $taxonomy );
                // show count
                $inner_html = '';
                if ( $r['show_count'] || $child_terms ) {
                    $inner_html .= ' <span class="pull-right">';
                    if ( $r['show_count'] ) {
                        $inner_html .= '<span class="count ' . apply_filters( 'mvx_list_categories_show_count_style_classess', 'badge badge-primary badge-pill ', $cat ) . '">' . $cat->count . '</span>';
                    }

                    if ( $child_terms ) {
                        $list_class .= ' has-children';
                        // $inner_html .= ' <i class="mvx-font ico-right-arrow-icon"></i>';
                    }
                    $inner_html .= '</span>';
                }
                // has selected term
                if ( ! empty( $r['selected'] ) && $cat->term_id == $r['selected'] ) {
					$list_class .= ' active';
                }
                $list_class = apply_filters( 'mvx_list_categories_list_style_classes', $list_class, $cat );
                $link       = apply_filters( 'mvx_list_categories_get_term_link', ( $r['cat_link'] ) ? $r['cat_link'] : get_term_link( $cat->term_id, $taxonomy ), $cat, $r );
                if ( 'list' == $r['style'] ) {
                    // <li><a href="#"><span>Grocery & Gourmet Foods</span></a></li>
                    $output .= "<li class='$list_class' data-term-id='$cat->term_id' data-taxonomy='$taxonomy'><a href='$link'><span>" . apply_filters( 'mvx_list_categories_term_name', $cat->name, $cat ) . "</span></a>$inner_html</li>";
                } else {
                    $output .= "<a class='$list_class' href='$link' data-term-id='$cat->term_id' data-taxonomy='$taxonomy'>" . apply_filters( 'mvx_list_categories_term_name', $cat->name, $cat ) . "$inner_html</a>";
                }
            }
        }

        /**
         * Filters the HTML output of a taxonomy list.
         *
         * @since 3.2.0
         *
         * @param string $output HTML output.
         * @param array  $r   An array of taxonomy-listing arguments.
         */
        $html = apply_filters( 'mvx_list_categories', $output, $r );

        if ( $r['echo'] ) {
            echo $html;
        } else {
            return $html;
        }
    }
}