<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;

use MultiVendorX\Utill;

/**
 * MultiVendorX Questions Answers Ajax class
 *
 * @class       Ajax class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Ajax {
    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'wp_ajax_multivendorx_follow_store_toggle', array( $this, 'multivendorx_follow_store_toggle' ) );
        add_action( 'wp_ajax_multivendorx_get_store_follow_status', array( $this, 'multivendorx_get_store_follow_status' ) );
        add_action( 'wp_ajax_nopriv_multivendorx_get_store_follow_status', array( $this, 'multivendorx_get_store_follow_status' ) );
    }

    /**
     * Toggle follow/unfollow for a store via AJAX.
     *
     * Updates user following list and store followers. Returns JSON success or error.
     *
     * @return void
     */
    public function multivendorx_follow_store_toggle() {
        if ( ! check_ajax_referer( 'follow_store_ajax_nonce', 'nonce', false ) ) {
            wp_send_json_error( array( 'message' => 'Invalid request.' ) );
        }
        $store_id = filter_input( INPUT_POST, 'store_id', FILTER_VALIDATE_INT );
        $user_id  = filter_input( INPUT_POST, 'user_id', FILTER_VALIDATE_INT );

        if ( ! $store_id || ! $user_id ) {
            wp_send_json_error( array( 'message' => 'Invalid data.' ) );
        }

        $following = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], true );
        if ( ! is_array( $following ) ) {
			$following = array();
        }

        $store = new \MultiVendorX\Store\Store( $store_id );

        // Fetch followers with possible date info.
        $followers = json_decode(
            (string) ( $store->meta_data[ Utill::STORE_SETTINGS_KEYS['followers'] ] ?? '[]' ),
            true
        );
        $followers = is_array( $followers ) ? $followers : array();

        if ( in_array( $store_id, $following, true ) ) {
            $following = array_diff( $following, array( $store_id ) );
            $followers = array_filter( $followers, fn( $f ) => $f['id'] !== $user_id );
            $follow    = false;
        } else {
            $following[] = $store_id;
            $followers[] = array(
                'id'   => $user_id,
                'date' => wp_date( 'c', time(), wp_timezone() ),
            );
            $follow      = true;
        }
        // Save updates.
        update_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], $following );
        $store->update_meta( Utill::STORE_SETTINGS_KEYS['followers'], array_values( $followers ) );

        wp_send_json_success(
            array(
				'follow'         => $follow,
				'follower_count' => count( $followers ),
            )
        );
    }

    /**
     * Get the follow status and follower count for a store via AJAX.
     *
     * Checks if the current user is following the given store and returns
     * the follower count along with the follow status in JSON format.
     * Performs a nonce check for security.
     *
     * @return void Sends JSON success or error response.
     */
    public function multivendorx_get_store_follow_status() {
        if ( ! check_ajax_referer( 'follow_store_ajax_nonce', 'nonce', false ) ) {
            wp_send_json_error( array( 'message' => 'Invalid request.' ) );
        }
        $store_id = filter_input( INPUT_POST, 'store_id', FILTER_VALIDATE_INT );
        $user_id  = get_current_user_id();

        if ( ! $store_id ) {
            wp_send_json_error( array( 'message' => 'Invalid store ID' ) );
        }

        $store     = new \MultiVendorX\Store\Store( $store_id );
        $followers = json_decode(
            (string) ( $store->meta_data[ Utill::STORE_SETTINGS_KEYS['followers'] ] ?? '[]' ),
            true
        );

        if ( ! is_array( $followers ) ) {
            $followers = array();
        }

        if ( isset( $followers[0] ) && is_int( $followers[0] ) ) {
            $followers = array_map(
                fn( $uid ) => array(
					'id'   => $uid,
					'date' => '',
                ),
                $followers
            );
        }

        // Extract user IDs for comparison and count.
        $follower_ids = array_column( $followers, 'id' );

        $following = $user_id ? get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['following_stores'], true ) : array();
        if ( ! is_array( $following ) ) {
            $following = array();
        }

        $is_following = in_array( $store_id, $following, true );

        wp_send_json_success(
            array(
				'follow'         => $is_following,
				'follower_count' => count( $follower_ids ),
            )
        );
    }
}
