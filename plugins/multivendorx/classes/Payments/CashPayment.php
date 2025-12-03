<?php
/**
 * Class CashPayment.
 *
 * @package MultiVendorX\Payments
 */

namespace MultiVendorX\Payments;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Class CashPayment.
 */
class CashPayment {

    /**
     * CashPayment constructor.
     */
    public function __construct() {
        add_action( 'multivendorx_process_cash_payment', array( $this, 'process_payment' ), 10, 5 );
    }

    /**
     * Get payment method id.
     *
     * @return string
     */
    public function get_id() {
        return 'cash';
    }

    /**
     * Get payment method settings.
     *
     * @return array
     */
    public function get_settings() {
        return array(
            'icon'         => 'adminlib-cash',
            'id'           => $this->get_id(),
            'label'        => 'Cash',
            'enableOption' => true,
            'disableBtn'   => true,
            'desc'         => 'Confirm and record payouts made directly to stores via cash.',
            'formFields'   => array(),
        );
    }

    /**
     * Get store payment settings.
     */
    public function get_store_payment_settings() {
    }

    /**
     * Process payment.
     */
    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {
        // quick autoload/class check (helps debugging).
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );

        $status = 'success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            'Cash',
            $status,
            $order_id,
            $transaction_id,
            $note,
            $amount
        );
    }
}
