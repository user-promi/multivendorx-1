<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\ReportAbuse;

/**
 * MultiVendorX Questions Answers Ajax class
 *
 * @class       Ajax class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Ajax {
    public function __construct(){
        add_action('wp_ajax_mvx_follow_store', [$this, 'handle_follow_store']);
    }
    /**
     * Handle follow/unfollow via AJAX
     */
    public function handle_follow_store() {
        // Verify nonce
        check_ajax_referer('follow_store_ajax_nonce', 'nonce');
    
        // Get and sanitize input using filter_input
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_VALIDATE_INT);
        $user_id  = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
    
        if (!$store_id || !$user_id) {
            wp_send_json_error(['message' => 'Invalid data.']);
        }
    
        // Get the current user's following stores
        $following = get_user_meta($user_id, 'mvx_following_stores', true);
        if (!is_array($following)) {
            $following = [];
        }
    
        // Get store object
        $store = new \MultiVendorX\Store\Store($store_id);
    
        // Directly fetch followers from meta_data
        $followers_raw = $store->meta_data['followers'] ?? '[]';
        $followers = json_decode($followers_raw, true);
        if (!is_array($followers)) $followers = [];
    
        // Determine if the user is already following
        if (in_array($store_id, $following)) {
            // Unfollow
            $following = array_diff($following, [$store_id]);
            $followers = array_diff($followers, [$user_id]);
            $new_status = 'Follow';
        } else {
            // Follow
            $following[] = $store_id;
            $followers[] = $user_id;
            $new_status = 'Unfollow';
        }
    
        // Save updated data
        update_user_meta($user_id, 'mvx_following_stores', $following);
        $store->update_meta('followers', json_encode($followers));
    
        wp_send_json_success(['new_status' => $new_status]);
    }
    
}