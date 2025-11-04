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
	
    
	public static function get_report_abuse_information( $args = array() ) {
		global $wpdb;
	
		$where = array();
	
		// Filter by report IDs
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
	
		// Filter by store IDs
		if ( isset( $args['store_ids'] ) && is_array( $args['store_ids'] ) && ! empty( $args['store_ids'] ) ) {
			$store_ids = implode( ',', array_map( 'intval', $args['store_ids'] ) );
			$where[]   = "store_id IN ($store_ids)";
		}
	
		// Filter by reporter email
		if ( isset( $args['email'] ) && ! empty( $args['email'] ) ) {
			$email = esc_sql( $args['email'] );
			$where[] = "email = '$email'";
		}
	
		$table = $wpdb->prefix . Utill::TABLES['report_abuse']; // abuse reports table
	
		// Count query
		if ( isset( $args['count'] ) && $args['count'] ) {
			$query = "SELECT COUNT(*) FROM $table";
		} else {
			// Select all columns
			$query = "SELECT * FROM $table";
		}
	
		// Add WHERE conditions
		if ( ! empty( $where ) ) {
			$condition = $args['condition'] ?? ' AND ';
			$query    .= ' WHERE ' . implode( " $condition ", $where );
		}
	
		// Limit & offset
		if ( isset( $args['limit'] ) && isset( $args['offset'] ) && empty( $args['count'] ) ) {
			$limit  = esc_sql( intval( $args['limit'] ) );
			$offset = esc_sql( intval( $args['offset'] ) );
			$query .= " LIMIT $limit OFFSET $offset";
		}
	
		// Execute query
		if ( isset( $args['count'] ) && $args['count'] ) {
			$result = $wpdb->get_var( $query );
			return $result ?? 0;
		} else {
			$result = $wpdb->get_results( $query, ARRAY_A );
			return $result ?? array();
		}
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
