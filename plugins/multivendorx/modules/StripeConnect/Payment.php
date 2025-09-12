<?php

namespace MultiVendorX\StripeConnect;

use MultiVendorX\StripeConnect\StripeGateway;

defined('ABSPATH') || exit;

class Payment
{
    private $gateway;

    public function __construct()
    {
        $this->gateway = new StripeGateway();
        add_action('multivendorx_process_stripe-connect_payment', array($this, 'process_payment'), 10, 4);
    }

    public function get_id()
    {
        return 'stripe-connect';
    }

    public function get_settings()
    {
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

    public function get_store_payment_settings()
    {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = !empty($payment_admin_settings['stripe-connect']) ? $payment_admin_settings['stripe-connect'] : [];

        if ($stripe_settings && $stripe_settings['enable']) {
            $vendor = get_current_user_id();
            $stripe_account_id = get_user_meta($vendor, '_stripe_connect_account_id', true);
            $onboarding_status = 'Not Onboarded';

            if ($stripe_account_id) {
                $account = $this->gateway->get_account($stripe_account_id);
                if ($account && $account->charges_enabled) {
                    $onboarding_status = 'Onboarded';
                }
            }

            ob_start();
            ?>
            <div class="mvx-stripe-connect-onboarding">
                <p><strong><?php echo __('Onboarding Status:', 'multivendorx'); ?></strong> <?php echo $onboarding_status; ?></p>
                <button id="mvx-stripe-connect-onboard-button" class="button button-primary">
                    <?php echo __('Onboard to collect payments', 'multivendorx'); ?>
                </button>
            </div>
            <script>
                jQuery(document).ready(function($) {
                    $('#mvx-stripe-connect-onboard-button').on('click', function(e) {
                        e.preventDefault();
                        $.post(ajaxurl, {
                            action: 'multivendorx_stripe_connect_onboard',
                            _wpnonce: '<?php echo wp_create_nonce('multivendorx_stripe_connect_onboard'); ?>'
                        }, function(response) {
                            if (response.success) {
                                window.location.href = response.data.url;
                            } else {
                                alert(response.data.message);
                            }
                        });
                    });
                });
            </script>
            <?php
            $html = ob_get_clean();

            return [
                'id'    => $this->get_id(),
                'label' => __('Stripe Connect', 'multivendorx'),
                'fields' => [
                    [
                        'type'  => 'html',
                        'html'  => $html
                    ]
                ]
            ];
        }
    }

    public function onboard_vendor()
    {
        check_ajax_referer('multivendorx_stripe_connect_onboard');

        $vendor = get_current_user_id();
        $stripe_account_id = get_user_meta($vendor, '_stripe_connect_account_id', true);

        if (!$stripe_account_id) {
            $account = $this->gateway->create_account();
            if ($account) {
                $stripe_account_id = $account->id;
                update_user_meta($vendor, '_stripe_connect_account_id', $stripe_account_id);
            } else {
                wp_send_json_error(['message' => __('Could not create Stripe account.', 'multivendorx')]);
            }
        }

        $account_link = $this->gateway->create_account_link($stripe_account_id);

        if ($account_link) {
            wp_send_json_success(['url' => $account_link->url]);
        } else {
            wp_send_json_error(['message' => __('Could not create account link.', 'multivendorx')]);
        }
    }

    public function process_payment($order_id, $store_id, $amount)
    {
        $stripe_account_id = get_user_meta($store_id, '_stripe_connect_account_id', true);
        if (!$stripe_account_id) {
            return [
                'success' => false,
                'message' => __('Vendor is not connected to Stripe.', 'multivendorx')
            ];
        }

        $session = $this->gateway->create_checkout_session($order_id, $stripe_account_id, $amount);

        if ($session) {
            wp_redirect($session->url);
            exit;
        } else {
            return [
                'success' => false,
                'message' => __('Could not create checkout session.', 'multivendorx')
            ];
        }
    }
}