<?php
/**
 * MultiVendorX Vendor Order Class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Order;

use MultiVendorX\Commission\Commission;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Vendor Order Class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class StoreOrder {

    /**
     * Order ID.
     *
     * @var int
     */
    private $id = 0;

    /**
     * Store ID.
     *
     * @var int
     */
    private $store_id = 0;

    /**
     * Order object.
     *
     * @var object
     */
    private $order = null;

    /**
     * Commission object.
     *
     * @var Commission
     */
    private $commission = null;

    /**
     * Get the order if ID is passed, otherwise the order is new and empty.
     *
     * @param  int | object $order The Order to read.
     */
    public function __construct( $order = 0 ) {
        if ( $order instanceof \WC_Order || $order instanceof \WC_Order_Refund ) {
            $this->id    = absint( $order->get_id() );
            $this->order = $order;
        } else {
            $this->id    = absint( $order );
            $this->order = wc_get_order( $this->id );
        }

        $this->store_id = $this->order ? absint( $this->order->get_meta( 'multivendorx_store_id', true ) ) : 0;
    }

    /**
     * Check the order is store order or not.
     * If the order is store order return true else false.
     *
     * @param   bool $current_store Check the order is current store order or not.
     * @return  bool
     */
    public function is_store_order( $current_store = false ) {
        if ( ! $this->store_id ) {
            return false;
        }
        if ( $current_store ) {
            return get_current_user_id() === $this->store_id;
        }
        return true;
    }

    /**
     * Get the props of store order.
     * Retrives data from store meta.
     *
     * @param  string $prop Prop name.
     * @return mixed
     */
    public function get_prop( $prop ) {
        return $this->order->get_meta( $prop, true );
    }

    /**
     * Get the WC_Order object.
     *
     * @return bool|\WC_Order|\WC_Order_Refund
     */
    public function get_order() {
        return $this->order;
    }

    /**
     * Get the commisssion object from store order
     *
     * @return Commission
     */
    public function get_commission() {
        if ( null === $this->commission ) {
            $commission_id    = (int) $this->get_prop( Utill::ORDER_META_SETTINGS['commission_id'] );
            $this->commission = new Commission( $commission_id );
        }
        return $this->commission;
    }
}
