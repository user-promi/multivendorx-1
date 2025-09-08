<?php

namespace MultiVendorX\Payments;
use MultiVendorX\Store\Store;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\MultiVendorX;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class PaymentProcessor {
    public function __construct() {
        add_action('multivendorx_after_payment_complete', array( $this, 'after_payment_complete'), 10, 4);
    }

    
    public function process_payment($store_id, $amount, $order_id = null) {
        global $wpdb;
        $store = new Store($store_id);

        if (!$order_id) {
            $withdrawals_fees = MultiVendorX()->setting->get_setting( 'withdrawals_fees', [] );
            $withdrawals_count = (int)$store->get_meta('withdrawals_count');

            if ($withdrawals_fees['free_withdrawals'] < $withdrawals_count) {

                $deduct_amount = (float) $amount * ((float) $withdrawals_fees['withdrawal_fee_percentage'] / 100) + (float) $withdrawals_fees['withdrawal_fee_fixed'];
                $amount = $amount - $deduct_amount;

                $data = [
                    'store_id'         => (int) $store_id,
                    'entry_type'       => 'Dr',
                    'transaction_type' => 'Withdrawal',
                    'amount'           => (float) $deduct_amount,
                    'currency'         => get_woocommerce_currency(),
                    'narration'        => "Withdrawal cost",
                    'status'           => 'Completed',
                ];

                $format = [ "%d", "%s", "%s", "%f", "%s", "%s", "%s" ];

                $wpdb->insert(
                    $wpdb->prefix . Utill::TABLES['transaction'],
                    $data,
                    $format
                );

                $transaction_id = $wpdb->insert_id;
                $store->update_meta('withdrawals_count', $withdrawals_count+1);
            }
        }

        $payment_method = $store->get_meta('payment_method');
            
        do_action("multivendorx_process_{$payment_method}_payment", $store_id, $amount, $order_id, $transaction_id);

    }

    public function after_payment_complete($store_id, $method, $status, $order_id, $transaction_id) {
        global $wpdb;

        $order         = $order_id > 0 ? wc_get_order($order_id) : null;
        $commission_id = $order ? $order->get_meta('multivendorx_commission_id', true) : null;
        $commission    = $commission_id ? CommissionUtil::get_commission_db($commission_id) : null;

        $amount = $commission ? (float) $commission->commission_total : 0.00;

        $data = [
            'store_id'         => (int) $store_id,
            'order_id'         => $order_id > 0 ? (int) $order_id : null,
            'commission_id'    => $commission_id ? (int) $commission_id : null,
            'entry_type'       => 'Dr',
            'transaction_type' => 'Withdrawal',
            'amount'           => $amount,
            'currency'         => get_woocommerce_currency(),
            'narration'        => ($status === 'success')
                                    ? "Withdrawal released via {$method} Payment Processor"
                                    : "Withdrawal failed via {$method} Payment Processor",
            'status'           => ($status === 'success') ? 'Completed' : 'Failed',
        ];

        $format = ["%d", "%d", "%d", "%s", "%s", "%f", "%s", "%s", "%s"];

        $wpdb->insert(
            $wpdb->prefix . Utill::TABLES['transaction'],
            $data,
            $format
        );
        if ($status != 'success') {
            $row = $wpdb->get_row(
                        $wpdb->prepare(
                            "SELECT *
                            FROM $wpdb->prefix . Utill::TABLES['transaction']
                            WHERE id = %d",
                            $transaction_id ));

            $wpdb->insert(
                $wpdb->prefix . Utill::TABLES['transaction'],
                [
                    'store_id'        => $row->store_id,
                    'entry_type'      => 'Cr',
                    'transaction_type'=> 'Reversed',
                    'amount'          => $row->amount,
                    'currency'        => $row->currency,
                    'narration'       => 'Transaction Reversed',
                    'status'          => 'Completed',
                ],
                ['%d','%s','%s', '%f','%s','%s', '%s']
            );
        }
    }

}