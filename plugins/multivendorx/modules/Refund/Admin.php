<?php
/**
 * MultiVendorX Admin class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Refund;

/**
 * MultiVendorX Refund Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {

    public function __construct() {
        add_action( 'init', array( $this, 'register_status_for_refund' ) );
        add_filter( 'wc_order_statuses', array( $this, 'add_refund_requested_to_order_statuses' ) );

        // add_action( 'add_meta_boxes', array( $this, 'mvx_refund_order_status_customer_meta' ), 10, 2 );
        add_action( 'woocommerce_process_shop_order_meta', array( $this, 'mvx_refund_order_status_save' ) );
    }

    public function register_status_for_refund() {
        register_post_status(
            'wc-refund-requested',
            array(
				'label'                     => _x( 'Refund Requested', 'Order status', 'multivendorx' ),
				'public'                    => true,
				'exclude_from_search'       => false,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
				'label_count'               => _n_noop( 'Refund Requested (%s)', 'Refund Requested (%s)', 'multivendorx' ),
            )
        );
    }

    public function add_refund_requested_to_order_statuses( $order_statuses ) {
        $new_statuses = array();

        foreach ( $order_statuses as $key => $label ) {
            $new_statuses[ $key ] = $label;

            if ( 'wc-on-hold' === $key ) {
                $new_statuses['wc-refund-requested'] = _x( 'Refund Requested', 'Order status', 'multivendorx' );
            }
        }

        return $new_statuses;
    }

    public function mvx_refund_order_status_customer_meta( $page, $order ) {
        if ( $page && $page != 'woocommerce_page_wc-orders' ) {
			return;
        }
        if ( $order->get_parent_id() == 0 ) {
			return;
        }
        add_meta_box( 'refund_status_customer', __( 'Customer refund status', 'multivendorx' ), array( $this, 'mvx_order_customer_refund_dd' ), $page, 'side', 'core', $order );
        // add_meta_box( 'refund_images_customer', __( 'Refund Request Images', 'multivendorx' ), array( $this, 'mvx_order_customer_refund_images' ), $page, 'side', 'core', $order );
    }

    public function mvx_order_customer_refund_dd( $order ) {
        $refund_status   = $order->get_meta( '_customer_refund_order', true ) ?? '';
        $refund_statuses = array(
            ''               => __( 'Refund Status', 'multivendorx' ),
            'refund_request' => __( 'Refund Requested', 'multivendorx' ),
            'refund_accept'  => __( 'Refund Accepted', 'multivendorx' ),
            'refund_reject'  => __( 'Refund Rejected', 'multivendorx' ),
        );
        ?>
        <select id="refund_order_customer" name="refund_order_customer" onchange='refund_admin_reason(this.value);'>
            <?php foreach ( $refund_statuses as $key => $value ) { ?>
            <option value="<?php echo $key; ?>" <?php selected( $refund_status, $key ); ?> ><?php echo $value; ?></option>
            <?php } ?>
        </select>
        <div class="reason_select_by_admin" id="reason_select_by_admin" style='display:none;'>
            <label for="additional_massage"><?php _e( 'Please Provide Some Reason', 'multivendorx' ); ?></label>
            <textarea class="woocommerce-Input input-text" name="refund_admin_reason_text" id="refund_admin_reason_text"></textarea>
        </div>
        <button type="submit" class="button cust-refund-status button-default" name="cust_refund_status" value="<?php echo __( 'Update status', 'multivendorx' ); ?>"><?php echo __( 'Update status', 'multivendorx' ); ?></button>
        <script>
            function refund_admin_reason(val){
                var element = document.getElementById('reason_select_by_admin');
                if( val == 'refund_accept' || val == 'refund_reject' )
                    element.style.display='block';
                else  
                    element.style.display='none';
            }
        </script>
        <?php
    }

    public function mvx_refund_order_status_save( $order_id ) {
        $order = wc_get_order( $order_id );
        if ( empty( $order_id ) || ( $order_id && $order->get_type() != 'shop_order' ) ) {
			return;
        }
        if ( $order->get_parent_id() == 0 ) {
			return;
        }
        if ( ! isset( $_POST['cust_refund_status'] ) ) {
			return $order_id;
        }
        if ( isset( $_POST['refund_order_customer'] ) && $_POST['refund_order_customer'] ) {
            $order->update_meta_data( '_customer_refund_order', wc_clean( wp_unslash( $_POST['refund_order_customer'] ) ) );
            $order->save();
            // trigger customer email
            if ( in_array( $_POST['refund_order_customer'], array( 'refund_reject', 'refund_accept' ) ) ) {
                $refund_details = array(
                    'admin_reason' => isset( $_POST['refund_admin_reason_text'] ) ? wc_clean( $_POST['refund_admin_reason_text'] ) : '',
				);

                $order_status = '';
                if ( $_POST['refund_order_customer'] == 'refund_accept' ) {
                    $order_status = __( 'accepted', 'multivendorx' );
                } elseif ( $_POST['refund_order_customer'] == 'refund_reject' ) {
                    $order_status = __( 'rejected', 'multivendorx' );
                }
                // Comment note for suborder
                $comment_id = $order->add_order_note( __( 'Site admin ', 'multivendorx' ) . $order_status . __( ' refund request for order #', 'multivendorx' ) . $order_id . ' .' );
                // user info
                $user_info = get_userdata( get_current_user_id() );
                wp_update_comment(
                    array(
						'comment_ID'           => $comment_id,
						'comment_author'       => $user_info->user_name,
						'comment_author_email' => $user_info->user_email,
                    )
                );

                // Comment note for parent order
                $parent_order_id   = $order->get_parent_id();
                $parent_order      = wc_get_order( $parent_order_id );
                $comment_id_parent = $parent_order->add_order_note( __( 'Site admin ', 'multivendorx' ) . $order_status . __( ' refund request for order #', 'multivendorx' ) . $order_id . '.' );
                wp_update_comment(
                    array(
						'comment_ID'           => $comment_id_parent,
						'comment_author'       => $user_info->user_name,
						'comment_author_email' => $user_info->user_email,
                    )
                );
            }
        }
    }
}