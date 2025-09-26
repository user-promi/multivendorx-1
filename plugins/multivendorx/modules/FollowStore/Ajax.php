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
    
    /**
     * Follow/unfollow store
     */
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
        $followers = json_decode($store->meta_data['followers'] ?? '[]', true);
        if (!is_array($followers)) $followers = [];

        if (in_array($store_id, $following)) {
            $following = array_diff($following, [$store_id]);
            $followers = array_diff($followers, [$user_id]);
            $new_status = 'Follow';
        } else {
            $following[] = $store_id;
            $followers[] = $user_id;
            $new_status = 'Unfollow';
        }

        update_user_meta($user_id, 'mvx_following_stores', $following);
        $store->update_meta('followers', json_encode(array_values($followers))); // ensure numeric keys

        wp_send_json_success(['new_status' => $new_status]);
    }

    /**
     * Return button text & follower count
     */
    public function handle_get_follow_data() {
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_VALIDATE_INT);
        $user_id  = get_current_user_id();

        if (!$store_id) wp_send_json_error(['message' => 'Invalid store ID']);

        $store = new \MultiVendorX\Store\Store($store_id);
        $followers = json_decode($store->meta_data['followers'] ?? '[]', true);
        if (!is_array($followers)) $followers = [];

        $following = $user_id ? get_user_meta($user_id, 'mvx_following_stores', true) : [];
        if (!is_array($following)) $following = [];
        $is_following = in_array($store_id, $following);

        $button_text = $user_id ? ($is_following ? 'Unfollow' : 'Follow') : 'Login to Follow';

        wp_send_json_success([
            'button_text'    => $button_text,
            'follower_count' => count($followers),
            'login_url'      => wc_get_page_permalink('myaccount'),
        ]);
    }
    
}