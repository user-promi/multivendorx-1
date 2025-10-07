<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;
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
        add_action('mvx_after_vendor_information', array($this, 'render_follow_button'), 10, 1);
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );

    }

    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-follow-store-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-follow-store-frontend-script' );
    }

    public function render_follow_button( $store_id = 0 ) {
        if ( empty( $store_id ) ) {
            return;
        }
    
        $current_user_id = get_current_user_id();
        
        echo '<div class="follow-wrapper">';
        // Render single button with placeholders
        echo '<button class="follow-btn admin-btn btn-purple" 
                    data-store-id="' . esc_attr($store_id) . '" 
                    data-user-id="' . esc_attr($current_user_id) . '">
                Loading...
            </button>';
    
        // Follower count placeholder
        echo ' <span class="follower-count" id="followers-count-' . esc_attr($store_id) . '">...</span>';
        echo '</div>';
    }
    
}
