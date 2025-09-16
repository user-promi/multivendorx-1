<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\QuestionsAnswers;
use MultiVendorX\Utill;

/**
 * MultiVendorX Questions Answers Util class
 *
 * @class       Util class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Util {

    
    /**
     * Fetch questions & answers for a product
     */
    public static function get_questions( $product_id, $search = '' ) {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['product_qna'];

        $query = "SELECT * FROM $table WHERE product_id=%d AND question_visibility='public'";
        $params = [ $product_id ];

        if ( $search ) {
            $query .= " AND (question_text LIKE %s OR answer_text LIKE %s)";
            $like = '%' . $wpdb->esc_like( $search ) . '%';
            $params[] = $like;
            $params[] = $like;
        }

        return $wpdb->get_results( $wpdb->prepare( $query, ...$params ) );
    }

}
