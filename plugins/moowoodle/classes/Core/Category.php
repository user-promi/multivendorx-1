<?php
/**
 * Category class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Core;

use MooWoodle\Util;

/**
 * MooWoodle Category class
 *
 * @class       Category class
 * @version     6.0.0
 * @author      Dualcube
 */
class Category {

	/**
     * Get course categories.
	 *
	 * @param mixed $where Condition to get course categories.
     *
     * @return array|object|null
     */
	public static function get_course_category( $where ) {
        global $wpdb;

        // Store query segment.
        $query_segments = array();

        if ( isset( $where['moodle_category_id'] ) ) {
            $query_segments[] = ' ( moodle_category_id = ' . $where['moodle_category_id'] . ' ) ';
        }

        if ( isset( $where['name'] ) ) {
            $query_segments[] = ' ( name = ' . $where['name'] . ' ) ';
        }

        if ( isset( $where['parent_id'] ) ) {
            $query_segments[] = ' ( parent_id = ' . $where['parent_id'] . ' ) ';
        }

		if ( isset( $where['category_ids'] ) ) {
			$ids              = implode( ',', array_map( 'intval', $where['category_ids'] ) );
			$query_segments[] = " ( moodle_category_id IN ($ids) ) ";
		}

        // get the table.
        $table = $wpdb->prefix . Util::TABLES['category'];

        // Base query.
        $query = "SELECT * FROM $table";

        // Join the query parts with 'AND'.
        $where_query = implode( ' AND ', $query_segments );

        if ( $where_query ) {
            $query .= " WHERE $where_query";
        }

        // Get all rows.
        $results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

        return $results;
    }

	/**
	 * Save or update Moodle categories in the MooWoodle categories table.
	 *
	 * This function loops through an array of categories and either inserts a new
	 * category or updates an existing one based on the Moodle category ID.
	 * It also increments the course sync count for each successful operation.
	 *
	 * @param array $categories List of category data. Each item must have 'id' and 'name'.
	 * @return void
	 */
	public static function update_course_categories( $categories ) {
		foreach ( $categories as $category ) {
			$args = array(
				'moodle_category_id' => (int) $category['id'],
				'name'               => trim( sanitize_text_field( $category['name'] ) ),
				'parent_id'          => (int) ( $category['parent'] ?? 0 ),
			);

			self::save_course_category( $args );

			\MooWoodle\Util::increment_sync_count( 'course' );
		}
	}

	/**
	 * Insert or update a category based on moodle_category_id.
	 *
	 * @param array $args {
	 *     Array of category data.
	 *
	 *     @type int    $moodle_category_id Required. Moodle category ID.
	 *     @type string $name               Required. Category name.
	 *     @type int    $parent_id          Optional. Parent category ID.
	 * }
	 * @return bool|int False on failure, number of rows affected on success.
	 */
	public static function save_course_category( $args ) {
		global $wpdb;

		if ( empty( $args['moodle_category_id'] ) ) {
			return false;
		}

		$table = $wpdb->prefix . Util::TABLES['category'];

		if ( self::get_course_category( array( 'moodle_category_id' => (int) $args['moodle_category_id'] ) ) ) {
			return $wpdb->update( $table, $args, array( 'moodle_category_id' => (int) $args['moodle_category_id'] ) );
		}

		return $wpdb->insert( $table, $args );
	}

	/**
	 * Returns term by Moodle category ID.
	 *
	 * @param int         $category_id Moodle category ID.
	 * @param string|null $taxonomy    Optional. Taxonomy name. Default null.
	 * @return object|null Term object on success, or null if not found.
	 */
	public static function get_product_category( $category_id, $taxonomy = '' ) {
		if ( ! $category_id || empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
			return null;
		}

		// Get the trermes basesd on moodle category id.
		$terms = get_terms(
            array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'meta_query' => array(
					array(
						'key'     => '_category_id',
						'value'   => $category_id,
						'compare' => '=',
					),
				),
            )
        );

		// Check no category found.
		if ( is_wp_error( $terms ) ) {
			return null;
		}

		return $terms[0];
	}

    /**
	 * Update Moodle course categories in WordPress site.
	 *
	 * @param array  $categories List of categories to update.
	 * @param string $taxonomy   Taxonomy name.
	 * @return void
	 */
	public static function update_product_categories( $categories, $taxonomy ) {
		if ( empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
			return;
		}

		$updated_ids = array();

		if ( $categories ) {
			foreach ( $categories as $category ) {
				// Update category.
				$categorie_id = self::update_product_category( $category, $taxonomy );

				// Store updated category id.
				if ( $categorie_id ) {
					$updated_ids[] = $categorie_id;
				}

				\MooWoodle\Util::increment_sync_count( 'course' );
			}
		}

		// Remove all term exclude updated ids.
		self::remove_exclude_ids( $updated_ids, $taxonomy );
	}

	/**
	 * Update a single category. If the category does not exist, create a new category.
	 *
	 * @param array  $category Category data to update or create.
	 * @param string $taxonomy Taxonomy name.
	 * @return int|null Category ID on success, or null on failure.
	 */
	public static function update_product_category( $category, $taxonomy ) {

		$term = self::get_product_category( $category['id'], $taxonomy );

		// If term is exist update it.
		if ( $term ) {
			$term = wp_update_term(
				$term->term_id,
				$taxonomy,
				array(
					'name'        => $category['name'],
					'slug'        => "{$category['name']} {$category['id']}",
					'description' => $category['description'],
				)
			);
		} else {
			// term not exist create it.
			$term = wp_insert_term(
				$category['name'],
				$taxonomy,
				array(
					'description' => $category['description'],
					'slug'        => "{$category['name']} {$category['id']}",
				)
			);

			if ( ! is_wp_error( $term ) ) {
				add_term_meta( $term['term_id'], '_category_id', $category['id'], false );
            }
		}

		// In success on update or insert sync meta data.
		if ( ! is_wp_error( $term ) ) {
			update_term_meta( $term['term_id'], '_parent', $category['parent'], '' );
			update_term_meta( $term['term_id'], '_category_path', $category['path'], false );

			return $category['id'];
		} else {
			MooWoodle()->util->log( 'moowoodle url:' . $term->get_error_message() . "\n" );
		}

		return null;
	}

	/**
	 * Remove all categories except the provided IDs.
	 *
	 * @param array  $exclude_ids IDs of categories to exclude from removal.
	 * @param string $taxonomy    Taxonomy name.
	 * @return void
	 */
	private static function remove_exclude_ids( $exclude_ids, $taxonomy ) {

		$terms = get_terms(
            array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
            )
        );

		if ( is_wp_error( $terms ) ) {
			return;
        }

		// Link with parent or delete term.
		foreach ( $terms as $term ) {
			$category_id = get_term_meta( $term->term_id, '_category_id', true );

			if ( in_array( $category_id, $exclude_ids, true ) ) {
				$parent_category_id = get_term_meta( $term->term_id, '_parent', true );

				// get parent term id and continue if not exist.
				$parent_term = self::get_product_category( $parent_category_id, $taxonomy );
				if ( empty( $parent_term ) ) {
					continue;
                }

				// sync parent term with term.
				wp_update_term( $term->term_id, $taxonomy, array( 'parent' => $parent_term->term_id ) );
			} else {
				// delete term if category is not moodle category.
				wp_delete_term( $term->term_id, $taxonomy );
			}
		}
	}
}
