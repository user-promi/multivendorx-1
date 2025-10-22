<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;

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
        add_action('wp_ajax_nopriv_mvx_get_follow_data', [$this, 'handle_get_follow_data']);
        add_action('wp_ajax_mvx_get_follow_data', [$this, 'handle_get_follow_data']);
    }
    
    public function handle_follow_store() {
        check_ajax_referer('follow_store_ajax_nonce', 'nonce');
    
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_VALIDATE_INT);
        $user_id  = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
    
        if (!$store_id || !$user_id) {
            wp_send_json_error(['message' => 'Invalid data.']);
        }
    
        $following = get_user_meta($user_id, 'mvx_following_stores', true);
        if (!is_array($following)) $following = [];
    
        $store = new \MultiVendorX\Store\Store($store_id);
    
        // Fetch followers with possible date info
        $followers_raw = $store->meta_data['followers'] ?? '[]';
        $followers = json_decode($followers_raw, true);
        if (!is_array($followers)) $followers = [];
    
        // Extract only user IDs for checking
        $follower_ids = array_column($followers, 'id');
    
        if (in_array($store_id, $following)) {
            // UNFOLLOW
            $following = array_diff($following, [$store_id]);
            $followers = array_filter($followers, fn($f) => $f['id'] != $user_id);
            $new_status = 'Follow';
        } else {
            // FOLLOW with timestamp
            $following[] = $store_id;
            $followers[] = [
                'id'   => $user_id,
                'date' => wp_date('c', time(), wp_timezone()), 
            ];
            $new_status = 'Unfollow';
        }
    
        // Save updates
        update_user_meta($user_id, 'mvx_following_stores', $following);
        $store->update_meta('followers', wp_json_encode(array_values($followers)));
    
        wp_send_json_success(['new_status' => $new_status]);
    }

    /**
     * Return button text & follower count
     */
    public function handle_get_follow_data() {
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_VALIDATE_INT);
        $user_id  = get_current_user_id();

        if ( ! $store_id ) {
            wp_send_json_error(['message' => 'Invalid store ID']);
        }

        $store = new \MultiVendorX\Store\Store($store_id);
        $followers = json_decode($store->meta_data['followers'] ?? '[]', true);

        if ( ! is_array($followers) ) {
            $followers = [];
        }

        // ✅ Handle old format (numeric user IDs)
        if ( isset($followers[0]) && is_int($followers[0]) ) {
            $followers = array_map(
                fn( $uid ) => [ 'id' => $uid, 'date' => '' ],
                $followers
            );
        }

        // ✅ Extract user IDs for comparison and count
        $follower_ids = array_column($followers, 'id');

        $following = $user_id ? get_user_meta($user_id, 'mvx_following_stores', true) : [];
        if ( ! is_array($following) ) {
            $following = [];
        }

        $is_following = in_array($store_id, $following, true);
        $button_text  = $user_id ? ( $is_following ? 'Unfollow' : 'Follow' ) : 'Login to Follow';

        wp_send_json_success([
            'button_text'    => $button_text,
            'follower_count' => count($follower_ids),
            'login_url'      => wc_get_page_permalink('myaccount'),
        ]);
    }

    
}