<?php
/**
 * The template for displaying single product page vendor tab 
 *
 * Override this template by copying it to yourtheme/MultiVendorX/policies-tab.php
 *
 * @author 		MultiVendorX
 * @package MultiVendorX/Templates
 * @version   2.3.0
 */

use MultiVendorX\Store\StoreUtil;

$store_id = $args['store_id'];
$policies = StoreUtil::get_store_policies($store_id);

if (empty($policies)) {
    echo 'No policy found.';
}
?>
<!-- <div class="mvx-product-policies">
    <?php if( !empty($policies['store_policy']) ){ ?>
    <div class="multivendorx-shipping-policies">
        <div class="heading"><?php echo esc_html_e('Store Policy', 'multivendorx'); ?></div>
        <div class="description" ><?php echo wp_kses_post($policies['store_policy']); ?></div>
    </div>
    <?php } if( !empty($policies['shipping_policy']) ){ ?>
    <div class="multivendorx-shipping-policies">
        <div class="heading"><?php echo esc_html_e('Shipping Policy', 'multivendorx'); ?></div>
        <div class="description" ><?php echo wp_kses_post($policies['shipping_policy']); ?></div>
    </div>
    <?php } if( !empty($policies['refund_policy']) ){ ?>
    <div class="multivendorx-shipping-policies">
        <div class="heading"><?php echo esc_html_e('Refund Policy', 'multivendorx'); ?></div>
        <div class="description" ><?php echo wp_kses_post($policies['refund_policy']); ?></div>
    </div>
    <?php } if( !empty($policies['cancellation_policy']) ){ ?>
    <div class="multivendorx-shipping-policies">
        <div class="heading"><?php echo esc_html_e('Cancellation / Return / Exchange Policy', 'multivendorx'); ?></div>
        <div class="description" ><?php echo wp_kses_post($policies['cancellation_policy']); ?></div>
    </div>
    <?php } ?>
</div> -->
<div class="multivendorx-policies-accordion">
    <?php 
    $policies_list = [
        'store_policy'        => __('Store Policy', 'multivendorx'),
        'shipping_policy'     => __('Shipping Policy', 'multivendorx'),
        'refund_policy'       => __('Refund Policy', 'multivendorx'),
        'cancellation_policy' => __('Cancellation / Return / Exchange Policy', 'multivendorx'),
    ];

    foreach($policies_list as $key => $label) :
        if(!empty($policies[$key])) : ?>
            <div class="accordion-item">
                <div class="accordion-header"><?php echo esc_html($label); ?></div>
                <div class="accordion-body"><?php echo wp_kses_post($policies[$key]); ?></div>
            </div>
        <?php endif;
    endforeach;
    ?>
</div>
