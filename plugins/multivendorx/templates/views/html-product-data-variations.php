<?php

/**
 * Variations product tab template
 *
 * Used by mvx-afm-add-product.php template
 *
 * This template can be overridden by copying it to yourtheme/mvx-pro/products/woocommerce/html-product-data-variations.php.
 *
 * HOWEVER, on occasion AFM will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @author 		MultiVendorX
 * @package 	MVX_FRONTEND_DASHBOARD/views/products/woocommerce
 * @version     3.0.0
 */
defined( 'ABSPATH' ) || exit;

global $wpdb;

$self = $args['self'];
$product_object = $args['product_object'];
$post = $args['post'];

$variation_attributes = array_filter( $product_object->get_attributes(), array( $self, 'filter_variation_attributes' ) );
$default_attributes = $product_object->get_default_attributes();
$variations_count = absint( $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(ID) FROM $wpdb->posts WHERE post_parent = %d AND post_type = 'product_variation' AND post_status IN ('publish', 'private')", $post->ID ) ) );
$variations_per_page = absint( apply_filters( 'woocommerce_admin_meta_boxes_variations_per_page', 15 ) );
$variations_total_pages = ceil( $variations_count / $variations_per_page );

?>

<div role="tabpanel" class="tab-pane fade collapsable-component-wrapper" id="variable_product_options">
    <div class="row-padding" id="variable_product_options_inner">
        <?php if ( ! count( $variation_attributes ) ) : ?>
        <div class="row">
            <div class="col-md-12">
                <div id="message" class="inline notice woocommerce-message">
                    <p><?php echo wp_kses_post( __( 'Before you can add a variation you need to add some variation attributes on the <strong>Attributes</strong> tab.', 'mvx-pro' ) ); ?></p>
                    <p><a class="button-primary" href="<?php echo esc_url( apply_filters( 'woocommerce_docs_url', 'https://docs.woocommerce.com/document/variable-product/', 'product-variations' ) ); ?>" target="_blank"><?php esc_html_e( 'Learn more', 'mvx-pro' ); ?></a></p>
                </div>
            </div>
        </div>
        <?php else : ?>
        <div class="row">
            <div class="col-md-12">
                <div class="toolbar variations-defaults">
                    <strong><?php esc_html_e( 'Default Form Values', 'mvx-pro' ); ?>: </strong>
                    <?php
                    foreach ( $variation_attributes as $attribute ) {
                        $selected_value = isset( $default_attributes[sanitize_title( $attribute->get_name() )] ) ? $default_attributes[sanitize_title( $attribute->get_name() )] : '';
                        ?>
                        <select name="default_attribute_<?php echo esc_attr( sanitize_title( $attribute->get_name() ) ); ?>" data-current="<?php echo esc_attr( $selected_value ); ?>" class="form-control inline-select">
                            <?php /* translators: WooCommerce attribute label */ ?>
                            <option value=""><?php esc_html( printf( __( 'No default %s&hellip;', 'mvx-pro' ), wc_attribute_label( $attribute->get_name() ) ) ); ?></option>
                            <?php if ( $attribute->is_taxonomy() ) : ?>
                                <?php foreach ( $attribute->get_terms() as $option ) : ?>
                                    <option <?php selected( $selected_value, $option->slug ); ?> value="<?php echo esc_attr( $option->slug ); ?>"><?php echo esc_html( apply_filters( 'woocommerce_variation_option_name', $option->name ) ); ?></option>
                                <?php endforeach; ?>
                            <?php else : ?>
                                <?php foreach ( $attribute->get_options() as $option ) : ?>
                                    <option <?php selected( $selected_value, $option ); ?> value="<?php echo esc_attr( $option ); ?>"><?php echo esc_html( apply_filters( 'woocommerce_variation_option_name', $option ) ); ?></option>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </select>
                        <?php
                    }
                    ?>
                    <hr>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="toolbar toolbar-top">
                    <select id="field_to_edit" class="variation_actions inline-select form-control">
                        <option data-global="true" value="add_variation"><?php esc_html_e( 'Add variation', 'mvx-pro' ); ?></option>
                        <option data-global="true" value="link_all_variations"><?php esc_html_e( 'Create variations from all attributes', 'mvx-pro' ); ?></option>
                        <option value="delete_all"><?php esc_html_e( 'Delete all variations', 'mvx-pro' ); ?></option>
                        <optgroup label="<?php esc_attr_e( 'Status', 'mvx-pro' ); ?>">
                            <option value="toggle_enabled"><?php esc_html_e( 'Toggle &quot;Enabled&quot;', 'mvx-pro' ); ?></option>
                            <option value="toggle_downloadable"><?php esc_html_e( 'Toggle &quot;Downloadable&quot;', 'mvx-pro' ); ?></option>
                            <option value="toggle_virtual"><?php esc_html_e( 'Toggle &quot;Virtual&quot;', 'mvx-pro' ); ?></option>
                        </optgroup>
                        <optgroup label="<?php esc_attr_e( 'Pricing', 'mvx-pro' ); ?>">
                            <option value="variable_regular_price"><?php esc_html_e( 'Set regular prices', 'mvx-pro' ); ?></option>
                            <option value="variable_regular_price_increase"><?php esc_html_e( 'Increase regular prices (fixed amount or percentage)', 'mvx-pro' ); ?></option>
                            <option value="variable_regular_price_decrease"><?php esc_html_e( 'Decrease regular prices (fixed amount or percentage)', 'mvx-pro' ); ?></option>
                            <option value="variable_sale_price"><?php esc_html_e( 'Set sale prices', 'mvx-pro' ); ?></option>
                            <option value="variable_sale_price_increase"><?php esc_html_e( 'Increase sale prices (fixed amount or percentage)', 'mvx-pro' ); ?></option>
                            <option value="variable_sale_price_decrease"><?php esc_html_e( 'Decrease sale prices (fixed amount or percentage)', 'mvx-pro' ); ?></option>
                            <option value="variable_sale_schedule"><?php esc_html_e( 'Set scheduled sale dates', 'mvx-pro' ); ?></option>
                        </optgroup>
                        <optgroup label="<?php esc_attr_e( 'Inventory', 'mvx-pro' ); ?>">
                            <option value="toggle_manage_stock"><?php esc_html_e( 'Toggle &quot;Manage stock&quot;', 'mvx-pro' ); ?></option>
                            <option value="variable_stock"><?php esc_html_e( 'Stock', 'mvx-pro' ); ?></option>
                            <option value="variable_stock_status_instock"><?php esc_html_e( 'Set Status - In stock', 'mvx-pro' ); ?></option>
                            <option value="variable_stock_status_outofstock"><?php esc_html_e( 'Set Status - Out of stock', 'mvx-pro' ); ?></option>
                            <option value="variable_stock_status_onbackorder"><?php esc_html_e( 'Set Status - On backorder', 'mvx-pro' ); ?></option>
                        </optgroup>
                        <optgroup label="<?php esc_attr_e( 'Shipping', 'mvx-pro' ); ?>">
                            <option value="variable_length"><?php esc_html_e( 'Length', 'mvx-pro' ); ?></option>
                            <option value="variable_width"><?php esc_html_e( 'Width', 'mvx-pro' ); ?></option>
                            <option value="variable_height"><?php esc_html_e( 'Height', 'mvx-pro' ); ?></option>
                            <option value="variable_weight"><?php esc_html_e( 'Weight', 'mvx-pro' ); ?></option>
                        </optgroup>
                        <optgroup label="<?php esc_attr_e( 'Downloadable products', 'mvx-pro' ); ?>">
                            <option value="variable_download_limit"><?php esc_html_e( 'Download limit', 'mvx-pro' ); ?></option>
                            <option value="variable_download_expiry"><?php esc_html_e( 'Download expiry', 'mvx-pro' ); ?></option>
                        </optgroup>
                        <?php do_action( 'woocommerce_variable_product_bulk_edit_actions' ); ?>
                    </select>
                    <a class="btn btn-default bulk_edit do_variation_action"><?php esc_html_e( 'Go', 'mvx-pro' ); ?></a>
                    <div class="variations-pagenav">
                        <?php /* translators: variations count */ ?>
                        <span class="displaying-num"><?php echo esc_html( sprintf( _n( '%s item', '%s items', $variations_count, 'mvx-pro' ), $variations_count ) ); ?></span>
                        <span class="expand-close">
                            (<a href="#" class="expand_all"><?php esc_html_e( 'Expand', 'mvx-pro' ); ?></a> / <a href="#" class="close_all"><?php esc_html_e( 'Close', 'mvx-pro' ); ?></a>)
                        </span>
                        <span class="pagination-links">
                            <a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'mvx-pro' ); ?>" href="#">&laquo;</a>
                            <a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'mvx-pro' ); ?>" href="#">&lsaquo;</a>
                            <span class="paging-select">
                                <label for="current-page-selector-1" class="screen-reader-text"><?php esc_html_e( 'Select Page', 'mvx-pro' ); ?></label>
                                <select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'mvx-pro' ); ?>">
                                    <?php for ( $i = 1; $i <= $variations_total_pages; $i++ ) : ?>
                                        <option value="<?php echo $i; // WPCS: XSS ok. ?>"><?php echo $i; // WPCS: XSS ok. ?></option>
                                    <?php endfor; ?>
                                </select>
                                <?php echo esc_html_x( 'of', 'number of pages', 'mvx-pro' ); ?> <span class="total-pages"><?php echo esc_html( $variations_total_pages ); ?></span>
                            </span>
                            <a class="next-page" title="<?php esc_attr_e( 'Go to the next page', 'mvx-pro' ); ?>" href="#">&rsaquo;</a>
                            <a class="last-page" title="<?php esc_attr_e( 'Go to the last page', 'mvx-pro' ); ?>" href="#">&raquo;</a>
                        </span>
                    </div>
                </div>
            </div> 
        </div>
        <?php
        // esc_attr does not double encode - htmlspecialchars does.
        $attributes_data = htmlspecialchars( wp_json_encode( wc_list_pluck( $variation_attributes, 'get_data' ) ) );
        ?>
        <div class="row">
            <div class="col-md-12">
                <div class="woocommerce_variations product-variations-wrapper wc-metaboxes" data-attributes="<?php echo $attributes_data; // WPCS: XSS ok.   ?>" data-total="<?php echo esc_attr( $variations_count ); ?>" data-total_pages="<?php echo esc_attr( $variations_total_pages ); ?>" data-page="1" data-edited="false">
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="toolbar button-group">
                    <button type="button" class="btn btn-default save-variation-changes" disabled="disabled"><?php esc_html_e( 'Save changes', 'mvx-pro' ); ?></button>
                    <button type="button" class="btn btn-default cancel-variation-changes" disabled="disabled"><?php esc_html_e( 'Cancel', 'mvx-pro' ); ?></button>

                    <div class="variations-pagenav">
                        <?php /* translators: variations count */ ?>
                        <span class="displaying-num"><?php echo esc_html( sprintf( _n( '%s item', '%s items', $variations_count, 'mvx-pro' ), $variations_count ) ); ?></span>
                        <span class="expand-close">
                            (<a href="#" class="expand_all"><?php esc_html_e( 'Expand', 'mvx-pro' ); ?></a> / <a href="#" class="close_all"><?php esc_html_e( 'Close', 'mvx-pro' ); ?></a>)
                        </span>
                        <span class="pagination-links">
                            <a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'mvx-pro' ); ?>" href="#">&laquo;</a>
                            <a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'mvx-pro' ); ?>" href="#">&lsaquo;</a>
                            <span class="paging-select">
                                <label for="current-page-selector-1" class="screen-reader-text"><?php esc_html_e( 'Select Page', 'mvx-pro' ); ?></label>
                                <select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'mvx-pro' ); ?>">
                                    <?php for ( $i = 1; $i <= $variations_total_pages; $i ++ ) : ?>
                                        <option value="<?php echo $i; // WPCS: XSS ok.  ?>"><?php echo $i; // WPCS: XSS ok.  ?></option>
                                    <?php endfor; ?>
                                </select>
                                <?php echo esc_html_x( 'of', 'number of pages', 'mvx-pro' ); ?> <span class="total-pages"><?php echo esc_html( $variations_total_pages ); ?></span>
                            </span>
                            <a class="next-page" title="<?php esc_attr_e( 'Go to the next page', 'mvx-pro' ); ?>" href="#">&rsaquo;</a>
                            <a class="last-page" title="<?php esc_attr_e( 'Go to the last page', 'mvx-pro' ); ?>" href="#">&raquo;</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>
