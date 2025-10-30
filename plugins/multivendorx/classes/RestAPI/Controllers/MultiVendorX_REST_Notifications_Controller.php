<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Notifications_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'notifications';

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
            // [
            //     'methods'             => \WP_REST_Server::CREATABLE,
            //     'callback'            => [ $this, 'create_item' ],
            //     'permission_callback' => [ $this, 'create_item_permissions_check' ],
            // ],
        ] );

        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
            ],
        ]);
    }

    public function get_items_permissions_check($request) {
        return true;
    }

    public function create_item_permissions_check($request) {
        return true;
    }

    public function update_item_permissions_check($request) {
        return true;
    }

    public function get_items($request) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
        $header_notifications = $request->get_param('header');

        if ($header_notifications) {
            $store_id = $request->get_param('store_id');
            $results = MultiVendorX()->notifications->get_all_notifications(!empty($store_id) ? $store_id : null);

            $formated_notifications = [];

            foreach ($results as $row) {

                $formated_notifications[] = [
                    'id'          => (int) $row->id,
                    'icon'        => 'adminlib-cart',
                    'title'       => $row->title,
                    'message'     => $row->message,
                    'time'        => $this->time_ago($row->created_at)
                ];
            }

            return rest_ensure_response( $formated_notifications);
        }

        $results = MultiVendorX()->notifications->get_all_events();

        $formated_notifications = [];

        foreach ($results as $row) {

            $custom_emails = !empty($row->custom_emails)
                ? json_decode($row->custom_emails, true)
                : [];

            // Build recipients array
            $recipients = [];
            $id = 1;

            $recipients[] = [
                'id' => $id++,
                'type' => 'Store',
                'label' => 'Store',
                'enabled' => (bool) $row->store_enabled,
                'canDelete' => false,
            ];
        
            $recipients[] = [
                'id' => $id++,
                'type' => 'Admin',
                'label' => 'Admin',
                'enabled' => (bool) $row->admin_enabled,
                'canDelete' => false,
            ];

            // Add any custom emails
            foreach ($custom_emails as $email) {
                $recipients[] = [
                    'id' => $id++,
                    'type' => 'extra',
                    'label' => $email,
                    'enabled' => true,
                    'canDelete' => true,
                ];
            }

            $channels = [
                'mail'   => (bool) $row->email_enabled,
                'sms'    => (bool) $row->sms_enabled,
                'system' => (bool) $row->system_enabled,
            ];

            $formated_notifications[] = [
                'id'          => (int) $row->id,
                'icon'        => 'adminlib-cart',
                'event'       => $row->event_name,
                'description' => $row->description,
                'tag' => $row->tag,
                'category' => $row->category,
                'recipients'  => $recipients,
                'channels'    => $channels,
            ];
        }

        return rest_ensure_response( $formated_notifications);
    }

    public function time_ago($datetime) {
        if (empty($datetime)) return '';

        $timestamp = strtotime($datetime);
        $diff = time() - $timestamp;

        if ($diff < 60) {
            return $diff . ' seconds ago';
        } elseif ($diff < 3600) {
            return floor($diff / 60) . ' minutes ago';
        } elseif ($diff < 86400) {
            return floor($diff / 3600) . ' hours ago';
        } elseif ($diff < 604800) {
            return floor($diff / 86400) . ' days ago';
        } else {
            return date('M j, Y', $timestamp);
        }
    }

    public function update_item($request) {
        global $wpdb;
        $notification_data = $request->get_param('notifications');   

        $is_dismissed = $request->get_param('is_dismissed');
        $id = $request->get_param('id');
        $form_data = $request->get_param('formData');

        if (!empty($form_data)) {

            $data = [
                'email_subject'  => $form_data['email_subject'],
                'email_body'  => $form_data['email_body'],
                'sms_content'  => $form_data['sms_content'],
                'system_message'  => $form_data['system_message'],
            ];

            $updated = $wpdb->update(
                        "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                        $data,
                        ['id' => $form_data['id']],
                        ['%s', '%s', '%s', '%s'],
                        ['%d']
                    );

            return rest_ensure_response([
                'success' => true,
            ]);
        }


        if ($is_dismissed) {
            $data = [
                'is_dismissed'  => $is_dismissed
            ];

            $updated = $wpdb->update(
                        "{$wpdb->prefix}" . Utill::TABLES['notifications'],
                        $data,
                        ['id' => $id],
                        null,
                        ['%s']
                    );

            return rest_ensure_response([
                'success' => true,
            ]);
        }

        if ( empty( $notification_data ) || ! is_array( $notification_data ) ) {
            return new \WP_Error( 'invalid_data', __( 'Invalid notification data', 'multivendorx' ), [ 'status' => 400 ] );
        }

        foreach ( $notification_data as $notification ) {
            $id = intval( $notification['id'] );

            $channels = $notification['channels'] ?? [];
            if (!empty($channels)) {
                $email_enabled   = $channels['mail'] ?? false;
                $sms_enabled     = $channels['sms'] ?? false;
                $system_enabled  = $channels['system'] ?? false;
            }

            $store_enabled = 0;
            $admin_enabled = 0;
            $custom_emails = [];

            if ( ! empty( $notification['recipients'] ) && is_array( $notification['recipients'] ) ) {
                foreach ( $notification['recipients'] as $recipient ) {
                    if ( $recipient['type'] === 'Store' ) {
                        $store_enabled = $recipient['enabled'] ?? false;
                    } elseif ( $recipient['type'] === 'Admin' ) {
                        $admin_enabled = $recipient['enabled'] ?? false;
                    } elseif ( $recipient['type'] === 'extra' ) {
                        $custom_emails[] = sanitize_email( $recipient['label'] );
                    }
                }
            }

            $custom_emails_json = ! empty( $custom_emails ) ? wp_json_encode( $custom_emails ) : null;

            $update_data = [
                'email_enabled'   => $email_enabled,
                'sms_enabled'     => $sms_enabled,
                'system_enabled'  => $system_enabled,
                'store_enabled'   => $store_enabled,
                'admin_enabled'   => $admin_enabled,
                'custom_emails'   => $custom_emails_json,
            ];

            $where = [ 'id' => $id ];

            $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['system_events'], $update_data, $where, null, [ '%d' ] );

        }

        if ($updated) {

            return rest_ensure_response([
                'success' => true,
                'message' => __( 'Notification(s) updated successfully.', 'multivendorx' ),
            ]);
        }
    
    
    }

    public function get_item($request) {
        $id = $request->get_param('id');

        $results = MultiVendorX()->notifications->get_all_events($id);

        return rest_ensure_response($results);

    }
}