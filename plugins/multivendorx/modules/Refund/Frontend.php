<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Refund;

/**
 * MultiVendorX Refund Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_action( 'woocommerce_order_details_after_order_table', array( $this, 'mvx_refund_btn_customer_my_account'), 10 );
        add_action( 'wp_enqueue_scripts', array( $this, 'add_scripts' ) );
         add_action( 'wp', array( $this, 'mvx_handler_cust_requested_refund' ) );
        
    }

    public function mvx_refund_btn_customer_my_account( $order ){
        if( !is_wc_endpoint_url( 'view-order' ) ) return;
        if( !MultiVendorX()->order->is_multivendorx_order( $order->get_id() ) ) return;
        $allowed_statuses = MultiVendorX()->setting->get_setting( 'customer_refund_status', [] );
        // Get current order status
        $order_status = $order->get_status(); // e.g., 'pending', 'completed'
        // Check if current order status is allowed
        if ( ! in_array( $order_status, $allowed_statuses, true ) ) {
            return; // don't show button
        }
        $refund_settings = MultiVendorX()->setting->get_option( 'multivendorx_order_actions_refunds_settings', [] );
        $refund_reason_options = MultiVendorX()->setting->get_setting('refund_reasons', []);
        $refund_button_text = apply_filters( 'mvx_customer_my_account_refund_request_button_text', __( 'Request a refund', 'multivendorx' ), $order );
        // Print refund messages, if any
        if( $msg_data = $this->mvx_get_customer_refund_order_msg( $order, $refund_settings ) ) {
            $type = isset( $msg_data['type'] ) ? $msg_data['type'] : 'info';
            ?>
            <div class="woocommerce-Message woocommerce-Message--<?php echo $type; ?> woocommerce-<?php echo $type; ?>">
                <?php echo $msg_data['msg']; ?>
            </div>
            <?php
            return;
        }
        ?>
        <p><button type="button" class="button wp-element-button" id="cust_request_refund_btn" name="cust_request_refund_btn" value="<?php echo $refund_button_text; ?>"><?php echo $refund_button_text; ?></button></p>
        <div id="mvx-myac-order-refund-wrap" class="mvx-myac-order-refund-wrap">
            <form method="POST" enctype="multipart/form-data">
                <?php wp_nonce_field('customer_request_refund', 'cust-request-refund-nonce'); ?>
                <fieldset>
                    <label class="section-heading"><?php echo __('Choose the product(s) you want a refund for', 'multivendorx'); ?></label>
                        <?php
                        foreach ($order->get_items() as $item) {
                            $product = $item->get_product();
                            if ($product) {
                                $product_image = $product->get_image(); ?>
                                <div class="order-refund-product-list">
                                    <input class="product-select-tag" type="checkbox" name="refund_product[]" id="refund_product" value="<?php echo esc_attr($product->get_id()); ?>">
                                    <label>
                                        <?php echo $product_image; ?>
                                        <?php echo esc_html($product->get_name()); ?>
                                    </label>
                                </div>
                        <?php
                            }
                        }
                        ?>
                    <label class="section-heading"><?php echo apply_filters('mvx_customer_my_account_refund_reason_label', __('Please mention your reason for refund', 'multivendorx'), $order); ?></label>
                    <?php
                    if ($refund_reason_options) {
                        foreach ($refund_reason_options as $index => $reason) {
                            echo '<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label class="refund_reason_option" for="refund_reason_option-' . $index . '">
                            <input type="radio" class="woocommerce-Input input-radio" name="refund_reason_option" id="refund_reason_option-' . $index . '" value="' . $index . '" />
                            ' . esc_html($reason['value']) . '
                        </label></p>';
                        }
                        // Add others reason
                        echo '<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label class="refund_reason_option" for="refund_reason_option-other">
                            <input type="radio" class="woocommerce-Input input-radio" name="refund_reason_option" id="refund_reason_option-other" value="others" />
                            ' . __('Others reason', 'multivendorx') . '
                        </label></p>';
                    ?>
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide cust-rr-other">
                            <label for="refund_reason_other"><?php _e('Refund reason', 'multivendorx'); ?></label>
                            <input type="text" class="woocommerce-Input input-text" name="refund_reason_other" id="refund_reason_other" autocomplete="off" />
                        </p>
                    <?php
                    } else {
                    ?>
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="refund_reason_other"><?php _e('Refund reason', 'multivendorx'); ?></label>
                            <input type="text" class="woocommerce-Input input-text" name="refund_reason_other" id="refund_reason_other" autocomplete="off" />
                        </p>
                    <?php
                    }
                    ?>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="additional_info"><?php _e('Provide additional information', 'multivendorx'); ?></label>
                        <textarea class="woocommerce-Input input-text" name="refund_request_addi_info" id="refund_request_addi_info"></textarea>
                    </p>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="product_img"><?php _e('Upload an image of the product', 'multivendorx'); ?></label>
                        <input type="file" class="woocommerce-Input input-img" name="product_img[]" id="product_img" accept="image/jpeg, image/png, image/gif, image/webp" multiple>
                        <small style="display:block; color:#666;"><?php _e('You can select multiple images.', 'multivendorx'); ?></small>
                    </p>

                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <button type="submit" class="button wp-element-button" name="cust_request_refund_sbmt" value="<?php _e('Submit', 'multivendorx'); ?>"><?php _e('Submit', 'multivendorx'); ?></button>
                    </p>
                </fieldset>
            </form>
        </div>
        <?php
    }

    public function add_scripts() {
        wp_add_inline_script( 'woocommerce', '( function( $ ) {
            $("#mvx-myac-order-refund-wrap").hide();
            $("#mvx-myac-order-refund-wrap .cust-rr-other").hide();
            $("#mvx-myac-order-refund-wrap .refund_reason_option input").on("click", function(){
                var others_checked = $("input:radio[name=refund_reason_option]:checked").val();
                if(others_checked == "others"){
                    $("#mvx-myac-order-refund-wrap .cust-rr-other").show();
                }else{
                    $("#mvx-myac-order-refund-wrap .cust-rr-other").hide();
                }
            });
			$("#cust_request_refund_btn").click(function(){
				$("#mvx-myac-order-refund-wrap").slideToggle();
			});
		} )( jQuery );' );
    }


    public function mvx_get_customer_refund_order_msg( $order, $settings = array() ) {
        if( !$order ) return false;
        $default_msg = apply_filters( 'mvx_customer_my_account_refund_order_messages', array(
            'order_status_not_allowed' => __( 'Refund is not allowed for the current order status.', 'multivendorx' ),
            'order_refund_period_overed' => __( 'Your refund period has expired' , 'multivendorx' ),
            'order_refund_rejected' => __( '*** Your request has been rejected ***', 'multivendorx' ),
            'order_refund_request_pending' => __( 'Your request is pending.', 'multivendorx' ),
            'order_refund_request_accepted' => __( '*** Your request has been accepted. *** ', 'multivendorx' ),
        ), $order, $settings );

        $cust_refund_status = $order->get_meta('_customer_refund_order', true ) ?  $order->get_meta('_customer_refund_order', true ) : '';
        $refund_days_limit = MultiVendorX()->setting->get_setting('refund_days') ? absint( MultiVendorX()->setting->get_setting('refund_days') ) : apply_filters( 'mvx_customer_refund_order_default_days_limit', 10, $order );
        $order_date = $order->get_date_created()->format('Y-m-d');
        $order_place_days = time() - strtotime( $order_date );
        $message = array();

        if( abs( round( $order_place_days / 86400 ) ) > $refund_days_limit ) {
            $message['type'] = 'info';
            $message['msg'] = isset( $default_msg['order_refund_period_overed'] ) ? $default_msg['order_refund_period_overed'] : __( 'Your refund period has expired.', 'multivendorx' );
        }
        if( !in_array( $order->get_status(), MultiVendorX()->setting->get_setting('customer_refund_status', []) ))  {
            $message['type'] = 'info';
            $message['msg'] = isset( $default_msg['order_status_not_allowed'] ) ? $default_msg['order_status_not_allowed'] : __( 'Refund is not allowed for the current order status.', 'multivendorx' );
        }
        if( $cust_refund_status == 'refund_reject' ) {
            $message['type'] = 'error';
            $message['msg'] = isset( $default_msg['order_refund_rejected'] ) ? $default_msg['order_refund_rejected'] : __( 'Sorry!! Your request has been rejected', 'multivendorx' );
        }elseif( $cust_refund_status == 'refund_request' ) {
            $message['type'] = 'warning';
            $message['msg'] = isset( $default_msg['order_refund_request_pending'] ) ? $default_msg['order_refund_request_pending'] : __( 'Your request is pending.', 'multivendorx' );
        }elseif( $cust_refund_status == 'refund_accept' ) {
            $message['type'] = 'success';
            $message['msg'] = isset( $default_msg['order_refund_request_accepted'] ) ? $default_msg['order_refund_request_accepted'] : __( 'Congratulation: *** Your request has been accepted. *** ', 'multivendorx' );
        }

        return $message;
    }

    public function mvx_handler_cust_requested_refund() {
        global $wp;
    
        $nonce_value = isset($_REQUEST['cust-request-refund-nonce']) ? wc_get_var($_REQUEST['cust-request-refund-nonce'], wc_get_var($_REQUEST['_wpnonce'], '')) : '';
        if ( ! wp_verify_nonce( $nonce_value, 'customer_request_refund' ) ) {
            return;
        }
    
        if ( ! isset( $_REQUEST['refund_product'] ) ) {
            wc_add_notice( __( 'Kindly choose a product', 'multivendorx' ), 'error' );
            return;
        }
    
        if ( ! isset( $_REQUEST['refund_reason_option'] ) ) {
            wc_add_notice( __( 'Kindly choose a refund reason', 'multivendorx' ), 'error' );
            return;
        }
    
        if ( ! isset( $wp->query_vars['view-order'] ) ) return;
    
        $order_id = $wp->query_vars['view-order'];
        $order = wc_get_order( $order_id );
    
        $reason_option           = wc_clean( wp_unslash( $_REQUEST['refund_reason_option'] ?? '' ) );
        $refund_reason_other     = wc_clean( wp_unslash( $_REQUEST['refund_reason_other'] ?? '' ) );
        $refund_request_addi_info = wc_clean( wp_unslash( $_REQUEST['refund_request_addi_info'] ?? '' ) );
        $refund_product          = wc_clean( $_REQUEST['refund_product'] ?? '' );

        $refund_reason_options = MultiVendorX()->setting->get_setting('refund_reasons', []);
        $refund_reason = $reason_option === 'others' ? $refund_reason_other : ( $refund_reason_options[$reason_option] ? $refund_reason_options[$reason_option]['value'] : '' );
    
        $uploaded_image_urls = [];
        $attach_ids = [];
        
        if ( isset( $_FILES['product_img'] ) && ! empty( $_FILES['product_img']['name'][0] ) ) {

            if ( ! function_exists( 'wp_handle_upload' ) ) {
                require_once ABSPATH . 'wp-admin/includes/file.php';
            }
            require_once ABSPATH . 'wp-admin/includes/image.php';
        
            $max_file_size = 10 * 1024 * 1024; // 10MB
            $allowed_mimes = [
                'jpg|jpeg|jpe' => 'image/jpeg',
                'gif'          => 'image/gif',
                'png'          => 'image/png',
                'webp'         => 'image/webp',
            ];
        
            $file_keys = array_keys( $_FILES['product_img']['name'] );
        
            foreach ( $file_keys as $index ) {
                if ( $_FILES['product_img']['error'][ $index ] !== UPLOAD_ERR_OK ) {
                    continue;
                }
        
                if ( $_FILES['product_img']['size'][ $index ] > $max_file_size ) {
                    continue;
                }
        
                $file_type = wp_check_filetype( $_FILES['product_img']['name'][ $index ], $allowed_mimes );
                if ( empty( $file_type['type'] ) ) {
                    continue;
                }
        
                $file = [
                    'name'     => sanitize_file_name( $_FILES['product_img']['name'][ $index ] ),
                    'type'     => $_FILES['product_img']['type'][ $index ],
                    'tmp_name' => $_FILES['product_img']['tmp_name'][ $index ],
                    'error'    => $_FILES['product_img']['error'][ $index ],
                    'size'     => $_FILES['product_img']['size'][ $index ],
                ];
        
                $upload = wp_handle_upload( $file, [ 'test_form' => false ] );
        
                if ( $upload && ! isset( $upload['error'] ) ) {
                    $uploaded_image_urls[] = esc_url_raw( $upload['url'] );
        
                    $attachment = [
                        'guid'           => $upload['url'],
                        'post_mime_type' => $upload['type'],
                        'post_title'     => pathinfo( $file['name'], PATHINFO_FILENAME ),
                        'post_content'   => '',
                        'post_status'    => 'inherit',
                    ];
        
                    $attach_id = wp_insert_attachment( $attachment, $upload['file'] );
        
                    if ( $attach_id ) {
                        $attach_data = wp_generate_attachment_metadata( $attach_id, $upload['file'] );
                        wp_update_attachment_metadata( $attach_id, $attach_data );
                        $attach_ids[] = $attach_id;
                    }
                }
            }
        }

        $order->update_meta_data( '_customer_refund_order', 'refund_request' );
        $order->update_meta_data( '_customer_refund_reason', $refund_reason );
        $order->update_meta_data( '_customer_refund_product', $refund_product );
        $order->update_meta_data( '_customer_refund_product_imgs', $uploaded_image_urls );
        $order->update_meta_data( '_customer_refund_product_img_ids', $attach_ids );
    
        $order->set_status( 'refund-requested' );
        $order->save();
    
        $user_info = get_userdata( get_current_user_id() );
    
        $comment_id = $order->add_order_note( __( 'Customer requested a refund ', 'multivendorx' ) . $order_id . '.' );
        wp_update_comment([
            'comment_ID'         => $comment_id,
            'comment_author'     => $user_info->user_login,
            'comment_author_email' => $user_info->user_email,
        ]);
    
        $parent_order_id = $order->get_parent_id();
        if ( $parent_order_id ) {
            $parent_order = wc_get_order( $parent_order_id );
            $comment_id_parent = $parent_order->add_order_note( __( 'Customer requested a refund for ', 'multivendorx' ) . $order_id . '.' );
            wp_update_comment([
                'comment_ID'         => $comment_id_parent,
                'comment_author'     => $user_info->user_login,
                'comment_author_email' => $user_info->user_email,
            ]);
        }
    
        wc_add_notice( __( 'Refund request successfully placed.', 'multivendorx' ) );
    }
}
