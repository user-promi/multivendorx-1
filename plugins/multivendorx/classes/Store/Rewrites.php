<?php
/**
 * MultiVendorX Rewrites class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Rewrites class.
 *
 * @class       Rewrites class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rewrites {

    /**
     * Custom store URL
     *
     * @var string
     */
    public $custom_store_url = '';

    /**
     * Hook into the functions
     */
    public function __construct() {
        $this->custom_store_url = MultiVendorX()->setting->get_setting( 'store_url', 'store' );

        add_action( 'init', array( $this, 'register_rule' ) );
        add_filter( 'query_vars', array( $this, 'register_query_var' ) );
        add_filter( 'template_include', array( $this, 'store_template' ), 10 );
        add_filter( 'render_block_context', array( $this, 'render_context' ), 10 );
        add_action( 'wp', array( $this, 'flash_rewrite_rules' ), 99 );
        // add_action( 'pre_get_posts', array( $this, 'store_query_filter' ) );
        add_filter( 'get_block_templates', array( $this, 'add_block_template' ), 10, 3 );
        add_filter( 'pre_get_block_file_template', array( $this, 'get_block_file_template' ), 10, 3 );
    }

    /**
     * Filter store query
     *
     * @param object $query The main query object.
     */
    public function store_query_filter( $query ) {
        if ( is_admin() || ! $query->is_main_query() ) {
            return;
        }

        $store_slug = get_query_var( $this->custom_store_url );
        if ( empty( $store_slug ) ) {
            return;
        }

        $store_obj = Store::get_store( $store_slug, 'slug' );
        if ( ! $store_obj ) {
            return;
        }

        $store_id = $store_obj->get_id();
        if ( ! $store_id ) {
            return;
        }

        if ( StoreUtil::get_excluded_products( '', $store_id ) ) {
            return;
        }

        // Force query to load products.
        $query->set( 'post_type', 'product' );

        // Add store filter.
        $meta_query   = $query->get( 'meta_query', array() );
        $meta_query[] = array(
            'key'     => Utill::POST_META_SETTINGS['store_id'],
            'value'   => $store_id,
            'compare' => '=',
        );
        $query->set( 'meta_query', $meta_query );

        // Pagination fix.
        $paged = max( 1, get_query_var( 'paged' ) );
        $query->set( 'paged', $paged );
        $query->set( 'wc_query', 'product_query' );
    }

    /**
     * Register custom rewrite rule for stores.
     */
    public function register_rule() {
        $page_id = MultiVendorX()->setting->get_setting( 'store_dashboard_page' );

        $rules = array(
            array(
                '^' . $this->custom_store_url . '/([^/]+)/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]',
                'top',
            ),
            array(
                '^' . $this->custom_store_url . '/([^/]+)/page/([0-9]{1,})/?$',
                'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]',
                'top',
            ),

            array(
                '^dashboard/([^/]+)/?([^/]*)/?([0-9]*)/?$',
                'index.php?page_id=' . $page_id . '&segment=$matches[1]&element=$matches[2]&context_id=$matches[3]',
                'top',
            ),

        );

        $rules = apply_filters( 'multivendorx_rewrite_rules', $rules, $this );

        add_rewrite_tag( '%segment%', '([^/]+)' );
        foreach ( $rules as $rule ) {
            add_rewrite_rule( $rule[0], $rule[1], $rule[2] );
        }
    }

    /**
     * Register query vars
     *
     * @param array $vars Query vars.
     */
    public function register_query_var( $vars ) {
        $vars[] = $this->custom_store_url;
        $vars[] = 'segment';

        return apply_filters( 'multivendorx_query_vars', $vars, $this );
    }

    /**
     * Load store template
     *
     * @param string $template Template path.
     * @return string Modified template path.
     */
    public function store_template( $template ) {
        $store_name = get_query_var( $this->custom_store_url );

        if ( empty( $store_name ) ) {
            return $template;
        }

        $store = Store::get_store( $store_name, 'slug' );
        if ( ! $store ) {
            return $template;
        }

        $plugin_template = trailingslashit( MultiVendorX()->plugin_path ) . 'templates/store/multivendorx-store.php';
        if ( file_exists( $plugin_template ) ) {
            return $plugin_template;
        }

        // Check for block template
        // $block_template = get_posts( array(
        //     'post_type' => 'wp_template',
        //     'name' => 'multivendorx-store',
        //     'posts_per_page' => 1,
        // ) );
        
        // if ( ! empty( $block_template ) && $store_name == 'store' ) {
        //     // Render block template
        //     $content = do_blocks( $block_template[0]->post_content );
            
        //     echo $content;
        //     exit;
        // }

        // Fallback to original template
        return $template;
    }

    function render_context($context) {

        $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $parts = explode('/', $path);

        if ($parts[0] === 'store' && !empty($parts[1])) {
            $context['multivendorx/store_slug'] = $parts[1];
        }

        return $context;
    }


    /**
     * Add block template to editor
     */
    public function add_block_template( $templates, $query, $template_type ) {
        if ( 'wp_template' !== $template_type ) {
            return $templates;
        }

        $theme_slug = get_stylesheet();
        $template_slug = 'multivendorx-store';

        // if ( ! get_query_var( $this->custom_store_url ) ) {
        //     return $templates;
        // }

        // Check if already exists
        $template_id   = $theme_slug . '//' . $template_slug;

        foreach ( $templates as $template ) {
            if ( $template->id === $template_id ) {
                return $templates;
            }
        }

        // Get saved template from database
        $saved = get_posts( array(
            'post_type' => 'wp_template',
            'name' => $template_slug,
            'posts_per_page' => 1,
        ) );

        // Default content
        $template_file = trailingslashit( MultiVendorX()->plugin_path ) . 'templates/store/store.html';
        $default_content = file_get_contents( $template_file );

        // Create template object
        $template = new \WP_Block_Template();
        $template->type = 'wp_template';
        $template->theme = $theme_slug;
        $template->slug = $template_slug;
        $template->id = $theme_slug . '//' . $template_slug;
        $template->title = 'MultiVendorX Store';
        $template->description = 'Template for vendor store pages';
        $template->source = 'plugin';
        $template->origin = $theme_slug;
        $template->status = 'publish';
        $template->has_theme_file = false;
        $template->is_custom = true;
        $template->content = ! empty( $saved ) ? $saved[0]->post_content : $default_content;
        $template->area = 'uncategorized';

        $templates[] = $template;
        return $templates;
    }

    /**
     * Get block file template for editing
     */
    public function get_block_file_template( $template, $id, $template_type ) {
        if ( 'wp_template' !== $template_type ) {
            return $template;
        }

        $theme_slug = get_stylesheet();
        $template_slug = 'multivendorx-store';
        $expected_id = $theme_slug . '//' . $template_slug;

        // Check if this is our template
        if ( $id !== $expected_id ) {
            return $template;
        }

        // Get saved template from database
        $saved = get_posts( array(
            'post_type' => 'wp_template',
            'name' => $template_slug,
            'posts_per_page' => 1,
        ) );

        // Default content
        $template_file = trailingslashit( MultiVendorX()->plugin_path ) . 'templates/store/store.html';
        $default_content = file_get_contents( $template_file );

        // Create template object
        $template_obj = new \WP_Block_Template();
        $template_obj->type = 'wp_template';
        $template_obj->theme = $theme_slug;
        $template_obj->slug = $template_slug;
        $template_obj->id = $expected_id;
        $template_obj->title = 'MultiVendorX Store';
        $template_obj->description = 'Template for vendor store pages';
        $template_obj->source = 'plugin';
        $template_obj->origin = $theme_slug;
        $template_obj->status = 'publish';
        $template_obj->has_theme_file = false;
        $template_obj->is_custom = true;
        $template_obj->content = ! empty( $saved ) ? $saved[0]->post_content : $default_content;
        $template_obj->area = 'uncategorized';

        return $template_obj;
    }

    /**
     * Flush rewrite rules
     */
    public function flash_rewrite_rules() {
        $this->register_rule();
        flush_rewrite_rules();
    }
}