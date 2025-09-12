<?php

namespace MultiVendorX\StripeConnect;

use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Checkout\Session;
use Stripe\Transfer;

defined('ABSPATH') || exit;

class StripeGateway
{
    private $stripe;

    public function __construct()
    {
        $payment_admin_settings = MultiVendorX()->setting->get_setting('payment_methods', []);
        $stripe_settings = !empty($payment_admin_settings['stripe-connect']) ? $payment_admin_settings['stripe-connect'] : [];

        if ($stripe_settings && $stripe_settings['enable']) {
            $secret_key = $stripe_settings['secret_key'];
            Stripe::setApiKey($secret_key);
            Stripe::setApiVersion('2025-08-27.basil');
        }
    }

    public function create_account()
    {
        try {
            $account = Account::create([
                'controller' => [
                    'fees' => [
                        'payer' => 'application',
                    ],
                    'losses' => [
                        'payments' => 'application',
                    ],
                    'stripe_dashboard' => [
                        'type' => 'express',
                    ],
                ],
            ]);
            return $account;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function get_account($account_id)
    {
        try {
            $account = Account::retrieve($account_id);
            return $account;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function create_account_link($account_id)
    {
        try {
            $account_link = AccountLink::create([
                'account' => $account_id,
                'refresh_url' => admin_url('admin.php?page=mvx-setting-admin-payment-methods'),
                'return_url' => admin_url('admin.php?page=mvx-setting-admin-payment-methods'),
                'type' => 'account_onboarding',
            ]);
            return $account_link;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function create_transfer($amount, $destination, $order_id)
    {
        try {
            $transfer = Transfer::create([
                'amount' => $amount * 100,
                'currency' => 'usd',
                'destination' => $destination,
                'transfer_group' => $order_id,
            ]);
            return $transfer;
        } catch (\Exception $e) {
            return null;
        }
    }
}
