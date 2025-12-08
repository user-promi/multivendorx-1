<?php
/**
 * Modules Commission Util
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Commission;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;
defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Commission Util.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class CommissionUtil {

    /**
     * Get a single commission row from databse by using commission id.
     * Return stdClass object represent a single row.
     *
     * @param   mixed $id Commission ID.
     * @return  array | object | \stdClass
     */
    public static function get_commission_db( $id ) {
        global $wpdb;
        $commission = $wpdb->get_row(
            $wpdb->prepare( 'SELECT * FROM `' . $wpdb->prefix . Utill::TABLES['commission'] . '` WHERE ID = %d', $id )
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                "Timestamp: " . current_time( 'mysql' ) . "\n" .
                "Error: " . $wpdb->last_error . "\n" .
                "Last Query: " . $wpdb->last_query . "\n" .
                "File: " . __FILE__ . "\n" .
                "Line: " . __LINE__ . "\n" .
                "Stack Trace: " . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return $commission ?? new \stdClass();
    }

    /**
     * Get the commission object of Commission class.
     *
     * @param   int $id Commission ID.
     * @return  Commission Commission Object.
     */
    public static function get_commission( $id ) {
        return new Commission( $id );
    }

    /**
     * Get the commission object of Commission class by store id and order id.
     *
     * @param   int $store_id Store ID.
     * @param   int $order_id Order ID.
     */
    public static function get_commission_by_store_and_order_id( $store_id, $order_id ) {
        global $wpdb;
        $commission = $wpdb->get_row(
            $wpdb->prepare( 'SELECT * FROM `' . $wpdb->prefix . Utill::TABLES['commission'] . '` WHERE store_id = %d AND order_id = %d', $store_id, $order_id )
        );
        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                "Timestamp: " . current_time( 'mysql' ) . "\n" .
                "Error: " . $wpdb->last_error . "\n" .
                "Last Query: " . $wpdb->last_query . "\n" .
                "File: " . __FILE__ . "\n" .
                "Line: " . __LINE__ . "\n" .
                "Stack Trace: " . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }
        return $commission ?? new \stdClass();
    }

    /**
     * Get array of commission object or count based on filter.
     *
     * @param   array $filter  Filter array.
     * @param   bool  $object  Default true. If false function returns raw DB rows or IDs.
     * @param   bool  $count   Default false. If true function returns total count instead of records.
     *
     * @return  array|int  Array of Commission objects, raw results, or integer count.
     */
    public static function get_commissions( $filter = array(), $object = true, $count = false ) {
        global $wpdb;

        // Remove 'fields' if object requested.
        if ( $object && isset( $filter['fields'] ) ) {
            unset( $filter['fields'] );
        }

        // Handle fields separately.
        if ( isset( $filter['fields'] ) && is_array( $filter['fields'] ) && ! $count ) {
            $fields = implode( ', ', $filter['fields'] );
        } else {
            $fields = $count ? 'COUNT(*) as total' : '*';
        }

        // Extract pagination.
        $page    = $filter['page'] ?? 0;
        $perpage = $filter['perpage'] ?? 0;

        // Extract sorting.
        $orderBy = $filter['orderBy'] ?? '';
        $order   = strtoupper( $filter['order'] ?? 'ASC' );

        // Remove non-column keys so they don’t appear in WHERE clause.
        unset( $filter['page'], $filter['perpage'], $filter['orderBy'], $filter['order'] );

        // Build WHERE conditions.
        $predicate = array();
        foreach ( $filter as $column => $value ) {
            if ( is_array( $value ) ) {
                if ( 'BETWEEN' === isset( $value['compare'] ) && $value['compare'] ) {
                    $start_value = Utill::add_single_quotes( $value['value'][0] );
                    $end_value   = Utill::add_single_quotes( $value['value'][1] );
                    $predicate[] = "{$column} BETWEEN {$start_value} AND {$end_value}";
                } elseif ( isset( $value['compare'] ) && in_array( $value['compare'], array( 'IN', 'NOT IN' ), true ) ) {
                    $compare     = $value['compare'];
                    $in_tuple    = '(' . implode( ', ', array_map( array( Utill::class, 'add_single_quotes' ), $value['value'] ) ) . ')';
                    $predicate[] = "{$column} {$compare} {$in_tuple}";
                }
            } else {
                $value       = Utill::add_single_quotes( $value );
                $predicate[] = "{$column} = {$value}";
            }
        }

        // Start query.
        $query = "SELECT {$fields} FROM `" . $wpdb->prefix . Utill::TABLES['commission'] . '`';

        if ( ! empty( $predicate ) ) {
            $query .= ' WHERE ' . implode( ' AND ', $predicate );
        }

        // Sorting (safe & only if not count).
        if ( ! $count && ! empty( $orderBy ) ) {
            $orderBy = esc_sql( $orderBy );
            if ( ! in_array( $order, array( 'ASC', 'DESC' ), true ) ) {
                $order = 'ASC';
            }
            $query .= " ORDER BY {$orderBy} {$order}";
        }

        // Pagination.
        if ( -1 !== ! $count && $page && $perpage && $perpage ) {
            $limit  = intval( $perpage );
            $offset = ( $page - 1 ) * $limit;
            $query .= " LIMIT {$limit} OFFSET {$offset}";
        }

        // If only count requested.
        if ( $count ) {
            return (int) $wpdb->get_var( $query ) ?? 0;
        }

        // Execute query.
        $commissions = $wpdb->get_results( $query );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                "Timestamp: " . current_time( 'mysql' ) . "\n" .
                "Error: " . $wpdb->last_error . "\n" .
                "Last Query: " . $wpdb->last_query . "\n" .
                "File: " . __FILE__ . "\n" .
                "Line: " . __LINE__ . "\n" .
                "Stack Trace: " . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        // Return object or raw array.
        if ( ! $object ) {
            return $commissions;
        }

        return array_map(
            function ( $commission ) {
                return new Commission( $commission );
            },
            $commissions
        );
    }

    /**
     * Get commission summary for a store or top N stores.
     *
     * @param   int  $store_id  Store ID.
     * @param   bool $top_stores  If true, fetch top N stores by total order value.
     * @param   int  $limit  Number of stores to fetch.
     *
     * @return  array  Array of commission summary.
     */
    public static function get_commission_summary_for_store( $store_id = null, $top_stores = false, $limit = 3 ) {
        global $wpdb;

        $table_name = $wpdb->prefix . Utill::TABLES['commission'];

        // If $top_stores = true, fetch top N stores by total order value.
        if ( $top_stores ) {
            $query = $wpdb->prepare(
                "
                SELECT 
                    store_id,
                    COALESCE(SUM(total_order_value), 0) AS total_order_amount,
                    COALESCE(SUM(facilitator_fee), 0) AS facilitator_fee,
                    COALESCE(SUM(gateway_fee), 0) AS gateway_fee,
                    COALESCE(SUM(store_shipping), 0) AS shipping_amount,
                    COALESCE(SUM(store_tax), 0) AS tax_amount,
                    COALESCE(SUM(store_shipping_tax), 0) AS shipping_tax_amount,
                    COALESCE(SUM(store_payable), 0) AS commission_total,
                    COALESCE(SUM(store_refunded), 0) AS commission_refunded
                FROM {$table_name}
                GROUP BY store_id
                ORDER BY total_order_amount DESC
                LIMIT %d
            ",
                $limit
            );

            $results = $wpdb->get_results( $query );

            if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
                MultiVendorX()->util->log(
                    "========= MULTIVENDORX ERROR =========\n" .
                    "Timestamp: " . current_time( 'mysql' ) . "\n" .
                    "Error: " . $wpdb->last_error . "\n" .
                    "Last Query: " . $wpdb->last_query . "\n" .
                    "File: " . __FILE__ . "\n" .
                    "Line: " . __LINE__ . "\n" .
                    "Stack Trace: " . wp_debug_backtrace_summary() . "\n" .
                    "=========================================\n\n"
                );
            }

            return array_map(
                function ( $row ) {
                    $store      = new Store( $row->store_id );
                    $store_name = $store ? $store->get( 'name' ) : '';

                    return array(
						'store_id'            => intval( $row->store_id ),
						'store_name'          => $store_name,
						'total_order_amount'  => floatval( $row->total_order_amount ),
						'facilitator_fee'     => floatval( $row->facilitator_fee ),
						'gateway_fee'         => floatval( $row->gateway_fee ),
						'shipping_amount'     => floatval( $row->shipping_amount ),
						'tax_amount'          => floatval( $row->tax_amount ),
						'shipping_tax_amount' => floatval( $row->shipping_tax_amount ),
						'commission_total'    => floatval( $row->commission_total ),
						'commission_refunded' => floatval( $row->commission_refunded ),
                    );
                },
                $results
            );
        }

        // Summary for a specific store.
        $query = "
            SELECT 
                COALESCE(SUM(total_order_value), 0) AS total_order_amount,
                COALESCE(SUM(facilitator_fee), 0) AS facilitator_fee,
                COALESCE(SUM(gateway_fee), 0) AS gateway_fee,
                COALESCE(SUM(store_shipping), 0) AS shipping_amount,
                COALESCE(SUM(store_tax), 0) AS tax_amount,
                COALESCE(SUM(store_shipping_tax), 0) AS shipping_tax_amount,
                COALESCE(SUM(store_payable), 0) AS commission_total,
                COALESCE(SUM(store_refunded), 0) AS commission_refunded
            FROM {$table_name}
        ";

        if ( ! empty( $store_id ) ) {
            $query .= $wpdb->prepare( ' WHERE store_id = %d', $store_id );
        }

        $result = $wpdb->get_row( $query );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                "========= MULTIVENDORX ERROR =========\n" .
                "Timestamp: " . current_time( 'mysql' ) . "\n" .
                "Error: " . $wpdb->last_error . "\n" .
                "Last Query: " . $wpdb->last_query . "\n" .
                "File: " . __FILE__ . "\n" .
                "Line: " . __LINE__ . "\n" .
                "Stack Trace: " . wp_debug_backtrace_summary() . "\n" .
                "=========================================\n\n"
            );
        }

        return array(
            'total_order_amount'  => floatval( $result->total_order_amount ),
            'facilitator_fee'     => floatval( $result->facilitator_fee ),
            'gateway_fee'         => floatval( $result->gateway_fee ),
            'shipping_amount'     => floatval( $result->shipping_amount ),
            'tax_amount'          => floatval( $result->tax_amount ),
            'shipping_tax_amount' => floatval( $result->shipping_tax_amount ),
            'commission_total'    => floatval( $result->commission_total ),
            'commission_refunded' => floatval( $result->commission_refunded ),
        );
    }
}
