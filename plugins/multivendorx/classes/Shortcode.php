<?php
/**
 * Modules Shortcode
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\StoreUtil;

/**
 * MultiVendorX Shortcode class.
 *
 * @class       Module class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Shortcode {

    /**
     * Shortcode class construct function
     */
    public function __construct() {
        add_shortcode( 'multivendorx_store_dashboard', array( $this, 'display_store_dashboard' ) );
        add_shortcode( 'multivendorx_store_registration', array( $this, 'display_store_registration' ) );
        add_shortcode( 'multivendorx_stores_list', array( $this, 'display_stores_list' ) );

        add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
        // add_action('wp_print_styles', array($this, 'dequeue_all_styles_on_page'), 99);
    }

    /**
     * Load frontend scripts
     */
    public function frontend_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-dashboard-components-script' );
        FrontendScripts::enqueue_script( 'multivendorx-dashboard-script' );
        FrontendScripts::localize_scripts( 'multivendorx-dashboard-script' );
        FrontendScripts::enqueue_style( 'multivendorx-dashboard-style' );
        FrontendScripts::enqueue_style( 'multivendorx-store-product-style' );

        // if (Utill::is_store_dashboard()) {
            // wp_deregister_style('wc-blocks-style');

            wp_enqueue_script( 'wp-element' );
            wp_enqueue_media();

            FrontendScripts::enqueue_script( 'multivendorx-store-dashboard-script' );
            // FrontendScripts::localize_scripts('multivendorx-store-dashboard-script');

		?>
            <style>
                <?php
                echo MultiVendorX()->setting->get_setting( 'custom_css_product_page', array() );
                ?>
            </style>
            <?php
			// }

			if ( Utill::is_store_registration_page() ) {
				FrontendScripts::enqueue_script( 'multivendorx-registration-form-script' );
				FrontendScripts::localize_scripts( 'multivendorx-registration-form-script' );
			}
    }

    /**
     * Dequeue all styles on page
     *
     * @return void
     */
    public static function dequeue_all_styles_on_page() {
        if ( Utill::is_store_dashboard() && is_user_logged_in() && in_array( 'store_owner', wp_get_current_user()->roles, true ) ) {
            global $wp_styles;
            $wp_styles->queue = array( 'multivendorx-dashboard-style', 'multivendorx-store-product-style', 'media-views', 'imgareaselect' );
        }
    }

    /**
     * Display store dashboard
     */
    public function display_store_dashboard() {
        ob_start();
        ?>
        <!-- <div id="multivendorx-vendor-dashboard">
        </div>  -->
        <?php
        $user = wp_get_current_user();
        if ( ! is_user_logged_in() ) {
            if ( ( 'no' === get_option( 'woocommerce_registration_generate_password' ) && ! is_user_logged_in() ) ) {
                wp_enqueue_script( 'wc-password-strength-meter' );
            }
            echo '<div class="mvx-dashboard woocommerce">';
            wc_get_template( 'myaccount/form-login.php' );
            echo '</div>';
        } else {
            MultiVendorX()->util->get_template( 'store/store-dashboard.php', array() );
        }

        return ob_get_clean();
    }

    /**
     * Display store registration form
     */
    public function display_store_registration() {
        ob_start();
        if ( is_user_logged_in() ) {
            ?>
            <div id="multivendorx-registration-form" class="woocommerce">
                <?php
                // Here you can render the actual registration form if needed.
                // Example: echo do_shortcode('[multivendorx_store_registration]');.
                ?>
            </div>
            <?php
        } else {
            echo '<div class="mvx-dashboard woocommerce">';
            echo '<div class="woocommerce-notices-wrapper"><div class="woocommerce-error">  <div class="wc-block-components-notice-banner__content"><strong> Kindly login before registration </strong></div></div></div>';
            wc_get_template( 'myaccount/form-login.php' );
            echo '</div>';
        }

        // Return the output buffer content.
        return ob_get_clean();
    }

    /**
     * Display stores list
     */
    public function display_stores_list() {
        ob_start();
        ?>
        <div id="multivendorx-stores-list">
        </div>
        <?php
        return ob_get_clean();
    }
}