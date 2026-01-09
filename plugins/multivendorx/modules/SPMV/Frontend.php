<?php
/**
 * Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SPMV;

use MultiVendorX\Utill;
use MultiVendorX\StoreReview\Util;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Frontend SPMV controller.
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {

    /**
     * Constructor.
     */
    public function __construct() {
        add_action('pre_get_posts', [$this, 'filter_duplicate_product'] );
    }

    public function filter_duplicate_product($query) {
        if ( !$query->is_main_query() ||
            !(is_shop() || is_product_category()) ) {
            return;
        }

        $data = $this->get_mapped_product_data();

        if (empty($data['exclude'])) {
            return;
        }

        $query->set('post__not_in', $data['exclude']);
    }

    public function get_mapped_product_data() {
        global $wpdb;

        $priority = MultiVendorX()->setting->get_setting('spmv_show_order', 'min_price');

        $mapped_ids  = [];
        $primary_ids = [];

        $table = $wpdb->prefix . Utill::TABLES['products_map'];

        $maps = $wpdb->get_results("
            SELECT product_map
            FROM {$table}
        ");

        foreach ($maps as $map) {
            $ids = json_decode($map->product_map, true);
            if (empty($ids) || !is_array($ids)) {
                continue;
            }

            $mapped_ids = array_merge($mapped_ids, $ids);

            $selected_id = $this->select_primary_product($ids, $priority);

            if ($selected_id) {
                $primary_ids[] = $selected_id;
            }
        }

        return [
            'primary' => array_unique($primary_ids),
            'exclude' => array_diff(array_unique($mapped_ids), $primary_ids),
        ];
    }

    public function select_primary_product(array $ids, string $priority) {
        $selected_id = null;

        switch ($priority) {

            case 'max_price':
                $best = 0;
                foreach ($ids as $pid) {
                    $price = (float) get_post_meta($pid, '_price', true);
                    if ($price > $best) {
                        $best = $price;
                        $selected_id = $pid;
                    }
                }
                break;

            case 'top_rated_store':
                $best = 0;
                foreach ($ids as $pid) {
                    $store_id = get_post_meta($pid, 'multivendorx_store_id', true);
                    $rating   = Util::get_overall_rating( $store_id );;

                    if ($rating > $best) {
                        $best = $rating;
                        $selected_id = $pid;
                    }
                }
                break;

            case 'min_price':
            default:
                $best = PHP_FLOAT_MAX;
                foreach ($ids as $pid) {
                    $price = (float) get_post_meta($pid, '_price', true);
                    if ($price > 0 && $price < $best) {
                        $best = $price;
                        $selected_id = $pid;
                    }
                }
                break;
        }

        return $selected_id;
    }

}