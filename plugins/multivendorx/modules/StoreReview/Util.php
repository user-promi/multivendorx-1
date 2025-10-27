<?php
namespace MultiVendorX\StoreReview;

use MultiVendorX\Utill;

if (!defined('ABSPATH')) exit;

class Util {

    /**
     * Check if user has already submitted a review for a store
     */
    public static function has_reviewed($store_id, $user_id) {
        global $wpdb;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];

        return (bool) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_review} WHERE store_id = %d AND customer_id = %d",
            $store_id, $user_id
        ));
    }

    /**
     * Insert a new review
     */
    public static function insert_review($store_id, $user_id, $title, $content, $overall) {
        global $wpdb;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];

        $wpdb->insert($table_review, [
            'store_id'       => $store_id,
            'customer_id'    => $user_id,
            'overall_rating' => $overall,
            'review_title'   => $title,
            'review_content' => $content,
            'status'         => 'pending',
            'date_created'   => current_time('mysql'),
        ]);

        return $wpdb->insert_id;
    }

    /**
     * Insert multiple parameter ratings for a review
     */
    public static function insert_ratings($review_id, $ratings) {
        global $wpdb;
        $table_rating = $wpdb->prefix . Utill::TABLES['rating'];

        foreach ($ratings as $param => $value) {
            if ($value) {
                $wpdb->insert($table_rating, [
                    'review_id'    => $review_id,
                    'parameter'    => sanitize_text_field($param),
                    'rating_value' => intval($value),
                ]);
            }
        }
    }

    /**
     * Fetch all approved reviews for a store
     */
    public static function get_reviews_by_store($store_id, $limit = 20) {
        global $wpdb;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];

        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_review} WHERE store_id = %d AND status = 'approved' ORDER BY date_created DESC LIMIT %d",
            $store_id, $limit
        ));
    }

    /**
     * Get individual parameter ratings for a review
     */
    public static function get_ratings_for_review($review_id) {
        global $wpdb;
        $table_rating = $wpdb->prefix . Utill::TABLES['rating'];

        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_rating} WHERE review_id = %d",
            $review_id
        ));
    }

    /**
     * Get average rating per parameter
     */
    public static function get_avg_ratings($store_id, $parameters) {
        global $wpdb;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];
        $table_rating = $wpdb->prefix . Utill::TABLES['rating'];

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

        return $averages;
    }

    /**
     * Get overall store rating
     */
    public static function get_overall_rating($store_id) {
        global $wpdb;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];

        $overall = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(overall_rating) FROM {$table_review} WHERE store_id = %d AND status = 'approved'",
            $store_id
        ));

        return round($overall, 2);
    }
    
    public static function get_user_review_status($store_id, $user_id) {
        global $wpdb;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];
    
        return $wpdb->get_var($wpdb->prepare(
            "SELECT status FROM {$table_review} 
             WHERE store_id = %d 
             AND customer_id = %d 
             ORDER BY date_created DESC 
             LIMIT 1",
            $store_id,
            $user_id
        ));
    }
    
}
