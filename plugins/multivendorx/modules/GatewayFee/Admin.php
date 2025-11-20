<?php
/**
 * MultiVendorX class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\GatewayFee;

/**
 * MultiVendorX Gateway Fee Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {
    public function __construct(){
        add_filter( 'multivendorx_before_commission_insert', [ $this, 'gateway_fee_calculation' ], 10, 3 );
    }


    public function gateway_fee_calculation( $filtered, $store, $order ) {

        if (!empty( MultiVendorX()->setting->get_setting('gateway_fees') )) {
            $fixed_fee      = 0;
            $percentage_fee = 0;
            $gateway_settings = reset(MultiVendorX()->setting->get_setting('gateway_fees', []));
            $parent_order = wc_get_order($order->get_parent_id());

            $payment_method = $parent_order->get_payment_method();
            $fixed_fee = (float) (
                $gateway_settings[ $payment_method . '_fixed' ]
                ?? $gateway_settings['default_fixed']
                ?? 0
            );

            $percentage_fee = (float) (
                $gateway_settings[ $payment_method . '_percentage' ]
                ?? $gateway_settings['default_percentage']
                ?? 0
            );

            $gateway_fee = (float) $order->get_total() * ((float) $percentage_fee / 100) + (float) $fixed_fee;

            $rules = unserialize($filtered['data']['rules_applied']);
            $rules['gateway_fee'] = [
                'fixed'      => $fixed_fee,
                'percentage' => $percentage_fee,
            ];

            $filtered['data']['gateway_fee'] = (float) $gateway_fee;
            $filtered['data']['store_payable'] = (float) $filtered['data']['store_payable'] - (float) $gateway_fee;
            $filtered['data']['marketplace_payable'] = (float) $filtered['data']['marketplace_payable'] + (float) $gateway_fee;
            $filtered['data']['rules_applied']= serialize($rules);
            $filtered['format'][] = '%f';
        }

        return $filtered;
    }

}