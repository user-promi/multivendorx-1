<?php
use MultiVendorX\store\store;

$store_id = $args['store_id'];

$store = Store::get_store_by_id( $store_id );

if ( ! $store ) {
    return;
}

$meta_data  = $store->get_all_meta();
$banner     = $meta_data['banner'] ?? MultiVendorX()->plugin_url . 'assets/images/banner-placeholder.jpg';
$profile    = $meta_data['image'] ?? MultiVendorX()->plugin_url . 'assets/images/default-store.jpg';
$description = $store->get('description');

?>

<div class='mvx_bannersec_start mvx-theme01'>
    <div class="mvx-banner-wrap">
        <img src="<?php echo esc_url( $banner ); ?>" class="mvx-imgcls"/>
        <div class='mvx-banner-area'>
            <div class='mvx-bannerright'>
                <div class="socialicn-area">
                    <div class="mvx_social_profile">
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
                </div>
                <div class='mvx-butn-area'>
                    <?php do_action( 'mvx_additional_button_at_banner' ); ?>
                </div>
            </div>
        </div>

        <div class='mvx-banner-below'>
            <div class='mvx-profile-area'>
                <img src='<?php echo esc_attr($profile); ?>' class='mvx-profile-imgcls' />
            </div>
            <div>
                <div class="mvx-banner-middle">
                    <div class="mvx-heading"><?php echo esc_html($store->get('name')) ?></div>
                </div>
                <div class="mvx-contact-deatil">
                            

                    <?php do_action('mvx_after_vendor_information',$store_id);?>   
                </div>

                <?php if (!empty($description)) { ?>                
                    <div class="description_data"> 
                        <?php echo $description; ?>
                    </div>
                <?php } ?>
            </div>

            <div class="mvx_vendor_rating">
                  
            </div>  

        </div>

    </div>
</div>