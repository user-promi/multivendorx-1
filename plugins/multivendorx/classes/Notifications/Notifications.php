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
                 // ========== STORE ACTIVITY ==========
            'new_store_approval' => 
                [
                    'name'  => 'New store approval',
                    'desc'  => 'Notify stores and admins when a new store is approved.',
                    'admin_enabled'  => True,
                    'store_enabled'  => True,
                    'email_subject'  => 'New store approval',
                    'email_body'  => 'Store approved successfully',
                    'sms_content'  => 'Store approved successfully',
                    'system_message'  => 'New store approval [store_name]',
                    'tag'   => 'Store',
                    'category'  => 'activity'
                ],
            'new_store_reject' => 
                [
                    'name'  => 'New store reject',
                    'desc'  => 'Notify stores and admins when a new store is rejected.',
                    'admin_enabled'  => True,
                    'store_enabled'  => True,
                    'email_subject'  => 'New Store Rejected',
                    'email_body'  => 'Store Rejected successfully',
                    'sms_content'  => 'Store Rejected successfully',
                    'system_message'  => 'New Store Rejected',
                    'tag'   => 'Store',
                    'category'  => 'activity'
                ],
                
    'store_suspended' => [
        'name'  => 'Store suspended',
        'desc'  => 'Notify stores when their store has been suspended.',
        'store_enabled'  => true,
        'admin_enabled'  => true,
        'email_subject'  => 'Store suspended',
        'email_body'  => 'Your store [store_name] has been suspended by the admin.',
        'sms_content'  => 'Store [store_name] has been suspended.',
        'system_message'  => 'Store suspended: [store_name].',
        'tag'   => 'Store',
        'category'  => 'activity'
    ],

    'store_reactivated' => [
        'name'  => 'Store reactivated',
        'desc'  => 'Notify stores when their store is reactivated by admin.',
        'store_enabled'  => true,
        'admin_enabled'  => true,
        'email_subject'  => 'Store reactivated',
        'email_body'  => 'Your store [store_name] has been reactivated.',
        'sms_content'  => 'Your store [store_name] is active again.',
        'system_message'  => 'Store [store_name] reactivated.',
        'tag'   => 'Store',
        'category'  => 'activity'
    ],

    'store_profile_updated' => [
        'name'  => 'Store profile updated',
        'desc'  => 'Notify admin when a store updates its profile information.',
        'admin_enabled'  => true,
        'email_subject'  => 'Store profile updated',
        'email_body'  => 'Store [store_name] has updated its profile information.',
        'sms_content'  => 'Store [store_name] updated profile.',
        'system_message'  => 'Store [store_name] updated profile.',
        'tag'   => 'Store',
        'category'  => 'activity'
    ],

    // ========== ORDER EVENTS ==========
    'new_order' => [
        'name'  => 'New order placed',
        'desc'  => 'Notify stores and customers when a new order is placed.',
        'admin_enabled'  => true,
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'New order received',
        'email_body'  => 'A new order [order_id] has been placed.',
        'sms_content'  => 'New order [order_id] received.',
        'system_message'  => 'Order [order_id] placed successfully.',
        'tag'   => 'Order',
        'category'  => 'activity'
    ],

    'order_processing' => [
        'name'  => 'Order processing',
        'desc'  => 'Notify customer when order status changes to processing.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Order processing started',
        'email_body'  => 'Your order [order_id] is now being processed.',
        'sms_content'  => 'Order [order_id] is now processing.',
        'system_message'  => 'Order [order_id] status: Processing.',
        'tag'   => 'Order',
        'category'  => 'activity'
    ],

    'order_shipped' => [
        'name'  => 'Order shipped',
        'desc'  => 'Notify customer when an order is shipped.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Order shipped',
        'email_body'  => 'Your order [order_id] has been shipped.',
        'sms_content'  => 'Order [order_id] shipped successfully.',
        'system_message'  => 'Order [order_id] is on its way.',
        'tag'   => 'Order',
        'category'  => 'activity'
    ],

    'order_completed' => [
        'name'  => 'Order completed',
        'desc'  => 'Notify store and customer when an order is completed.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Order completed',
        'email_body'  => 'Order [order_id] has been successfully completed.',
        'sms_content'  => 'Order [order_id] completed successfully.',
        'system_message'  => 'Order [order_id] marked as completed.',
        'tag'   => 'Order',
        'category'  => 'activity'
    ],

    'order_cancelled' => [
        'name'  => 'Order cancelled',
        'desc'  => 'Notify stores and customers when an order is cancelled.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'admin_enabled'  => true,
        'email_subject'  => 'Order cancelled',
        'email_body'  => 'Order [order_id] has been cancelled.',
        'sms_content'  => 'Order [order_id] cancelled successfully.',
        'system_message'  => 'Order [order_id] cancelled.',
        'tag'   => 'Order',
        'category'  => 'activity'
    ],

    'order_refunded' => [
        'name'  => 'Order refunded',
        'desc'  => 'Notify customer and store when an order is refunded.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Order refunded',
        'email_body'  => 'Your refund for order [order_id] has been processed.',
        'sms_content'  => 'Refund for [order_id] processed.',
        'system_message'  => 'Order [order_id] refunded.',
        'tag'   => 'Order',
        'category'  => 'activity'
    ],

    // ========== PAYMENT ==========
    'payment_received' => [
        'name'  => 'Payment received',
        'desc'  => 'Notify store and admin when payment for an order is received.',
        'store_enabled'  => true,
        'admin_enabled'  => true,
        'email_subject'  => 'Payment received',
        'email_body'  => 'Payment for order [order_id] has been received successfully.',
        'sms_content'  => 'Payment received for [order_id].',
        'system_message'  => 'Payment for [order_id] received.',
        'tag'   => 'Payment',
        'category'  => 'activity'
    ],

    'payout_released' => [
        'name'  => 'Payout released',
        'desc'  => 'Notify stores when their payout is released.',
        'store_enabled'  => true,
        'email_subject'  => 'Payout released',
        'email_body'  => 'A payout of [amount] has been released to your account.',
        'sms_content'  => 'Payout of [amount] released.',
        'system_message'  => 'Payout released: [amount].',
        'tag'   => 'Payment',
        'category'  => 'activity'
    ],

    'payout_failed' => [
        'name'  => 'Payout failed',
        'desc'  => 'Notify admin and store when payout processing fails.',
        'admin_enabled'  => true,
        'store_enabled'  => true,
        'email_subject'  => 'Payout failed',
        'email_body'  => 'Payout of [amount] for store [store_name] failed.',
        'sms_content'  => 'Payout failed for [store_name].',
        'system_message'  => 'Payout error for [store_name].',
        'tag'   => 'Payment',
        'category'  => 'activity'
    ],

    // ========== REFUND ==========
    'refund_requested' => [
        'name'  => 'Refund requested',
        'desc'  => 'Notify admin, store, and customer when a refund is requested.',
        'admin_enabled'  => true,
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Refund requested',
        'email_body'  => 'A refund request has been placed for order [order_id].',
        'sms_content'  => 'Refund requested for [order_id].',
        'system_message'  => 'Refund request submitted for [order_id].',
        'tag'   => 'Refund',
        'category'  => 'activity'
    ],

    'refund_approved' => [
        'name'  => 'Refund approved',
        'desc'  => 'Notify customer and store when a refund is approved by admin.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Refund approved',
        'email_body'  => 'Your refund for order [order_id] has been approved.',
        'sms_content'  => 'Refund approved for [order_id].',
        'system_message'  => 'Refund approved for [order_id].',
        'tag'   => 'Refund',
        'category'  => 'activity'
    ],

    'refund_rejected' => [
        'name'  => 'Refund rejected',
        'desc'  => 'Notify customer when their refund request is rejected.',
        'customer_enabled' => true,
        'email_subject'  => 'Refund rejected',
        'email_body'  => 'Your refund request for order [order_id] has been rejected.',
        'sms_content'  => 'Refund request rejected for [order_id].',
        'system_message'  => 'Refund rejected for [order_id].',
        'tag'   => 'Refund',
        'category'  => 'activity'
    ],

    'refund_processed' => [
        'name'  => 'Refund processed',
        'desc'  => 'Notify customer and admin when a refund is processed successfully.',
        'admin_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Refund processed',
        'email_body'  => 'Refund for order [order_id] has been processed successfully.',
        'sms_content'  => 'Refund processed for [order_id].',
        'system_message'  => 'Refund processed successfully.',
        'tag'   => 'Refund',
        'category'  => 'activity'
    ],
    // ========== PRODUCT ==========
    'product_added' => [
        'name'  => 'New product added',
        'desc'  => 'Notify admin when a new product is added by a store.',
        'admin_enabled'  => true,
        'store_enabled'  => true,
        'email_subject'  => 'New product added',
        'email_body'  => 'New product “[product_name]” added by [store_name].',
        'sms_content'  => 'New product “[product_name]” added by [store_name].',
        'system_message'  => 'Product “[product_name]” added successfully.',
        'tag'   => 'Product',
        'category'  => 'activity'
    ],

    'product_approved' => [
        'name'  => 'Product approved',
        'desc'  => 'Notify store when a product is approved.',
        'store_enabled'  => true,
        'email_subject'  => 'Product approved',
        'email_body'  => 'Your product “[product_name]” has been approved.',
        'sms_content'  => 'Product “[product_name]” approved.',
        'system_message'  => 'Product “[product_name]” approved successfully.',
        'tag'   => 'Product',
        'category'  => 'notification'
    ],

    'product_rejected' => [
        'name'  => 'Product rejected',
        'desc'  => 'Notify store when a product is rejected.',
        'store_enabled'  => true,
        'email_subject'  => 'Product rejected',
        'email_body'  => 'Your product “[product_name]” was rejected. Reason: [reason].',
        'sms_content'  => 'Product “[product_name]” rejected.',
        'system_message'  => 'Product “[product_name]” rejected.',
        'tag'   => 'Product',
        'category'  => 'notification'
    ],

    'product_low_stock' => [
        'name'  => 'Low stock alert',
        'desc'  => 'Notify store when a product stock falls below threshold.',
        'store_enabled'  => true,
        'email_subject'  => 'Low stock alert',
        'email_body'  => 'Your product “[product_name]” is running low on stock (only [quantity] left).',
        'sms_content'  => 'Low stock alert: “[product_name]” – [quantity] left.',
        'system_message'  => 'Low stock alert for “[product_name]”.',
        'tag'   => 'Product',
        'category'  => 'notification'
    ],

    'product_out_of_stock' => [
        'name'  => 'Out of stock alert',
        'desc'  => 'Notify store when a product goes out of stock.',
        'store_enabled'  => true,
        'email_subject'  => 'Out of stock',
        'email_body'  => 'Your product “[product_name]” is now out of stock.',
        'sms_content'  => 'Out of stock: “[product_name]”.',
        'system_message'  => 'Product “[product_name]” is out of stock.',
        'tag'   => 'Product',
        'category'  => 'notification'
    ],

    // ========== REVIEWS ==========
    'product_review_received' => [
        'name'  => 'New product review',
        'desc'  => 'Notify store when a new product review is submitted by a customer.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'New product review received',
        'email_body'  => '[rating]-star review received for “[product_name]” by [customer_name].',
        'sms_content'  => 'New review received for “[product_name]”.',
        'system_message'  => 'New review received for “[product_name]”.',
        'tag'   => 'Review',
        'category'  => 'activity'
    ],

    'review_flagged' => [
        'name'  => 'Review flagged',
        'desc'  => 'Notify admin when a customer flags a review.',
        'admin_enabled'  => true,
        'email_subject'  => 'Review flagged',
        'email_body'  => 'A review for “[product_name]” has been flagged for moderation.',
        'sms_content'  => 'Review flagged for “[product_name]”.',
        'system_message'  => 'Review flagged for “[product_name]”.',
        'tag'   => 'Review',
        'category'  => 'notification'
    ],

    // ========== WITHDRAWALS ==========
    'withdrawal_requested' => [
        'name'  => 'Withdrawal requested',
        'desc'  => 'Notify admin when a store requests withdrawal.',
        'admin_enabled'  => true,
        'store_enabled'  => true,
        'email_subject'  => 'Withdrawal request submitted',
        'email_body'  => 'Store [store_name] requested withdrawal of [amount].',
        'sms_content'  => 'Withdrawal request of [amount] submitted.',
        'system_message'  => 'Withdrawal requested by [store_name].',
        'tag'   => 'Payment',
        'category'  => 'notification'
    ],

    'withdrawal_released' => [
        'name'  => 'Withdrawal released',
        'desc'  => 'Notify store when withdrawal is released.',
        'store_enabled'  => true,
        'email_subject'  => 'Withdrawal released',
        'email_body'  => 'Your withdrawal has been released via [payment_processor].',
        'sms_content'  => 'Withdrawal released successfully.',
        'system_message'  => 'Withdrawal released successfully.',
        'tag'   => 'Payment',
        'category'  => 'notification'
    ],

    // ========== REPORT ABUSE ==========
    'report_abuse_submitted' => [
        'name'  => 'Report abuse submitted',
        'desc'  => 'Notify admin and store when a customer reports a product.',
        'admin_enabled'  => true,
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Product reported',
        'email_body'  => 'Customer reported “[product_name]” for abuse.',
        'sms_content'  => 'Product “[product_name]” reported.',
        'system_message'  => 'Abuse report for “[product_name]” received.',
        'tag'   => 'Report',
        'category'  => 'notification'
    ],

    'report_abuse_action_taken' => [
        'name'  => 'Report abuse resolved',
        'desc'  => 'Notify store and customer when admin takes action on a report.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Report resolved',
        'email_body'  => 'Admin reviewed the abuse report for “[product_name]”. Action: [action_taken].',
        'sms_content'  => 'Abuse report reviewed for “[product_name]”.',
        'system_message'  => 'Abuse report resolved for “[product_name]”.',
        'tag'   => 'Report',
        'category'  => 'notification'
    ],

    // ========== ANNOUNCEMENTS ==========
    'system_announcement' => [
        'name'  => 'System announcement',
        'desc'  => 'Notify stores and customers of a new admin announcement.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'New announcement',
        'email_body'  => '[announcement_message]',
        'sms_content'  => '[announcement_message]',
        'system_message'  => 'New announcement: [announcement_message]',
        'tag'   => 'System',
        'category'  => 'notification'
    ],

    'system_maintenance' => [
        'name'  => 'System maintenance',
        'desc'  => 'Notify all users of scheduled system maintenance.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'admin_enabled'  => true,
        'email_subject'  => 'System maintenance scheduled',
        'email_body'  => 'System maintenance is scheduled on [date_time].',
        'sms_content'  => 'Maintenance scheduled on [date_time].',
        'system_message'  => 'Scheduled maintenance on [date_time].',
        'tag'   => 'System',
        'category'  => 'notification'
    ],

    'policy_update' => [
        'name'  => 'Policy update',
        'desc'  => 'Notify users when marketplace policy changes.',
        'store_enabled'  => true,
        'customer_enabled' => true,
        'email_subject'  => 'Policy update',
        'email_body'  => 'Marketplace policy updated. Please review the new terms.',
        'sms_content'  => 'Policy updated. Check marketplace terms.',
        'system_message'  => 'Marketplace policy updated.',
        'tag'   => 'System',
        'category'  => 'notification'
    ],

    'commission_processed' => [
        'name'  => 'Commission processed',
        'desc'  => 'Notify store when commission payment is processed.',
        'store_enabled'  => true,
        'admin_enabled'  => true,
        'email_subject'  => 'Commission processed',
        'email_body'  => 'Commission payment of [amount] processed for [store_name].',
        'sms_content'  => 'Commission processed for [store_name].',
        'system_message'  => 'Commission payment processed for [store_name].',
        'tag'   => 'Commission',
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