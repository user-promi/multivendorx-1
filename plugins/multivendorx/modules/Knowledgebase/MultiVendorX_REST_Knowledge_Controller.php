<?php
/**
 * Knowledgebase REST API controller class.
 *
 * @package multivendorx
 */

namespace MultiVendorX\Knowledgebase;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API knowledge base controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class MultiVendorX_REST_Knowledge_Controller extends \WP_REST_Controller {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'knowledge';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    /**
     * Register the routes for knowledge base.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
    }

    /**
     * Get all knowledge base articles.
     *
     * @param object $request WP_REST_Request object.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );// phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * Create a knowledge base article.
     *
     * @param object $request WP_REST_Request object.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Update an existing knowledge base article.
     *
     * @param object $request WP_REST_Request object.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Get all knowledge base articles.
     *
     * @param object $request WP_REST_Request object.
     */
    public function get_items( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            MultiVendorX()->util->log( $error );
            return $error;
        }

        try {
            $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
            $page   = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset = ( $page - 1 ) * $limit;

            $count_param  = $request->get_param( 'count' );
            $status_param = $request->get_param( 'status' );
            $search_field = sanitize_text_field( $request->get_param( 'searchField' ) );

            $start_date_raw = sanitize_text_field( $request->get_param( 'startDate' ) );
            $end_date_raw   = sanitize_text_field( $request->get_param( 'endDate' ) );

            $start_timestamp = ! empty( $start_date_raw ) ? strtotime( preg_replace( '/\.\d+Z?$/', '', str_replace( 'T', ' ', $start_date_raw ) ) ) : false;
            $end_timestamp   = ! empty( $end_date_raw ) ? strtotime( preg_replace( '/\.\d+Z?$/', '', str_replace( 'T', ' ', $end_date_raw ) ) ) : false;

            $start_date = $start_timestamp ? gmdate( 'Y-m-d 00:00:00', $start_timestamp ) : '';
            $end_date   = $end_timestamp ? gmdate( 'Y-m-d 23:59:59', $end_timestamp ) : '';

            /**
             * COUNT ONLY
             */
            if ( $count_param ) {
                $posts = get_posts(
                    array(
                        'post_type'      => 'multivendorx_kb',
                        'posts_per_page' => -1,
                        'fields'         => 'ids',
                        'post_status'    => 'any',
                    )
                );
                return rest_ensure_response( count( $posts ) );
            }

            /**
             * MAIN QUERY
             */
            $query_args = array(
                'post_type'      => Utill::POST_TYPES['knowledge'],
                'posts_per_page' => $limit,
                'offset'         => $offset,
                'post_status'    => $status_param ? $status_param : 'any',
                'orderby'        => 'date',
                'order'          => 'DESC',
            );

            if ( $start_date && $end_date ) {
                $query_args['date_query'] = array(
                    array(
                        'after'     => $start_date,
                        'before'    => $end_date,
                        'inclusive' => true,
                    ),
                );
            }

            if ( ! empty( $search_field ) ) {
                $query_args['s'] = $search_field;
            }

            $posts = get_posts( $query_args );
            $items = array();

            foreach ( $posts as $post ) {
                $items[] = array(
                    'id'      => $post->ID,
                    'title'   => $post->post_title,
                    'content' => $post->post_content,
                    'date'    => get_the_date( 'Y-m-d H:i:s', $post->ID ),
                    'status'  => $post->post_status,
                );
            }

            /**
             * COUNTS (GLOBAL)
             * Optimized counter function
             */
            $counter = function ( $status ) {
                $q = new \WP_Query(
                    array(
                        'post_type'      => Utill::POST_TYPES['knowledge'],
                        'post_status'    => $status,
                        'posts_per_page' => 1,
                        'fields'         => 'ids',
                        'no_found_rows'  => false,
                    )
                );
                wp_reset_postdata();
                return isset( $q->found_posts ) ? intval( $q->found_posts ) : 0;
            };

            return rest_ensure_response(
                array(
                    'items'   => $items,
                    'all'     => $counter( 'any' ),
                    'publish' => $counter( 'publish' ),
                    'pending' => $counter( 'pending' ),
                    'draft'   => $counter( 'draft' ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }


    /**
     * Create a knowledge base article.
     *
     * @param object $request REST_Request object.
     */
    public function create_item( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            MultiVendorX()->util->log( $error );

            return $error;
        }

        try {
            $title   = sanitize_text_field( $request->get_param( 'title' ) );
            $content = wp_kses_post( $request->get_param( 'content' ) );
            $status  = sanitize_key( $request->get_param( 'status' ) ?? 'draft' );

            $post_id = wp_insert_post(
                array(
                    'post_title'   => $title,
                    'post_content' => $content,
                    'post_type'    => 'multivendorx_kb',
                    'post_status'  => $status,
                ),
                true
            );

            if ( is_wp_error( $post_id ) ) {
                return rest_ensure_response(
                    array(
                        'success' => false,
                        'message' => $post_id->get_error_message(),
                    )
                );
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $post_id,
                    'title'   => $title,
                    'content' => $content,
                    'status'  => $status,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Update a knowledge base article.
     *
     * @param object $request REST_Request object.
     */
    public function update_item( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            MultiVendorX()->util->log( $error );

            return $error;
        }

        try {
            $data = $request->get_params();

            /** -----------------------------------------
             * BULK UPDATE
             * ----------------------------------------- */
            if ( ! empty( $data['bulk'] ) && ! empty( $data['ids'] ) && ! empty( $data['action'] ) ) {
                $action = sanitize_key( $data['action'] );
                $ids    = array_map( 'absint', $data['ids'] );

                foreach ( $ids as $id ) {
                    switch ( $action ) {
                        case 'publish':
                        case 'pending':
                            wp_update_post(
                                array(
                                    'ID'          => $id,
                                    'post_status' => $action,
                                )
                            );
                            break;

                        case 'delete':
                            wp_delete_post( $id, true );
                            break;
                    }
                }

                return rest_ensure_response(
                    array(
                        'success' => true,
                        'bulk'    => true,
                    )
                );
            }

            /** -----------------------------------------
             * SINGLE UPDATE
             * ----------------------------------------- */
            $post_id = absint( $request->get_param( 'id' ) );
            $post    = get_post( $post_id );

            if ( ! $post || Utill::POST_TYPES['knowledge'] !== $post->post_type ) {
                return new \WP_Error(
                    'not_found',
                    __( 'Knowledge Base article not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            $new_title   = isset( $data['title'] ) ? sanitize_text_field( $data['title'] ) : $post->post_title;
            $new_content = isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : $post->post_content;

            $valid_statuses = array( 'publish', 'pending', 'draft' );
            $new_status     = isset( $data['status'] ) && in_array( $data['status'], $valid_statuses, true )
                                ? $data['status']
                                : $post->post_status;

            $updated_id = wp_update_post(
                array(
                    'ID'           => $post_id,
                    'post_title'   => $new_title,
                    'post_content' => $new_content,
                    'post_status'  => $new_status,
                ),
                true
            );

            if ( is_wp_error( $updated_id ) ) {
                return rest_ensure_response(
                    array(
                        'success' => false,
                        'message' => $updated_id->get_error_message(),
                    )
                );
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $post_id,
                    'title'   => $new_title,
                    'content' => $new_content,
                    'status'  => $new_status,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get a knowledge base item from the database.
     *
     * @param object $request The request object.
     */
    public function get_item( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }

        $id   = absint( $request->get_param( 'id' ) );
        $post = get_post( $id );

        if ( ! $post || Utill::POST_TYPES['knowledge'] !== $post->post_type ) {
            return new \WP_Error(
                'not_found',
                __( 'Knowledge Base article not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }

        return rest_ensure_response(
            array(
                'id'      => $id,
                'title'   => $post->post_title,
                'content' => $post->post_content,
                'status'  => $post->post_status,
                'date'    => get_post_time( 'Y-m-d H:i:s', true, $post ),
            )
        );
    }
    /**
     * Delete a knowledge base item from the database.
     *
     * @param object $request The request object.
     */
    public function delete_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }

        $post_id = absint( $request->get_param( 'id' ) );
        $post    = get_post( $post_id );

        if ( ! $post || Utill::POST_TYPES['knowledge'] !== $post->post_type ) {
            return new \WP_Error(
                'not_found',
                __( 'Knowledge Base article not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }

        $deleted = wp_delete_post( $post_id, true );

        if ( ! $deleted ) {
            return rest_ensure_response(
                array(
					'success' => false,
					'message' => __( 'Failed to delete the Knowledge Base article', 'multivendorx' ),
                )
            );
        }

        return rest_ensure_response(
            array(
				'success' => true,
				'id'      => $post_id,
				'message' => __( 'Knowledge Base article deleted successfully', 'multivendorx' ),
            )
        );
    }
}
