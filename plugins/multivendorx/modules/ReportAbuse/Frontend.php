<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\ReportAbuse;
use MultiVendorX\FrontendScripts;


/**
 * MultiVendorX Follow Store Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_action('woocommerce_product_meta_start', array($this, 'add_report_abuse_link'), 30);
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );

    }

    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-follow-store-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-follow-store-frontend-script' );
    }

    /**
     * Store report abuse option
     */
    function add_report_abuse_link( $product_id = 0 ) {
        if ( ! $product_id && function_exists('get_the_ID') ) {
            $product_id = get_the_ID();
        }
        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return;
        }
    
        if ( apply_filters('mvx_show_report_abuse_link', true, $product) ) {
            $report_abuse_text = apply_filters('mvx_report_abuse_text', __('Report Abuse', 'multivendorx'), $product);
            $show_in_popup = apply_filters('mvx_show_report_abuse_form_popup', true, $product);
            ?>
            <div class="mvx-report-abuse-wrapper">
                <a href="javascript:void(0);" class="open-report-abuse"><?php echo esc_html($report_abuse_text); ?></a>
    
                <div class="report-abuse-form" style="display:none;">
                    <h3><?php echo sprintf(esc_html__('Report abuse for "%s"', 'multivendorx'), $product->get_name()); ?></h3>
                    <p><input type="text" class="report_abuse_name" placeholder="<?php esc_attr_e('Name', 'multivendorx'); ?>"></p>
                    <p><input type="email" class="report_abuse_email" placeholder="<?php esc_attr_e('Email', 'multivendorx'); ?>"></p>
                    <p><textarea class="report_abuse_msg" placeholder="<?php esc_attr_e('Message', 'multivendorx'); ?>"></textarea></p>
                    <input type="hidden" class="report_abuse_product_id" value="<?php echo esc_attr($product->get_id()); ?>">
                    <button type="button" class="submit-report-abuse"><?php esc_html_e('Report', 'multivendorx'); ?></button>
                </div>
            </div>
            <?php
        }
    }
    
    
    
    
    
    
}