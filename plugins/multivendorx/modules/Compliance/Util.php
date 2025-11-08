<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Compliance;
use MultiVendorX\Utill;

/**
 * MultiVendorX Questions Answers Util class
 *
 * @class       Util class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Util {

	public static function create_report_abuse( $data = array() ) {
		global $wpdb;
	
		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];
	
		// Sanitize and prepare data
		$insert_data = array(
			'store_id'   => isset( $data['store_id'] ) ? intval( $data['store_id'] ) : 0,
			'product_id' => isset( $data['product_id'] ) ? intval( $data['product_id'] ) : 0,
			'name'       => isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : '',
			'email'      => isset( $data['email'] ) ? sanitize_email( $data['email'] ) : '',
			'message'    => isset( $data['message'] ) ? sanitize_textarea_field( $data['message'] ) : '',
		);
	
		// Insert data
		$inserted = $wpdb->insert(
			$table,
			$insert_data,
			array( '%d', '%d', '%s', '%s', '%s' )
		);
	
		if ( $inserted ) {
			// Return the inserted record ID
			return $wpdb->insert_id;
		} else {
			return false;
		}
	}
	
    
	public static function get_report_abuse_information( $args = [] ) {
		global $wpdb;
	
		$where = [];
	
		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];
	
		// Existing filters
		if ( isset( $args['store_ids'] ) && ! empty( $args['store_ids'] ) ) {
			$store_ids = implode( ',', array_map( 'intval', $args['store_ids'] ) );
			$where[]   = "store_id IN ($store_ids)";
		}

	    if ( isset( $args['email'] ) && ! empty( $args['email'] ) ) {
			$where[] = $wpdb->prepare( "email = %s", sanitize_email( $args['email'] ) );
		}
		
		// 🔹 Date range filter
		if ( isset( $args['date_range'] ) ) {
			$start = esc_sql( $args['date_range']['start'] );
			$end   = esc_sql( $args['date_range']['end'] );
			$where[] = "DATE(created_at) BETWEEN '$start' AND '$end'";
		}
	
		// Build base query
		$query = isset( $args['count'] ) && $args['count']
			? "SELECT COUNT(*) FROM $table"
			: "SELECT * FROM $table";
	
		if ( ! empty( $where ) ) {
			$query .= ' WHERE ' . implode( ' AND ', $where );
		}
	
		// 🔹 Order by
		if ( empty( $args['count'] ) && ! empty( $args['order_by'] ) ) {
			$order_by = esc_sql( $args['order_by'] );
			$order    = esc_sql( $args['order'] ?? 'DESC' );
			$query   .= " ORDER BY $order_by $order";
		}
	
		// Limit & offset
		if ( isset( $args['limit'], $args['offset'] ) && empty( $args['count'] ) ) {
			$limit  = intval( $args['limit'] );
			$offset = intval( $args['offset'] );
			$query .= " LIMIT $limit OFFSET $offset";
		}
	
		return isset( $args['count'] ) && $args['count']
			? (int) $wpdb->get_var( $query )
			: (array) $wpdb->get_results( $query, ARRAY_A );
	}
	
	

	public static function delete_report_abuse( $id ) {
		global $wpdb;
	
		$table = $wpdb->prefix . Utill::TABLES['report_abuse'];
	
		$id = intval( $id );
		if ( ! $id ) {
			return false;
		}
	
		$deleted = $wpdb->delete(
			$table,
			[ 'id' => $id ],
			[ '%d' ]
		);
	
		// $wpdb->delete returns number of rows deleted, or false on error
		if ( $deleted === false ) {
			return false; // DB error
		}
	
		return true; // success, even if 0 rows (no row existed)
	}
	
}
