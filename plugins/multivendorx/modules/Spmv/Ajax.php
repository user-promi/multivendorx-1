<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SPMV;

/**
 * MultiVendorX SPMV Ajax class
 *
 * @class       Ajax class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Ajax {
    public function __construct(){

        add_action('wp_ajax_mvx_auto_search_product', array($this, 'mvx_auto_suggesion_product'));
        add_action('wp_ajax_nopriv_mvx_auto_search_product', array($this, 'mvx_auto_suggesion_product'));

        // add_action('wp_ajax_single_product_multiple_vendors_sorting', array($this, 'single_product_multiple_vendors_sorting'));
        // add_action('wp_ajax_nopriv_single_product_multiple_vendors_sorting', array($this, 'single_product_multiple_vendors_sorting'));


    }

    public function mvx_auto_suggesion_product() {
        check_ajax_referer('search-products', 'security');
        $user = wp_get_current_user();
        $term = wc_clean(empty($term) ? stripslashes(wc_clean($_REQUEST['protitle'])) : $term);
        $is_admin = isset($_REQUEST['is_admin']) ? wc_clean($_REQUEST['is_admin']) : '';

        if (empty($term)) {
            wp_die();
        }

        $data_store = \WC_Data_Store::load('product');
        $ids = $data_store->search_products($term, '', false);

        $include = array();
        foreach ($ids as $id) {
            $product_map_id = get_post_meta($id, '_mvx_spmv_map_id', true);
            if ($product_map_id) {
                $results = Util::fetch_products_map($product_map_id);
                $product_ids = wp_list_pluck($results, 'product_id');
                if($product_ids){
                    $include[] = min($product_ids);
                }
            } else {
                $include[] = $id;
            }
        }

        if ($include) {
            $ids = array_slice(array_intersect($ids, $include), 0, 10);
        } else {
            $ids = array();
        }
        $product_objects = apply_filters('mvx_auto_suggesion_product_objects', array_map('wc_get_product', $ids), $user);
        $html = '';
        if (count($product_objects) > 0) {
            $html .= "<ul>";
            foreach ($product_objects as $product_object) {
                if ($product_object) {
                    // if ( mvx_is_product_type_avaliable($product_object->get_type())) {
                    //     if ($is_admin == 'false') {
                    //         $html .= "<li><a data-product_id='{$product_object->get_id()}' href='javascript:void(0)'>" . rawurldecode($product_object->get_formatted_name()) . "</a></li>";
                    //     } else {
                    //         $html .= "<li data-element='{$product_object->get_id()}'><a href='" . wp_nonce_url(admin_url('edit.php?post_type=product&action=duplicate_product&singleproductmultiseller=1&post=' . $product_object->get_id()), 'woocommerce-duplicate-product_' . $product_object->get_id()) . "'>" . rawurldecode($product_object->get_formatted_name()) . "</a></li>";
                    //     }
                    // } else
                    if (current_user_can('edit_products')) {
                        $html .= "<li data-element='{$product_object->get_id()}'><a href='" . wp_nonce_url(admin_url('edit.php?post_type=product&action=duplicate_product&singleproductmultiseller=1&post=' . $product_object->get_id()), 'woocommerce-duplicate-product_' . $product_object->get_id()) . "'>" . rawurldecode($product_object->get_formatted_name()) . "</a></li>";
                    }
                }
            }
            $html .= "</ul>";
        } else {
            $html .= "<ul><li class='mvx_no-suggesion'>" . __('No Suggestion found', 'multivendorx') . "</li></ul>";
        }

        wp_send_json(array('html' => $html, 'results_count' => count($product_objects)));
    }

    function single_product_multiple_vendors_sorting() {
        global $MVX;
        $sorting_value = isset($_POST['sorting_value']) ? wc_clean($_POST['sorting_value']) : 0;
        $attrid = isset($_POST['attrid']) ? absint($_POST['attrid']) : 0;
        $more_products = $this->get_multiple_vendors_array_for_single_product($attrid);
        $more_product_array = $more_products['more_product_array'];
        $results = $more_products['results'];
        $MVX->template->get_template('single-product/multiple-vendors-products-body.php', array('more_product_array' => $more_product_array, 'sorting' => $sorting_value));
        die;
    }

    function get_multiple_vendors_array_for_single_product($post_id) {
        $product = wc_get_product( $post_id );
        $more_product_array = $mapped_products = array();
        $has_product_map_id = get_post_meta( $product->get_id(), '_mvx_spmv_map_id', true );
        if( $has_product_map_id ){
            $products_map_data_ids = get_mvx_spmv_products_map_data( $has_product_map_id );
            $mapped_products = array_diff( $products_map_data_ids, array( $product->get_id() ) );
            $more_product_array = get_mvx_more_spmv_products( $product->get_id() );
        }
        return array('results' => $mapped_products, 'more_product_array' => $more_product_array);
    }

    function get_mvx_more_spmv_products( $product_id = 0 ) {
        if( !$product_id ) return array();
        $more_products = array();
        $has_product_map_id = get_post_meta( $product_id, '_mvx_spmv_map_id', true );
        if( $has_product_map_id ){
            $products_map_data_ids = get_mvx_spmv_products_map_data( $has_product_map_id );
            $mapped_products = array_diff( $products_map_data_ids, array( $product_id ) );
            if( $mapped_products && count( $mapped_products ) >= 1 ){
                $i = 0;
                foreach ( $mapped_products as $p_id ) {
                    $p_author = absint( get_post_field( 'post_author', $p_id ) );
                    $p_obj = wc_get_product( $p_id );
                    if( $p_obj ){
                        if ( !$p_obj->is_visible() || get_post_status ( $p_id ) != 'publish' ) continue;
                        if ( is_user_mvx_pending_vendor( $p_author ) || is_user_mvx_rejected_vendor( $p_author ) && absint( get_post_field( 'post_author', $product_id ) ) == $p_author ) continue;
                        $product_vendor = get_mvx_product_vendors( $p_id );
                        if ( $product_vendor ){
                            $more_products[$i]['seller_name'] = $product_vendor->page_title;
                            $more_products[$i]['is_vendor'] = 1;
                            $more_products[$i]['shop_link'] = $product_vendor->permalink;
                            $more_products[$i]['rating_data'] = mvx_get_vendor_review_info( $product_vendor->term_id );
                        } else {
                            $user_info = get_userdata($p_author);
                            $more_products[$i]['seller_name'] = isset( $user_info->data->display_name ) ? $user_info->data->display_name : '';
                            $more_products[$i]['is_vendor'] = 0;
                            $more_products[$i]['shop_link'] = get_permalink(wc_get_page_id('shop'));
                            $more_products[$i]['rating_data'] = 'admin';
                        }
                        $currency_symbol = get_woocommerce_currency_symbol();
                        $regular_price_val = $p_obj->get_regular_price();
                        $sale_price_val = $p_obj->get_sale_price();
                        $price_val = $p_obj->get_price();
                        $more_products[$i]['product_name'] = $p_obj->get_title();
                        $more_products[$i]['regular_price_val'] = $regular_price_val;
                        $more_products[$i]['sale_price_val'] = $sale_price_val;
                        $more_products[$i]['price_val'] = $price_val;
                        $more_products[$i]['product_id'] = $p_obj->get_id();
                        $more_products[$i]['product_type'] = $p_obj->get_type();
                        if ($p_obj->get_type() == 'variable') {
                            $more_products[$i]['_min_variation_price'] = get_post_meta( $p_obj->get_id(), '_min_variation_price', true );
                            $more_products[$i]['_max_variation_price'] = get_post_meta( $p_obj->get_id(), '_max_variation_price', true );
                            $variable_min_sale_price = get_post_meta( $p_obj->get_id(), '_min_variation_sale_price', true );
                            $variable_max_sale_price = get_post_meta( $p_obj->get_id(), '_max_variation_sale_price', true );
                            $more_products[$i]['_min_variation_sale_price'] = $variable_min_sale_price ? $variable_min_sale_price : $more_products[$i]['_min_variation_price'];
                            $more_products[$i]['_max_variation_sale_price'] = $variable_max_sale_price ? $variable_max_sale_price : $more_products[$i]['_max_variation_price'];
                            $more_products[$i]['_min_variation_regular_price'] = get_post_meta( $p_obj->get_id(), '_min_variation_regular_price', true );
                            $more_products[$i]['_max_variation_regular_price'] = get_post_meta( $p_obj->get_id(), '_max_variation_regular_price', true );
                        }
                    }
                    $i++;
                }
            }
        }
        return apply_filters( 'mvx_more_spmv_products', $more_products, $product_id );
    }
}