<?php

namespace MultiVendorX\BankTransfer;

defined( 'ABSPATH' ) || exit;

use MultiVendorX\Store\Store;


class Payment {

    public function __construct() {
        add_action( 'multivendorx_process_bank-transfer_payment', array( $this, 'process_payment' ), 10, 5 );
    }

    public function get_id() {
        return 'bank-transfer';
    }

    public function get_settings() {
        return array(
            'icon'         => 'adminlib-bank',
            'id'           => $this->get_id(),
            'label'        => 'Bank Transfer',
            'enableOption' => true,
            'disableBtn'   => true,
            'desc'         => 'Bank transfer',
            'formFields'   => array(
                array(
                    'key'   => 'bank_name',
                    'type'  => 'text',
                    'label' => 'Bank name',
                ),
                array(
                    'key'   => 'abr_routing_number',
                    'type'  => 'text',
                    'label' => 'ABA routing number',
                ),
                array(
                    'key'   => 'destination_currency',
                    'type'  => 'text',
                    'label' => 'Destination currency',
                ),
                array(
                    'key'   => 'bank_address',
                    'type'  => 'text-area',
                    'label' => 'Bank address',
                ),
                array(
                    'key'   => 'iban',
                    'type'  => 'text',
                    'label' => 'IBAN',
                ),
                array(
                    'key'   => 'account_holder_name',
                    'type'  => 'text',
                    'label' => 'Account holder name',
                ),
                array(
                    'key'   => 'account_number',
                    'type'  => 'text',
                    'label' => 'Account number',
                ),
            ),
        );
    }

    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );

        $settings = ! empty( $payment_admin_settings['bank-transfer'] ) ? $payment_admin_settings['bank-transfer'] : array();

        if ( $settings && ! $settings['enable'] ) {
            return array(
                'id'     => $this->get_id(),
                'label'  => __( 'Bank Transfer', 'multivendorx' ),
                'fields' => array(
                    array(
                        'key'   => 'account_number',
                        'type'  => 'text',
                        'label' => 'Account Number',
                    ),
                    array(
                        'key'   => 'account_holder_name',
                        'type'  => 'text',
                        'label' => 'Account Holder Name',
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
                        'label' => 'Bank Name',
                    ),
                    array(
                        'key'   => 'bank_address',
                        'type'  => 'text-area',
                        'label' => 'Bank Address',
                    ),
                    array(
                        'key'   => 'abr_routing_number',
                        'type'  => 'text',
                        'label' => 'ABA Routing Number',
                    ),
                    array(
                        'key'   => 'iban',
                        'type'  => 'text',
                        'label' => 'IBAN',
                    ),
                    array(
                        'key'         => 'destination currency',
                        'type'        => 'text',
                        'label'       => 'Destination Currency',
                        'placeholder' => 'Enter Destination Currency',
                    ),
                ),
            );
        }
    }

    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {

        // quick autoload/class check (helps debugging)
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
