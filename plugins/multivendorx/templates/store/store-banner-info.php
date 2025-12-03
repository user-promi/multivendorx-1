<?php
/**
 * Template to display the vendor store banner and details.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-banner-info.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

use MultiVendorX\store\store;

$store_id = $args['store_id'];

$store = Store::get_store_by_id( $store_id );

if ( ! $store ) {
    return;
}

$meta_data         = $store->get_all_meta();
$banner            = $meta_data['banner'] ?? MultiVendorX()->plugin_url . 'assets/images/banner-placeholder.jpg';
$profile           = $meta_data['image'] ?? MultiVendorX()->plugin_url . 'assets/images/default-store.jpg';
$description       = $store->get( 'description' );
$template          = MultiVendorX()->setting->get_setting( 'store_banner_template', array() );
$selected_template = isset( $template['selectedPalette'] ) ? $template['selectedPalette'] : 'template1';

?>

<div class="multivendorx-banner <?php echo esc_attr( $selected_template ); ?>">
    <div class="banner-img">
        <?php if ( ! empty( $banner ) ) : ?>
            <img src="<?php echo esc_url( $banner ); ?>" alt="">
        <?php else : ?>
            <div class="no-banner">1500 X 900</div>
        <?php endif; ?>
    </div>
    <div class='banner-right'>
        <div class="social-profile">
            <?php if ( ! empty( $meta_data['facebook'] ) ) : ?>
                <a target="_blank" href="<?php echo esc_url( $meta_data['facebook'] ); ?>">
                    <i class="dashicons dashicons-facebook"></i>
                </a>
            <?php endif; ?>

            <?php if ( ! empty( $meta_data['twitter'] ) ) : ?>
                <a target="_blank" href="<?php echo esc_url( $meta_data['twitter'] ); ?>">
                    <i class="dashicons dashicons-twitter"></i>
                </a>
            <?php endif; ?>

            <?php if ( ! empty( $meta_data['linkedin'] ) ) : ?>
                <a target="_blank" href="<?php echo esc_url( $meta_data['linkedin'] ); ?>">
                    <i class="dashicons dashicons-instagram"></i>
                </a>
            <?php endif; ?>

            <?php if ( ! empty( $meta_data['youtube'] ) ) : ?>
                <a target="_blank" href="<?php echo esc_url( $meta_data['youtube'] ); ?>">
                    <i class="dashicons dashicons-youtube"></i>
                </a>
            <?php endif; ?>

            <?php if ( ! empty( $meta_data['instagram'] ) ) : ?>
                <a target="_blank" href="<?php echo esc_url( $meta_data['instagram'] ); ?>">
                    <i class="dashicons dashicons-linkedin"></i>
                </a>
            <?php endif; ?>

            <?php do_action( 'mvx_vendor_store_header_social_link', $store_id ); ?>

        </div>
        <div class='multivendorx-butn-area'>
            <?php do_action( 'mvx_additional_button_at_banner' ); ?>
        </div>
    </div>
    <div class='store-details'>
        <div class='profile'>
            <?php if ( ! empty( $profile ) ) : ?>
                <div class="multivendorx-profile-img">
                <img src="<?php echo esc_url( $profile ); ?>" alt="">
                </div>
            <?php else : ?>
                <div class="multivendorx-profile-img placeholder">400 x 400</div>
            <?php endif; ?>

        </div>
        <div class="details">
            <div class="heading"><?php echo esc_html( $store->get( 'name' ) ); ?></div>
            <div class="container">

                <div class="contact-details">
                    <div class="row">
                        <?php
                        // Show email if not hidden.
                        if ( ! empty( $meta_data['email'] ) && ( $meta_data['hideEmail'] ?? 'no' ) === 'no' ) {
                            echo '<div class="store-email"><i class="adminlib-mail"></i> ' . esc_html( $meta_data['email'] ) . '</div>';
                        }

                        // Show phone if not hidden.
                        if ( ! empty( $meta_data['phone'] ) && ( $meta_data['hidePhone'] ?? 'no' ) === 'no' ) {
                            echo '<div class="store-phone"> <i class="adminlib-form-phone"></i>' . esc_html( $meta_data['phone'] ) . '</div>';
                        }
                        ?>
                    </div>
                    <?php
                    // Show full address.
                    $address = trim( ( $meta_data['address_1'] ?? '' ) . ' ' . ( $meta_data['address_2'] ?? '' ) );
                    if ( ! empty( $address ) ) {
                        echo '<div class="store-address"> <i class="adminlib-location"></i>' . esc_html( $address ) . '</div>';
                    }
                    ?>
                    <?php if ( ! empty( $description ) ) { ?>
                        <div class="description_data">
                            <?php echo wp_kses_post( $description ); ?>
                        </div>
                    <?php } ?>
                </div>
                <?php

                do_action( 'mvx_after_vendor_information', $store_id );
                ?>
            </div>
        </div>

        <div class="multivendorx-vendor-rating">
            <!-- You can insert vendor rating stars here -->
        </div>
    </div>
</div>