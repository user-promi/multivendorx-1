<?php
namespace MultiVendorX\StoreReview;

use MultiVendorX\Utill;

if (!defined('ABSPATH')) exit;

class Util {

    /**
     * Check if a user has purchased from a specific store
     */
    public static function is_verified_buyer($store_id, $user_id) {
        if (empty($store_id) || empty($user_id)) {
            return 0;
        }
    
        //Fetch all relevant orders for this user
        $orders = wc_get_orders([
            'customer_id' => $user_id,
            'status'      => ['completed', 'processing', 'on-hold'],
            'limit'       => -1,
            'return'      => 'ids',
        ]);
    
        if (empty($orders)) {
            return 0;
        }
    
        foreach ($orders as $order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                continue;
            }
    
            //Loop through all products in the order
            foreach ($order->get_items('line_item') as $item_id => $item) {
                $product_id = $item->get_product_id();
                $product    = wc_get_product($product_id);
                if (!$product) continue;
    
                // Get store ID from product meta or item meta
                $product_store_id = get_post_meta($product_id, 'multivendorx_store_id', true);
                if (empty($product_store_id)) {
                    $product_store_id = $item->get_meta('multivendorx_store_id');
                }
    
                // Match store ID
                if ((int) $product_store_id === (int) $store_id) {
                    return (int) $order_id; // Verified buyer — return that order ID
                }
            }
        }
    
        return 0; //Not a verified buyer
    }

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
    public static function insert_review($store_id, $user_id, $title, $content, $overall, $order_id = 0) {
        global $wpdb;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];
    
        $wpdb->insert($table_review, [
            'store_id'       => $store_id,
            'customer_id'    => $user_id,
            'order_id'       => intval($order_id), // ✅ store order ID
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
