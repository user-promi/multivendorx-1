<?php
namespace MultiVendorX\StoreReview;

use MultiVendorX\FrontendScripts;

if (!defined('ABSPATH')) exit;

class Frontend {

    public function __construct() {
        add_filter('multivendorx_rewrite_rules', [$this, 'add_review_rule'], 10, 2);
        add_filter('multivendorx_query_vars', [$this, 'add_query_vars']);
        add_filter('multivendorx_store_tabs', [$this, 'add_store_tab'], 10, 2);

        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
    }

    public function enqueue_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script('multivendorx-review-frontend-script');
        FrontendScripts::localize_scripts('multivendorx-review-frontend-script');
    }

    public function add_review_rule($rules, $instance) {
        $rules[] = [
            '^' . $instance->custom_store_url . '/([^/]+)/reviews?$',
            'index.php?' . $instance->custom_store_url . '=$matches[1]&store_review=true',
            'top',
        ];
        return $rules;
    }

    public function add_query_vars($vars) {
        $vars[] = 'store_review';
        return $vars;
    }

    public function add_store_tab($tabs, $store_id) {
        $tabs['reviews'] = [
            'title' => __('Reviews', 'multivendorx'),
            'url'   => $this->get_store_review_url($store_id),
        ];
        return $tabs;
    }

    public function get_store_review_url($store_id) {
        return MultiVendorX()->store->storeutil->get_store_url($store_id, 'reviews');
    }
}
