<?php

namespace MultiVendorX\PaypalMarketplace;
use MultiVendorX\Payments\RealtimeGateway;

defined('ABSPATH') || exit;

use MultiVendorX\Store\Store;


class Payment extends RealtimeGateway {
    public function __construct(){
       
    }

    public function get_id() {
        return 'paypal-marketplace';
    }

    public function get_settings() {
        return [
            'icon'      => 'PP',
            'id'        => $this->get_id(),
            'label'     => 'Paypal Marketplace',
            'enableOption' => true,
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

        $paypal_settings = !empty($payment_admin_settings['paypal-marketplace']) ? $payment_admin_settings['paypal-marketplace'] : [];
        
        if ($paypal_settings['enable']) {
            return [
                'id'    => $this->get_id(),
                'label' => __('Paypal Marketplace', 'multivendorx'),
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

    public function process_payment($order_id) {
        $this->get_all_information($order_id);


        // do_action render based on charges of this gateways
        // do_action('multivendorx_after_payment_complete', $store_id,
        //                 'Paypal Marketplace',
        //                 $status,
        //                 $order_id, $transaction_id
        //             );
       
        // do_action( 'multivendorx_after_real_time_payment_complete',$store_id, $order_id );
        
    }

}

