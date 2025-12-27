<?php
/**
 * AI Assistant REST API Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

class Import_dummy_data extends \WP_REST_Controller {

    /**
     * Route Base.
     *
     * @var string
     */
    protected $rest_base = 'import-dummy-data';

    /**
     * Register AI Assistant API routes
     */
    public function register_routes() {
        $data = register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Permission check for AI Operations
     *
     * @param mixed $request
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'edit_products' );
    }

    /**
     * Handle AI request (main entry point)
     *
     * @param mixed $request
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );

        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_REST_Response(
                array(
                    'success' => false,
                    'code'    => 'invalid_nonce',
                    'message' => __( 'Invalid nonce.', 'multistorex' ),
                ),
                401
            );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        return $this->import_dummy_data( $request );
    }

    public function import_dummy_data( $request ) {
        $store_owners = $this->import_store_owner();
        $store_ids = $this->import_stores( $store_owners );
        $product_ids = $this->import_products($store_ids);
        $this->import_commissions();
        if( $product_ids ){
            $this->import_orders( $product_ids);
            $this->import_reviews($product_ids);
        }
        return [
            'success' => true,
            'store_owners' => $store_owners,
            'store_ids' => $store_ids,
            'product_ids' => $product_ids
        ];        
    }

    public function import_store_owner() {

        $xml = simplexml_load_file( MultiVendorX()->plugin_path . '/assets/dummy-data/store_owners.xml' );
        $store_owners = [];
    
        foreach ( $xml->store as $store ) {
    
            $username = (string) $store->username;
            $email    = (string) $store->email;
    
            // 1. Check if user already exists
            $user = get_user_by( 'login', $username );
    
            if ( $user ) {
                $user_id = $user->ID;
            } else {
                $userdata = [
                    'user_login'    => $username,
                    'user_pass'     => (string) $store->password,
                    'user_email'    => $email,
                    'user_nicename' => (string) $store->nickname,
                    'first_name'    => (string) $store->firstname,
                    'last_name'     => (string) $store->lastname,
                    'role'          => 'store_owner',
                ];
    
                $user_id = wp_insert_user( $userdata );
    
                if ( is_wp_error( $user_id ) ) {
                    continue;
                }
            }

            $store_owners[] = (int) $user_id;
    
            // Image handling
            foreach ( $store->images->image as $image ) {
                $src = plugins_url( $image->src );
                $upload = wc_rest_upload_image_from_url( esc_url_raw( $src ) );
    
                if ( is_wp_error( $upload ) ) {
                    continue;
                }
    
                $attachment_id = wc_rest_set_uploaded_image_as_attachment( $upload, $user_id );
    
                if ( wp_attachment_is_image( $attachment_id ) ) {
                    if ( $image->position == 'store' ) {
                        update_user_meta( $user_id, '_store_image', $attachment_id );
                    } elseif ( $image->position == 'cover' ) {
                        update_user_meta( $user_id, '_store_banner', $attachment_id );
                    }
                }
            }
        }
    
        return $store_owners;
    }    

    public function import_stores( $store_owners ) {

        $xml_url = MultiVendorX()->plugin_path . '/assets/dummy-data/store.xml';
        $xml = simplexml_load_file(
            $xml_url
        );

        if ( ! $xml ) {
            return;
        }

        $created_store_ids = [];

        foreach ( $xml->store as $store ) {

            $owner_index = (int) $store->owner_index;
            $owner_id    = $store_owners[ $owner_index ] ?? 0;

            if ( ! $owner_id ) {
                continue;
            }

            // Create Store Object
            $store_obj = new \MultiVendorX\Store\Store();

            $store_data = array(
                'name'        => (string) $store->name,
                'slug'        => sanitize_title( (string) $store->slug ),
                'description' => (string) $store->description,
                'status'      => (string) $store->status,
                'who_created' => $owner_id,
            );

            // Set core store data
            foreach ( $store_data as $key => $value ) {
                $store_obj->set( $key, $value );
            }

            // Save store
            $store_id = $store_obj->save();

            if ( ! $store_id ) {
                continue;
            }

            // Assign primary owner
            \MultiVendorX\Store\StoreUtil::set_primary_owner( $owner_id, $store_id );

            // Save meta fields
            $meta_fields = array(
                'phone'     => (string) $store->phone,
                'address_1' => (string) $store->address_1,
                'city'      => (string) $store->city,
                'state'     => (string) $store->state,
                'country'   => (string) $store->country,
                'postcode'  => (string) $store->postcode,
            );

            foreach ( $meta_fields as $key => $value ) {
                if ( ! empty( $value ) ) {
                    $store_obj->update_meta( $key, $value );
                }
            }

            // Mark store as active
            $store_obj->set( 'status', 'active' );
            $store_obj->save();
    
            $created_store_ids[] = $store_id;
        }

        return $created_store_ids;
    }

    public function import_products( $store_ids ) {

        $xml_url = MultiVendorX()->plugin_path . '/assets/dummy-data/products.xml';
    
        $xml = simplexml_load_file(
            $xml_url
        );
    
        if ( ! $xml ) {
            return [];
        }
    
        $created_products = [];
    
        foreach ( $xml->product as $index => $product ) {
    
            $store_index = (int) $product->store_index;
            $store_id    = $store_ids[ $store_index ] ?? 0;
    
            if ( ! $store_id ) {
                continue;
            }
    
            $post_data = [
                'post_title'   => (string) $product->name,
                'post_content' => (string) $product->description,
                'post_excerpt' => (string) $product->short_description,
                'post_status'  => (string) $product->status,
                'post_type'    => 'product',
                'post_author'  => get_current_user_id(),
            ];
    
            $product_id = wp_insert_post( $post_data );
    
            if ( is_wp_error( $product_id ) ) {
                continue;
            }
    
            // Meta
            update_post_meta( $product_id, '_sku', (string) $product->sku );
            update_post_meta( $product_id, '_regular_price', (string) $product->price );
            update_post_meta( $product_id, '_sale_price', (string) $product->sale_price );
            update_post_meta( $product_id, '_price', (string) $product->sale_price ?: (string) $product->price );
            update_post_meta( $product_id, '_manage_stock', (string) $product->stock->manage === 'true' ? 'yes' : 'no' );
            update_post_meta( $product_id, '_stock', (int) $product->stock->quantity );
            update_post_meta( $product_id, '_stock_status', (string) $product->stock->status );
    
            // Product type
            wp_set_object_terms( $product_id, (string) $product->type, 'product_type' );
    
            // Categories
            $category_ids = [];
            foreach ( $product->categories->category as $cat_id ) {
                $category_ids[] = (int) $cat_id;
            }
    
            if ( ! empty( $category_ids ) ) {
                wp_set_object_terms( $product_id, $category_ids, 'product_cat' );
            }
    
            // Tags
            $tags = [];
            foreach ( $product->tags->tag as $tag ) {
                $tags[] = sanitize_text_field( (string) $tag );
            }
    
            if ( ! empty( $tags ) ) {
                wp_set_object_terms( $product_id, $tags, 'product_tag' );
            }
    
            update_post_meta( $product_id, 'multivendorx_store_id', $store_id );
    
            do_action( 'multivendorx_after_product_import', $product_id, $store_id );
    
            $created_products[] = $product_id;
        }
    
        return $created_products;
    }

    public function import_commissions() {
    
        libxml_use_internal_errors( true );
        $xml = simplexml_load_file( MultiVendorX()->plugin_path . '/assets/dummy-data/commissions.xml' );
    
        if ( ! $xml ) {
            return new \WP_Error( 'invalid_xml', 'Invalid XML structure.' );
        }
    
        // Get current commission type setting
        $commission_type = MultiVendorX()->setting->get_setting( 'commission_type' );
    
        foreach ( $xml->commission as $commission ) {
    
            $category_name = sanitize_text_field( (string) $commission->category );
            $value         = floatval( (string) $commission->value );
    
            if ( empty( $category_name ) ) {
                continue;
            }
    
            // Create or get category
            $term = term_exists( $category_name, 'product_cat' );
            if ( ! $term ) {
                $term = wp_insert_term( $category_name, 'product_cat' );
            }
    
            if ( is_wp_error( $term ) ) {
                continue;
            }
    
            $term_id = is_array( $term ) ? $term['term_id'] : $term;
    
            /**
             * Apply commission based on system configuration
             */
            switch ( $commission_type ) {
    
                case 'fixed':
                    update_term_meta(
                        $term_id,
                        'category_fixed_commission',
                        $value
                    );
                    break;
    
                case 'percent':
                    update_term_meta(
                        $term_id,
                        'category_percentage_commission',
                        $value
                    );
                    break;
    
                case 'fixed_with_percentage':
                    update_term_meta(
                        $term_id,
                        'category_fixed_commission',
                        $value
                    );
                    update_term_meta(
                        $term_id,
                        'category_percentage_commission',
                        $value
                    );
                    break;
    
                default:
                    // fallback
                    update_term_meta(
                        $term_id,
                        'category_percentage_commission',
                        $value
                    );
                    break;
            }
        }
    
        return array(
            'success' => true,
            'message' => __( 'Commission data imported successfully.', 'multivendorx' ),
        );
    }

    public function import_orders( $product_ids ) {

        $xml = simplexml_load_file(
            MultiVendorX()->plugin_path . '/assets/dummy-data/orders.xml'
        );
    
        if ( ! $xml ) {
            return;
        }
    
        foreach ( $xml->order as $order_xml ) {
    
            // Create order
            $order = wc_create_order([
                'status' => (string) $order_xml->status,
            ]);
    
            if ( is_wp_error( $order ) ) {
                continue;
            }
    
            // Billing details
            $order->set_billing_first_name( (string) $order_xml->billing->first_name );
            $order->set_billing_last_name( (string) $order_xml->billing->last_name );
            $order->set_billing_email( (string) $order_xml->billing->email );
            $order->set_billing_phone( (string) $order_xml->billing->phone );
            $order->set_billing_address_1( (string) $order_xml->billing->address_1 );
            $order->set_billing_city( (string) $order_xml->billing->city );
            $order->set_billing_postcode( (string) $order_xml->billing->postcode );
            $order->set_billing_country( (string) $order_xml->billing->country );
    
            // Add products
            foreach ( $order_xml->items->item as $item ) {
                $product_id = (int) $product_ids[ (int) $item->product_index ] ?? 0;
    
                if ( ! $product_id ) {
                    continue;
                }
    
                $product = wc_get_product( $product_id );
                if ( ! $product ) {
                    continue;
                }
    
                $order->add_product(
                    $product,
                    (int) $item->quantity,
                    array(
                        'subtotal' => (float) $item->subtotal,
                        'total'    => (float) $item->total,
                    )
                );
            }
    
            // Shipping
            if ( isset( $order_xml->shipping ) ) {
                $shipping = new \WC_Order_Item_Shipping();
                $shipping->set_method_title( (string) $order_xml->shipping->method );
                $shipping->set_method_id( 'flat_rate' );
                $shipping->set_total( (float) $order_xml->shipping->cost );
                $order->add_item( $shipping );
            }
    
            // Payment method
            $order->set_payment_method( (string) $order_xml->payment_method );
            $order->set_payment_method_title( ucfirst( (string) $order_xml->payment_method ) );
    
            // Finalize
            $order->calculate_totals();
            $order->save();
    
            /**
             * Create sub-orders (MultiVendorX logic)
             */
            if ( function_exists( 'MultiVendorX' ) ) {
                MultiVendorX()->order->create_store_orders( $order );
            }
        }
    
        return true;
    }
    
    public function import_reviews( $product_ids ) {

        if ( empty( $product_ids ) ) {
            return;
        }
    
        // Load reviews XML
        $xml = simplexml_load_file(
            MultiVendorX()->plugin_path . '/assets/dummy-data/reviews.xml'
        );
    
        if ( ! $xml ) {
            return;
        }
    
        /**
         * We assign reviews sequentially to products.
         * If reviews < products → remaining products get no reviews.
         */
        $product_index = 0;
        $total_products = count( $product_ids );
    
        foreach ( $xml->review as $review ) {
    
            if ( $product_index >= $total_products ) {
                break;
            }
    
            $product_id = $product_ids[ $product_index ];
            $product_index++;
    
            if ( ! $product_id || get_post_type( $product_id ) !== 'product' ) {
                continue;
            }
    
            // Insert comment as WooCommerce review
            $comment_data = array(
                'comment_post_ID'      => $product_id,
                'comment_author'       => sanitize_text_field( (string) $review->reviewer ),
                'comment_author_email' => sanitize_email( (string) $review->email ),
                'comment_content'      => sanitize_textarea_field( (string) $review->comment ),
                'comment_type'         => 'review',
                'comment_approved'     => 1,
                'comment_date'         => current_time( 'mysql' ),
            );
    
            $comment_id = wp_insert_comment( $comment_data );
    
            if ( is_wp_error( $comment_id ) ) {
                continue;
            }
    
            // Rating meta
            $rating = max( 1, min( 5, intval( $review->rating ) ) );
            update_comment_meta( $comment_id, 'rating', $rating );
    
            /**
             * Recalculate product rating properly
             * (WooCommerce compatible way)
             */
            $comments = get_approved_comments( $product_id );
            $rating_sum   = 0;
            $rating_count = 0;
    
            foreach ( $comments as $comment ) {
                if ( $comment->comment_type !== 'review' ) {
                    continue;
                }
    
                $r = intval( get_comment_meta( $comment->comment_ID, 'rating', true ) );
                if ( $r > 0 ) {
                    $rating_sum += $r;
                    $rating_count++;
                }
            }
    
            if ( $rating_count > 0 ) {
                $average = round( $rating_sum / $rating_count, 2 );
    
                update_post_meta( $product_id, '_wc_average_rating', $average );
                update_post_meta( $product_id, '_wc_review_count', $rating_count );
                update_post_meta( $product_id, '_wc_rating_count', array_fill( 1, 5, 0 ) );
            }
    
            // Trigger hooks for compatibility
            do_action( 'woocommerce_review_posted', $comment_id, $comment_data );
        }
    
        return true;
    }
    
}
