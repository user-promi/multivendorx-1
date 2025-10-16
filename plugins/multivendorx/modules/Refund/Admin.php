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
        add_action( 'init', [$this, 'register_status_for_refund']);
        add_filter( 'wc_order_statuses', array( $this, 'add_refund_requested_to_order_statuses') );

    }

    public function register_status_for_refund() {
        register_post_status( 'wc-refund-requested', array(
            'label'                     => _x( 'Refund Requested', 'Order status', 'multivendorx' ),
            'public'                    => true,
            'exclude_from_search'       => false,
            'show_in_admin_all_list'    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop( 'Refund Requested (%s)', 'Refund Requested (%s)', 'multivendorx' ),
        ) );
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
}