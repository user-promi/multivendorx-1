<?php

namespace MultiVendorX\RestAPI\Controllers;

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

        // register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
        //     [
        //         'methods'             => \WP_REST_Server::READABLE,
        //         'callback'            => [$this, 'get_item'],
        //         'permission_callback' => [$this, 'get_items_permissions_check'],
        //         'args'                => [
        //             'id' => ['required' => true],
        //         ],
        //     ],
        //     [
        //         'methods'             => \WP_REST_Server::EDITABLE,
        //         'callback'            => [$this, 'update_item'],
        //         'permission_callback' => [$this, 'update_item_permissions_check'],
        //     ],
        // ]);
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

        $results = MultiVendorX()->notifications->get_all_events();

        $formated_notifications = [];

        foreach ($results as $row) {

            $custom_emails = !empty($row->custom_emails)
                ? json_decode($row->custom_emails, true)
                : [];

            // Build recipients array
            $recipients = [];
            $id = 1;

            if (!empty($row->store_enabled)) {
                $recipients[] = [
                    'id' => $id++,
                    'type' => 'Vendor',
                    'label' => 'Vendor',
                    'enabled' => (bool) $row->store_enabled,
                    'canDelete' => false,
                ];
            }

            if (!empty($row->admin_enabled)) {
                $recipients[] = [
                    'id' => $id++,
                    'type' => 'Admin',
                    'label' => 'Admin',
                    'enabled' => (bool) $row->admin_enabled,
                    'canDelete' => false,
                ];
            }

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
}