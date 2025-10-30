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

    public $events = [];

    public function __construct() {
        add_action('init', [$this, 'register_notification_hooks']);
        $this->insert_system_events();

        add_action( 'multivendorx_clear_notifications', array($this, 'multivendorx_clear_notifications'));

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
                    'system_message'  => 'New Store Approval [store_name]',
                    'tag'   => 'Store',
                    'category'  => 'activity'
                ],
            'new_store_reject' => 
                [
                    'name'  => 'New Store Reject',
                    'desc'  => 'Notify stores and admins when a new store is rejected.',
                    'admin_enabled'  => True,
                    'store_enabled'  => True,
                    'email_subject'  => 'New Store Rejected',
                    'email_body'  => 'Store Rejected successfully',
                    'sms_content'  => 'Store Rejected successfully',
                    'system_message'  => 'New Store Rejected',
                    'tag'   => 'Store',
                    'category'  => 'activity'
                ]
        ];

        $count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->prefix}" . Utill::TABLES['system_events']
        );

        if ($count > 0) {
            return;
        }

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
                    'tag'    => $event['tag'] ?? '',
                    'category'    => $event['category'] ?? '',
                ],
                [
                    '%s', '%s', '%d', '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
                ]
            );

        }

    }


    public function trigger_notifications($action_name, $parameters) {
        global $wpdb;
        $event = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM `" . $wpdb->prefix . Utill::TABLES['system_events'] . "` WHERE system_action = %s", $action_name )
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

    public function get_all_events( $id = null ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['system_events'];
        
        $events = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table" ) );

        if ( ! empty( $id ) ) {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE id = %d",
                    $id )
            );
        } else {
            $events = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table" ) );
        }

        return $events;
    } 


    public function get_all_notifications( $store_id = null ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        if ( ! empty( $store_id ) ) {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE store_id = %d AND is_dismissed = %d",
                    $store_id,
                    0
                )
            );
        } else {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE is_dismissed = %d",
                    0
                )
            );
        }

        return $events;
    }

    public function multivendorx_clear_notifications() {
        global $wpdb;

        $days = MultiVendorX()->setting->get_setting( 'clear_notifications' );

        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        $current_date = current_time('mysql');

        // Delete data older than N days or already expired
        $query = $wpdb->prepare(
            "
            DELETE FROM $table
            WHERE (expires_at IS NOT NULL AND expires_at < %s)
            OR (created_at < DATE_SUB(%s, INTERVAL %d DAY))
            ",
            $current_date,
            $current_date,
            $days
        );

        $wpdb->query( $query );

    }

}