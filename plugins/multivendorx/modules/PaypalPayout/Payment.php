<?php

namespace MultiVendorX\PaypalPayout;

defined('ABSPATH') || exit;

use MultiVendorX\Store\Store;
// Correct SDK namespaces (note: PaypalPayoutsSDK, not PayPal\Core)
use PaypalPayoutsSDK\Core\PayPalHttpClient;
use PaypalPayoutsSDK\Core\SandboxEnvironment;
use PaypalPayoutsSDK\Core\ProductionEnvironment;
use PaypalPayoutsSDK\Payouts\PayoutsPostRequest;

class Payment {
    public function __construct(){
        add_action('multivendorx_process_paypal-payout_payment', array($this, 'process_payment'), 10, 4);
    }

    public function get_id() {
        return 'paypal-payout';
    }

    public function get_settings() {
        return [
            'icon'      => 'PP',
            'id'        => $this->get_id(),
            'label'     => 'Paypal Payout',
            'connected' => true,
            'desc'      => 'Full marketplace solution with instant payouts, comprehensive dispute handling, and global coverage. Best for established marketplaces.',
            'formFields' => [
                [
                    'key'   => 'payment_mode',
                    'type'  => 'setting-toggle',
                    'label' => __('Payment Mode', 'multivendorx'),
                    'options' => [
                        ['key' => 'sandbox', 'label' => __('Sandbox', 'multivendorx'), 'value' => 'sandbox'],
                        ['key' => 'live', 'label' => __('Live', 'multivendorx'), 'value' => 'live'],
                    ]
                ],
                [
                    'key'         => 'client_id',
                    'type'        => 'text',
                    'label'       => 'Client ID',
                    'placeholder' => 'Enter Client id',
                ],
                [
                    'key'         => 'client_secret',
                    'type'        => 'text',
                    'label'       => 'Client Secret Key',
                    'placeholder' => 'Enter Secret Key',
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        return [
            'id'    => $this->get_id(),
            'label' => __('Paypal Payout', 'multivendorx'),
            'fields' => [
                [
                    'name'        => 'paypal_email',
                    'type'        => 'email',
                    'label'       => __('PayPal Email', 'multivendorx'),
                    'placeholder' => __('Enter your PayPal email address', 'multivendorx'),
                ]
            ]
        ];
    }

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null) {

        // quick autoload/class check (helps debugging)
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );
        $store   = new Store( $store_id );

        if (!empty($payment_admin_settings['paypal-payout'])) {
            $paypal_settings = $payment_admin_settings['paypal-payout'];
            if ($paypal_settings['enable']) {
                //add in paramiters 
                $receiver_email = $store->get_meta('payment_method') == 'paypal-payout' ? $store->get_meta('paypal_email') : ""; // receiver sandbox email
                $sandbox = $paypal_settings['payment_mode'] == 'sandbox' ? true : false;   // sandbox mode
                $clientId = $paypal_settings['client_id'];
                $clientSecret = $paypal_settings['client_secret'];
                $currency = get_woocommerce_currency();

                // Choose environment
                $environment = $sandbox
                    ? new SandboxEnvironment($clientId, $clientSecret)
                    : new ProductionEnvironment($clientId, $clientSecret);

                $client = new PayPalHttpClient($environment);

                // Build payout request
                $request = new PayoutsPostRequest();
                $request->body = [
                    "sender_batch_header" => [
                        "sender_batch_id" => uniqid(),
                        "email_subject"   => "You have a payment",
                    ],
                    "items" => [
                        [
                            "recipient_type" => "EMAIL",
                            "amount" => [
                                "value"    => number_format($amount, 2, '.', ''),
                                "currency" => $currency
                            ],
                            "receiver" => $receiver_email,
                            "note"     => "Payment from Store #$store_id"
                        ]
                    ]
                ];

                try {
                    $response = $client->execute($request);

                    $success = !empty($response->result->batch_header->payout_batch_id);

                    $status  = $success ? 'success' : 'failure';
                    $message = $success ? 'Payment successful' : 'Payment failed';

                    do_action(
                        'multivendorx_after_payment_complete',
                        $store_id,
                        'Paypal Payout',
                        $status,
                        $order_id, $transaction_id
                    );

                    return [
                        'success'  => $success,
                        'message'  => $message,
                        'response' => $response->result ?? null
                    ];

                    // if (!empty($response->result->batch_header->payout_batch_id)) {
                    //     do_action('multivendorx_after_payment_complete', $order_id, $store_id, 'Paypal Payout');

                    //     return [
                    //         'success'  => true,
                    //         'message'  => 'Payment successful',
                    //         'response' => $response->result
                    //     ];
                    // } else {
                    //     return [
                    //         'success'  => false,
                    //         'message'  => 'Payment failed',
                    //         'response' => $response->result ?? null
                    //     ];
                    // }
                } catch (\Exception $e) { // <-- use global Exception inside a namespace
                    return [
                        'success' => false,
                        'message' => 'PayPal SDK Error: ' . $e->getMessage(),
                        'response' => null
                    ];
                }
            }
        }
        
    }

}

