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
                echo '<div class="header"> <div class="details-wrapper">';
                echo '<div class="avater">B</div> <div class="name">'. esc_html($reviewer_name) .'</div> <span class="time">1 day ago</span></div> ';
                echo '</div>';
                echo '<div class="body">';
                echo ' <div class="rating"><i class="adminlib-star-o"></i> <i class="adminlib-star-o"></i> <i class="adminlib-star-o"></i> <i class="adminlib-star-o"></i> <i class="adminlib-star-o"></i> <span class="title">'. esc_html($review->review_title) . '</span></div> ';
                echo ' <div class="content">' . esc_html($review->review_content) . '</div> </div>';

                if (!empty($review->reply)) {
                    echo '<div class="mvx-review-reply">';
                    echo '<strong>' . esc_html__('Admin reply:', 'multivendorx') . '</strong> ';
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
    
        //Get all reviews
        $reviews = Util::get_reviews_by_store($store_id);
        $total_reviews = count($reviews);
    
        //Initialize breakdown
        $breakdown = [
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        ];
    
        foreach ($reviews as $review) {
            $rating = round(floatval($review->overall_rating)); // Round to nearest star
            if (isset($breakdown[$rating])) {
                $breakdown[$rating]++;
            }
        }
    
        wp_send_json_success([
            'averages'      => $averages,
            'overall'       => round($overall, 1),
            'total_reviews' => $total_reviews,
            'breakdown'     => $breakdown,
        ]);
    }
    
}
