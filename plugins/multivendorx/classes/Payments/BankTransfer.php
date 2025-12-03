<?php
/**
 * Bank transfer payment gateway class.
 *
 * @package MultiVendorX\Payments
 */
namespace MultiVendorX\Payments;

defined( 'ABSPATH' ) || exit;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

class BankTransfer {

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'multivendorx_process_bank-transfer_payment', array( $this, 'process_payment' ), 10, 5 );
    }

    /**
     * Get payment gateway id.
     *
     * @return string
     */
    public function get_id() {
        return 'bank-transfer';
    }

    /**
     * Get payment gateway settings.
     *
     * @return array
     */
    public function get_settings() {
        return array(
            'icon'         => 'adminlib-bank',
            'id'           => $this->get_id(),
            'label'        => 'Bank Transfer',
            'enableOption' => true,
            'disableBtn'   => true,
            'desc'         => 'Transfer payouts directly to store’s bank accounts.',
            'formFields'   => array(
                array(
                    'key'            => 'bank_name',
                    'type'           => 'multi-checkbox',
                    'selectDeselect' => true,

                    'label'          => __( 'Bank details required from the store', 'multivendorx' ),
                    'options'        => array(
                        array(
                            'key'   => 'bank_name',
                            'label' => __( 'Bank name', 'multivendorx' ),
                            'value' => 'bank_account_details',
                            'edit'  => true,
                        ),
                        array(
                            'key'   => 'routing_number',
                            'label' => __( 'ABA routing number)', 'multivendorx' ),
                            'value' => 'routing_number',
                            'edit'  => true,
                        ),
                        array(
                            'key'   => 'destination_currency',
                            'label' => __( 'Destination currency', 'multivendorx' ),
                            'value' => 'destination_currency',
                            'edit'  => true,
                        ),
                        array(
                            'key'   => 'bank_address',
                            'label' => __( 'Bank address', 'multivendorx' ),
                            'value' => 'bank_address',
                            'edit'  => true,
                        ),
                        array(
                            'key'   => 'IBAN',
                            'label' => __( 'IBAN', 'multivendorx' ),
                            'value' => 'IBAN',
                            'edit'  => true,
                        ),
                        array(
                            'key'   => 'account_holder_name',
                            'label' => __( 'Account holder Name', 'multivendorx' ),
                            'value' => 'account_holder_name',
                            'edit'  => true,
                        ),
                        array(
                            'key'   => 'account_number',
                            'label' => __( 'Account number', 'multivendorx' ),
                            'value' => 'account_number',
                            'edit'  => true,
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Get store payment settings.
     */
    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );

        $settings = ! empty( $payment_admin_settings['bank-transfer'] ) ? $payment_admin_settings['bank-transfer'] : array();

        if ( ! empty( $settings ) && $settings['enable'] ) {
            return array(
                'id'     => $this->get_id(),
                'label'  => __( 'Bank Transfer', 'multivendorx' ),
                'fields' => array(

                    array(
                        'key'   => 'account_holder_name',
                        'type'  => 'text',
                        'label' => 'Account holder name',
                    ),
                    array(
                        'key'     => 'account_type',
                        'type'    => 'setting-toggle',
                        'label'   => __( 'Account type', 'multivendorx' ),
                        'options' => array(
                            array(
								'key'   => 'current',
								'label' => __( 'Current', 'multivendorx' ),
								'value' => 'current',
							),
                            array(
								'key'   => 'savings',
								'label' => __( 'Savings', 'multivendorx' ),
								'value' => 'savings',
							),
                        ),
                    ),
                    array(
                        'key'   => 'bank_name',
                        'type'  => 'text',
                        'label' => 'Bank name',
                    ),
                    array(
                        'key'   => 'bank_address',
                        'type'  => 'text-area',
                        'label' => 'Bank address',
                    ),
                    array(
                        'key'   => 'abr_routing_number',
                        'type'  => 'text',
                        'label' => 'ABA routing number',
                    ),
                    array(
                        'key'   => 'iban',
                        'type'  => 'text',
                        'label' => 'IBAN',
                    ),
                    array(
                        'key'   => 'destination currency',
                        'type'  => 'text',
                        'label' => 'Destination currency',
                    ),
                ),
            );
        }
    }

    /**
     * Process payment.
     *
     * @param int    $store_id
     * @param float  $amount
     * @param int    $order_id
     * @param string $transaction_id
     * @param string $note
     */
    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {

        // quick autoload/class check (helps debugging).
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $store                  = new Store( $store_id );

        $status = 'success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            'Bank Transfer',
            $status,
            $order_id,
            $transaction_id,
            $note,
            $amount
        );
    }
}
