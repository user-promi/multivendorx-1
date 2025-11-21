<?php
namespace MultiVendorX\Notifications;

use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Notifications class
 *
 * @version        PRODUCT_VERSION
 * @package        MultiVendorX
 * @author         MultiVendorX
 */

class Notifications
{

    public $events = [];

    public function __construct()
    {
        add_action('init', [$this, 'register_notification_hooks']);
        $this->insert_system_events();

        add_action('multivendorx_clear_notifications', [$this, 'multivendorx_clear_notifications']);

    }

    public function register_notification_hooks()
    {
        foreach ($this->events as $event => $value) {
            add_action("multivendorx_notify_{$event}", [$this, 'trigger_notifications'], 10, 2);
        }
    }

    public function insert_system_events()
    {
        global $wpdb;

        // $all_events = [
        //     'multivendorx_new_store_approval'   => ['admin', 'store']
        // ];

        $this->events = [
            // ========== STORE ACTIVITY ==========
            'new_store_approval'        =>
            [
                'name'           => 'New store approval',
                'desc'           => 'A new store is approved by the admin.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'New store approval',
                'email_body'     => 'Store approved successfully',
                'sms_content'    => 'Store approved successfully',
                'system_message' => 'New store approval [store_name]',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],
            'new_store_reject'          =>
            [
                'name'           => 'New store reject',
                'desc'           => 'A store application is rejected by the admin.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'New Store Rejected',
                'email_body'     => 'Store Rejected successfully',
                'sms_content'    => 'Store Rejected successfully',
                'system_message' => 'New Store Rejected',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            'store_suspended'           => [
                'name'           => 'Store suspended',
                'desc'           => 'A store is suspended by the admin.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Store suspended',
                'email_body'     => 'Your store [store_name] has been suspended by the admin.',
                'sms_content'    => 'Store [store_name] has been suspended.',
                'system_message' => 'Store suspended: [store_name].',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            'store_reactivated'         => [
                'name'           => 'Store reactivated',
                'desc'           => 'A suspended store is reactivated by the admin.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Store reactivated',
                'email_body'     => 'Your store [store_name] has been reactivated.',
                'sms_content'    => 'Your store [store_name] is active again.',
                'system_message' => 'Store [store_name] reactivated.',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            'store_profile_updated'     => [
                'name'           => 'Store profile updated',
                'desc'           => 'A store profile is updated by the store owner.',
                'admin_enabled'  => true,
                'email_subject'  => 'Store profile updated',
                'email_body'     => 'Store [store_name] has updated its profile information.',
                'sms_content'    => 'Store [store_name] updated profile.',
                'system_message' => 'Store [store_name] updated profile.',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            // ========== ORDER EVENTS ==========
            'new_order'                 => [
                'name'             => 'New order placed',
                'desc'             => 'A new order is placed on the marketplace.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New order received',
                'email_body'       => 'A new order [order_id] has been placed.',
                'sms_content'      => 'New order [order_id] received.',
                'system_message'   => 'Order [order_id] placed successfully.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            'order_processing'          => [
                'name'             => 'Order processing',
                'desc'             => 'An order status is changed to processing.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order processing started',
                'email_body'       => 'Your order [order_id] is now being processed.',
                'sms_content'      => 'Order [order_id] is now processing.',
                'system_message'   => 'Order [order_id] status: Processing.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            'order_shipped'             => [
                'name'             => 'Order shipped',
                'desc'             => 'An order is marked as shipped.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order shipped',
                'email_body'       => 'Your order [order_id] has been shipped.',
                'sms_content'      => 'Order [order_id] shipped successfully.',
                'system_message'   => 'Order [order_id] is on its way.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            'order_completed'           => [
                'name'             => 'Order completed',
                'desc'             => 'An order is completed successfully.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order completed',
                'email_body'       => 'Order [order_id] has been successfully completed.',
                'sms_content'      => 'Order [order_id] completed successfully.',
                'system_message'   => 'Order [order_id] marked as completed.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            'order_cancelled'           => [
                'name'             => 'Order cancelled',
                'desc'             => 'An order is cancelled by the customer or admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'admin_enabled'    => true,
                'email_subject'    => 'Order cancelled',
                'email_body'       => 'Order [order_id] has been cancelled.',
                'sms_content'      => 'Order [order_id] cancelled successfully.',
                'system_message'   => 'Order [order_id] cancelled.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            'order_refunded'            => [
                'name'             => 'Order refunded',
                'desc'             => 'A refund is issued for an order.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order refunded',
                'email_body'       => 'Your refund for order [order_id] has been processed.',
                'sms_content'      => 'Refund for [order_id] processed.',
                'system_message'   => 'Order [order_id] refunded.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            // ========== PAYMENT ==========
            'payment_received'          => [
                'name'           => 'Payment received',
                'desc'           => 'A payment is received for an order.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Payment received',
                'email_body'     => 'Payment for order [order_id] has been received successfully.',
                'sms_content'    => 'Payment received for [order_id].',
                'system_message' => 'Payment for [order_id] received.',
                'tag'            => 'Payment',
                'category'       => 'activity',
            ],

            'payout_failed'             => [
                'name'           => 'Payout failed',
                'desc'           => 'A payout processing attempt has failed.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'Payout failed',
                'email_body'     => 'Payout of [amount] for store [store_name] failed.',
                'sms_content'    => 'Payout failed for [store_name].',
                'system_message' => 'Payout error for [store_name].',
                'tag'            => 'Payment',
                'category'       => 'activity',
            ],

            // ========== REFUND ==========
            'refund_requested'          => [
                'name'             => 'Refund requested',
                'desc'             => 'A refund request is submitted by a customer.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund requested',
                'email_body'       => 'A refund request has been placed for order [order_id].',
                'sms_content'      => 'Refund requested for [order_id].',
                'system_message'   => 'Refund request submitted for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ],

            'refund_approved'           => [
                'name'             => 'Refund approved',
                'desc'             => 'A refund request is approved by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund approved',
                'email_body'       => 'Your refund for order [order_id] has been approved.',
                'sms_content'      => 'Refund approved for [order_id].',
                'system_message'   => 'Refund approved for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ],

            'refund_rejected'           => [
                'name'             => 'Refund rejected',
                'desc'             => 'A refund request is rejected by the admin.',
                'customer_enabled' => true,
                'email_subject'    => 'Refund rejected',
                'email_body'       => 'Your refund request for order [order_id] has been rejected.',
                'sms_content'      => 'Refund request rejected for [order_id].',
                'system_message'   => 'Refund rejected for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ],

            'refund_processed'          => [
                'name'             => 'Refund processed',
                'desc'             => 'A refund is processed and completed successfully.',
                'admin_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund processed',
                'email_body'       => 'Refund for order [order_id] has been processed successfully.',
                'sms_content'      => 'Refund processed for [order_id].',
                'system_message'   => 'Refund processed successfully.',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ],

            // ========== PRODUCT ==========
            'product_added'             => [
                'name'           => 'New product added',
                'desc'           => 'A new product is added by a store.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'New product added',
                'email_body'     => 'New product “[product_name]” added by [store_name].',
                'sms_content'    => 'New product “[product_name]” added by [store_name].',
                'system_message' => 'Product “[product_name]” added successfully.',
                'tag'            => 'Product',
                'category'       => 'activity',
            ],

            'product_approved'          => [
                'name'           => 'Product approved',
                'desc'           => 'A product is approved by the admin.',
                'store_enabled'  => true,
                'email_subject'  => 'Product approved',
                'email_body'     => 'Your product “[product_name]” has been approved.',
                'sms_content'    => 'Product “[product_name]” approved.',
                'system_message' => 'Product “[product_name]” approved successfully.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            'product_rejected'          => [
                'name'           => 'Product rejected',
                'desc'           => 'A product is rejected during review.',
                'store_enabled'  => true,
                'email_subject'  => 'Product rejected',
                'email_body'     => 'Your product “[product_name]” was rejected. Reason: [reason].',
                'sms_content'    => 'Product “[product_name]” rejected.',
                'system_message' => 'Product “[product_name]” rejected.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            'product_low_stock'         => [
                'name'           => 'Low stock alert',
                'desc'           => 'A product stock level is detected below the set threshold.',
                'store_enabled'  => true,
                'email_subject'  => 'Low stock alert',
                'email_body'     => 'Your product “[product_name]” is running low on stock (only [quantity] left).',
                'sms_content'    => 'Low stock alert: “[product_name]” – [quantity] left.',
                'system_message' => 'Low stock alert for “[product_name]”.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            'product_out_of_stock'      => [
                'name'           => 'Out of stock alert',
                'desc'           => 'A product is detected as out of stock.',
                'store_enabled'  => true,
                'email_subject'  => 'Out of stock',
                'email_body'     => 'Your product “[product_name]” is now out of stock.',
                'sms_content'    => 'Out of stock: “[product_name]”.',
                'system_message' => 'Product “[product_name]” is out of stock.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            // ========== REVIEWS ==========
            'product_review_received'   => [
                'name'             => 'New product review',
                'desc'             => 'A new review is submitted for a product.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New product review received',
                'email_body'       => '[rating]-star review received for “[product_name]” by [customer_name].',
                'sms_content'      => 'New review received for “[product_name]”.',
                'system_message'   => 'New review received for “[product_name]”.',
                'tag'              => 'Review',
                'category'         => 'activity',
            ],

            'review_flagged'            => [
                'name'           => 'Review flagged',
                'desc'           => 'A product review is flagged by a customer.',
                'admin_enabled'  => true,
                'email_subject'  => 'Review flagged',
                'email_body'     => 'A review for “[product_name]” has been flagged for moderation.',
                'sms_content'    => 'Review flagged for “[product_name]”.',
                'system_message' => 'Review flagged for “[product_name]”.',
                'tag'            => 'Review',
                'category'       => 'notification',
            ],

            // ========== WITHDRAWALS ==========
            'withdrawal_requested'      => [
                'name'           => 'Withdrawal requested',
                'desc'           => 'A withdrawal request is submitted by a store.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'Withdrawal request submitted',
                'email_body'     => 'Store [store_name] requested withdrawal of [amount].',
                'sms_content'    => 'Withdrawal request of [amount] submitted.',
                'system_message' => 'Withdrawal requested by [store_name].',
                'tag'            => 'Payment',
                'category'       => 'notification',
            ],

            'withdrawal_released'       => [
                'name'           => 'Withdrawal released',
                'desc'           => 'A withdrawal is released successfully.',
                'store_enabled'  => true,
                'email_subject'  => 'Withdrawal released',
                'email_body'     => 'Your withdrawal has been released via [payment_processor].',
                'sms_content'    => 'Withdrawal released successfully.',
                'system_message' => 'Withdrawal released successfully.',
                'tag'            => 'Payment',
                'category'       => 'notification',
            ],
            
            'withdrawl_rejected'           => [
                'name'           => 'Withdrawl rejected',
                'desc'           => 'A withdrawl request is rejected by the admin.',
                'store_enabled'  => true,
                'email_subject'  => 'Withdrawl rejected',
                'email_body'     => 'A Withdrawl of [amount] has been rejected by your administrator.',
                'sms_content'    => 'Withdrawl of [amount] rejected.',
                'system_message' => 'Withdrawl Payout rejected: [amount].',
                'tag'            => 'Payment',
                'category'       => 'activity',
            ],

            // ========== REPORT ABUSE ==========
            'report_abuse_submitted'    => [
                'name'             => 'Report abuse submitted',
                'desc'             => 'A product is reported for abuse by a customer.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Product reported',
                'email_body'       => 'Customer reported “[product_name]” for abuse.',
                'sms_content'      => 'Product “[product_name]” reported.',
                'system_message'   => 'Abuse report for “[product_name]” received.',
                'tag'              => 'Report',
                'category'         => 'notification',
            ],

            'report_abuse_action_taken' => [
                'name'             => 'Report abuse resolved',
                'desc'             => 'An abuse report is reviewed and resolved by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Report resolved',
                'email_body'       => 'Admin reviewed the abuse report for “[product_name]”. Action: [action_taken].',
                'sms_content'      => 'Abuse report reviewed for “[product_name]”.',
                'system_message'   => 'Abuse report resolved for “[product_name]”.',
                'tag'              => 'Report',
                'category'         => 'notification',
            ],

            // ========== ANNOUNCEMENTS ==========
            'system_announcement'       => [
                'name'             => 'System announcement',
                'desc'             => 'A system-wide announcement is published by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New announcement',
                'email_body'       => '[announcement_message]',
                'sms_content'      => '[announcement_message]',
                'system_message'   => 'New announcement: [announcement_message]',
                'tag'              => 'System',
                'category'         => 'notification',
            ],

            'system_maintenance'        => [
                'name'             => 'System maintenance',
                'desc'             => 'A scheduled maintenance is announced by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'admin_enabled'    => true,
                'email_subject'    => 'System maintenance scheduled',
                'email_body'       => 'System maintenance is scheduled on [date_time].',
                'sms_content'      => 'Maintenance scheduled on [date_time].',
                'system_message'   => 'Scheduled maintenance on [date_time].',
                'tag'              => 'System',
                'category'         => 'notification',
            ],

            'policy_update'             => [
                'name'             => 'Policy update',
                'desc'             => 'Marketplace policies are updated by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Policy update',
                'email_body'       => 'Marketplace policy has been updated. Please review the new terms.',
                'sms_content'      => 'Policy update: Review new terms.',
                'system_message'   => 'Marketplace policy updated.',
                'tag'              => 'System',
                'category'         => 'notification',
            ],

            'commission_processed'      => [
                'name'           => 'Commission processed',
                'desc'           => 'A commission payment is processed for a store.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Commission processed',
                'email_body'     => 'Commission payment of [amount] processed for [store_name].',
                'sms_content'    => 'Commission processed for [store_name].',
                'system_message' => 'Commission payment processed for [store_name].',
                'tag'            => 'Commission',
                'category'       => 'activity',
            ],

            // (remaining duplicates/legacy keys retained from original list)
            'product_review_received'   => [
                'name'           => 'New Review Received',
                'desc'           => 'A new review is submitted for a product.',
                'store_enabled'  => true,
                'email_subject'  => 'New Review Received',
                'email_body'     => '{rating}-star review received for "{product_name}" by {customer_name}.',
                'sms_content'    => 'You received a {rating}-star review for {product_name}.',
                'system_message' => 'New review for {product_name} from {customer_name}.',
                'tag'            => 'Product',
                'category'       => 'activity',
            ],
            'order_completed_alt'       => [
                'name'             => 'Order Completed',
                'desc'             => 'An order is completed successfully.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order Completed',
                'email_body'       => 'Order #{order_id} successfully completed.',
                'sms_content'      => 'Order #{order_id} is now completed.',
                'system_message'   => 'Order #{order_id} completed successfully.',
                'tag'              => 'Order',
                'category'         => 'notification',
            ],

            'commission_credit'         => [
                'name'           => 'Commission Credited',
                'desc'           => 'A commission is credited for an order.',
                'store_enabled'  => true,
                'email_subject'  => 'Commission Credited',
                'email_body'     => 'Commission received for order #{order_id}.',
                'sms_content'    => 'Commission credited for order #{order_id}.',
                'system_message' => 'Commission received for order #{order_id}.',
                'tag'            => 'Commission',
                'category'       => 'notification',
            ],
            
            'adjustment_credit'         => [
                'name'           => 'Adjustment Credit',
                'desc'           => 'An adjustment credit is issued by the admin.',
                'store_enabled'  => true,
                'email_subject'  => 'Adjustment Credit',
                'email_body'     => 'Admin adjustment credit of {amount} {currency}.',
                'sms_content'    => 'Credit of {amount} {currency} applied.',
                'system_message' => 'Adjustment credit: {amount} {currency}.',
                'tag'            => 'Finance',
                'category'       => 'notification',
            ],

            'adjustment_debit'          => [
                'name'           => 'Adjustment Debit',
                'desc'           => 'An adjustment debit is applied by the admin.',
                'store_enabled'  => true,
                'email_subject'  => 'Adjustment Debit',
                'email_body'     => 'Admin adjustment debit of {amount} {currency}.',
                'sms_content'    => 'Debit of {amount} {currency} applied.',
                'system_message' => 'Adjustment debit: {amount} {currency}.',
                'tag'            => 'Finance',
                'category'       => 'notification',
            ],

            'order_new'                 => [
                'name'           => 'New Order Received',
                'desc'           => 'A new order is received by the store.',
                'store_enabled'  => true,
                'email_subject'  => 'New Order Received',
                'email_body'     => 'New order #{order_id} received.',
                'sms_content'    => 'New order #{order_id} received.',
                'system_message' => 'Order #{order_id} received.',
                'tag'            => 'Order',
                'category'       => 'notification',
            ],

            'order_ready_to_ship'       => [
                'name'           => 'Order Ready to Ship',
                'desc'           => 'An order is marked as ready to ship.',
                'store_enabled'  => true,
                'email_subject'  => 'Order Ready to Ship',
                'email_body'     => 'Order #{order_id} is ready to ship.',
                'sms_content'    => 'Order #{order_id} ready to ship.',
                'system_message' => 'Order #{order_id} ready to ship.',
                'tag'            => 'Order',
                'category'       => 'notification',
            ],

            'order_delivered_alt'       => [
                'name'             => 'Order Delivered',
                'desc'             => 'An order is marked as delivered.',
                'customer_enabled' => true,
                'email_subject'    => 'Order Delivered',
                'email_body'       => 'Order #{order_id} has been delivered.',
                'sms_content'      => 'Order #{order_id} delivered.',
                'system_message'   => 'Order #{order_id} delivered.',
                'tag'              => 'Order',
                'category'         => 'notification',
            ],

            'order_return_requested'    => [
                'name'             => 'Return Requested',
                'desc'             => 'A return request is submitted by the customer.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Return Requested',
                'email_body'       => 'Return request received for order #{order_id}.',
                'sms_content'      => 'Return request for order #{order_id}.',
                'system_message'   => 'Return request received for order #{order_id}.',
                'tag'              => 'Refund',
                'category'         => 'notification',
            ],
        ];

        [
            // ========== STORE ACTIVITY ==========
            'new_store_approval'        =>
            [
                'name'           => 'New store approval',
                'desc'           => 'Admin approves a new store.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'New store approval',
                'email_body'     => 'Store approved successfully',
                'sms_content'    => 'Store approved successfully',
                'system_message' => 'New store approval [store_name]',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],
            'new_store_reject'          =>
            [
                'name'           => 'New store reject',
                'desc'           => 'Notify stores and admins when a new store is rejected.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'New Store Rejected',
                'email_body'     => 'Store Rejected successfully',
                'sms_content'    => 'Store Rejected successfully',
                'system_message' => 'New Store Rejected',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            'store_suspended'           => [
                'name'           => 'Store suspended',
                'desc'           => 'Notify stores when their store has been suspended.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Store suspended',
                'email_body'     => 'Your store [store_name] has been suspended by the admin.',
                'sms_content'    => 'Store [store_name] has been suspended.',
                'system_message' => 'Store suspended: [store_name].',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            'store_reactivated'         => [
                'name'           => 'Store reactivated',
                'desc'           => 'Notify stores when their store is reactivated by admin.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Store reactivated',
                'email_body'     => 'Your store [store_name] has been reactivated.',
                'sms_content'    => 'Your store [store_name] is active again.',
                'system_message' => 'Store [store_name] reactivated.',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            'store_profile_updated'     => [
                'name'           => 'Store profile updated',
                'desc'           => 'Notify admin when a store updates its profile information.',
                'admin_enabled'  => true,
                'email_subject'  => 'Store profile updated',
                'email_body'     => 'Store [store_name] has updated its profile information.',
                'sms_content'    => 'Store [store_name] updated profile.',
                'system_message' => 'Store [store_name] updated profile.',
                'tag'            => 'Store',
                'category'       => 'activity',
            ],

            // ========== ORDER EVENTS ==========
            'new_order'                 => [
                'name'             => 'New order placed',
                'desc'             => 'Notify stores and customers when a new order is placed.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New order received',
                'email_body'       => 'A new order [order_id] has been placed.',
                'sms_content'      => 'New order [order_id] received.',
                'system_message'   => 'Order [order_id] placed successfully.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            'order_processing'          => [
                'name'             => 'Order processing',
                'desc'             => 'Notify customer when order status changes to processing.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order processing started',
                'email_body'       => 'Your order [order_id] is now being processed.',
                'sms_content'      => 'Order [order_id] is now processing.',
                'system_message'   => 'Order [order_id] status: Processing.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            'order_refunded'            => [
                'name'             => 'Order refunded',
                'desc'             => 'Notify customer and store when an order is refunded.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order refunded',
                'email_body'       => 'Your refund for order [order_id] has been processed.',
                'sms_content'      => 'Refund for [order_id] processed.',
                'system_message'   => 'Order [order_id] refunded.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ],

            // ========== PAYMENT ==========
            'payout_released'           => [
                'name'           => 'Store payout released',
                'desc'           => 'Notify stores that their payout is released.',
                'store_enabled'  => true,
                'email_subject'  => 'Payout released',
                'email_body'     => 'A payout of [amount] has been released to your account.',
                'sms_content'    => 'Payout of [amount] released.',
                'system_message' => 'Payout released: [amount].',
                'tag'            => 'Payment',
                'category'       => 'activity',
            ],

            // ========== REFUND ==========
            'refund_requested'          => [
                'name'             => 'Customer refund request submitted',
                'desc'             => 'Notify admin, store, and customer when a refund is requested.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund requested',
                'email_body'       => 'A refund request has been placed for order [order_id].',
                'sms_content'      => 'Refund requested for [order_id].',
                'system_message'   => 'Refund request submitted for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ],

            'refund_approved'           => [
                'name'             => 'Refund request is approved',
                'desc'             => 'Notify customer and store when a refund is approved by admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund approved',
                'email_body'       => 'Your refund for order [order_id] has been approved.',
                'sms_content'      => 'Refund approved for [order_id].',
                'system_message'   => 'Refund approved for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ],

            'refund_rejected'           => [
                'name'             => 'Refund request is rejected',
                'desc'             => 'Notify customer when their refund request is rejected.',
                'customer_enabled' => true,
                'email_subject'    => 'Refund rejected',
                'email_body'       => 'Your refund request for order [order_id] has been rejected.',
                'sms_content'      => 'Refund request rejected for [order_id].',
                'system_message'   => 'Refund rejected for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ],
            // ========== PRODUCT ==========
            'product_added'             => [
                'name'           => 'New product added by store',
                'desc'           => 'Notify admin when a new product is added by a store.',
                'admin_enabled'  => true,
                'email_subject'  => 'New product added',
                'email_body'     => 'New product “[product_name]” added by [store_name].',
                'sms_content'    => 'New product “[product_name]” added by [store_name].',
                'system_message' => 'Product “[product_name]” added successfully.',
                'tag'            => 'Product',
                'category'       => 'activity',
            ],

            'product_approved'          => [
                'name'           => 'Admin reviews and approves a product',
                'desc'           => 'Notify store when a product is approved.',
                'store_enabled'  => true,
                'email_subject'  => 'Product approved',
                'email_body'     => 'Your product “[product_name]” has been approved.',
                'sms_content'    => 'Product “[product_name]” approved.',
                'system_message' => 'Product “[product_name]” approved successfully.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            'product_rejected'          => [
                'name'           => 'Admin reviews and rejects a product',
                'desc'           => 'Notify store when a product is rejected.',
                'store_enabled'  => true,
                'email_subject'  => 'Product rejected',
                'email_body'     => 'Your product “[product_name]” was rejected. Reason: [reason].',
                'sms_content'    => 'Product “[product_name]” rejected.',
                'system_message' => 'Product “[product_name]” rejected.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            'product_low_stock'         => [
                'name'           => 'Product stock level drops below the minimum threshold',
                'desc'           => 'Notify store when a product stock falls below threshold.',
                'store_enabled'  => true,
                'email_subject'  => 'Low stock alert',
                'email_body'     => 'Your product “[product_name]” is running low on stock (only [quantity] left).',
                'sms_content'    => 'Low stock alert: “[product_name]” – [quantity] left.',
                'system_message' => 'Low stock alert for “[product_name]”.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            'product_out_of_stock'      => [
                'name'           => 'Product out of stock alert',
                'desc'           => 'Notify store when a product goes out of stock.',
                'store_enabled'  => true,
                'email_subject'  => 'Out of stock',
                'email_body'     => 'Your product “[product_name]” is now out of stock.',
                'sms_content'    => 'Out of stock: “[product_name]”.',
                'system_message' => 'Product “[product_name]” is out of stock.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ],

            // ========== REVIEWS ==========
            'product_review_received'   => [
                'name'             => 'New product review submitted',
                'desc'             => 'Notify store when a new product review is submitted by a customer.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'admin_enabled'  => true,
                'email_subject'    => 'New product review received',
                'email_body'       => '[rating]-star review received for “[product_name]” by [customer_name].',
                'sms_content'      => 'New review received for “[product_name]”.',
                'system_message'   => 'New review received for “[product_name]”.',
                'tag'            => 'Review',
                'category'       => 'notification',
            ],

            // 'review_flagged'            => [
            //     'name'           => 'Abuse report submitted for product',
            //     'desc'           => 'Notify admin when a customer flags a review.',
            //     'admin_enabled'  => true,
            //     'email_subject'  => 'Review flagged',
            //     'email_body'     => 'A review for “[product_name]” has been flagged for moderation.',
            //     'sms_content'    => 'Review flagged for “[product_name]”.',
            //     'system_message' => 'Review flagged for “[product_name]”.',
            //     'tag'            => 'Review',
            //     'category'       => 'notification',
            // ],

            // ========== WITHDRAWALS ==========
            'withdrawal_requested'      => [
                'name'           => 'Withdrawal requested',
                'desc'           => 'Notify admin when a store requests withdrawal.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'Withdrawal request submitted',
                'email_body'     => 'Store [store_name] requested withdrawal of [amount].',
                'sms_content'    => 'Withdrawal request of [amount] submitted.',
                'system_message' => 'Withdrawal requested by [store_name].',
                'tag'            => 'Payment',
                'category'       => 'notification',
            ],
            // ========== REPORT ABUSE ==========
            'report_abuse_submitted'    => [
                'name'             => 'Abuse report submitted for product',
                'desc'             => 'Notify admin and store when a customer reports a product.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Product reported',
                'email_body'       => 'Customer reported “[product_name]” for abuse.',
                'sms_content'      => 'Product “[product_name]” reported.',
                'system_message'   => 'Abuse report for “[product_name]” received.',
                'tag'              => 'Report',
                'category'         => 'notification',
            ],

            'report_abuse_action_taken' => [
                'name'             => 'Product review moderated by admin',
                'desc'             => 'Notify store and customer when admin takes action on a report.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Report resolved',
                'email_body'       => 'Admin reviewed the abuse report for “[product_name]”. Action: [action_taken].',
                'sms_content'      => 'Abuse report reviewed for “[product_name]”.',
                'system_message'   => 'Abuse report resolved for “[product_name]”.',
                'tag'              => 'Report',
                'category'         => 'notification',
            ],

            // ========== ANNOUNCEMENTS ==========
            'system_announcement'       => [
                'name'             => 'Announcement published',
                'desc'             => 'Notify stores and customers of a new admin announcement.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New announcement',
                'email_body'       => '[announcement_message]',
                'sms_content'      => '[announcement_message]',
                'system_message'   => 'New announcement: [announcement_message]',
                'tag'              => 'System',
                'category'         => 'notification',
            ],
            'policy_update'             => [
                'name'             => 'Store policy update',
                'desc'             => 'Notify users when marketplace policy changes.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Policy update',
                'email_body'       => 'Marketplace policy updated. Please review the new terms.',
                'sms_content'      => 'Policy updated. Check marketplace terms.',
                'system_message'   => 'Marketplace policy updated.',
                'tag'              => 'System',
                'category'         => 'notification',
            ],
            'commission_credit'         => [
                'name'           => 'Commission Credited',
                'desc'           => 'Notify stores when commission is credited for an order.',
                'store_enabled'  => true,
                'email_subject'  => 'Commission Credited',
                'email_body'     => 'Commission received for order #{order_id}.',
                'sms_content'    => 'Commission credited for order #{order_id}.',
                'system_message' => 'Commission received for order #{order_id}.',
                'tag'            => 'Commission',
                'category'       => 'notification',
            ],

            'adjustment_credit'         => [
                'name'           => 'Adjustment Credit',
                'desc'           => 'Notify stores when admin gives adjustment credit.',
                'store_enabled'  => true,
                'email_subject'  => 'Adjustment Credit',
                'email_body'     => 'Admin adjustment credit of {amount} {currency}.',
                'sms_content'    => 'Credit of {amount} {currency} applied.',
                'system_message' => 'Adjustment credit: {amount} {currency}.',
                'tag'            => 'Finance',
                'category'       => 'notification',
            ],

            'adjustment_debit'          => [
                'name'           => 'Adjustment Debit',
                'desc'           => 'Notify stores when admin debits adjustment.',
                'store_enabled'  => true,
                'email_subject'  => 'Adjustment Debit',
                'email_body'     => 'Admin adjustment debit of {amount} {currency}.',
                'sms_content'    => 'Debit of {amount} {currency} applied.',
                'system_message' => 'Adjustment debit: {amount} {currency}.',
                'tag'            => 'Finance',
                'category'       => 'notification',
            ],

            'order_new'                 => [
                'name'           => 'New Order Received',
                'desc'           => 'Notify stores when a new order is received.',
                'store_enabled'  => true,
                'email_subject'  => 'New Order Received',
                'email_body'     => 'New order #{order_id} received.',
                'sms_content'    => 'New order #{order_id} received.',
                'system_message' => 'Order #{order_id} received.',
                'tag'            => 'Order',
                'category'       => 'notification',
            ],

            'order_ready_to_ship'       => [
                'name'           => 'Order Ready to Ship',
                'desc'           => 'Notify stores when an order is ready to ship.',
                'store_enabled'  => true,
                'email_subject'  => 'Order Ready to Ship',
                'email_body'     => 'Order #{order_id} is ready to ship.',
                'sms_content'    => 'Order #{order_id} ready to ship.',
                'system_message' => 'Order #{order_id} ready to ship.',
                'tag'            => 'Order',
                'category'       => 'notification',
            ],

            'order_delivered'           => [
                'name'             => 'Order Delivered',
                'desc'             => 'Notify customers when their order is delivered.',
                'customer_enabled' => true,
                'email_subject'    => 'Order Delivered',
                'email_body'       => 'Order #{order_id} has been delivered.',
                'sms_content'      => 'Order #{order_id} delivered.',
                'system_message'   => 'Order #{order_id} delivered.',
                'tag'              => 'Order',
                'category'         => 'notification',
            ],

            'order_return_requested'    => [
                'name'             => 'Return Requested',
                'desc'             => 'Notify stores and customers when a return is requested.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Return Requested',
                'email_body'       => 'Return request received for order #{order_id}.',
                'sms_content'      => 'Return request for order #{order_id}.',
                'system_message'   => 'Return request received for order #{order_id}.',
                'tag'              => 'Refund',
                'category'         => 'notification',
            ],

            'system_announcement'       => [
                'name'           => 'System Announcement',
                'desc'           => 'Notify stores about system-wide announcements.',
                'store_enabled'  => true,
                'email_subject'  => 'System Announcement',
                'email_body'     => '{announcement_message}',
                'sms_content'    => 'New system announcement available.',
                'system_message' => '{announcement_message}',
                'tag'            => 'System',
                'category'       => 'notification',
            ],

            'system_maintenance'        => [
                'name'             => 'System Maintenance',
                'desc'             => 'Notify stores and customers about scheduled maintenance.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'System Maintenance Scheduled',
                'email_body'       => 'Scheduled system maintenance on {date_time}.',
                'sms_content'      => 'Maintenance on {date_time}.',
                'system_message'   => 'System maintenance scheduled on {date_time}.',
                'tag'              => 'System',
                'category'         => 'notification',
            ],

            'policy_update'             => [
                'name'             => 'Policy Update',
                'desc'             => 'Notify stores and customers when marketplace policy is updated.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Policy Update',
                'email_body'       => 'Marketplace policy has been updated. Please review the new terms.',
                'sms_content'      => 'Policy update: Review new terms.',
                'system_message'   => 'Marketplace policy updated.',
                'tag'              => 'System',
                'category'         => 'notification',
            ],
        ]

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
                    'admin_enabled'    => $event['admin_enabled'] ?? false,
                    'customer_enabled' => $event['customer_enabled'] ?? false,
                    'store_enabled'    => $event['store_enabled'] ?? false,
                    'system_enabled'   => true,
                    'system_action'    => $key,
                    'email_subject'    => $event['email_subject'] ?? '',
                    'email_body'       => $event['email_body'] ?? '',
                    'sms_content'      => $event['sms_content'] ?? '',
                    'system_message'   => $event['system_message'] ?? '',
                    'status'           => 'active',
                    'custom_emails'    => wp_json_encode([]), // empty array
                    'tag'              => $event['tag'] ?? '',
                    'category'         => $event['category'] ?? '',
                ],
                [
                    '%s',
                    '%s',
                    '%d',
                    '%d',
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                ]
            );

        }

    }

    public function trigger_notifications($action_name, $parameters)
    {
        global $wpdb;
        $event = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM `" . $wpdb->prefix . Utill::TABLES['system_events'] . "` WHERE system_action = %s", $action_name)
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

    public function send_notifications($event, $parameters)
    {

        global $wpdb;

        $wpdb->insert(
            "{$wpdb->prefix}" . Utill::TABLES['notifications'],
            [
                'store_id' => $parameters['store_id'] ?? null,
                'category' => $parameters['category'],
                'type'     => $event->system_action,
                'title'    => $event->event_name,
                'message'  => $event->description,
            ],
            [
                '%d',
                '%s',
                '%s',
                '%s',
                '%s',
            ]
        );

    }

    public function get_all_events($id = null)
    {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['system_events'];

        $events = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table"));

        if (! empty($id)) {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE id = %d",
                    $id
                )
            );
        } else {
            $events = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table"));
        }

        return $events;
    }


    public function get_all_notifications($store_id = null, $args = [])
    {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        if (! empty($store_id)) {
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

        if (!empty($args)) {
            $where = [];
    
            if ( isset( $args['ID'] ) ) {
                $ids     = is_array( $args['ID'] ) ? $args['ID'] : [ $args['ID'] ];
                $ids     = implode( ',', array_map( 'intval', $ids ) );
                $where[] = "ID IN ($ids)";
            }
        
            if ( isset( $args['category'] ) ) {
                $where[] = "category = '" . esc_sql( $args['category'] ) . "'";
            }

            if ( isset( $args['store_id'] ) ) {
                $where[] = "store_id = '" . esc_sql( $args['store_id'] ) . "'";
            }   
        
            if ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) {
                $where[] = "create_time BETWEEN '" . esc_sql( $args['start_date'] ) . "' AND '" . esc_sql( $args['end_date'] ) . "'";
            }
        
            $table = $wpdb->prefix . Utill::TABLES['notifications'];
        
            if ( isset( $args['count'] ) ) {
                $query = "SELECT COUNT(*) FROM {$table}";
            } else {
                $query = "SELECT * FROM {$table}";
            }
        
            if ( ! empty( $where ) ) {
                $condition = $args['condition'] ?? ' AND ';
                $query    .= ' WHERE ' . implode( $condition, $where );
            }
        
            //Keep your pagination logic
            if ( isset( $args['limit'] ) && isset( $args['offset'] ) && empty( $args['count'] ) ) {
                $limit  = intval( $args['limit'] );
                $offset = intval( $args['offset'] );
                $query .= " LIMIT $limit OFFSET $offset";
            }
        
            if ( isset( $args['count'] ) ) {
                $results = $wpdb->get_var( $query );
                return $results ?? 0;
            } else {
                $results = $wpdb->get_results( $query, ARRAY_A );
                return $results ?? [];
            }
        }
    
        return $events;
    }

    public function multivendorx_clear_notifications()
    {
        global $wpdb;

        $days = MultiVendorX()->setting->get_setting('clear_notifications');

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

        $wpdb->query($query);

    }

}