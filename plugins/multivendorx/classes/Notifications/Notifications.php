<?php

namespace MultiVendorX\Notifications;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Notifications class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class Notifications {

    public $events;

    public function __construct() {
        $this->register_notification_hooks();
    }

    public function register_notification_hooks() {
        foreach ($this->events as $event => $value) {
            add_action("multivendorx_notify_{$event}", [$this, 'trigger_notifications'], 10, 2);
        }
    }

    public function insert_system_events() {
        global $wpdb;

        // $all_events = [
        //     'multivendorx_new_store_approval'   => ['admin', 'store']
        // ];

        $this->events = [
            'new_store_approval' => 
                [
                    'name'  => 'New Store Approval',
                    'desc'  => 'Notify stores and admins when a new store is approved.',
                    'admin_enabled'  => True,
                    'store_enabled'  => True,
                    'email_subject'  => 'New Store Approval',
                    'email_body'  => 'Store approved successfully',
                    'sms_content'  => 'Store approved successfully',
                    'system_message'  => 'New Store Approval',
                ]
        ];

        foreach ($this->events as $key => $event) {

            $wpdb->insert(
                "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                [
                    'event_name'       => $event['name'],
                    'description'      => $event['desc'],
                    'admin_enabled'    => $event['admin_enabled'] ?? False,
                    'customer_enabled' => $event['customer_enabled'] ?? False,
                    'store_enabled'    => $event['store_enabled'] ?? False,
                    'system_enabled'   => True,
                    'system_action'    => $key,
                    'email_subject'    => $event['email_subject'] ?? '',
                    'email_body'       => $event['email_body'] ?? '',
                    'sms_content'      => $event['sms_content'] ?? '',
                    'system_message'   => $event['system_message'] ?? '',
                    'status'           => 'active',
                    'custom_emails'    => wp_json_encode([]), // empty array
                ],
                [
                    '%s', '%s', '%d', '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
                ]
            );

        }

    }
    public function trigger_notifications($event_name, $parameters) {

        global $wpdb;
        $event = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM `" . $wpdb->prefix . Utill::TABLES['system_events'] . "` WHERE event_name = %s", $event_name )
        );

        if ($event->admin_enabled) {
            $admin_email = $parameters['admin_email'];
        }
        if ($event->store_enabled) {
            $store_email = $parameters['store_email'];
        }
        if ($event->customer_enabled) {
            $customer_email = $parameters['customer_email'];
        }

        if ($event->system_enabled) {
            $this->send_notifications($event, $parameters);
        }

        if ($event->email_enabled) {
            // call email class
        }
        
        if ($event->sms_enabled) {
            // call sms class
        }

    }

    public function send_notifications($event, $parameters) {

        global $wpdb;

        $wpdb->insert(
            "{$wpdb->prefix}" . Utill::TABLES['notifications'],
            [
                'store_id'      => $parameters['store_id'] ?? null,
                'category'      => $parameters['category'],
                'type'          => $event->system_action,
                'title'         => $event->event_name,
                'message'       => $event->description,
            ],
            [
                '%d', '%s', '%s', '%s', '%s'
            ]
        );

    }
    
}