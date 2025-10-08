<?php
use MultiVendorX\Store\StoreUtil;

global $product;
$html = '';

$store = StoreUtil::get_products_vendor($product->get_id());
if ($store) {
    $html .= '<div class="single-product-vendor">';
    $html .= apply_filters('mvx_before_seller_info_tab', '');

    $details = MultiVendorX()->frontend->show_store_info($product->get_id());
    if ($details) {
        // Filter to control whether to show "Meet our ..." format
        $show_meet_text = apply_filters('mvx_show_meet_seller_text', true, $details);

        if ($show_meet_text) {
            $heading_text = sprintf(
                __('Meet our %1$s of shop %2$s', 'multivendorx'),
                esc_html($details['owner_name']),
                esc_html($details['name'])
            );
        } else {
            $heading_text = esc_html($details['name']);
        }

        // Start vendor info block
        $html .= '<div class="mvx-vendor-info">';
        $html .= $details['logo_html'];
        $html .= '<h2 class="vendor-heading">' . $heading_text . '</h2>';

        $rating_html = '<div class="vendor-rating">⭐️⭐️⭐️⭐️☆ (4.0 / 5)</div>';
        $html .= $rating_html;

        if (!empty($details['address'])) {
            $html .= '<p class="vendor-address"><strong>' . __('Address:', 'multivendorx') . '</strong> ' . esc_html($details['address']) . '</p>';
        }

        $store_details = MultiVendorX()->setting->get_setting('store_branding_details', []);
        if (in_array('show_store_description', $store_details) && !empty($details['description'])) {
            $html .= '<div class="vendor-description">' . apply_filters('the_content', $details['description']) . '</div>';
        }

        if (!empty($details['phone'])) {
            $html .= '<p class="vendor-phone"><strong>' . __('Phone:', 'multivendorx') . '</strong> ' . esc_html($details['phone']) . '</p>';
        }

        if (!empty($details['email'])) {
            $html .= '<p class="vendor-email"><strong>' . __('Email:', 'multivendorx') . '</strong> ' . esc_html($details['email']) . '</p>';
        }

        $html .= apply_filters('mvx_follow_button_html', '', $store->get_id(), get_current_user_id());

        $html .= '<p><a href="' . esc_url(MultiVendorX()->store->storeutil->get_store_url($store->get_id())) . '">'
            . sprintf(__('More Products from %1$s', 'multivendorx'), $store->get('name')) . '</a></p>';

        $html .= '</div>'; // .mvx-vendor-info
    }

    $html .= apply_filters('mvx_after_seller_info_tab', '');
    $html .= '</div>'; // .single-product-vendor

    echo $html;

    do_action('mvx_after_vendor_tab');
}
?>
