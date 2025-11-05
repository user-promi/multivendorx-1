<?php

namespace MultiVendorX\Payments;

defined('ABSPATH') || exit;

use MultiVendorX\Store\Store;

class PaypalPayout {
    public function __construct(){
        add_action('multivendorx_process_paypal-payout_payment', array($this, 'process_payment'), 10, 5);
    }

    public function get_id() {
        return 'paypal-payout';
    }

    public function get_settings() {
        return [
            'icon'      => 'adminlib-form-paypal-email',
            'id'        => $this->get_id(),
            'label'     => 'Paypal Payout',
            'enableOption' => true,
            'disableBtn'=> true,
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
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );

        $paypal_settings = !empty($payment_admin_settings['paypal-payout']) ? $payment_admin_settings['paypal-payout'] : [];
        
        if ($paypal_settings) {
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
    }

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null, $note = null) {
        $log_file = plugin_dir_path(__FILE__) . "/paypal_payment_processing.log";
        
        // Log payment process start
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYPAL_PAYMENT_PROCESS_STARTED\n", FILE_APPEND);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PARAMETERS - Store ID: {$store_id}, Amount: {$amount}, Order ID: {$order_id}, Transaction ID: {$transaction_id}, Note: {$note}\n", FILE_APPEND);

        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', [] );
        $store = new Store( $store_id );

        if (!empty($payment_admin_settings['paypal-payout'])) {
            $paypal_settings = $payment_admin_settings['paypal-payout'];
            
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYPAL_SETTINGS_FOUND - Enabled: " . ($paypal_settings['enable'] ? 'YES' : 'NO') . "\n", FILE_APPEND);
            
            if ($paypal_settings && $paypal_settings['enable']) {
                $receiver_email = $store->get_meta('payment_method') == 'paypal-payout' ? $store->get_meta('paypal_email') : "";
                $sandbox = $paypal_settings['payment_mode'] == 'sandbox';
                $client_id = $paypal_settings['client_id'];
                $client_secret = $paypal_settings['client_secret'];
                $currency = get_woocommerce_currency();

                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYPAL_CONFIG - Receiver Email: {$receiver_email}, Sandbox: " . ($sandbox ? 'YES' : 'NO') . ", Currency: {$currency}\n", FILE_APPEND);
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYPAL_CONFIG - Client ID: " . (empty($client_id) ? 'MISSING' : 'PRESENT') . ", Client Secret: " . (empty($client_secret) ? 'MISSING' : 'PRESENT') . "\n", FILE_APPEND);

                if (empty($receiver_email)) {
                    $error_message = 'PayPal email not configured for this vendor';
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_FAILED - " . $error_message . "\n", FILE_APPEND);
                    return [
                        'success' => false,
                        'message' => $error_message,
                        'response' => null
                    ];
                }

                if (empty($client_id) || empty($client_secret)) {
                    $error_message = 'PayPal Client ID or Client Secret not configured';
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_FAILED - " . $error_message . "\n", FILE_APPEND);
                    return [
                        'success' => false,
                        'message' => $error_message,
                        'response' => null
                    ];
                }

                try {
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": GETTING_ACCESS_TOKEN\n", FILE_APPEND);
                    
                    // Get access token first
                    $access_token = $this->get_paypal_access_token($client_id, $client_secret, $sandbox);
                    
                    if (!$access_token) {
                        $error_message = 'Failed to authenticate with PayPal';
                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_FAILED - " . $error_message . "\n", FILE_APPEND);
                        return [
                            'success' => false,
                            'message' => $error_message,
                            'response' => null
                        ];
                    }

                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_RECEIVED - Token: " . substr($access_token, 0, 20) . "...\n", FILE_APPEND);

                    // Create payout
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": CREATING_PAYOUT - Amount: {$amount}, Receiver: {$receiver_email}\n", FILE_APPEND);
                    
                    $payout_response = $this->create_paypal_payout(
                        $access_token, 
                        $receiver_email, 
                        $amount, 
                        $currency, 
                        $store_id, 
                        $sandbox
                    );

                    if ($payout_response && !empty($payout_response['batch_header']['payout_batch_id'])) {
                        $payout_batch_id = $payout_response['batch_header']['payout_batch_id'];
                        $batch_status = $payout_response['batch_header']['batch_status'] ?? 'UNKNOWN';
                        
                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_SUCCESS - Batch ID: {$payout_batch_id}, Status: {$batch_status}\n", FILE_APPEND);
                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_DETAILS - Amount: {$amount} {$currency}, Store ID: {$store_id}\n", FILE_APPEND);

                        $success = true;
                        $status = 'success';
                        $message = 'Payment successful';

                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": TRIGGERING_AFTER_PAYMENT_ACTION\n", FILE_APPEND);
                        
                        do_action(
                            'multivendorx_after_payment_complete',
                            $store_id,
                            'Paypal Payout',
                            $status,
                            $order_id, 
                            $transaction_id, 
                            $note, 
                            $amount
                        );

                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_COMPLETE_ACTION_TRIGGERED\n", FILE_APPEND);

                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_SUCCESS - " . $message . "\n", FILE_APPEND);

                        return [
                            'success'  => $success,
                            'message'  => $message,
                            'response' => $payout_response
                        ];
                    } else {
                        $error_message = $payout_response['message'] ?? 'Payment failed - No batch ID received';
                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_FAILED - " . $error_message . "\n", FILE_APPEND);
                        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_RESPONSE: " . var_export($payout_response, true) . "\n", FILE_APPEND);
                        
                        return [
                            'success' => false,
                            'message' => $error_message,
                            'response' => $payout_response
                        ];
                    }

                } catch (\Exception $e) {
                    $error_message = 'PayPal API Error: ' . $e->getMessage();
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": EXCEPTION - " . $error_message . "\n", FILE_APPEND);
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STACK_TRACE: " . $e->getTraceAsString() . "\n", FILE_APPEND);
                    
                    return [
                        'success' => false,
                        'message' => $error_message,
                        'response' => null
                    ];
                }
            }
        }
        
        $error_message = 'PayPal Payout is not enabled';
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_FAILED - " . $error_message . "\n", FILE_APPEND);
        
        return [
            'success' => false,
            'message' => $error_message,
            'response' => null
        ];
    }

    /**
     * Get PayPal access token using client credentials
     */
    private function get_paypal_access_token($client_id, $client_secret, $sandbox = false) {
        $log_file = plugin_dir_path(__FILE__) . "/paypal_payment_processing.log";
        
        $base_url = $sandbox 
            ? 'https://api.sandbox.paypal.com' 
            : 'https://api.paypal.com';

        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_REQUEST - URL: {$base_url}/v1/oauth2/token\n", FILE_APPEND);

        $args = [
            'method'  => 'POST',
            'headers' => [
                'Accept' => 'application/json',
                'Accept-Language' => 'en_US',
                'Content-Type' => 'application/x-www-form-urlencoded',
            ],
            'body' => 'grant_type=client_credentials',
            'timeout' => 30,
        ];

        // Add Basic Auth header
        $args['headers']['Authorization'] = 'Basic ' . base64_encode($client_id . ':' . $client_secret);

        $response = wp_remote_post($base_url . '/v1/oauth2/token', $args);

        if (is_wp_error($response)) {
            $error_message = 'PayPal Access Token Error: ' . $response->get_error_message();
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_FAILED - " . $error_message . "\n", FILE_APPEND);
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        $response_code = wp_remote_retrieve_response_code($response);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_RESPONSE - Code: {$response_code}\n", FILE_APPEND);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $error_message = 'PayPal Access Token JSON Error: ' . json_last_error_msg();
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_FAILED - " . $error_message . "\n", FILE_APPEND);
            return false;
        }

        if ($response_code !== 200) {
            $error_details = $data['error_description'] ?? 'Unknown error';
            $error_message = "PayPal Access Token HTTP Error: {$response_code} - {$error_details}";
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_FAILED - " . $error_message . "\n", FILE_APPEND);
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_RESPONSE_BODY: " . var_export($data, true) . "\n", FILE_APPEND);
            return false;
        }

        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ACCESS_TOKEN_SUCCESS - Token type: " . ($data['token_type'] ?? 'N/A') . ", Expires in: " . ($data['expires_in'] ?? 'N/A') . "s\n", FILE_APPEND);

        return $data['access_token'] ?? false;
    }

    /**
     * Create PayPal payout
     */
    private function create_paypal_payout($access_token, $receiver_email, $amount, $currency, $store_id, $sandbox = false) {
        $log_file = plugin_dir_path(__FILE__) . "/paypal_payment_processing.log";
        
        $base_url = $sandbox 
            ? 'https://api.sandbox.paypal.com' 
            : 'https://api.paypal.com';

        $sender_batch_id = uniqid();
        $sender_item_id = uniqid();
        
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_REQUEST - URL: {$base_url}/v1/payments/payouts\n", FILE_APPEND);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_REQUEST - Batch ID: {$sender_batch_id}, Item ID: {$sender_item_id}\n", FILE_APPEND);

        $payout_data = [
            "sender_batch_header" => [
                "sender_batch_id" => $sender_batch_id,
                "email_subject"   => "You have a payment",
                "email_message"   => "You have received a payment from the marketplace"
            ],
            "items" => [
                [
                    "recipient_type" => "EMAIL",
                    "amount" => [
                        "value"    => number_format($amount, 2, '.', ''),
                        "currency" => $currency
                    ],
                    "receiver" => $receiver_email,
                    "note"     => "Payment from Store #$store_id",
                    "sender_item_id" => $sender_item_id
                ]
            ]
        ];

        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_DATA: " . json_encode($payout_data) . "\n", FILE_APPEND);

        $args = [
            'method'  => 'POST',
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $access_token,
            ],
            'body' => json_encode($payout_data),
            'timeout' => 30,
        ];

        $response = wp_remote_post($base_url . '/v1/payments/payouts', $args);

        if (is_wp_error($response)) {
            $error_message = 'HTTP Request failed: ' . $response->get_error_message();
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_FAILED - " . $error_message . "\n", FILE_APPEND);
            throw new \Exception($error_message);
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        $response_code = wp_remote_retrieve_response_code($response);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_RESPONSE - Code: {$response_code}\n", FILE_APPEND);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $error_message = 'Invalid JSON response from PayPal';
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_FAILED - " . $error_message . "\n", FILE_APPEND);
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_RESPONSE_BODY: " . $body . "\n", FILE_APPEND);
            throw new \Exception($error_message);
        }

        if ($response_code < 200 || $response_code >= 300) {
            $error_message = $data['message'] ?? $data['name'] ?? 'Unknown PayPal API error';
            $full_error = "PayPal API error {$response_code}: {$error_message}";
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_FAILED - " . $full_error . "\n", FILE_APPEND);
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_ERROR_DETAILS: " . var_export($data, true) . "\n", FILE_APPEND);
            throw new \Exception($full_error);
        }

        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_SUCCESS - Batch ID: " . ($data['batch_header']['payout_batch_id'] ?? 'N/A') . ", Status: " . ($data['batch_header']['batch_status'] ?? 'N/A') . "\n", FILE_APPEND);

        return $data;
    }

    /**
     * Get payout batch status (optional - for checking payout status later)
     */
    public function get_payout_status($payout_batch_id, $client_id, $client_secret, $sandbox = false) {
        $log_file = plugin_dir_path(__FILE__) . "/paypal_payment_processing.log";
        
        try {
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": GETTING_PAYOUT_STATUS - Batch ID: {$payout_batch_id}\n", FILE_APPEND);
            
            $access_token = $this->get_paypal_access_token($client_id, $client_secret, $sandbox);
            
            if (!$access_token) {
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_STATUS_FAILED - Could not get access token\n", FILE_APPEND);
                return false;
            }

            $base_url = $sandbox 
                ? 'https://api.sandbox.paypal.com' 
                : 'https://api.paypal.com';

            $args = [
                'method'  => 'GET',
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $access_token,
                ],
                'timeout' => 30,
            ];

            $response = wp_remote_get($base_url . '/v1/payments/payouts/' . $payout_batch_id, $args);

            if (is_wp_error($response)) {
                $error_message = 'PayPal Payout Status Error: ' . $response->get_error_message();
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_STATUS_FAILED - " . $error_message . "\n", FILE_APPEND);
                return false;
            }

            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            $response_code = wp_remote_retrieve_response_code($response);
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_STATUS_RESPONSE - Code: {$response_code}\n", FILE_APPEND);

            if ($response_code === 200 && !empty($data['batch_header'])) {
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_STATUS_SUCCESS - Status: " . ($data['batch_header']['batch_status'] ?? 'UNKNOWN') . "\n", FILE_APPEND);
            }

            return $data;

        } catch (\Exception $e) {
            $error_message = 'PayPal Payout Status Error: ' . $e->getMessage();
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYOUT_STATUS_FAILED - " . $error_message . "\n", FILE_APPEND);
            return false;
        }
    }
}