<?php
/**
 * MultiVendorX Store class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Store class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Store {

    /**
     * Store ID.
     *
     * @var int
     */
    protected $id = 0;

    /**
     * Store data.
     *
     * @var array
     */
    protected $data = array();

    /**
     * Store meta data.
     *
     * @var array
     */
    protected $meta_data = array();

    /**
     * Container for store classes.
     *
     * @var array
     */
    private $container = array();

    /**
     * Constructor.
     *
     * @param int $store_id Store ID.
     */
    public function __construct( $store_id = 0 ) {

        $this->init_classes();

        if ( $store_id > 0 ) {
            $this->load( $store_id );
        }
    }

    /**
     * Initialize all Store classes.
     */
    public function init_classes() {
        $this->container = array(
            'rewrites'  => new Rewrites(),
            'storeutil' => new StoreUtil(),
        );
    }

    /**
     * Load store data from the database.
     *
     * @param int $store_id Store ID.
     */
    public function load( $store_id ) {
        global $wpdb;

        $table = esc_sql( "{$wpdb->prefix}" . Utill::TABLES['store'] );

        $sql = sprintf(
            'SELECT * FROM `%s` WHERE ID = %%d',
            $table
        );

        $prepared = $wpdb->prepare( $sql, $store_id );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row( $prepared, ARRAY_A );

        if ( $row ) {
            $this->id        = $row['ID'];
            $this->data      = $row;
            $this->meta_data = $this->get_all_meta();
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }
    }

    /**
     * Get store ID.
     */
    public function get_id() {
        return $this->id;
    }

    /**
     * Get store data.
     *
     * @param string $key Data key.
     */
    public function get( $key ) {
        return $this->data[ $key ] ?? null;
    }

    /**
     * Set store data.
     *
     * @param string $key   Data key.
     * @param mixed  $value Data value.
     */
    public function set( $key, $value ) {
        $this->data[ $key ] = $value;
    }

    /**
     * Save store data to the database.
     *
     * @return int Store ID.
     */
    public function save() {
        global $wpdb;

        // Escape table name to avoid PHPCS warnings
        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store'] );

        $data = array(
            Utill::STORE_SETTINGS_KEYS['name']        => $this->data['name'] ?? '',
            Utill::STORE_SETTINGS_KEYS['slug']        => $this->data['slug'] ?? sanitize_title( $this->data['name'] ?? '' ),
            Utill::STORE_SETTINGS_KEYS['description'] => $this->data['description'] ?? '',
            Utill::STORE_SETTINGS_KEYS['who_created'] => $this->data['who_created'] ?? 'admin',
            Utill::STORE_SETTINGS_KEYS['status']      => $this->data['status'] ?? 'active',
        );

        $formats = array( '%s', '%s', '%s', '%s', '%s' );

        if ( $this->id > 0 ) {
            $wpdb->update( $table, $data, array( 'ID' => $this->id ), $formats, array( '%d' ) );
        } else {
            $wpdb->insert( $table, $data, $formats );
            $this->id = $wpdb->insert_id;
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return $this->id;
    }

    /**
     * Get store meta value.
     *
     * @param string $key    Meta key to look up.
     * @param bool   $single Whether to return a single value or an array of values.
     *
     * @return mixed Meta value(s) or null.
     */
    public function get_meta( $key, $single = true ) {
        global $wpdb;

        // Escape table name to avoid PHPCS interpolation warnings
        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store_meta'] );

        if ( $single ) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $value = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT meta_value FROM {$table} WHERE store_id = %d AND meta_key = %s LIMIT 1",
                    $this->id,
                    $key
                )
            );
        } else {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $value = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT meta_value FROM {$table} WHERE store_id = %d AND meta_key = %s",
                    $this->id,
                    $key
                )
            );
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return $value;
    }

    /**
     * Get all meta data for this store.
     *
     * @return array Key-value array of all store meta.
     */
    public function get_all_meta() {
        global $wpdb;

        // Escape table name to avoid PHPCS interpolation warning
        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store_meta'] );

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT meta_key, meta_value FROM {$table} WHERE store_id = %d",
                $this->id
            ),
            ARRAY_A
        );

        $meta = array();
        foreach ( $rows as $row ) {
            $meta[ $row['meta_key'] ] = $row['meta_value'];
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return $meta;
    }

    /**
     * Update store meta value.
     *
     * @param string $key   Meta key to update.
     * @param mixed  $value Value to assign to the meta key.
     */
    public function update_meta( $key, $value ) {
        global $wpdb;

        // Escape table name to avoid PHPCS interpolation errors
        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store_meta'] );

        if ( is_array( $value ) || is_object( $value ) ) {
            $value = wp_json_encode( $value );
        }

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM {$table} WHERE store_id = %d AND meta_key = %s",
                $this->id,
                $key
            )
        );

        if ( $exists ) {
            $wpdb->update(
                $table,
                array( 'meta_value' => $value ),
                array( 'ID' => $exists ),
                array( '%s' ),
                array( '%d' )
            );
        } else {
            $wpdb->insert(
                $table,
                array(
                    'store_id'   => $this->id,
                    'meta_key'   => $key,
                    'meta_value' => $value,
                ),
                array( '%d', '%s', '%s' )
            );
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }
    }

    /**
     * Magic method to access container items.
     *
     * @param string $class Class name.
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( property_exists( $this, $class ) ) {
            return $this->$class;
        }
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    /**
     * Get store by ID.
     *
     * @param int $id Store ID to look up.
     */
    public static function get_store_by_id( $id ) {
        return $id ? new self( $id ) : null;
    }

    /**
     * Get store by slug.
     *
     * @param string $slug Slug to look up.
     * @return self|null Store instance if found, null otherwise.
     */
    public static function get_store_by_slug( $slug ) {
        global $wpdb;

        // Escape table name
        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store'] );

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $query = $wpdb->prepare(
            "SELECT ID FROM {$table} WHERE slug = %s LIMIT 1",
            $slug
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $id = $wpdb->get_var( $query );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return $id ? new self( (int) $id ) : null;
    }


    /**
     * Check whether a store with given slug exists in the database.
     *
     * @param string $slug       Slug to check against.
     * @param int    $exclude_id Optional. ID of the store to exclude from search results. Default 0.
     * @return bool True if store exists, otherwise false.
     */
    public static function store_slug_exists( $slug, $exclude_id = 0 ) {
        global $wpdb;

        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store'] );

        if ( $exclude_id ) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $query = $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE slug = %s AND ID != %d",
                $slug,
                $exclude_id
            );
        } else {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $query = $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE slug = %s",
                $slug
            );
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $exists = (int) $wpdb->get_var( $query );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return $exists > 0;
    }

    /**
     * Get stores by name.
     *
     * @param string $name Name of the store. Can be partial or full.
     *
     * @return array Array of store objects.
     */
    public static function get_store_by_name( $name ) {
        global $wpdb;

        if ( empty( $name ) ) {
            return false;
        }

        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store'] );
        $like  = '%' . $wpdb->esc_like( $name ) . '%';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE name LIKE %s AND status = %s",
                $like,
                'active'
            ),
            ARRAY_A
        );

        $stores = array();
        if ( ! empty( $results ) ) {
            foreach ( $results as $row ) {
                $stores[] = new self( (int) $row['ID'] );
            }
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return $stores;
    }

    /**
     * Delete a store meta key.
     *
     * @param string $key Meta key to delete.
     */
    public function delete_meta( $key ) {
        global $wpdb;

        // Escape table name
        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store_meta'] );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete(
            $table,
            array(
                'store_id' => (int) $this->id,
                'meta_key' => $key,
            ),
            array( '%d', '%s' )
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }
    }

    /**
     * Delete all meta for the current store.
     *
     * @return bool
     */
    public function delete_all_meta() {
        global $wpdb;

        // Escape table name
        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store_meta'] );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $deleted = $wpdb->delete(
            $table,
            array( 'store_id' => (int) $this->id ),
            array( '%d' )
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return false !== $deleted;
    }

    /**
     * Delete the current store completely from database.
     */
    public function delete_store_completely() {
        global $wpdb;

        $store_id = (int) $this->id;

        if ( $store_id <= 0 ) {
            return false;
        }

        // Table names.
        $store_table       = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store_users_table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];
        $store_meta_table  = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        // Delete meta.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete( $store_meta_table, array( 'store_id' => $store_id ), array( '%d' ) );

        // Delete users.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete( $store_users_table, array( 'store_id' => $store_id ), array( '%d' ) );

        // Delete store.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete( $store_table, array( 'ID' => $store_id ), array( '%d' ) );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                'Timestamp: ' . current_time( 'mysql' ) . "\n" .
                'Error: ' . $wpdb->last_error . "\n" .
                'Last Query: ' . $wpdb->last_query . "\n" .
                'File: ' . __FILE__ . "\n" .
                'Line: ' . __LINE__ . "\n" .
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
                'Stack Trace: ' . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return true;
    }
}
