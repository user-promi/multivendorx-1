<?php
namespace MultiVendorX\Payments;

defined( 'ABSPATH' ) || exit;
use MultiVendorX\Store\Store;
class PaypalPayout {
    public function __construct() {
        add_action( 'multivendorx_process_paypal-payout_payment', array( $this, 'process_payment' ), 10, 5 );
    }
    public function get_id() {
        return 'paypal-payout';
    }
    public function get_settings() {
        return array(
            'icon'         => 'adminlib-form-paypal-email',
            'id'           => $this->get_id(),
            'label'        => 'Paypal Payout',
            'enableOption' => true,
            'disableBtn'   => true,
            'desc'         => 'Full marketplace solution with instant payouts, comprehensive dispute handling, and global coverage. Best for established marketplaces.',
            'formFields'   => array(
                array(
                    'key'     => 'payment_mode',
                    'type'    => 'setting-toggle',
                    'label'   => __( 'Payment mode', 'multivendorx' ),
                    'options' => array(
                        array(
							'key'   => 'sandbox',
							'label' => __( 'Sandbox', 'multivendorx' ),
							'value' => 'sandbox',
						),
                        array(
							'key'   => 'live',
							'label' => __( 'Live', 'multivendorx' ),
							'value' => 'live',
						),
                    ),
                ),
                array(
                    'key'         => 'client_id',
                    'type'        => 'text',
                    'label'       => 'Client ID',
                    'placeholder' => 'Enter Client id',
                ),
                array(
                    'key'         => 'client_secret',
                    'type'        => 'text',
                    'label'       => 'Client secret key',
                    'placeholder' => 'Enter Secret Key',
                ),
            ),
        );
    }
    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $paypal_settings        = ! empty( $payment_admin_settings['paypal-payout'] ) ? $payment_admin_settings['paypal-payout'] : array();
        if ( ! empty( $paypal_settings ) && $paypal_settings['enable'] ) {
            return array(
                'id'     => $this->get_id(),
                'label'  => __( 'Paypal Payout', 'multivendorx' ),
                'fields' => array(
                    array(
                        'key'         => 'paypal_email',
                        'type'        => 'email',
                        'label'       => __( 'PayPal Email', 'multivendorx' ),
                        'placeholder' => __( 'Enter your PayPal email address', 'multivendorx' ),
                    ),
                ),
            );
        }
    }
    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null ) {
        $payment_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );
        $paypal_settings  = $payment_settings['paypal-payout'] ?? null;
        if ( $paypal_settings && ! empty( $paypal_settings['enable'] ) ) {
            $status         = 'failed';
            $store          = new Store( $store_id );
            $receiver_email = $store->get_meta( Utill::STORE_SETTINGS_KEYS['payment_method'] ) === 'paypal-payout'
                                ? $store->get_meta( Utill::STORE_SETTINGS_KEYS['paypal_email'] )
                                : '';
            $client_id      = $paypal_settings['client_id'] ?? '';
            $client_secret  = $paypal_settings['client_secret'] ?? '';
            if ( $receiver_email && $client_id && $client_secret ) {
                $sandbox  = ( $paypal_settings['payment_mode'] == 'sandbox' );
                $currency = get_woocommerce_currency();

                // 1. access token
                $access_token = $this->get_paypal_access_token( $client_id, $client_secret, $sandbox );
                if ( $access_token ) {
                    // 2. create payout
                    $payout_response = $this->create_paypal_payout(
                        $access_token,
                        $receiver_email,
                        $amount,
                        $currency,
                        $store_id,
                        $sandbox
                    );

                    // success when batch id exists
                    if ( ! empty( $payout_response ) && ! empty( $payout_response['batch_header']['payout_batch_id'] ) ) {
                        $status = 'success';
                    }
                }
            }

            do_action(
                'multivendorx_after_payment_complete',
                $store_id,
                'Paypal Payout',
                $status,        // :heavy_check_mark: dynamic status here
                $order_id,
                $transaction_id,
                $note,
                $amount
            );
        }
    }
    /**
     * Get PayPal access token using client credentials
     */
    private function get_paypal_access_token( $client_id, $client_secret, $sandbox = false ) {
        $base_url = $sandbox
            ? 'https://api.sandbox.paypal.com'
            : 'https://api.paypal.com';
        $args     = array(
            'method'  => 'POST',
            'headers' => array(
                'Accept'          => 'application/json',
                'Accept-Language' => 'en_US',
                'Content-Type'    => 'application/x-www-form-urlencoded',
            ),
            'body'    => 'grant_type=client_credentials',
            'timeout' => 30,
        );
        // Add Basic Auth header
        $args['headers']['Authorization'] = 'Basic ' . base64_encode( $client_id . ':' . $client_secret );
        $response                         = wp_remote_post( $base_url . '/v1/oauth2/token', $args );
        if ( is_wp_error( $response ) ) {
            return false;
        }
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        return ! empty( $data ) ? $data['access_token'] : false;
    }

    /**
     * Create PayPal payout
     */
    private function create_paypal_payout( $access_token, $receiver_email, $amount, $currency, $store_id, $sandbox = false ) {
        $base_url        = $sandbox
            ? 'https://api.sandbox.paypal.com'
            : 'https://api.paypal.com';
        $sender_batch_id = uniqid();
        $sender_item_id  = uniqid();
        $payout_data     = array(
            'sender_batch_header' => array(
                'sender_batch_id' => $sender_batch_id,
                'email_subject'   => 'You have a payment',
                'email_message'   => 'You have received a payment from the marketplace',
            ),
            'items'               => array(
                array(
                    'recipient_type' => 'EMAIL',
                    'amount'         => array(
                        'value'    => number_format( $amount, 2, '.', '' ),
                        'currency' => $currency,
                    ),
                    'receiver'       => $receiver_email,
                    'note'           => "Payment from Store #$store_id",
                    'sender_item_id' => $sender_item_id,
                ),
            ),
        );
        $args            = array(
            'method'  => 'POST',
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $access_token,
            ),
            'body'    => json_encode( $payout_data ),
            'timeout' => 30,
        );
        $response        = wp_remote_post( $base_url . '/v1/payments/payouts', $args );

        if ( is_wp_error( $response ) ) {
            return array();
        }
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        return $data;
    }
}
