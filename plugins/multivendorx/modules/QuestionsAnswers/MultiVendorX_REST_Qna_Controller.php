<?php

namespace MultiVendorX\QuestionsAnswers;
use MultiVendorX\QuestionsAnswers\Util;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Qna_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'qna';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

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
            [
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'delete_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
        ]);
    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' )||current_user_can('edit_stores');
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'create_stores' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('edit_stores');
    }


    /**
     * Get QnA items with optional pagination and date filter
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }

        $store_id   = $request->get_param( 'store_id' );
        $limit      = max( intval( $request->get_param( 'row' ) ), 10 );
        $page       = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset     = ( $page - 1 ) * $limit;
        $start_date = $request->get_param('startDate');
        $end_date   = $request->get_param('endDate');

        // Count only
        if ( $request->get_param( 'count' ) ) {
            $total_count = Util::get_question_information( [ 'count' => true ] );
            return rest_ensure_response( (int) $total_count );
        }

        // Prepare args
        $args = [
            'limit'  => $limit,
            'offset' => $offset,
        ];

        if ( $start_date ) {
            $args['start_date'] = sanitize_text_field( $start_date );
        }
        if ( $end_date ) {
            $args['end_date'] = sanitize_text_field( $end_date );
        }

        // Store-wise filter (optional)
        if ( $store_id ) {
            $args['store_id'] = intval( $store_id );
        }

        $questions = Util::get_question_information( $args );

        // Format response
        $formatted = array_map( function( $q ) {
            $product = wc_get_product( $q['product_id'] );
            return [
                'id'                  => (int) $q['id'],
                'product_id'          => (int) $q['product_id'],
                'product_name'        => $product ? $product->get_name() : '',
                'product_link'        => $product ? get_permalink( $product->get_id() ) : '',
                'question_text'       => $q['question_text'],
                'answer_text'         => $q['answer_text'],
                'question_by'         => (int) $q['question_by'],
                'author_name'         => get_the_author_meta( 'display_name', $q['question_by'] ),
                'question_date'       => $q['question_date'],
                'time_ago'            => human_time_diff( strtotime( $q['question_date'] ), current_time( 'timestamp' ) ) . ' ago',
                'total_votes'         => (int) $q['total_votes'],
                'question_visibility' => $q['question_visibility'],
            ];
        }, $questions );

        return rest_ensure_response( $formatted );
    }

    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }

    }

    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
        
        $current_user_id = get_current_user_id();
        $current_user    = wp_get_current_user();
    
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error( 'invalid_id', __( 'Invalid ID', 'multivendorx' ), [ 'status' => 400 ] );
        }
    
        $q = reset( Util::get_question_information( [ 'id' => $id ] ) );
        if ( ! $q ) {
            return new \WP_Error( 'not_found', __( 'Question not found', 'multivendorx' ), [ 'status' => 404 ] );
        }
    
        // Permission check
        if ( ! in_array( 'administrator', $current_user->roles ) ) {
            if ( in_array( 'store_owner', $current_user->roles ) ) {
                $product = wc_get_product( $q['product_id'] );
                if ( ! $product || $product->get_author() != $current_user_id ) {
                    return new \WP_Error( 'forbidden', __( 'You are not allowed to view this question', 'multivendorx' ), [ 'status' => 403 ] );
                }
            } else {
                return new \WP_Error( 'forbidden', __( 'You are not allowed to view this question', 'multivendorx' ), [ 'status' => 403 ] );
            }
        }
    
        $product       = wc_get_product( $q['product_id'] );
        $product_name  = $product ? $product->get_name() : '';
        $product_link  = $product ? get_permalink( $product->get_id() ) : '';
        $product_image = $product ? wp_get_attachment_url( $product->get_image_id() ) : '';
    
        $data = [
            'id'                  => (int) $q['id'],
            'product_id'          => (int) $q['product_id'],
            'product_name'        => $product_name,
            'product_link'        => $product_link,
            'product_image'       => $product_image,
            'question_text'       => $q['question_text'],
            'answer_text'         => $q['answer_text'],
            'question_by'         => (int) $q['question_by'],
            'author_name'         => get_the_author_meta( 'display_name', $q['question_by'] ),
            'question_date'       => $q['question_date'],
            'time_ago'            => human_time_diff( strtotime( $q['question_date'] ), current_time( 'timestamp' ) ) . ' ago',
            'total_votes'         => (int) $q['total_votes'],
            'question_visibility' => $q['question_visibility'],
        ];
    
        return rest_ensure_response( $data );
    }
    
    public function update_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        // Get question ID
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid question ID', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        // Fetch the question
        $q = reset( Util::get_question_information( [ 'id' => $id ] ) );
        if ( ! $q ) {
            return new \WP_Error(
                'not_found',
                __( 'Question not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // Fields that can be updated
        $answer_text = $request->get_param( 'answer_text' );
        $visibility  = $request->get_param( 'question_visibility' );
    
        $data_to_update = [];
    
        if ( isset( $answer_text ) ) {
            $data_to_update['answer_text'] = sanitize_textarea_field( $answer_text );
        }
    
        if ( isset( $visibility ) ) {
            $allowed = [ 'public', 'private', 'hidden' ];
            if ( in_array( $visibility, $allowed, true ) ) {
                $data_to_update['question_visibility'] = sanitize_text_field( $visibility );
            } else {
                return new \WP_Error(
                    'invalid_visibility',
                    __( 'Invalid visibility value', 'multivendorx' ),
                    [ 'status' => 400 ]
                );
            }
        }
    
        if ( empty( $data_to_update ) ) {
            return new \WP_Error(
                'nothing_to_update',
                __( 'No valid fields to update', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        // Save via Util helper
        $updated = Util::update_question( $id, $data_to_update );
    
        if ( ! $updated ) {
            return rest_ensure_response( [ 'success' => false ] );
        }
    
        return rest_ensure_response( [ 'success' => true ] );
    }
    
    public function get_store_wise_qna( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        $store_id = intval( $request->get_param( 'store_id' ) );
        if ( ! $store_id ) {
            return new \WP_Error(
                'invalid_store',
                __( 'Invalid store ID', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $count  = $request->get_param( 'count' );
        
        $product_ids = wc_get_products( array(
            'status'   => 'publish',               // Only published products
            'limit'    => -1,                      // Get all products
            'return'   => 'ids',                   // Return only IDs
            'meta_key' => 'multivendorx_store_id', // Meta key
            'meta_value' => $store_id,             // Store ID you want to match
        ) );
        
        if ( empty( $product_ids ) ) {
            return rest_ensure_response( $count ? 0 : [] );
        }
    
        $qna_args = [
            'limit'       => $count ? 0 : $limit,
            'offset'      => $offset,
            'product_ids' => $product_ids,
        ];
    
        if ( $count ) {
            $total_count = Util::get_question_information( array_merge( $qna_args, ['count' => true] ) );
            return rest_ensure_response( (int) $total_count );
        }
    
        $qna_entries = Util::get_question_information( $qna_args );
        if ( empty( $qna_entries ) ) {
            return rest_ensure_response( [] );
        }
    
        // Step 3: Format response
        $formatted = array_map( function( $q ) {
            $product       = wc_get_product( $q['product_id'] );
            $product_name  = $product ? $product->get_name() : '';
            $product_link  = $product ? get_permalink( $product->get_id() ) : '';
            $product_image = $product ? wp_get_attachment_url( $product->get_image_id() ) : '';
    
            return [
                'id'                  => (int) $q['id'],
                'product_id'          => (int) $q['product_id'],
                'product_name'        => $product_name,
                'product_link'        => $product_link,
                'product_image'       => $product_image,
                'question_text'       => $q['question_text'],
                'answer_text'         => $q['answer_text'],
                'question_by'         => (int) $q['question_by'],
                'author_name'         => get_the_author_meta( 'display_name', $q['question_by'] ),
                'question_date'       => $q['question_date'],
                'time_ago'            => human_time_diff( strtotime( $q['question_date'] ), current_time( 'timestamp' ) ) . ' ago',
                'total_votes'         => (int) $q['total_votes'],
                'question_visibility' => $q['question_visibility'],
            ];
        }, $qna_entries );
    
        return rest_ensure_response( $formatted );
    }
    public function delete_item( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        // Get question ID
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid question ID', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        // Fetch the question
        $q = reset( Util::get_question_information( [ 'id' => $id ] ) );
        if ( ! $q ) {
            return new \WP_Error(
                'not_found',
                __( 'Question not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // Delete via Util helper (implement delete_question in Util)
        $deleted = Util::delete_question( $id );
    
        if ( ! $deleted ) {
            return new \WP_Error(
                'delete_failed',
                __( 'Failed to delete question', 'multivendorx' ),
                [ 'status' => 500 ]
            );
        }
    
        return rest_ensure_response( [ 'success' => true ] );
    }
    
    
    
}