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
        $login_url = wc_get_page_permalink('myaccount');
    
        // Not logged in — redirect on button click
        if ( ! $current_user_id ) {
            echo '<button class="mvx-follow-btn" 
                        data-store-id="'. esc_attr($store_id) .'" 
                        onclick="window.location.href=\''. esc_url($login_url) .'\'">
                    Login to Follow
                </button>';
            return;
        }
    
        // Check if user already follows this store
        $following = get_user_meta( $current_user_id, 'mvx_following_stores', true );
        if ( ! is_array( $following ) ) $following = array();
        $is_following = in_array( $store_id, $following );
    
        $button_text = $is_following ? 'Unfollow' : 'Follow';
    
        echo '<button class="mvx-follow-btn" 
                    data-store-id="'. esc_attr($store_id) .'" 
                    data-user-id="'. esc_attr($current_user_id) .'">
                '. esc_html($button_text) .'
            </button>';
    }
    
    
    
    
    
}