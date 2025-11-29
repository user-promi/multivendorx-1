<?php

namespace MultiVendorX\Payments;

defined( 'ABSPATH' ) || exit;

class CashPayment {

    public function __construct() {
        add_action( 'multivendorx_process_cash_payment', array( $this, 'process_payment' ), 10, 5 );
    }

    public function get_id() {
        return 'cash';
    }

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

    public function get_store_payment_settings() {
    }

    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {
        // quick autoload/class check (helps debugging)
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
