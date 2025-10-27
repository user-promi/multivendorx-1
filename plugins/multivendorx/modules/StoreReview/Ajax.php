<?php
namespace MultiVendorX\StoreReview;

if (!defined('ABSPATH')) exit;

class Ajax {

    public function __construct() {
        add_action('wp_ajax_multivendorx_store_review_submit', [$this, 'submit_review']);
        add_action('wp_ajax_nopriv_multivendorx_store_review_submit', [$this, 'submit_review']);
        
        add_action('wp_ajax_multivendorx_store_review_list', [$this, 'get_reviews']);
        add_action('wp_ajax_nopriv_multivendorx_store_review_list', [$this, 'get_reviews']);
        
        add_action('wp_ajax_multivendorx_store_review_avg', [$this, 'get_avg_ratings']);
        add_action('wp_ajax_nopriv_multivendorx_store_review_avg', [$this, 'get_avg_ratings']);
        
    }

    public function submit_review() {
        check_ajax_referer('review_ajax_nonce', 'nonce');
    
        $data = filter_input_array(INPUT_POST, [
            'store_id'       => FILTER_SANITIZE_NUMBER_INT,
            'review_title'   => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
            'review_content' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
            'rating'         => [
                'filter' => FILTER_DEFAULT,
                'flags'  => FILTER_REQUIRE_ARRAY
            ],
        ]);
    
        $store_id       = intval($data['store_id'] ?? 0);
        $user_id        = get_current_user_id();
        $review_title   = $data['review_title'] ?? '';
        $review_content = $data['review_content'] ?? '';
        $ratings        = $data['rating'] ?? [];
    
        if (!$user_id || !$store_id || empty($ratings)) {
            wp_send_json_error(['message' => __('Missing required fields.', 'multivendorx')]);
        }
    
        // Check if already reviewed
        if (Util::has_reviewed($store_id, $user_id)) {
            wp_send_json_error(['message' => __('You have already reviewed this store.', 'multivendorx')]);
        }
    
        //Detect if verified buyer and get their order ID
        $order_id = Util::is_verified_buyer($store_id, $user_id);
    
        // Insert new review
        $overall   = array_sum($ratings) / count($ratings);
        $review_id = Util::insert_review($store_id, $user_id, $review_title, $review_content, $overall, $order_id);
        Util::insert_ratings($review_id, $ratings);
    
        wp_send_json_success(['message' => __('Review submitted successfully!', 'multivendorx')]);
    }
    

    public function get_reviews() {
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_SANITIZE_NUMBER_INT);
        $reviews  = Util::get_reviews_by_store($store_id);

        ob_start();
        if ($reviews) {
            echo '<ul class="mvx-review-list">';
            foreach ($reviews as $review) {
                echo '<li class="mvx-review-item">';
                $user_info     = get_userdata($review->customer_id);
                $reviewer_name = $user_info ? $user_info->display_name : __('Anonymous', 'multivendorx');

                echo '<strong>' . esc_html($reviewer_name) . '</strong>';
                echo '<p><strong>' . esc_html($review->review_title) . '</strong></p>';
                echo '<p>' . esc_html($review->review_content) . '</p>';

                $ratings = Util::get_ratings_for_review($review->review_id);
                if ($ratings) {
                    echo '<ul class="mvx-review-params">';
                    foreach ($ratings as $r) {
                        echo '<li>' . esc_html($r->parameter) . ': ' . intval($r->rating_value) . '★</li>';
                    }
                    echo '</ul>';
                }

                if (!empty($review->reply)) {
                    echo '<div class="mvx-review-reply">';
                    echo '<strong>' . esc_html__('Reply:', 'multivendorx') . '</strong> ';
                    echo '<p>' . esc_html($review->reply) . '</p>';
                    echo '</div>';
                }

                echo '</li>';
            }
            echo '</ul>';
        } else {
            echo '<p>' . esc_html__('No reviews yet.', 'multivendorx') . '</p>';
        }

        wp_send_json_success(['html' => ob_get_clean()]);
    }

    public function get_avg_ratings() {
        $store_id   = filter_input(INPUT_POST, 'store_id', FILTER_SANITIZE_NUMBER_INT);
        $parameters = MultiVendorX()->setting->get_setting('ratings_parameters', []);

        $averages = Util::get_avg_ratings($store_id, $parameters);
        $overall  = Util::get_overall_rating($store_id);

        wp_send_json_success([
            'averages' => $averages,
            'overall'  => $overall,
        ]);
    }
}
