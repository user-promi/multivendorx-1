<?php
namespace MultiVendorX\StoreReview;

class Ajax {

    public function __construct() {
        add_action('wp_ajax_store_review_submit', [$this, 'submit_review']);
        add_action('wp_ajax_nopriv_store_review_submit', [$this, 'submit_review']);
        add_action('wp_ajax_store_review_list', [$this, 'get_reviews']);
        add_action('wp_ajax_nopriv_store_review_list', [$this, 'get_reviews']);
    }

    public function submit_review() {
        check_ajax_referer('review_ajax_nonce', 'nonce');

        $user_id  = get_current_user_id();
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_VALIDATE_INT);
        $rating   = filter_input(INPUT_POST, 'rating', FILTER_VALIDATE_INT);
        $comment  = filter_input(INPUT_POST, 'comment', FILTER_SANITIZE_STRING);

        if (!$user_id || !$store_id || !$rating || !$comment) {
            wp_send_json_error(['message' => 'All fields are required.']);
        }

        // Check if the user already reviewed this store
        $existing = get_comments([
            'user_id'      => $user_id,
            'meta_key'     => 'store_rating_id',
            'meta_value'   => $store_id,
            'comment_type' => 'multivendorx_review',
            'count'        => true,
        ]);

        if ($existing > 0) {
            wp_send_json_error(['message' => 'You have already reviewed this store.']);
        }

        $current_user = wp_get_current_user();

        $comment_id = wp_insert_comment([
            'comment_post_ID'      => (int) MultiVendorX()->setting->get_setting('store_dashboard_page'),
            'comment_author'       => $current_user->display_name,
            'comment_author_email' => $current_user->user_email,
            'comment_content'      => $comment,
            'user_id'              => $user_id,
            'comment_type'         => 'multivendorx_review',
            'comment_approved'     => 1,
            'comment_date'         => current_time('mysql'),
            'comment_date_gmt'     => current_time('mysql', 1),
            'comment_author_IP'    => $_SERVER['REMOTE_ADDR'] ?? '',
            'comment_agent'        => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'comment_parent'       => 0,
        ]);

        if ($comment_id) {
            update_comment_meta($comment_id, 'store_rating', $rating);
            update_comment_meta($comment_id, 'store_rating_id', $store_id);
            wp_send_json_success(['message' => 'Thank you! Your review has been submitted.']);
        }

        wp_send_json_error(['message' => 'Something went wrong.']);
    }

    public function get_reviews() {
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_VALIDATE_INT);
        $paged    = max(1, filter_input(INPUT_POST, 'page', FILTER_VALIDATE_INT) ?: 1);
        $per_page = 5;

        if (!$store_id) {
            wp_send_json_error(['message' => 'Store ID missing.']);
        }

        $reviews = get_comments([
            'meta_key'     => 'store_rating_id',
            'meta_value'   => $store_id,
            'comment_type' => 'multivendorx_review',
            'parent'       => 0,
            'status'       => 'approve',
            'number'       => $per_page,
            'offset'       => ($paged - 1) * $per_page,
            'order'        => 'DESC',
        ]);

        $total_reviews = get_comments([
            'meta_key'     => 'store_rating_id',
            'meta_value'   => $store_id,
            'comment_type' => 'multivendorx_review',
            'parent'       => 0,
            'count'        => true,
            'status'       => 'approve',
        ]);

        $total_pages = ceil($total_reviews / $per_page);

        ob_start();

        if ($reviews) {
            echo '<ul class="mvx-review-list">';
            foreach ($reviews as $review) {
                $rating = intval(get_comment_meta($review->comment_ID, 'store_rating', true));
                echo '<li class="mvx-review-item">';
                echo '<strong>' . esc_html($review->comment_author) . '</strong> - Rating: ' . $rating;
                echo '<p>' . esc_html($review->comment_content) . '</p>';

                // Replies
                $replies = get_comments([
                    'parent' => $review->comment_ID,
                    'status' => 'approve',
                    'order'  => 'ASC',
                ]);

                if ($replies) {
                    echo '<ul class="mvx-review-replies">';
                    foreach ($replies as $reply) {
                        echo '<li class="mvx-review-reply">';
                        echo '<strong>' . esc_html($reply->comment_author) . '</strong>: ' . esc_html($reply->comment_content);
                        echo '</li>';
                    }
                    echo '</ul>';
                }

                echo '</li>';
            }
            echo '</ul>';
        } else {
            echo '<p>' . esc_html__('No reviews yet.', 'multivendorx') . '</p>';
        }

        // Pagination
        $pagination_html = '';
        if ($total_pages > 1) {
            $pagination_html .= '<div id="review_pagination">';
            for ($i = 1; $i <= $total_pages; $i++) {
                $active_class = ($i === $paged) ? 'active' : '';
                $pagination_html .= '<button class="mvx-review-page ' . esc_attr($active_class) . '" data-page="' . esc_attr($i) . '">' . esc_html($i) . '</button> ';
            }
            $pagination_html .= '</div>';
        }

        wp_send_json_success([
            'html'       => ob_get_clean(),
            'pagination' => $pagination_html,
        ]);
    }
}