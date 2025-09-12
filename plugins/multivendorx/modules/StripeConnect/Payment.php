<?php

namespace MultiVendorX\StripeConnect;


defined('ABSPATH') || exit;

class Payment {
    public function __construct(){
        // $this->hi();
        add_action('multivendorx_process_stripe-connect_payment', array($this, 'process_payment'), 10, 2);
        // AJAX endpoints for onboarding
        add_action('wp_ajax_mvx_stripe_connect_onboard', [$this, 'ajax_vendor_onboard']);
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
                    'key'         => 'secret_key',
                    'type'        => 'password',
                    'label'       => 'Secret Key',
                    'placeholder' => 'Enter Secret Key',
                ]
            ]
        ];
    }

    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = !empty($payment_admin_settings['stripe-connect']) ? $payment_admin_settings['stripe-connect'] : [];

        if ($stripe_settings && !empty($stripe_settings['enable'])) {
            $secret_key = $stripe_settings['secret_key'] ?? '';

            if (empty($secret_key)) {
                return [
                    'id'    => $this->get_id(),
                    'label' => __('Stripe Connect', 'multivendorx'),
                    'fields' => [
                        [
                            'type'  => 'notice',
                            'value' => __('Stripe Secret Key not configured by admin. Please contact support.', 'multivendorx'),
                        ]
                    ]
                ];
            }

            // Retrieve vendor’s connected account id from user meta
            $vendor_id = get_current_user_id();
            $connected_account_id = get_user_meta($vendor_id, '_mvx_stripe_connected_account', true);

            try {
                if (!class_exists('\Stripe\Stripe')) {
                    require_once __DIR__ . '/../../vendor/autoload.php';
                }

                \Stripe\Stripe::setApiKey($secret_key);

                $account_status = null;
                if ($connected_account_id) {
                    $account = \Stripe\Account::retrieve($connected_account_id);
                    $account_status = $account->requirements->disabled_reason ?? 'active';
                }

                $fields = [];

                if (!$connected_account_id) {
                    // Show onboarding button
                    $fields[] = [
                        'type'  => 'button',
                        'label' => __('Onboard to Collect Payments', 'multivendorx'),
                        'action'=> 'mvx_stripe_connect_onboard',
                    ];
                } else {
                    // Show current onboarding status
                    $fields[] = [
                        'type'  => 'notice',
                        'value' => sprintf(__('Connected to Stripe. Status: %s', 'multivendorx'), esc_html($account_status))
                    ];
                }

                return [
                    'id'    => $this->get_id(),
                    'label' => __('Stripe Connect', 'multivendorx'),
                    'fields'=> $fields
                ];

            } catch (\Exception $e) {
                return [
                    'id'    => $this->get_id(),
                    'label' => __('Stripe Connect', 'multivendorx'),
                    'fields'=> [
                        [
                            'type'  => 'notice',
                            'value' => __('Error communicating with Stripe: ', 'multivendorx') . $e->getMessage(),
                        ]
                    ]
                ];
            }
        }
    }

    /**
     * Handle vendor onboarding (AJAX)
     */
    public function ajax_vendor_onboard() {
        check_ajax_referer('mvx_stripe_connect_onboard', 'nonce');

        $vendor_id = get_current_user_id();
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $secret_key = $payment_admin_settings['stripe-connect']['secret_key'] ?? '';

        if (empty($secret_key)) {
            wp_send_json_error(['message' => 'Stripe Secret Key missing.']);
        }

        try {
            if (!class_exists('\Stripe\Stripe')) {
                require_once __DIR__ . '/../../vendor/autoload.php';
            }

            \Stripe\Stripe::setApiKey($secret_key);

            // Step 1: Create connected account if not exists
            $connected_account_id = get_user_meta($vendor_id, '_mvx_stripe_connected_account', true);

            if (!$connected_account_id) {
                $account = \Stripe\Account::create([
                    'controller' => [
                        'fees' => ['payer' => 'application'],
                        'losses' => ['payments' => 'application'],
                        'stripe_dashboard' => ['type' => 'express'],
                    ],
                ]);
                $connected_account_id = $account->id;
                update_user_meta($vendor_id, '_mvx_stripe_connected_account', $connected_account_id);
            }

            // Step 2: Create account link for onboarding
            $account_link = \Stripe\AccountLink::create([
                'account'     => $connected_account_id,
                'refresh_url' => home_url('/vendor-dashboard/?onboarding=refresh'),
                'return_url'  => home_url('/vendor-dashboard/?onboarding=success'),
                'type'        => 'account_onboarding',
            ]);

            wp_send_json_success(['url' => $account_link->url]);

        } catch (\Exception $e) {
            wp_send_json_error(['message' => $e->getMessage()]);
        }
    }

 
    public function process_payment($order_id, $store_id, $amount) {
        $secret_key = '';
        $connected_account_id = '';
        $currency = "USD";
        try {
            if (!class_exists('\Stripe\Stripe')) {
                require_once __DIR__ . '/../../vendor/autoload.php';
            }

            \Stripe\Stripe::setApiKey($secret_key);

            $transfer = \Stripe\Transfer::create([
                'amount'      => intval($amount * 100),
                'currency'    => $currency,
                'destination' => $connected_account_id,
                'description' => "Payment from Store #$store_id",
                'transfer_group' => "STORE_$store_id"
            ]);

            do_action('multivendorx_after_payment_complete', $order_id, $store_id);

        //     return [
        //         'success'  => true,
        //         'message'  => 'Payment successful',
        //         'response' => $transfer
        //     ];
        } catch (\Stripe\Exception\ApiErrorException $e) {
            //ERROR
        }
    }

    // public function hi(){
    //     $stripe = $this->process_payment(
    //         102,                          // store_id
    //         5.00,                         // amount
    //     );
    //     file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":stripe: : " . var_export($stripe, true) . "\n", FILE_APPEND);
    // }
}
