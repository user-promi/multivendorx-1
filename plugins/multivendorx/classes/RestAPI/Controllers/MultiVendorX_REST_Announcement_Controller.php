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
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
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

    /**
     * Get announcement items using WP functions only
     */
    public static function get_announcement_items( $args ) {
        $defaults = [
            'post_type'      => 'multivendorx_an',
            'post_status'    => [ 'publish', 'pending' ],
            'posts_per_page' => 10,
            's'              => '',
        ];
        $query_args = wp_parse_args( $args, $defaults );

        // Handle count-only mode
        if ( isset( $args['status'] ) && $args['status'] !== 'all' ) {
            $query_args['post_status'] = $args['status'];
        }

        if ( isset( $args['count'] ) && $args['count'] ) {
            $counts = wp_count_posts( 'multivendorx_an' );
            $total = array_sum( (array) $counts ) ? array_sum( (array) $counts ) : 0;
            $publish = isset( $counts->publish ) ? (int) $counts->publish : 0;
            $pending = isset( $counts->pending ) ? (int) $counts->pending : 0;
            $totalcounts = ['total' => $total, 'publish' => $publish, 'pending' => $pending];
            return $totalcounts ;
        }

        // Fetch posts
        $posts = get_posts( $query_args );
        $items = [];

        foreach ( $posts as $post ) {
            $id     = (int) $post->ID;
            $stores = get_post_meta( $id, '_mvx_announcement_stores', true );
            $store_names = [];

            if ( is_array( $stores ) ) {
                foreach ( $stores as $store_id ) {
                    $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
                    if ( $store_obj && ! empty( $store_obj->data['name'] ) ) {
                        $store_names[] = $store_obj->data['name'];
                    }
                }
            }

            $items[] = [
                'id'      => $id,
                'title'   => $post->post_title,
                'content' => $post->post_content,
                'status'  => $post->post_status,
                'stores'  => $store_names,
                'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
            ];
        }

        return $items;
    }


    // GET 
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $status_param = $request->get_param( 'status' );
    
        $args = [
            'post_type'      => 'multivendorx_an',
            'status'         => $status_param ?: 'all',
            's'              => $request->get_param( 's' ) ?: '',
            'posts_per_page' => $limit,
            'offset'         => $offset,
        ];
    
        // Data
        $items = self::get_announcement_items( $args );
    
        // Counts
        $totalcounts = self::get_announcement_items( ['count' => true ] );
    
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
            'items'  => $items,
            'total'  => $total,
            'page'   => $page,
            'limit'  => $limit,
            'all'     => $totalcounts['total'],
            'publish' => $totalcounts['publish'],
            'pending' => $totalcounts['pending'],
        ] );        
    }    
        
    
    
    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        $data = $request->get_json_params();
    
        // Unwrap formData if present
        $formData = isset($data['formData']) ? $data['formData'] : $data;
    
        $title   = isset($formData['title']) ? sanitize_text_field($formData['title']) : '';
        $content = isset($formData['content']) ? sanitize_textarea_field($formData['content']) : '';
        $stores  = isset($formData['stores']) ? $formData['stores'] : [];
        $status  = ( isset($formData['status']) && in_array($formData['status'], ['publish','pending'], true) )
            ? $formData['status']
            : 'publish'; // fallback
    
        if ( is_string( $stores ) ) {
            $stores = array_filter( array_map( 'trim', explode( ',', $stores ) ) );
        } elseif ( ! is_array( $stores ) ) {
            $stores = [];
        }
    
        // Insert post
        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_content' => $content,
            'post_type'    => 'multivendorx_an',
            'post_status'  => $status,   // ✅ use dynamic status
        ], true);
    
        if ( is_wp_error( $post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $post_id->get_error_message(),
            ]);
        }
    
        // Save stores if provided
        if ( ! empty($stores) ) {
            update_post_meta( $post_id, '_mvx_announcement_stores', $stores );
        }
    
        // Optionally save URL as post meta
        $url = $formData['url'] ?? '';
        if ( ! empty($url) ) {
            update_post_meta( $post_id, '_mvx_announcement_url', esc_url_raw($url) );
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'title'   => $title,
            'url'     => $url,
            'content' => $content,
            'status'  => $status,   // ✅ return back status
            'stores'  => $stores,
        ]);
    }
        
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }
    
        $data = $request->get_json_params();
    
        // ✅ Bulk update handling
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
    
        if ( ! $post || $post->post_type !== 'multivendorx_an' ) {
            return new \WP_Error( 'not_found', __( 'Announcement not found', 'multivendorx' ), [ 'status' => 404 ] );
        }
    
        $title   = sanitize_text_field( $data['title'] ?? $post->post_title );
        $content = sanitize_textarea_field( $data['content'] ?? $post->post_content );
        $status  = ( isset($data['status']) && $data['status'] === 'publish' ) ? 'publish' : 'pending';
        $stores  = isset($data['stores']) ? (array) $data['stores'] : get_post_meta( $id, '_mvx_announcement_stores', true );
    
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
    
        // Update stores
        if ( ! empty($stores) ) {
            update_post_meta( $id, '_mvx_announcement_stores', $stores );
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $id,
            'title'   => $title,
            'content' => $content,
            'status'  => $status,
            'stores'  => $stores,
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
                __( 'Invalid announcement ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        $post = get_post( $id );
        if ( ! $post || $post->post_type !== 'multivendorx_an' ) {
            return new \WP_Error(
                'not_found',
                __( 'Announcement not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }
    
        $title   = $post->post_title;
        $content = $post->post_content;
        $url     = get_post_meta( $id, '_mvx_announcement_url', true );
        $stores  = get_post_meta( $id, '_mvx_announcement_stores', true );
    
        $store_data = array();
        if ( ! empty( $stores ) && is_array( $stores ) ) {
            foreach ( $stores as $store_id ) {
                $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
                if ( $store_obj && ! empty( $store_obj->data['name'] ) ) {
                    $store_data[] = array(
                        'id'   => $store_id,
                        'name' => $store_obj->data['name'],
                    );
                }
            }
        }

        $response = array(
            'id'      => $id,
            'title'   => $title,
            'content' => $content,
            'url'     => $url,
            'stores'  => $store_data,
            'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
        );

        return rest_ensure_response( $response );
    }

    
}