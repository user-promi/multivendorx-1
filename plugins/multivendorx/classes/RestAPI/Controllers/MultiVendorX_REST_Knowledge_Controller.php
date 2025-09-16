<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Knowledge_Controller extends \WP_REST_Controller {
    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'multivendorx/v1';

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'knowledge';

    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'create_item' ],
                'permission_callback' => [ $this, 'create_item_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE, // <-- add this
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
            ],
        ]);
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' );
    }

    public function create_item_permissions_check($request) {
        return current_user_can( 'manage_options' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('manage_options');
    }

    /**
     * Get knowledge base items using WP functions only
     */
    public static function get_knowledge_items( $args ) {
        $defaults = [
            'post_type'      => 'multivendorx_kb',
            'post_status'    => [ 'publish', 'pending' ],
            'posts_per_page' => 10,
            's'              => '',
        ];
        $query_args = wp_parse_args( $args, $defaults );

        if ( isset( $args['status'] ) && $args['status'] !== 'all' ) {
            $query_args['post_status'] = $args['status'];
        }

        if ( isset( $args['count'] ) && $args['count'] ) {
            $counts = wp_count_posts( 'multivendorx_kb' );
            $total = array_sum( (array) $counts ) ? array_sum( (array) $counts ) : 0;
            $publish = isset( $counts->publish ) ? (int) $counts->publish : 0;
            $pending = isset( $counts->pending ) ? (int) $counts->pending : 0;
            $totalcounts = ['total' => $total, 'publish' => $publish, 'pending' => $pending];
            return $totalcounts ;
        }

        $posts = get_posts( $query_args );
        $items = [];

        foreach ( $posts as $post ) {
            $items[] = [
                'id'      => $post->ID,
                'title'   => $post->post_title,
                'content' => $post->post_content,
                'status'  => $post->post_status,
                'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
            ];
        }

        return $items;
    }

    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }
    
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $status_param = $request->get_param( 'status' );
    
        $args = [
            'post_type'      => 'multivendorx_kb',
            'status'         => $status_param ?: 'all',
            's'              => $request->get_param( 'search' ),
            'posts_per_page' => $limit,
            'offset'         => $offset,
        ];
    
        // Data
        $items = self::get_knowledge_items( $args );
    
        // Counts
        $totalcounts = self::get_knowledge_items( [ 'count' => true ] );
    
        // Fix: treat $status_param as string, not array
        switch ( $status_param ) {
            case 'publish':
                $total = $totalcounts['publish'];
                break;
            case 'pending':
                $total = $totalcounts['pending'];
                break;
            default:
                $total = $totalcounts['total'];
        }
    
        return rest_ensure_response( [
            'items'   => $items,
            'total'   => $total,
            'page'    => $page,
            'limit'   => $limit,
            'all'     => $totalcounts['total'],
            'publish' => $totalcounts['publish'],
            'pending' => $totalcounts['pending'],
        ] );
    }    

    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        $data     = $request->get_json_params();
        $formData = isset($data['formData']) ? $data['formData'] : $data;

        $title   = sanitize_text_field( $formData['title'] ?? '' );
        $content = sanitize_textarea_field( $formData['content'] ?? '' );
        $status  = ( isset($formData['status']) && $formData['status'] === 'publish' ) ? 'publish' : 'pending';

        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_content' => $content,
            'post_type'    => 'multivendorx_kb',
            'post_status'  => $status,
        ], true );

        if ( is_wp_error( $post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $post_id->get_error_message(),
            ]);
        }

        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'title'   => $title,
            'content' => $content,
            'status'  => $status,
        ]);
    }

    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }
    
        $data = $request->get_json_params();
    
        // Check for bulk update
        if ( isset($data['bulk']) && !empty($data['ids']) && !empty($data['action']) ) {
            $action = sanitize_key( $data['action'] );
            $ids    = array_map( 'absint', $data['ids'] );
    
            foreach ( $ids as $id ) {
                switch ( $action ) {
                    case 'publish':
                    case 'pending':
                        wp_update_post([ 'ID' => $id, 'post_status' => $action ]);
                        break;
                    case 'delete':
                        wp_delete_post( $id, true );
                        break;
                }
            }
    
            return rest_ensure_response([ 'success' => true, 'bulk' => true ]);
        }
    
        // ✅ Normal single update
        $id   = absint( $request->get_param( 'id' ) );
        $post = get_post( $id );
    
        if ( ! $post || $post->post_type !== 'multivendorx_kb' ) {
            return new \WP_Error( 'not_found', __( 'Knowledge Base article not found', 'multivendorx' ), [ 'status' => 404 ] );
        }
    
        $title   = sanitize_text_field( $data['title'] ?? $post->post_title );
        $content = sanitize_textarea_field( $data['content'] ?? $post->post_content );
        $status  = ( isset($data['status']) && $data['status'] === 'publish' ) ? 'publish' : 'pending';
    
        $updated_id = wp_update_post([
            'ID'           => $id,
            'post_title'   => $title,
            'post_content' => $content,
            'post_status'  => $status,
        ], true );
    
        if ( is_wp_error( $updated_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $updated_id->get_error_message(),
            ]);
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $id,
            'title'   => $title,
            'content' => $content,
            'status'  => $status,
        ]);
    }    

    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }

        $id   = absint( $request->get_param( 'id' ) );
        $post = get_post( $id );

        if ( ! $post || $post->post_type !== 'multivendorx_kb' ) {
            return new \WP_Error( 'not_found', __( 'Knowledge Base article not found', 'multivendorx' ), [ 'status' => 404 ] );
        }

        return rest_ensure_response([
            'id'      => $id,
            'title'   => $post->post_title,
            'content' => $post->post_content,
            'status'  => $post->post_status,
            'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
        ]);
    }

}
