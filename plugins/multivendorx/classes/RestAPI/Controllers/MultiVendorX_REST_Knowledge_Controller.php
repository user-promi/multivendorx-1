<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Knowledge_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'knowledge';

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
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
        ] );

        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
            ],
        ]);

    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' );
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'manage_options' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('manage_options');
    }


    // GET 
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $count  = $request->get_param( 'count' );
    
        // Default type
        $type = $request->get_param( 'type' ) ?: 'multivendorx_kb';
    
        // If only count requested
        if ( $count ) {
            $total = wp_count_posts( $type );
            // Include both publish and pending
            $total_count = ( (int) $total->publish ) + ( (int) $total->pending );
            return rest_ensure_response( $total_count );
        }

        $query = new \WP_Query( array(
            'post_type'      => $type,
            'posts_per_page' => $limit,
            'post_status'    => array( 'publish', 'pending' ),
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ) );
    
        $formatted_items = array();
    
        foreach ( $query->posts as $post ) {

            $formatted_items[] = apply_filters(
                'multivendorx_' . $type,
                array(
                    'id'      => (int) $post->ID,
                    'title'   => $post->post_title,
                    'content' => $post->post_content,
                    'status'  => $post->post_status,
                    'date'    => get_the_date( 'c', $post ),
                )
            );
        }
    
        return rest_ensure_response( $formatted_items );
    }
    
    public function create_item( $request ) {
        $data = $request->get_json_params();
    
        // Unwrap formData if present
        $formData = isset($data['formData']) ? $data['formData'] : $data;

        // Sanitize inputs
        $title   = isset($formData['title']) ? sanitize_text_field($formData['title']) : '';
        $content = isset($formData['content']) ? sanitize_textarea_field($formData['content']) : '';
        $status  = isset($formData['status']) && $formData['status'] === 'publish' ? 'publish' : 'pending';
    
        // Insert post
        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_content' => $content,
            'post_type'    => 'multivendorx_kb',
            'post_status'  => $status,
        ], true);
    
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
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid KB ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'multivendorx_kb' ) {
            return new \WP_Error(
                'not_found',
                __( 'Knowledge Base article not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }
    
        $data    = $request->get_json_params();
        $title   = isset( $data['title'] ) ? sanitize_text_field( $data['title'] ) : $post->post_title;
        $content = isset( $data['content'] ) ? sanitize_textarea_field( $data['content'] ) : $post->post_content;
        $status  = isset( $data['status'] ) && $data['status'] === 'publish' ? 'publish' : 'pending';
    
        // Update the post
        $updated_post_id = wp_update_post([
            'ID'           => $id,
            'post_title'   => $title,
            'post_content' => $content,
            'post_status'  => $status,
        ], true);
    
        if ( is_wp_error( $updated_post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $updated_post_id->get_error_message(),
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
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid KB ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'multivendorx_kb' ) {
            return new \WP_Error(
                'not_found',
                __( 'Knowledge Base article not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }
    
        $response = array(
            'id'      => $id,
            'title'   => $post->post_title,
            'content' => $post->post_content,
            'status'  => $post->post_status,
            'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
        );
    
        return rest_ensure_response( $response );
    }
    
    
}