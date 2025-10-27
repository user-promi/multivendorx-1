<?php

namespace MultiVendorX\StoreReview;
use MultiVendorX\StoreReview\Util;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Store_Review_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'review';

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
        $start_date = $request->get_param( 'startDate' );
        $end_date   = $request->get_param( 'endDate' );
        $count      = $request->get_param( 'count' );
        $status      = $request->get_param( 'status' );
    
        $args = [];
    
        if ( $store_id ) {
            $args['store_id'] = intval( $store_id );
        }
        if ( $status ) {
            $args['status'] = intval( $status );
        }
        //Return count only
        if ( $count ) {
            $args['count'] = true;
            $total_count = Util::get_review_information( $args );
            return rest_ensure_response( (int) $total_count );
        }
    
        // 🔹 Add pagination & date filters
        $args['limit']  = $limit;
        $args['offset'] = $offset;
    
        if ( $start_date ) {
            $args['start_date'] = sanitize_text_field( $start_date );
        }
        if ( $end_date ) {
            $args['end_date'] = sanitize_text_field( $end_date );
        }
    
        // 🔹 Fetch raw review data
        $reviews = Util::get_review_information( $args );
    
        // 🔹 Format response
        $formatted = [];
    
        if ( ! empty( $reviews ) ) {
            foreach ( $reviews as $review ) {
                $customer = get_userdata( $review['customer_id'] );
                $customer_name = $customer ? $customer->display_name : __( 'Guest', 'multivendorx' );
    
                $formatted[] = [
                    'review_id'      => (int) $review['review_id'],
                    'store_id'       => (int) $review['store_id'],
                    'customer_id'    => (int) $review['customer_id'],
                    'customer_name'  => $customer_name,
                    'order_id'       => (int) $review['order_id'],
                    'overall_rating' => round( floatval( $review['overall_rating'] ), 2 ),
                    'review_title'   => sanitize_text_field( $review['review_title'] ),
                    'review_content' => wp_strip_all_tags( $review['review_content'] ),
                    'status'         => ucfirst( sanitize_text_field( $review['status'] ) ),
                    'reported'       => (int) $review['reported'],
                    'reply'          => $review['reply'] ?? '',
                    'reply_date'     => $review['reply_date'] ?? '',
                    'date_created'   => $review['date_created'],
                    'date_modified'  => $review['date_modified'],
                    'review_images'  => !empty($review['review_images'])
                        ? maybe_unserialize( $review['review_images'] )
                        : [],
                    // Optional — show human readable time difference
                    'time_ago'       => human_time_diff( strtotime( $review['date_created'] ), current_time( 'timestamp' ) ) . ' ' . __( 'ago', 'multivendorx' ),
                ];
            }
        }
    
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
    
        //Get review ID
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid review ID', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        // Fetch review info (replace this with your correct util function)
        $review = reset( Util::get_review_information( [ 'id' => $id ] ) );
        if ( ! $review ) {
            return new \WP_Error(
                'not_found',
                __( 'Review not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        //Fields that can be updated
        $reply  = $request->get_param( 'reply' );
        $status = $request->get_param( 'status' );
    
        $data_to_update = [];
    
        // Save reply text
        if ( isset( $reply ) ) {
            $data_to_update['reply'] = sanitize_textarea_field( $reply );
            $data_to_update['reply_date'] = current_time( 'mysql' );
        }
    
        //Save status (Pending / Approved / Rejected)
        if ( isset( $status ) ) {
            $allowed = [ 'Pending', 'Approved', 'Rejected' ];
            if ( in_array( $status, $allowed, true ) ) {
                $data_to_update['status'] = sanitize_text_field( $status );
            } else {
                return new \WP_Error(
                    'invalid_status',
                    __( 'Invalid status value', 'multivendorx' ),
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
    
        // 💾 Save to DB (replace with your helper function)
        $updated = Util::update_review( $id, $data_to_update );
    
        if ( ! $updated ) {
            return rest_ensure_response( [ 'success' => false ] );
        }
    
        return rest_ensure_response( [
            'success' => true,
            'data'    => [
                'id'     => $id,
                'updated' => $data_to_update,
            ],
        ] );
    }
    
    
    public function delete_item( $request ) {
        // 🔒 Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                [ 'status' => 403 ]
            );
        }
    
        // 🔹 Get review ID
        $id = absint( $request->get_param( 'id' ) );
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_id',
                __( 'Invalid review ID', 'multivendorx' ),
                [ 'status' => 400 ]
            );
        }
    
        // 🔹 Fetch the review (to confirm it exists)
        $review = reset( Util::get_review_information( [ 'review_id' => $id ] ) );
        if ( ! $review ) {
            return new \WP_Error(
                'not_found',
                __( 'Review not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // 🗑️ Delete via Util helper (this also deletes rating rows)
        $deleted = Util::delete_review( $id );
    
        if ( ! $deleted ) {
            return new \WP_Error(
                'delete_failed',
                __( 'Failed to delete review', 'multivendorx' ),
                [ 'status' => 500 ]
            );
        }
    
        // ✅ Success response
        return rest_ensure_response( [ 'success' => true ] );
    }
     
}