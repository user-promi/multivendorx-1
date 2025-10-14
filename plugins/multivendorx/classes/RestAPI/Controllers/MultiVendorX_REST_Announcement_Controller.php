<?php

namespace MultiVendorX\RestAPI\Controllers;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Announcement_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'announcement';

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
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
            ],
        ]);
       
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => [ $this, 'delete_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ], // only admins can delete
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

    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        $limit        = max( intval( $request->get_param( 'row' ) ), 10 );
        $page         = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset       = ( $page - 1 ) * $limit;
        $count_param  = $request->get_param( 'count' );
        $status_param = $request->get_param( 'status' );
        $searchField  = sanitize_text_field( $request->get_param( 'searchField' ) );
    
        $start_date_raw = sanitize_text_field( $request->get_param( 'startDate' ) );
        $end_date_raw   = sanitize_text_field( $request->get_param( 'endDate' ) );
        
        $start_timestamp = ! empty( $start_date_raw ) ? strtotime( str_replace('T', ' ', preg_replace('/\.\d+Z?$/', '', $start_date_raw)) ) : false;
        $end_timestamp   = ! empty( $end_date_raw )   ? strtotime( str_replace('T', ' ', preg_replace('/\.\d+Z?$/', '', $end_date_raw)) )   : false;
        
        $start_date = $start_timestamp ? date( 'Y-m-d 00:00:00', $start_timestamp ) : '';
        $end_date   = $end_timestamp   ? date( 'Y-m-d 23:59:59', $end_timestamp )   : '';
    
        // Existing count logic
        if ( $count_param ) {
            $posts = get_posts([
                'post_type'      => 'multivendorx_an',
                'posts_per_page' => -1,
                'fields'         => 'ids',
                'post_status'    => 'any',
            ]);
            return rest_ensure_response( count( $posts ) );
        }
    
        // Base query args — always show latest first
        $query_args = [
            'post_type'        => 'multivendorx_an',
            'posts_per_page'   => $limit,
            'offset'           => $offset,
            'post_status'      => $status_param ? $status_param : 'any',
            'orderby'          => 'date',          // sort by post_date
            'order'            => 'DESC',          // latest first
            'suppress_filters' => false,           // ensure no filters override sorting
            'no_found_rows'    => false,           // enables pagination count
        ];

        // Add date filter if provided
        if ( $start_date && $end_date ) {
            $query_args['date_query'] = [
                [
                    'after'     => $start_date,
                    'before'    => $end_date,
                    'inclusive' => true,
                ],
            ];
        }
    
        // Add title search only if searchField has value
        if ( ! empty( $searchField ) ) {
            $query_args['s'] = $searchField; // WP_Query searches post_title + content
        }
    
        $posts = get_posts( $query_args );
        $items = [];
    
        foreach ( $posts as $post ) {
            $stores = (array) get_post_meta( $post->ID, 'multivendorx_announcement_stores', true );
            $store_names = [];
    
            foreach ( $stores as $store_id ) {
                $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
                if ( $store_obj ) {
                    $store_names[] = $store_obj->get('name');
                }
            }
    
            $items[] = [
                'id'         => $post->ID,
                'title'      => $post->post_title,
                'content'    => $post->post_content,
                'store_name' => implode(', ', $store_names),
                'date'       => get_the_date( 'Y-m-d H:i:s', $post->ID ),
                'status'     => $post->post_status,
            ];
        }
    
        // Counts (no date or search filter applied)
        $counter = function( $status ) {
            $args = [
                'post_type'      => 'multivendorx_an',
                'post_status'    => $status,
                'posts_per_page' => 1,
                'fields'         => 'ids',
                'no_found_rows'  => false,
            ];
    
            $q = new \WP_Query( $args );
            $count = isset( $q->found_posts ) ? intval( $q->found_posts ) : 0;
            wp_reset_postdata();
            return $count;
        };
    
        $publish_count = $counter( 'publish' );
        $pending_count = $counter( 'pending' );
        $draft_count   = $counter( 'draft' );
        $all_count     = $counter( 'any' );
    
        return rest_ensure_response([
            'items'   => $items,
            'all'     => $all_count,
            'publish' => $publish_count,
            'pending' => $pending_count,
            'draft'   => $draft_count,
        ]);
    }
    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }

        $stores  = $request->get_param('stores') ?: [];   
    
        $post_id = wp_insert_post([
            'post_title'   => $request->get_param('title'),
            'post_content' => $request->get_param('content'),
            'post_type'    => 'multivendorx_an',
            'post_status'  => $request->get_param('status') ?? 'draft',
        ], true);
    
        if ( is_wp_error( $post_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $post_id->get_error_message(),
            ]);
        }
    
        // Save stores if provided
        if ( ! empty($stores) ) {
            update_post_meta( $post_id, 'multivendorx_announcement_stores', $stores );
        }
    
        // Optionally save URL as post meta
        $url = $formData['url'] ?? '';
        if ( ! empty($url) ) {
            update_post_meta( $post_id, 'multivendorx_announcement_url', esc_url_raw($url) );
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'title'   => $request->get_param('title'),
            'url'     => $url,
            'content' => $request->get_param('content'),
            'status'  => $request->get_param('status') === 'publish'  ? 'publish' : 'pending',
            'stores'  => $stores,
        ]);
    }
        
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }
    
        $data = $request->get_params();
        $stores  = $request->get_param('stores') ?: [];   
    
        // Bulk update handling
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
    
        // Normal single update
        $post_id = absint( $request->get_param( 'id' ) );
        $post    = get_post( $post_id );
    
        if ( ! $post || $post->post_type !== 'multivendorx_an' ) {
            return new \WP_Error( 'not_found', __( 'Announcement not found', 'multivendorx' ), [ 'status' => 404 ] );
        }
    
        // Update post with new title/content/status
        $updated_id = wp_update_post([
            'ID'           => $post_id,
            'post_title'   => sanitize_text_field($data['title'] ?? ''),
            'post_content' => sanitize_textarea_field($data['content'] ?? ''),
            'post_status'  => isset($data['status']) && in_array($data['status'], ['publish','pending','draft'], true)
                ? $data['status']
                : 'draft',
        ], true );
    
        if ( is_wp_error( $updated_id ) ) {
            return rest_ensure_response([
                'success' => false,
                'message' => $updated_id->get_error_message(),
            ]);
        }
    
        // Update stores meta
        update_post_meta($post_id, 'multivendorx_announcement_stores', $stores);
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'title'   => $data['title'] ?? '',
            'content' => $data['content'] ?? '',
            'status'  => get_post_status($post_id),
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
    
        $store_data = array();
        if ( ! empty( $stores ) && is_array( $stores ) ) {
            foreach ( $stores as $store_id ) {
                $store_obj = MultivendorX()->store->get_store_by_id( $store_id );
                if ( $store_obj ) {
                    $store_data[] = array(
                        'id'   => $store_id,
                        'name' => $store_obj->get('name'),
                    );
                }
            }
        }

        $response = array(
            'id'      => $id,
            'title'   => $post->post_title,
            'content' => $post->post_content,
            'status'  => $post->post_status,
            'url'     => get_post_meta( $id, 'multivendorx_announcement_url', true ),
            'stores'  => get_post_meta( $id, 'multivendorx_announcement_stores', true ),
            'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
        );

        return rest_ensure_response( $response );
    }
    
    public function delete_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), [ 'status' => 403 ] );
        }
    
        $post_id = absint( $request->get_param( 'id' ) );
        if ( ! $post_id ) {
            return new \WP_Error( 'invalid_id', __( 'Invalid announcement ID', 'multivendorx' ), [ 'status' => 400 ] );
        }
    
        $post = get_post( $post_id );
        if ( ! $post || $post->post_type !== 'multivendorx_an' ) {
            return new \WP_Error( 'not_found', __( 'Announcement not found', 'multivendorx' ), [ 'status' => 404 ] );
        }
    
        $deleted = wp_delete_post( $post_id, true ); // true = force delete
        if ( ! $deleted ) {
            return new \WP_Error( 'delete_failed', __( 'Failed to delete announcement', 'multivendorx' ), [ 'status' => 500 ] );
        }
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $post_id,
            'message' => __( 'Announcement deleted successfully', 'multivendorx' ),
        ]);
    }
    
    
}