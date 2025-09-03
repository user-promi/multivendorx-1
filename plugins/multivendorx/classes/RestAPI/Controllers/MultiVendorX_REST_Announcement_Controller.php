<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Announcement_Controller extends \WP_REST_Controller {
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
	protected $rest_base = 'announcement';

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
        ] );

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
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
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
    
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $count  = $request->get_param( 'count' );
    
        // Default type
        $type = $request->get_param( 'type' ) ?: 'multivendorx_an';
    
        // If only count requested
        if ( $count ) {
            $total = wp_count_posts( $type );
            return rest_ensure_response( (int) $total->publish );
        }
    
        $query = new \WP_Query( array(
            'post_type'      => $type,
            'post_status'    => 'publish',
            'posts_per_page' => $limit,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ) );
    
        $formatted_items = array();
    
        foreach ( $query->posts as $post ) {
            $id      = (int) $post->ID;
            $title   = $post->post_title;
            $content = apply_filters( 'the_content', $post->post_content );
            $url     = get_post_meta( $id, '_mvx_announcement_url', true );
            $vendors = get_post_meta( $id, '_mvx_vendor_notices_vendors', true );
    
            $formatted_items[] = apply_filters(
                'multivendorx_' . $type,
                array(
                    'id'      => $id,
                    'title'   => $title,
                    'content' => $content,
                    'url'     => $url,
                    'vendors' => $vendors,
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
    
        $title   = isset($formData['title']) ? sanitize_text_field($formData['title']) : '';
        $url     = isset($formData['url']) ? esc_url_raw($formData['url']) : '';
        $content = isset($formData['content']) ? sanitize_textarea_field($formData['content']) : '';
        $vendors = isset($formData['vendors']) ? (array) $formData['vendors'] : [];
    
        // Insert post
        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_content' => $content,
            'post_type'    => 'multivendorx_an', // ✅ corrected post type
            'post_status'  => 'publish',
        ], true);
    
        // Save vendors if provided
        if ( ! empty($vendors) ) {
            update_post_meta( $post_id, '_mvx_vendor_notices_vendors', $vendors );
        }
    
        // Optionally save URL as post meta
        if ( ! empty($url) ) {
            update_post_meta( $post_id, '_mvx_announcement_url', $url );
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'title'   => $title,
            'url'     => $url,
            'content' => $content,
            'vendors' => $vendors,
        ]);
    }
    
    

    public function update_item( $request ) {
       
    }
}