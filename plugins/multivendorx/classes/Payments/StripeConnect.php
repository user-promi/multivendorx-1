<?php
namespace MultiVendorX\Payments;
use MultiVendorX\Store\Store;
defined('ABSPATH') || exit;

class StripeConnect
{
    private $api_version = '2025-08-27.basil';
    
    public function __construct()
    {
        add_action('multivendorx_process_stripe-connect_payment', [$this, 'process_payment'], 10, 5);
        
        // Register AJAX
        add_action('wp_ajax_create_stripe_account', [$this, 'ajax_create_account']);
        add_action('wp_ajax_disconnect_stripe_account', [$this, 'ajax_disconnect_account']);
        
        // Use admin_post endpoint for OAuth callback (works whether user is logged-in or not)
        add_action('admin_post_multivendorx_stripe_oauth_callback', [$this, 'handle_oauth_callback']);
        add_action('admin_post_nopriv_multivendorx_stripe_oauth_callback', [$this, 'handle_oauth_callback']);
    }

    public function ajax_create_account() {
        if (!is_user_logged_in()) {
            wp_send_json_error(['message' => __('You must be logged in.', 'multivendorx')]);
        }
        
        $store_id = get_user_meta( get_current_user_id(), "multivendorx_active_store", true);
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? [];
        $client_id = $stripe_settings['client_id'] ?? '';
        
        if (empty($client_id)) {
            wp_send_json_error(['message' => __('Stripe Client ID not configured.', 'multivendorx')]);
        }

        // Use admin-post.php as redirect
        $redirect_uri = admin_url('admin-post.php?action=multivendorx_stripe_oauth_callback');
        $state = wp_generate_password(24, false, false);
        
        // Store vendor ID in transient for verification
        set_transient('mvx_stripe_oauth_state_' . $state, $store_id, 5 * MINUTE_IN_SECONDS);
        
        $onboarding_url = add_query_arg([
            'response_type' => 'code',
            'client_id'     => $client_id,
            'scope'         => 'read_write',
            'redirect_uri'  => $redirect_uri,
            'state'         => $state,
        ], 'https://connect.stripe.com/oauth/authorize');

        wp_send_json_success([
            'message'        => __('Redirecting to Stripe onboarding...', 'multivendorx'),
            'onboarding_url' => $onboarding_url,
        ]);
    }

    public function handle_oauth_callback() {
        $log_file = plugin_dir_path(__FILE__) . "/error.log";
        
        // Log initial callback
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": OAUTH_CALLBACK_STARTED\n", FILE_APPEND);
        
        // Use filter_input for GET parameters
        $code = filter_input(INPUT_GET, 'code', FILTER_SANITIZE_STRING);
        $state = filter_input(INPUT_GET, 'state', FILTER_SANITIZE_STRING);
        
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": GET_PARAMS - Code: " . ($code ? 'PRESENT' : 'MISSING') . ", State: " . ($state ? 'PRESENT' : 'MISSING') . "\n", FILE_APPEND);
        
        if (!$code || !$state) {
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ERROR: Missing code or state parameters\n", FILE_APPEND);
            wp_safe_redirect($this->get_redirect_url('error', 'stripe_oauth'));
            exit;
        }
        
        $vendor_id = get_transient('mvx_stripe_oauth_state_' . $state);
        
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STATE: " . $state . "\n", FILE_APPEND);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": VENDOR_ID_FROM_TRANSIENT: " . var_export($vendor_id, true) . "\n", FILE_APPEND);
        
        delete_transient('mvx_stripe_oauth_state_' . $state);
        
        if (empty($vendor_id)) {
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ERROR: Invalid or expired OAuth state\n", FILE_APPEND);
            wp_safe_redirect($this->get_redirect_url('error', 'invalid_state'));
            exit;
        }
        
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? [];
        $secret_key = $stripe_settings['secret_key'] ?? '';
        $client_id  = $stripe_settings['client_id'] ?? '';
        
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STRIPE_SETTINGS: " . var_export($stripe_settings, true) . "\n", FILE_APPEND);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": SECRET_KEY_EXISTS: " . (!empty($secret_key) ? 'YES' : 'NO') . "\n", FILE_APPEND);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": CLIENT_ID_EXISTS: " . (!empty($client_id) ? 'YES' : 'NO') . "\n", FILE_APPEND);
        
        try {
            // Replace SDK OAuth call with API call
            $response = $this->make_stripe_api_call(
                'https://connect.stripe.com/oauth/token',
                [
                    'grant_type' => 'authorization_code',
                    'client_id' => $client_id,
                    'client_secret' => $secret_key,
                    'code' => $code
                ]
            );
            
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STRIPE_OAUTH_RESPONSE: " . var_export($response, true) . "\n", FILE_APPEND);
            
            if (!empty($response['stripe_user_id'])) {
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STRIPE_USER_ID_RECEIVED: " . $response['stripe_user_id'] . "\n", FILE_APPEND);
                
                $store = new Store($vendor_id);
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STORE_OBJECT_CREATED: " . var_export($store, true) . "\n", FILE_APPEND);
                
                // Save each meta individually with logging
                $meta_updates = [
                    "_stripe_connect_account_id" => $response['stripe_user_id'],
                    "_vendor_payment_mode" => 'stripe-connect',
                    "vendor_connected" => 1,
                    "admin_client_id" => $client_id,
                    "access_token" => $response['access_token'] ?? '',
                    "refresh_token" => $response['refresh_token'] ?? '',
                    "stripe_publishable_key" => $response['stripe_publishable_key'] ?? ''
                ];
                
                foreach ($meta_updates as $key => $value) {
                    $result = $store->update_meta($key, sanitize_text_field($value));
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": META_UPDATE - " . $key . ": " . ($result ? 'SUCCESS' : 'FAILED') . "\n", FILE_APPEND);
                    file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": META_VALUE - " . $key . ": " . sanitize_text_field($value) . "\n", FILE_APPEND);
                }
                
                // Verify the data was saved
                $saved_account_id = $store->get_meta("_stripe_connect_account_id");
                $saved_payment_mode = $store->get_meta("_vendor_payment_mode");
                
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": VERIFICATION - _stripe_connect_account_id: " . $saved_account_id . "\n", FILE_APPEND);
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": VERIFICATION - _vendor_payment_mode: " . $saved_payment_mode . "\n", FILE_APPEND);
                
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": OAUTH_SUCCESS - Redirecting to success\n", FILE_APPEND);
                wp_safe_redirect($this->get_redirect_url('connected', 'stripe'));
                exit;
            } else {
                file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": ERROR: No stripe_user_id in response\n", FILE_APPEND);
                wp_safe_redirect($this->get_redirect_url('error', 'stripe_connection_failed'));
                exit;
            }
        } catch (Exception $e) {
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": GENERAL_ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
            wp_safe_redirect($this->get_redirect_url('error', 'general_error'));
            exit;
        }
    }

    public function ajax_disconnect_account() {
        if (!is_user_logged_in()) {
            wp_send_json_error(['message' => __('You must be logged in.', 'multivendorx')]);
        }
        
        $store_id = get_user_meta( get_current_user_id(), "multivendorx_active_store", true);
        $store = new Store($store_id);
        
        // Delete all Stripe-related meta using the same Store object method
        $meta_keys = [
            "_stripe_connect_account_id",
            "_vendor_payment_mode",
            "vendor_connected",
            "admin_client_id",
            "access_token",
            "refresh_token",
            "stripe_publishable_key"
        ];
        
        foreach ($meta_keys as $key) {
            $store->delete_meta($key);
        }
        
        wp_send_json_success(['message' => __('Your Stripe account has been disconnected.', 'multivendorx')]);
    }

    /**
     * Get proper redirect URL for dashboard
     */
    private function get_redirect_url($type, $value) {
        $base_url = home_url('/dashboard/settings/#subtab=payout');
        
        if ($type === 'connected') {
            return add_query_arg('connected', $value, $base_url);
        } elseif ($type === 'error') {
            return add_query_arg('error', $value, $base_url);
        }
        
        return $base_url;
    }

    public function get_id() {
        return 'stripe-connect';
    }

    public function get_settings() {
        return [
            'icon'      => 'adminlib-stripe-connect',
            'id'        => $this->get_id(),
            'label'     => 'Stripe Connect',
            'enableOption' => true,
            'desc'      => __('Marketplace payouts via Stripe Connect (OAuth).', 'multivendorx'),
            'disableBtn'=> true,
            'formFields' => [
                [
                    'key'   => 'payment_mode',
                    'type'  => 'setting-toggle',
                    'label' => __('Payment mode', 'multivendorx'),
                    'options' => [
                        ['key' => 'test', 'label' => __('Test', 'multivendorx'), 'value' => 'test'],
                        ['key' => 'live', 'label' => __('Live', 'multivendorx'), 'value' => 'live'],
                    ]
                ],
                [
                    'key'         => 'client_id',
                    'type'        => 'text',
                    'label'       => __('Stripe client ID', 'multivendorx'),
                    'placeholder' => __('Enter Stripe Client ID', 'multivendorx'),
                ],
                [
                    'key'         => 'secret_key',
                    'type'        => 'password',
                    'label'       => __('Secret key', 'multivendorx'),
                    'placeholder' => __('Enter secret key', 'multivendorx'),
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? [];
        
        if ($stripe_settings) {
            $store_id = get_user_meta( get_current_user_id(), "multivendorx_active_store", true);
            $store = new Store($store_id);
            $stripe_account_id = $store->get_meta('_stripe_connect_account_id');
            $onboarding_status = 'Not Connected';
            $is_onboarded = false;
            
            if ($stripe_account_id) {
                $account = $this->get_account($stripe_account_id);
                if ($account) {
                    if ($account['charges_enabled']) {
                        $onboarding_status = 'Connected';
                        $is_onboarded = true;
                    } else {
                        $onboarding_status = 'Connected – Verification Required';
                    }
                }
            }
            
            $fields = [
                [
                    'type' => 'html',
                    'html' => '<p><strong>' . __('Stripe Status:', 'multivendorx') . '</strong> ' . $onboarding_status . '</p>',
                ],
            ];
            
            if (!is_admin()) {
                if ($is_onboarded) {
                    $fields[] = [
                        'type'  => 'button',
                        'key'   => 'disconnect_account',
                        'label' => __('Disconnect Stripe Account', 'multivendorx'),
                        'action'=> 'disconnect_stripe_account',
                        'class' => 'mvx-stripe-disconnect-btn',
                    ];
                } else {
                    $fields[] = [
                        'type'  => 'button',
                        'key'   => 'create_account',
                        'label' => __('Connect with Stripe', 'multivendorx'),
                        'action'=> 'create_stripe_account',
                        'class' => 'mvx-stripe-connect-btn',
                    ];
                }
            }
            
            return [
                'id'    => $this->get_id(),
                'label' => __('Stripe Connect', 'multivendorx'),
                'fields'=> $fields,
            ];
        }
    }

    public function process_payment($store_id, $amount, $order_id = null, $transaction_id = null, $note = null)
    {
        $log_file = plugin_dir_path(__FILE__) . "/payment_processing.log";
        
        // Log payment process start
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_PROCESS_STARTED\n", FILE_APPEND);
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PARAMETERS - Store ID: {$store_id}, Amount: {$amount}, Order ID: {$order_id}, Transaction ID: {$transaction_id}, Note: {$note}\n", FILE_APPEND);
        
        $store = new Store($store_id);
        $stripe_account_id = $store->get_meta('_stripe_connect_account_id');
        
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STORE_META_RETRIEVED - Stripe Account ID: " . ($stripe_account_id ?: 'NOT_FOUND') . "\n", FILE_APPEND);
        
        if (!$stripe_account_id) {
            $error_message = __('Vendor is not connected to Stripe.', 'multivendorx');
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_FAILED - " . $error_message . "\n", FILE_APPEND);
            return [
                'success' => false,
                'message' => $error_message
            ];
        }
        
        // Log before creating transfer
        file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": CREATING_TRANSFER - Amount: {$amount}, Destination: {$stripe_account_id}, Order ID: {$order_id}\n", FILE_APPEND);
        
        $transfer = $this->create_transfer($amount, $stripe_account_id, $order_id);
        
        if ($transfer) {
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": TRANSFER_SUCCESS - Transfer ID: " . $transfer['id'] . ", Status: " . $transfer['status'] . "\n", FILE_APPEND);
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": TRANSFER_DETAILS - Amount: " . ($transfer['amount'] / 100) . " " . $transfer['currency'] . ", Created: " . date("d/m/Y H:i:s", $transfer['created']) . "\n", FILE_APPEND);
            
            // Trigger after payment complete action
            do_action('multivendorx_after_payment_complete', $store_id, 'Stripe Connect', 'success', $order_id, $transaction_id, $note, $amount);
            
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_COMPLETE_ACTION_TRIGGERED\n", FILE_APPEND);
            
            $success_message = __('Payout successful', 'multivendorx');
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_SUCCESS - " . $success_message . "\n", FILE_APPEND);
            
            return [
                'success'  => true,
                'message'  => $success_message,
                'response' => $transfer
            ];
        } else {
            $error_message = __('Could not create transfer.', 'multivendorx');
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": PAYMENT_FAILED - " . $error_message . "\n", FILE_APPEND);
            return [
                'success' => false,
                'message' => $error_message
            ];
        }
    }

    public function update_account($account_id, $data) {
        try {
            $response = $this->make_stripe_api_call(
                "https://api.stripe.com/v1/accounts/{$account_id}",
                $data,
                'POST'
            );
            return $response;
        } catch (Exception $e) {
            error_log('Stripe Account Update Error: ' . $e->getMessage());
            return null;
        }
    }

    public function get_account($account_id) {
        try {
            $response = $this->make_stripe_api_call(
                "https://api.stripe.com/v1/accounts/{$account_id}",
                [],
                'GET'
            );
            return $response;
        } catch (Exception $e) {
            return null;
        }
    }

    public function create_transfer($amount, $destination, $order_id) {
        $log_file = plugin_dir_path(__FILE__) . "/payment_processing.log";
        
        try {
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": TRANSFER_CREATION_STARTED - Amount: {$amount}, Destination: {$destination}, Order ID: {$order_id}\n", FILE_APPEND);
            
            $transfer_data = [
                'amount' => $amount * 100,
                'currency' => 'usd',
                'destination' => $destination,
                'transfer_group' => $order_id,
            ];
            
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": TRANSFER_DATA - " . var_export($transfer_data, true) . "\n", FILE_APPEND);
            
            $transfer = $this->make_stripe_api_call(
                'https://api.stripe.com/v1/transfers',
                $transfer_data,
                'POST'
            );
            
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": TRANSFER_CREATION_SUCCESS - Transfer ID: " . $transfer['id'] . "\n", FILE_APPEND);
            
            return $transfer;
        } catch (Exception $e) {
            file_put_contents($log_file, date("d/m/Y H:i:s", time()) . ": STRIPE_TRANSFER_ERROR - " . $e->getMessage() . "\n", FILE_APPEND);
            return null;
        }
    }

    /**
     * Make Stripe API call using WordPress HTTP API
     */
    private function make_stripe_api_call($url, $data = [], $method = 'POST') {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = $payment_admin_settings['stripe-connect'] ?? [];
        $secret_key = $stripe_settings['secret_key'] ?? '';
        
        if (empty($secret_key)) {
            throw new Exception('Stripe secret key not configured');
        }
        
        $args = [
            'method'  => $method,
            'headers' => [
                'Authorization' => 'Bearer ' . $secret_key,
                'Content-Type'  => 'application/x-www-form-urlencoded',
                'Stripe-Version' => $this->api_version,
            ],
            'timeout' => 30,
        ];
        
        if (($method === 'POST' || $method === 'PUT') && !empty($data)) {
            $args['body'] = http_build_query($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('HTTP Request failed: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $decoded_response = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from Stripe');
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code < 200 || $response_code >= 300) {
            $error_message = $decoded_response['error']['message'] ?? 'Unknown Stripe API error';
            $error_code = $decoded_response['error']['code'] ?? 'unknown';
            throw new Exception("Stripe API error {$response_code}: {$error_message} (Code: {$error_code})");
        }
        
        return $decoded_response;
    }
}