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
        // add_action( 'woocommerce_order_details_after_order_table', array( $this, 'mvx_refund_btn_customer_my_account'), 10 );
        add_action( 'wp_enqueue_scripts', array( $this, 'add_scripts' ) );
        
    }

    public function mvx_refund_btn_customer_my_account( $order ){
        if( !is_wc_endpoint_url( 'view-order' ) ) return;
        if( !mvx_get_order( $order->get_id() ) ) return;
        
        $refund_settings = mvx_get_option( 'mvx_refund_management_tab_settings', true );
        $refund_reason_options = get_mvx_global_settings('refund_order_msg') ? explode( "||", get_mvx_global_settings('refund_order_msg') ) : array();
        $refund_button_text = apply_filters( 'mvx_customer_my_account_refund_request_button_text', __( 'Request a refund', 'multivendorx' ), $order );
        // Print refund messages, if any
        if( $msg_data = mvx_get_customer_refund_order_msg( $order, $refund_settings ) ) {
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
                            ' . esc_html($reason) . '
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
}