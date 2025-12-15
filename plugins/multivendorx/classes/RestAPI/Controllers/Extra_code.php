<?php

register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/social-profiles',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_social_profiles' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/connect-social',
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'connect_social_profile' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/disconnect-social',
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'disconnect_social_profile' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/social-callback',
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'handle_social_callback' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

    /**
     * Handle social verification callback
     *
     * @param object $request Request data.
     */
    public function handle_social_callback( $request ) {
        try {
            $params   = $request->get_params();
            $provider = sanitize_text_field( $params['provider'] ?? '' );
            $code     = sanitize_text_field( $params['code'] ?? '' );
            $state    = sanitize_text_field( $params['state'] ?? '' );

            if ( empty( $provider ) || empty( $code ) ) {
                return new \WP_Error( 'invalid_params', __( 'Missing required parameters', 'multivendorx' ), array( 'status' => 400 ) );
            }

            $user_id = get_current_user_id();
            if ( ! $user_id ) {
                return new \WP_Error( 'unauthorized', __( 'You must be logged in', 'multivendorx' ), array( 'status' => 401 ) );
            }

            $social_verification = $this->get_social_verification();
            $user_data           = $social_verification->process_oauth_callback( $provider, $code, $params );

            if ( $user_data ) {
                $social_verification->save_social_connection( $user_id, $provider, $user_data );

                return rest_ensure_response(
                    array(
						'success' => true,
						'message' => ucfirst( $provider ) . ' account connected successfully!',
						'data'    => $user_data,
                    )
                );
            } else {
                return new \WP_Error( 'verification_failed', __( 'Failed to verify social account', 'multivendorx' ), array( 'status' => 400 ) );
            }
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to process social verification', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get social verification instance
     */
    function get_social_verification() {
        static $instance = null;

        return $instance;
    }

    /**
     * Get social profiles
     *
     * @param object $request Request data.
     */
    public function get_social_profiles( $request ) {
        try {
            $user_id             = get_current_user_id();
            $social_verification = $this->get_social_verification();
            $profiles            = $social_verification->get_social_profiles( $user_id );

            return rest_ensure_response(
                array(
					'success' => true,
					'data'    => $profiles,
                )
            );
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to fetch social profiles', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Connect social profile
     *
     * @param object $request Request data.
     */
    public function connect_social_profile( $request ) {
        try {
            $params   = $request->get_json_params();
            $provider = sanitize_text_field( $params['provider'] ?? '' );

            if ( empty( $provider ) ) {
                return new \WP_Error( 'missing_provider', __( 'Provider is required', 'multivendorx' ), array( 'status' => 400 ) );
            }

            $social_verification = $this->get_social_verification();
            $auth_url            = $social_verification->get_auth_url( $provider );

            if ( ! $auth_url ) {
                return new \WP_Error( 'invalid_provider', __( 'Invalid provider or provider not configured', 'multivendorx' ), array( 'status' => 400 ) );
            }

            return rest_ensure_response(
                array(
					'success' => true,
					'data'    => array(
						'redirect_url' => $auth_url,
					),
                )
            );
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to connect social profile', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Disconnect social profile
     *
     * @param object $request Request data.
     */
    public function disconnect_social_profile( $request ) {
        try {
            $params   = $request->get_json_params();
            $provider = sanitize_text_field( $params['provider'] ?? '' );

            if ( empty( $provider ) ) {
                return new \WP_Error( 'missing_provider', __( 'Provider is required', 'multivendorx' ), array( 'status' => 400 ) );
            }

            $user_id             = get_current_user_id();
            $social_verification = $this->get_social_verification();
            $success             = $social_verification->disconnect_social_profile( $user_id, $provider );

            if ( $success ) {
                return rest_ensure_response(
                    array(
						'success' => true,
						'message' => __( 'Social profile disconnected successfully', 'multivendorx' ),
                    )
                );
            } else {
                return new \WP_Error( 'disconnect_failed', __( 'Failed to disconnect social profile', 'multivendorx' ), array( 'status' => 400 ) );
            }
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to disconnect social profile', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
