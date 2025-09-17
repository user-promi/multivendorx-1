<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreReview;

/**
 * MultiVendorX Questions Answers Ajax class
 *
 * @class       Ajax class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Ajax {
    public function __construct(){

        add_action('wp_ajax_store_review_submit', array($this, 'multivendorx_store_review_submit'));
        add_action('wp_ajax_nopriv_store_review_submit', array($this, 'multivendorx_store_review_submit'));

    }

    // Submit Question
    public function multivendorx_store_review_submit() {
        check_ajax_referer('review_ajax_nonce', 'nonce');

        $user_id  = get_current_user_id();
        $rating   = intval($_POST['rating']);
        $comment  = sanitize_textarea_field($_POST['comment']);
        $store_id = intval($_POST['store_for_rating']);
        $author   = sanitize_text_field($_POST['author']);
        $email    = sanitize_email($_POST['email']);

        if (!$user_id) {
            wp_send_json_error(['message' => 'You must be logged in to leave a review.']);
        }

        if (empty($rating) || empty($comment)) {
            wp_send_json_error(['message' => 'Rating and review cannot be empty.']);
        }

        $comment_data = [
            'comment_post_ID' => MultiVendorX()->setting->get_setting( 'store_dashboard_page' ),
            'comment_author'  => $author,
            'comment_author_email' => $email,
            'comment_content' => $comment,
            'user_id'         => $user_id,
            'comment_type'    => 'multivendorx_store_review',
            'comment_date' => current_time('mysql'),
            'comment_approved'=> 1,
        ];

        $comment_id = wp_insert_comment($comment_data);

        if ($comment_id) {
            // Save rating as comment meta
            update_comment_meta($comment_id, 'store_rating', $rating);
            update_comment_meta($comment_id, 'store_rating_id', $store_id);

            wp_send_json_success(['message' => 'Thank you! Your review has been submitted.']);
        }
    }

}