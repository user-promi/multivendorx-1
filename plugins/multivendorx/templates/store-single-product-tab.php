<?php

/**
 * The template for displaying single product page vendor tab 
 *
 * Override this template by copying it to yourtheme/MultiVendorX/vendor_tab.php
 *
 * @author 		MultiVendorX
 * @package MultiVendorX/Templates
 * @version   2.2.0
 */

use MultiVendorX\Store\StoreUtil;

global $product;
$html = '';
$store = StoreUtil::get_products_vendor($product->get_id());
if ($store) {
    $html .= '<div class="single-product-vendor">';
    $html .= apply_filters('mvx_before_seller_info_tab', '');

    $details = MultiVendorX()->frontend->show_store_info($product->get_id());
    if ($details)  {
        $html .= $details['logo_html'] . '<h2>' . $details['name'] . '</h2>';
    }
    echo $html;
    
    // review add later 

    $html = '';
    $store_details = MultiVendorX()->setting->get_setting( 'store_branding_details' );
    if (in_array( 'show_store_description', $store_details )) {
        $html .= apply_filters('the_content', $store->get('description') );
    }
    $html .= '<p><a href="' . esc_url( MultiVendorX()->store->storeutil->get_store_url( $store->get_id() ) ) . '">' . sprintf(__('More Products from %1$s', 'multivendorx'), $store->get('name')) . '</a></p>';
    $html .= apply_filters('mvx_after_seller_info_tab', '');
    $html .= '</div>';
    echo $html;
    do_action('mvx_after_vendor_tab');
}
?>