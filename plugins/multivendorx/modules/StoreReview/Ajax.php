<?php
namespace MultiVendorX\StoreReview;

class Ajax {

    public function __construct() {
        add_action('wp_ajax_store_review_submit', [$this, 'submit_review']);
        add_action('wp_ajax_nopriv_store_review_submit', [$this, 'submit_review']);
        add_action('wp_ajax_store_review_list', [$this, 'get_reviews']);
        add_action('wp_ajax_nopriv_store_review_list', [$this, 'get_reviews']);
        
        // Update store average ratings when new review is added
        add_action('comment_post', [$this, 'update_store_ratings'], 10, 2);
        
        // Admin hooks for criteria management
        add_action('admin_init', [$this, 'register_criteria_settings']);
    }

    /**
     * Get dynamic rating criteria
     */
    private function get_rating_criteria() {
        return get_option('mvx_rating_criteria', [
            'quality' => __('Product Quality', 'multivendorx'),
            'shipping' => __('Shipping Speed', 'multivendorx'),
            'design' => __('Design & Presentation', 'multivendorx'),
            'communication' => __('Communication', 'multivendorx')
        ]);
    }

    public function submit_review() {
        check_ajax_referer('review_ajax_nonce', 'nonce');

        $user_id  = get_current_user_id();
        $store_id = filter_input(INPUT_POST, 'store_id', FILTER_VALIDATE_INT);
        $overall_rating = filter_input(INPUT_POST, 'overall_rating', FILTER_VALIDATE_FLOAT);
        $comment  = filter_input(INPUT_POST, 'comment', FILTER_SANITIZE_STRING);
        $rating_data = $_POST['rating_data'] ?? [];

        if (!$user_id || !$store_id || !$overall_rating || !$comment || empty($rating_data)) {
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
        $rating_criteria = $this->get_rating_criteria();

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
            // Save overall rating
            update_comment_meta($comment_id, 'store_rating', $overall_rating);
            update_comment_meta($comment_id, 'store_rating_id', $store_id);
            
            // Save individual criteria ratings
            foreach ($rating_data as $criteria => $rating) {
                if (array_key_exists($criteria, $rating_criteria)) {
                    update_comment_meta($comment_id, 'rating_' . $criteria, $rating);
                }
            }
            
            // Update store average ratings
            $this->update_store_ratings($comment_id, true);
            
            wp_send_json_success(['message' => 'Thank you! Your review has been submitted.']);
        }

        wp_send_json_error(['message' => 'Something went wrong.']);
    }

    public function update_store_ratings($comment_id, $approved = null) {
        $comment = get_comment($comment_id);
        
        // Check if this is our review type
        if ($comment->comment_type !== 'multivendorx_review') {
            return;
        }
        
        $store_id = get_comment_meta($comment_id, 'store_rating_id', true);
        if (!$store_id) return;
        
        $rating_criteria = $this->get_rating_criteria();
        
        // Get all approved reviews for this store
        $reviews = get_comments([
            'meta_key'     => 'store_rating_id',
            'meta_value'   => $store_id,
            'comment_type' => 'multivendorx_review',
            'status'       => 'approve',
            'parent'       => 0,
        ]);
        
        if (empty($reviews)) return;
        
        $total_overall = 0;
        $criteria_totals = [];
        $criteria_counts = [];
        
        // Initialize criteria arrays dynamically
        foreach ($rating_criteria as $key => $label) {
            $criteria_totals[$key] = 0;
            $criteria_counts[$key] = 0;
        }
        
        foreach ($reviews as $review) {
            $overall_rating = get_comment_meta($review->comment_ID, 'store_rating', true);
            $total_overall += floatval($overall_rating);
            
            // Sum individual criteria ratings dynamically
            foreach ($rating_criteria as $key => $label) {
                $criteria_rating = get_comment_meta($review->comment_ID, 'rating_' . $key, true);
                if ($criteria_rating) {
                    $criteria_totals[$key] += floatval($criteria_rating);
                    $criteria_counts[$key]++;
                }
            }
        }
        
        $review_count = count($reviews);
        
        // Calculate averages
        $average_overall = $review_count > 0 ? $total_overall / $review_count : 0;
        
        $average_criteria = [];
        foreach ($rating_criteria as $key => $label) {
            $average_criteria[$key] = $criteria_counts[$key] > 0 ? 
                $criteria_totals[$key] / $criteria_counts[$key] : 0;
        }
        
        // Save store rating data
        update_user_meta($store_id, '_mvx_store_rating_count', $review_count);
        update_user_meta($store_id, '_mvx_store_avg_rating', round($average_overall, 2));
        
        // Save criteria averages dynamically
        foreach ($average_criteria as $key => $avg) {
            update_user_meta($store_id, '_mvx_store_avg_' . $key, round($avg, 2));
        }
        
        // Save all criteria data as array
        update_user_meta($store_id, '_mvx_store_criteria_ratings', $average_criteria);
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
        $rating_criteria = $this->get_rating_criteria();

        ob_start();

        if ($reviews) {
            echo '<ul class="mvx-review-list">';
            foreach ($reviews as $review) {
                $overall_rating = floatval(get_comment_meta($review->comment_ID, 'store_rating', true));
                
                echo '<li class="mvx-review-item">';
                echo '<strong>' . esc_html($review->comment_author) . '</strong>';
                echo '<div class="mvx-overall-rating">Overall: ' . $overall_rating . '/5</div>';
                
                // Display individual criteria ratings dynamically
                echo '<div class="mvx-criteria-ratings">';
                foreach ($rating_criteria as $key => $label) {
                    $criteria_rating = get_comment_meta($review->comment_ID, 'rating_' . $key, true);
                    if ($criteria_rating) {
                        echo '<span class="criteria-rating-item">';
                        echo esc_html($label) . ': ' . $criteria_rating . '/5';
                        echo '</span> ';
                    }
                }
                echo '</div>';
                
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
    
    /**
     * Get store average ratings dynamically
     */
    public static function get_store_ratings($store_id) {
        $rating_criteria = get_option('mvx_rating_criteria', [
            'quality' => 'Product Quality',
            'shipping' => 'Shipping Speed', 
            'design' => 'Design & Presentation',
            'communication' => 'Communication'
        ]);
        
        $ratings = [
            'overall' => get_user_meta($store_id, '_mvx_store_avg_rating', true) ?: 0,
            'count' => get_user_meta($store_id, '_mvx_store_rating_count', true) ?: 0
        ];
        
        // Add criteria ratings dynamically
        foreach ($rating_criteria as $key => $label) {
            $ratings[$key] = get_user_meta($store_id, '_mvx_store_avg_' . $key, true) ?: 0;
        }
        
        return $ratings;
    }
    
    /**
     * Admin settings for rating criteria
     */
    public function register_criteria_settings() {
        register_setting('mvx_settings', 'mvx_rating_criteria', [
            'type' => 'array',
            'sanitize_callback' => [$this, 'sanitize_rating_criteria']
        ]);
    }
    
    public function sanitize_rating_criteria($criteria) {
        $sanitized = [];
        foreach ($criteria as $key => $label) {
            $clean_key = sanitize_key($key);
            $clean_label = sanitize_text_field($label);
            if (!empty($clean_key) && !empty($clean_label)) {
                $sanitized[$clean_key] = $clean_label;
            }
        }
        return $sanitized;
    }
    
    /**
     * Add new rating criteria
     */
    public static function add_rating_criteria($key, $label) {
        $criteria = get_option('mvx_rating_criteria', []);
        $criteria[sanitize_key($key)] = sanitize_text_field($label);
        update_option('mvx_rating_criteria', $criteria);
    }
    
    /**
     * Remove rating criteria
     */
    public static function remove_rating_criteria($key) {
        $criteria = get_option('mvx_rating_criteria', []);
        $clean_key = sanitize_key($key);
        if (isset($criteria[$clean_key])) {
            unset($criteria[$clean_key]);
            update_option('mvx_rating_criteria', $criteria);
        }
    }
    
    /**
     * Get all available rating criteria
     */
    public static function get_all_rating_criteria() {
        return get_option('mvx_rating_criteria', []);
    }
}