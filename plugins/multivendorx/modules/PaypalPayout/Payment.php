<?php

namespace MultiVendorX\PaypalPayout;

defined('ABSPATH') || exit;

// Correct SDK namespaces (note: PaypalPayoutsSDK, not PayPal\Core)
use PaypalPayoutsSDK\Core\PayPalHttpClient;
use PaypalPayoutsSDK\Core\SandboxEnvironment;
use PaypalPayoutsSDK\Core\ProductionEnvironment;
use PaypalPayoutsSDK\Payouts\PayoutsPostRequest;

class Payment {
    public function __construct(){
        // $this->hi();
        add_action('multivendorx_process_paypal-payout_payment', array($this, 'process_payment'), 10, 2);
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
                    'key'         => 'paypal_email',
                    'type'        => 'text',
                    'label'       => 'Paypal Email',
                    'placeholder' => 'Enter Email',
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

    public function process_payment($store_id, $amount) {
        // quick autoload/class check (helps debugging)

        //add in paramiters 
        $receiver_email = "receiver-sandbox-email@test.com";// receiver sandbox email
        $sandbox = true;                         // sandbox mode
        $clientId = "";
        $clientSecret = "";
        $currency = "USD";
        
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

            if (!empty($response->result->batch_header->payout_batch_id)) {
                do_action('multivendorx_after_payment_complete', $store_id);

                return [
                    'success'  => true,
                    'message'  => 'Payment successful',
                    'response' => $response->result
                ];
            } else {
                return [
                    'success'  => false,
                    'message'  => 'Payment failed',
                    'response' => $response->result ?? null
                ];
            }
        } catch (\Exception $e) { // <-- use global Exception inside a namespace
            return [
                'success' => false,
                'message' => 'PayPal SDK Error: ' . $e->getMessage(),
                'response' => null
            ];
        }
    }

    public function hi(){
        $result = $this->process_payment(
            101,                          // store_id
            5.00,                         // amount
        );
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":result: : " . var_export($result, true) . "\n", FILE_APPEND);
    }
}

