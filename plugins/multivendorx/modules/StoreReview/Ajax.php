<?php
namespace MultiVendorX\StoreReview;
use MultiVendorX\Utill;

if (!defined('ABSPATH')) exit;

class Ajax {

    public function __construct() {
        add_action('wp_ajax_store_review_submit', [$this, 'submit_review']);
        add_action('wp_ajax_nopriv_store_review_submit', [$this, 'submit_review']);
        add_action('wp_ajax_store_review_list', [$this, 'get_reviews']);
        add_action('wp_ajax_nopriv_store_review_list', [$this, 'get_reviews']);
        add_action('wp_ajax_store_review_avg', [$this, 'get_avg_ratings']);
        add_action('wp_ajax_nopriv_store_review_avg', [$this, 'get_avg_ratings']);
    }

    public function submit_review() {
        global $wpdb;
        check_ajax_referer('review_ajax_nonce', 'nonce');

        $store_id = intval($_POST['store_id']);
        $user_id = get_current_user_id();
        $review_title = sanitize_text_field($_POST['review_title'] ?? '');
        $review_content = sanitize_textarea_field($_POST['review_content'] ?? '');
        $ratings = $_POST['rating'] ?? [];
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: : " . var_export($store_id, true) . "\n", FILE_APPEND);
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: : " . var_export($user_id, true) . "\n", FILE_APPEND);
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: : " . var_export($review_title, true) . "\n", FILE_APPEND);
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: : " . var_export($review_content, true) . "\n", FILE_APPEND);
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: : " . var_export($ratings, true) . "\n", FILE_APPEND);

        if (!$user_id || !$store_id || empty($ratings)) {
            wp_send_json_error(['message' => 'Missing required fields.']);
        }

        $table_review = $wpdb->prefix . Utill::TABLES['review'];
        $table_rating = $wpdb->prefix . Utill::TABLES['rating'];

        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_review} WHERE store_id = %d AND customer_id = %d",
            $store_id, $user_id
        ));

        if ($existing > 0) {
            wp_send_json_error(['message' => 'You have already reviewed this store.']);
        }

        $overall = array_sum($ratings) / count($ratings);

        $wpdb->insert($table_review, [
            'store_id'       => $store_id,
            'customer_id'    => $user_id,
            'overall_rating' => $overall,
            'review_title'   => $review_title,
            'review_content' => $review_content,
            'status'         => 'pending',
        ]);

        $review_id = $wpdb->insert_id;

        foreach ($ratings as $param => $value) {
            if ($value) {
                $wpdb->insert($table_rating, [
                    'review_id'    => $review_id,
                    'parameter'    => sanitize_text_field($param),
                    'rating_value' => intval($value),
                ]);
            }
        }

        wp_send_json_success(['message' => 'Review submitted successfully!']);
    }

    public function get_reviews() {
        global $wpdb;
    
        $store_id = intval($_POST['store_id']);
        $table_review = $wpdb->prefix . Utill::TABLES['review'];
        $table_rating = $wpdb->prefix . Utill::TABLES['rating'];
    
        // Fetch all approved reviews
        $reviews = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_review} 
             WHERE store_id = %d AND status = 'approved' 
             ORDER BY date_created DESC LIMIT 20",
            $store_id
        ));
    
        ob_start();
    
        if ($reviews) {
            echo '<ul class="mvx-review-list">';
    
            foreach ($reviews as $review) {
                echo '<li class="mvx-review-item">';
                
                // Reviewer name
                $user_info = get_userdata($review->customer_id);
                $reviewer_name = $user_info ? $user_info->display_name : __('Anonymous', 'multivendorx');
                echo '<strong>' . esc_html($reviewer_name) . '</strong>';
    
                // Review content
                echo '<p><strong>' . esc_html($review->review_title) . '</strong></p>';
                echo '<p>' . esc_html($review->review_content) . '</p>';
    
                // Individual parameter ratings
                $ratings = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM {$table_rating} WHERE review_id = %d",
                    $review->review_id
                ));
    
                if ($ratings) {
                    echo '<ul class="mvx-review-params">';
                    foreach ($ratings as $r) {
                        echo '<li>' . esc_html($r->parameter) . ': ' . intval($r->rating_value) . '★</li>';
                    }
                    echo '</ul>';
                }
    
                //Display reply (if exists)
                if (!empty($review->admin_reply)) {
                    echo '<div class="mvx-review-reply">';
                    echo '<strong>' . esc_html__('Reply:', 'multivendorx') . '</strong> ';
                    echo '<p>' . esc_html($review->admin_reply) . '</p>';
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
        global $wpdb;
        $store_id = intval($_POST['store_id']);
        $table_review = $wpdb->prefix . Utill::TABLES['review'];
        $table_rating = $wpdb->prefix . Utill::TABLES['rating'];

        $parameters = MultiVendorX()->setting->get_setting('ratings_parameters', []);
        $averages = [];

        foreach ($parameters as $param) {
            $param_value = is_array($param) ? ($param['value'] ?? '') : $param;
            if (empty($param_value)) continue;

            $avg = $wpdb->get_var($wpdb->prepare(
                "SELECT AVG(rating_value) FROM {$table_rating}
                 INNER JOIN {$table_review} ON {$table_review}.review_id = {$table_rating}.review_id
                 WHERE {$table_review}.store_id = %d
                 AND {$table_rating}.parameter = %s
                 AND {$table_review}.status = 'approved'",
                $store_id, $param_value
            ));
            $averages[$param_value] = $avg ? round($avg, 2) : 0;
        }

        $overall = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(overall_rating) FROM {$table_review} WHERE store_id = %d AND status = 'approved'",
            $store_id
        ));

        wp_send_json_success([
            'averages' => $averages,
            'overall'  => round($overall, 2),
        ]);
    }
}
