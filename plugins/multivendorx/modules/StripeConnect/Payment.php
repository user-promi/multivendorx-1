<?php

namespace MultiVendorX\StripeConnect;


defined('ABSPATH') || exit;

class Payment {
    public function __construct(){
        // $this->hi();
        add_action('multivendorx_process_stripe-connect_payment', array($this, 'process_payment'), 10, 2);
    }

    public function get_id() {
        return 'stripe-connect';
    }

    public function get_settings() {
        return [
            'icon'      => 'ST',
            'id'        => $this->get_id(),
            'label'     => 'Stripe Connect',
            'enableOption' => true,
            'desc'      => 'Full marketplace solution with instant payouts, comprehensive dispute handling, and global coverage. Best for established marketplaces.',
            'formFields' => [
                [
                    'key'   => 'payment_mode',
                    'type'  => 'setting-toggle',
                    'label' => __('Payment Mode', 'multivendorx'),
                    'options' => [
                        ['key' => 'test', 'label' => __('Test', 'multivendorx'), 'value' => 'test'],
                        ['key' => 'live', 'label' => __('Live', 'multivendorx'), 'value' => 'live'],
                    ]
                ],
                [
                    'key'         => 'api_key',
                    'type'        => 'text',
                    'label'       => 'API Key',
                    'placeholder' => 'Enter API Key',
                ],
                [
                    'key'         => 'secret_key',
                    'type'        => 'password',
                    'label'       => 'Secret Key',
                    'placeholder' => 'Enter Secret Key',
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );

        $stripe_settings = !empty($payment_admin_settings['stripe-connect']) ? $payment_admin_settings['stripe-connect'] : [];
        
        if ($stripe_settings && $stripe_settings['enable']) {

            return [
                'id'    => $this->get_id(),
                'label' => __('Stripe Connect', 'multivendorx'),
                'fields' => []
            ];
        }

    }

 
    // public function process_payment($order_id, $store_id, $amount) {
    //     $secret_key = '';
    //     $connected_account_id = '';
    //     $currency = "USD";
    //     try {
    //         if (!class_exists('\Stripe\Stripe')) {
    //             require_once __DIR__ . '/../../vendor/autoload.php';
    //         }

    //         \Stripe\Stripe::setApiKey($secret_key);

    //         $transfer = \Stripe\Transfer::create([
    //             'amount'      => intval($amount * 100),
    //             'currency'    => $currency,
    //             'destination' => $connected_account_id,
    //             'description' => "Payment from Store #$store_id",
    //             'transfer_group' => "STORE_$store_id"
    //         ]);

    //         do_action('multivendorx_after_payment_complete', $order_id, $store_id);

    //         return [
    //             'success'  => true,
    //             'message'  => 'Payment successful',
    //             'response' => $transfer
    //         ];
    //     } catch (\Stripe\Exception\ApiErrorException $e) {
    //         return [
    //             'success' => false,
    //             'message' => 'Stripe API Error: ' . $e->getMessage(),
    //             'response' => null
    //         ];
    //     }
    // }

    // public function hi(){
    //     $stripe = $this->process_payment(
    //         102,                          // store_id
    //         5.00,                         // amount
    //     );
    //     file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":stripe: : " . var_export($stripe, true) . "\n", FILE_APPEND);
    // }
}
