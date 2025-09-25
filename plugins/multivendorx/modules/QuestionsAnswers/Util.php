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

	public static function get_question_information( $args ) {
		global $wpdb;
	
		$where = array();
	
		// Filter by specific question IDs
		if ( isset( $args['id'] ) ) {
			$ids     = is_array( $args['id'] ) ? $args['id'] : array( $args['id'] );
			$ids     = implode( ',', array_map( 'intval', $ids ) );
			$where[] = "id IN ($ids)";
		}
	
		// Filter by product IDs
		if ( isset( $args['product_ids'] ) && is_array( $args['product_ids'] ) && ! empty( $args['product_ids'] ) ) {
			$product_ids = implode( ',', array_map( 'intval', $args['product_ids'] ) );
			$where[]     = "product_id IN ($product_ids)";
		}
	
		$table = $wpdb->prefix . Utill::TABLES['product_qna'];
	
		// Select query
		if ( isset( $args['count'] ) ) {
			$query = "SELECT COUNT(*) FROM $table";
		} else {
			$query = "SELECT * FROM $table";
		}
	
		// Add WHERE conditions
		if ( ! empty( $where ) ) {
			$condition = $args['condition'] ?? ' AND ';
			$query    .= ' WHERE ' . implode( $condition, $where );
		}
	
		// Limit & offset
		if ( isset( $args['limit'] ) && isset( $args['offset'] ) && ! isset( $args['count'] ) ) {
			$limit  = esc_sql( intval( $args['limit'] ) );
			$offset = esc_sql( intval( $args['offset'] ) );
			$query .= " LIMIT $limit OFFSET $offset";
		}
	
		// Execute
		if ( isset( $args['count'] ) ) {
			$results = $wpdb->get_var( $query );
			return $results ?? 0;
		} else {
			$results = $wpdb->get_results( $query, ARRAY_A );
			return $results ?? array();
		}
	}
	
	
	public static function update_question( $id, $data ) {
		global $wpdb;
	
		$table = $wpdb->prefix . Utill::TABLES['product_qna'];
	
		// Nothing to update
		if ( empty( $data ) ) {
			return false;
		}
	
		// Sanitize fields just in case
		$update_data = [];
		$update_format = [];
	
		if ( isset( $data['answer_text'] ) ) {
			$update_data['answer_text'] = $data['answer_text'];
			$update_format[] = '%s';
		}
	
		if ( isset( $data['question_visibility'] ) ) {
			$update_data['question_visibility'] = $data['question_visibility'];
			$update_format[] = '%s';
		}
	
		if ( empty( $update_data ) ) {
			return false;
		}
	
		$where = [ 'id' => intval( $id ) ];
		$where_format = [ '%d' ];
	
		$updated = $wpdb->update(
			$table,
			$update_data,
			$where,
			$update_format,
			$where_format
		);
	
		// $wpdb->update returns number of rows updated, or false on error
		if ( $updated === false ) {
			return false; // DB error
		}
	
		return true; // success, even if 0 rows (no change)
	}
	
}
