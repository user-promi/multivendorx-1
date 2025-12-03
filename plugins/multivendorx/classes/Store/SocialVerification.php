<?php
/**
 * MultiVendorX Social Verification Class.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * MultiVendorX Social Verification.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

class SocialVerification {

    /**
     * Social verification APIs
     */
    private $apis = array();

    /**
     * Constructor
     */
    public function __construct() {
        $this->initialize_apis();
        add_action( 'init', array( $this, 'handle_oauth_callbacks' ) );
    }

    /**
     * Initialize social verification APIs
     */
    private function initialize_apis() {
        $this->apis = array(
            'facebook' => new FacebookVerification(),
            'google'   => new GoogleVerification(),
            'twitter'  => new TwitterVerification(),
            'linkedin' => new LinkedInVerification(),
        );
    }

    /**
     * Get API instance for social provider
     *
     * @param string $provider Social provider.
     */
    public function get_api( $provider ) {
        return isset( $this->apis[ $provider ] ) ? $this->apis[ $provider ] : null;
    }

    /**
     * Get auth URL for social provider
     *
     * @param string $provider Social provider.
     */
    public function get_auth_url( $provider ) {
        $api = $this->get_api( $provider );
        return $api ? $api->get_auth_url() : false;
    }

    /**
     * Process OAuth callback
     *
     * @param string $provider Social provider.
     * @param string $code OAuth code.
     * @param array  $request_data Request data.
     */
    public function process_oauth_callback( $provider, $code, $request_data ) {
        $api = $this->get_api( $provider );
        return $api ? $api->verify_callback( $code, $request_data ) : false;
    }

    /**
     * Get connected social profiles for current vendor
     *
     * @param int $vendor_id Vendor ID.
     */
    public function get_social_profiles( $vendor_id = null ) {
        if ( ! $vendor_id ) {
            $vendor_id = get_current_user_id();
        }
        $connections = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['social_verification'], true ) ?: array();

        return $connections;
    }

    /**
     * Save social connection
     *
     * @param int    $user_id User ID.
     * @param string $provider Social provider.
     * @param array  $user_data User data.
     */
    public function save_social_connection( $user_id, $provider, $user_data ) {
        $connections = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['social_verification'], true ) ?: array();

        $connections[ $provider ] = array(
            'connected_at' => current_time( 'mysql' ),
            'profile_data' => $user_data,
            'is_verified'  => true,
        );

        update_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['social_verification'], $connections );

        // Log the connection.
        $this->log_verification_attempt( $user_id, $provider, 'connected' );

        return true;
    }

    /**
     * Disconnect social profile
     *
     * @param int    $vendor_id Vendor ID.
     * @param string $provider Social provider.
     */
    public function disconnect_social_profile( $vendor_id, $provider ) {
        $connections = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['social_verification'], true ) ?: array();

        if ( isset( $connections[ $provider ] ) ) {
            unset( $connections[ $provider ] );
            update_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['social_verification'], $connections );

            // Log the disconnection.
            $this->log_verification_attempt( $vendor_id, $provider, 'disconnected' );

            return true;
        }

        return false;
    }

    /**
     * Check if social verification is enabled for provider
     *
     * @param string $provider Social provider.
     */
    public function is_social_enabled( $provider ) {
        $settings        = $this->get_social_settings();
        $social_settings = $settings['social-verification']['social_verification_methods'][ $provider . '-connect' ] ?? null;

        return $social_settings && $social_settings['enable'];
    }

    /**
     * Get social settings
     */
    private function get_social_settings() {
        return MultiVendorX()->setting->get_setting( 'all_verification_methods' );
    }

    /**
     * Get redirect URL
     *
     * @param string $status Status of the verification.
     * @param string $provider Social provider.
     * @param string $message Optional message.
     */
    private function get_redirect_url( $status, $provider = '', $message = '' ) {
        // Redirect to the verification settings page in dashboard.
        $redirect_url = home_url( '/?dashboard=1&tab=settings&subtab=verification' );
        $args         = array( 'social_status' => $status );

        if ( $provider ) {
            $args['provider'] = $provider;
        }

        if ( $message ) {
            $args['message'] = urlencode( $message );
        }

        return add_query_arg( $args, $redirect_url );
    }

    /**
     * Handle OAuth callbacks
     */
    public function handle_oauth_callbacks() {
        // Check if this is a social verification callback.
        if ( ! isset( $_GET['social_verification'] ) || ! isset( $_GET['provider'] ) ) {
            return;
        }

        $provider = sanitize_text_field( $_GET['provider'] );

        $this->log( 'OAuth callback received for provider: ' . $provider . ' - GET params: ' . json_encode( $_GET ) );

        // For Twitter, we don't need nonce verification in callback as it comes from external service.
        if ( $provider !== 'twitter' ) {
            if ( ! wp_verify_nonce( $_GET['_wpnonce'] ?? '', 'social_verification_' . $provider ) ) {
                wp_die( 'Security verification failed' );
            }
        }

        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            $this->log( 'User not logged in, storing callback data temporarily' );
            // Store the data in session/temporary storage and redirect to login.
            $temp_key = 'social_verification_pending_' . wp_generate_password( 12, false );
            set_transient(
                $temp_key,
                array(
					'provider'       => $provider,
					'code'           => $_GET['code'] ?? '',
					'state'          => $_GET['state'] ?? '',
					'oauth_token'    => $_GET['oauth_token'] ?? '',
					'oauth_verifier' => $_GET['oauth_verifier'] ?? '',
				),
                15 * MINUTE_IN_SECONDS
            );

            wp_redirect( wp_login_url( add_query_arg( $_GET, home_url( $_SERVER['REQUEST_URI'] ) ) ) );
            exit;
        }

        try {
            $success = false;
            $message = '';

            switch ( $provider ) {
                case 'facebook':
                case 'google':
                case 'linkedin':
                    if ( isset( $_GET['code'] ) ) {
                        $user_data = $this->process_oauth_callback( $provider, $_GET['code'], $_GET );
                        if ( $user_data ) {
                            $this->save_social_connection( $user_id, $provider, $user_data );
                            $success = true;
                            $message = ucfirst( $provider ) . ' account connected successfully!';
                        } else {
                            $message = 'Failed to connect ' . $provider . ' account.';
                        }
                    }
                    break;

                case 'twitter':
                    $this->log( 'Processing Twitter callback' );
                    if ( isset( $_GET['oauth_token'] ) && isset( $_GET['oauth_verifier'] ) ) {
                        $user_data = $this->process_oauth_callback( $provider, $_GET['oauth_token'], $_GET );
                        if ( $user_data ) {
                            $this->save_social_connection( $user_id, $provider, $user_data );
                            $success = true;
                            $message = 'Twitter account connected successfully!';
                            $this->log( "Twitter connection successful for user $user_id" );
                        } else {
                            $message = 'Failed to connect Twitter account.';
                            $this->log( "Twitter connection failed for user $user_id" );
                        }
                    } else {
                        $message = 'Missing Twitter callback parameters.';
                        $this->log( 'Twitter callback missing parameters' );
                    }
                    break;
            }

            // Redirect back to verification page with status.
            $redirect_url = $this->get_redirect_url(
                $success ? 'success' : 'error',
                $provider,
                $message
            );

            $this->log( 'Redirecting to: ' . $redirect_url );
            wp_redirect( $redirect_url );
            exit;
        } catch ( Exception $e ) {
            $this->log( 'Social verification error: ' . $e->getMessage() );

            $redirect_url = $this->get_redirect_url(
                'error',
                $provider,
                'An error occurred during verification.'
            );

            wp_redirect( $redirect_url );
            exit;
        }
    }

    /**
     * Process OAuth callback
     *
     * @param string $provider Social provider.
     */
    private function log( $message ) {
        $log_file  = plugin_dir_path( __FILE__ ) . '/social_verification.log';
        $timestamp = date( 'd/m/Y H:i:s', time() );
        file_put_contents( $log_file, $timestamp . ': ' . $message . "\n", FILE_APPEND );
    }

    /**
     * Log verification activity
     *
     * @param int    $user_id User ID.
     * @param string $provider Social provider.
     * @param string $status Status of the verification.
     */
    private function log_verification_attempt( $user_id, $provider, $status ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vendor_verification_logs';

        $wpdb->insert(
            $table_name,
            array(
                'vendor_id'         => $user_id,
                'verification_type' => 'social_' . $provider,
                'status'            => $status,
                'ip_address'        => $this->get_client_ip(),
                'user_agent'        => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'created_at'        => current_time( 'mysql' ),
            ),
            array( '%d', '%s', '%s', '%s', '%s', '%s' )
        );
    }

    /**
     * Get client IP address
     */
    private function get_client_ip() {
        $ip_keys = array( 'HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR' );

        foreach ( $ip_keys as $key ) {
            if ( ! empty( $_SERVER[ $key ] ) ) {
                $ip = trim( current( explode( ',', $_SERVER[ $key ] ) ) );
                if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }
}

/**
 * MultiVendorX Social Verification.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class FacebookVerification {

    /**
     * App ID
     *
     * @var string
     */
    private $app_id;

    /**
     * App secret
     *
     * @var string
     */
    private $app_secret;

    /**
     * Redirect URI
     *
     * @var string
     */
    private $redirect_uri;

    /**
     * Constructor
     */
    public function __construct() {
        $settings    = MultiVendorX()->setting->get_setting( 'all_verification_methods' );
        $fb_settings = $settings['social-verification']['social_verification_methods']['facebook-connect'] ?? array();

        $this->app_id       = $fb_settings['app_id'] ?? '';
        $this->app_secret   = $fb_settings['app_secret'] ?? '';
        $this->redirect_uri = $fb_settings['redirect_uri'] ?? '';
    }

    /**
     * Check if Facebook verification is configured
     */
    public function get_auth_url() {
        if ( ! $this->is_configured() ) {
            return false;
        }

        $params = array(
            'client_id'     => $this->app_id,
            'redirect_uri'  => $this->redirect_uri,
            'scope'         => 'email,public_profile',
            'state'         => wp_create_nonce( 'social_verification_facebook' ),
            'response_type' => 'code',
        );

        return 'https://www.facebook.com/v17.0/dialog/oauth?' . http_build_query( $params );
    }

    /**
     * Verify callback from Facebook
     *
     * @param string $code Facebook code.
     * @param array  $request_data Request data.
     * @return array|false
     */
    public function verify_callback( $code, $request_data ) {
        if ( ! $this->is_configured() ) {
            return false;
        }

        // Exchange code for access token.
        $token_url = 'https://graph.facebook.com/v17.0/oauth/access_token?' . http_build_query(
            array(
				'client_id'     => $this->app_id,
				'client_secret' => $this->app_secret,
				'redirect_uri'  => $this->redirect_uri,
				'code'          => $code,
            )
        );

        $response = wp_remote_get( $token_url );

        if ( is_wp_error( $response ) ) {
            error_log( 'Facebook token exchange error: ' . $response->get_error_message() );
            return false;
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( isset( $data['access_token'] ) ) {
            // Get user profile.
            $profile_url = 'https://graph.facebook.com/v17.0/me?' . http_build_query(
                array(
					'access_token' => $data['access_token'],
					'fields'       => 'id,name,email,first_name,last_name,picture',
                )
            );

            $profile_response = wp_remote_get( $profile_url );

            if ( is_wp_error( $profile_response ) ) {
                error_log( 'Facebook profile fetch error: ' . $profile_response->get_error_message() );
                return false;
            }

            $profile_data = json_decode( wp_remote_retrieve_body( $profile_response ), true );

            if ( isset( $profile_data['id'] ) ) {
                return array(
                    'social_id'       => $profile_data['id'],
                    'name'            => $profile_data['name'] ?? '',
                    'first_name'      => $profile_data['first_name'] ?? '',
                    'last_name'       => $profile_data['last_name'] ?? '',
                    'email'           => $profile_data['email'] ?? '',
                    'profile_picture' => $profile_data['picture']['data']['url'] ?? '',
                    'profile_url'     => 'https://facebook.com/' . $profile_data['id'],
                );
            }
        }

        error_log( 'Facebook verification failed: ' . wp_remote_retrieve_body( $response ) );
        return false;
    }

    /**
     * Check if Facebook verification is properly configured.
     */
    private function is_configured() {
        return ! empty( $this->app_id ) && ! empty( $this->app_secret );
    }
}

/**
 * MultiVendorX Google Verification Class.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class GoogleVerification {

    /**
     * Client ID
     *
     * @var string
     */
    private $client_id;

    /**
     * Client secret
     *
     * @var string
     */
    private $client_secret;

    /**
     * Redirect URI
     *
     * @var string
     */
    private $redirect_uri;

    /**
     * Constructor
     */
    public function __construct() {
        $settings        = MultiVendorX()->setting->get_setting( 'all_verification_methods' );
        $google_settings = $settings['social-verification']['social_verification_methods']['google-connect'] ?? array();

        $this->client_id     = $google_settings['client_id'] ?? '';
        $this->client_secret = $google_settings['client_secret'] ?? '';

        $this->redirect_uri = $google_settings['redirect_uri'] ?? '';
    }

    /**
     * Get authentication URL
     *
     * @return string|false
     */
    public function get_auth_url() {
        if ( ! $this->is_configured() ) {
            return false;
        }

        $callback_url = home_url( '/?social_verification=1&provider=google' );
        $nonce        = wp_create_nonce( 'social_verification_google' );

        $params = array(
            'client_id'     => $this->client_id,
            'redirect_uri'  => $callback_url,
            'scope'         => 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            'state'         => $nonce,
            'response_type' => 'code',
            'access_type'   => 'online',
            'prompt'        => 'consent',
        );

        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query( $params );
    }

    /**
     * Verify callback
     *
     * @param string $code Code from Google.
     * @param array  $request_data Request data.
     * @return array|false
     */
    public function verify_callback( $code, $request_data ) {
        if ( ! $this->is_configured() ) {
            return false;
        }

        // Exchange code for access token.
        $token_response = wp_remote_post(
            'https://oauth2.googleapis.com/token',
            array(
				'body' => array(
					'client_id'     => $this->client_id,
					'client_secret' => $this->client_secret,
					'code'          => $code,
					'grant_type'    => 'authorization_code',
					'redirect_uri'  => $this->redirect_uri,
				),
			)
        );

        if ( is_wp_error( $token_response ) ) {
            error_log( 'Google token exchange error: ' . $token_response->get_error_message() );
            return false;
        }

        $token_data = json_decode( wp_remote_retrieve_body( $token_response ), true );

        if ( isset( $token_data['access_token'] ) ) {
            // Get user profile.
            $profile_response = wp_remote_get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                array(
					'headers' => array(
						'Authorization' => 'Bearer ' . $token_data['access_token'],
					),
				)
            );

            if ( is_wp_error( $profile_response ) ) {
                error_log( 'Google profile fetch error: ' . $profile_response->get_error_message() );
                return false;
            }

            $profile_data = json_decode( wp_remote_retrieve_body( $profile_response ), true );

            if ( isset( $profile_data['id'] ) ) {
                return array(
                    'social_id'       => $profile_data['id'],
                    'name'            => $profile_data['name'] ?? '',
                    'given_name'      => $profile_data['given_name'] ?? '',
                    'family_name'     => $profile_data['family_name'] ?? '',
                    'email'           => $profile_data['email'] ?? '',
                    'profile_picture' => $profile_data['picture'] ?? '',
                    'locale'          => $profile_data['locale'] ?? '',
                    'verified_email'  => $profile_data['verified_email'] ?? false,
                );
            }
        }

        error_log( 'Google verification failed: ' . wp_remote_retrieve_body( $token_response ) );
        return false;
    }

    /**
     * Check if the Google verification is properly configured.
     *
     * @return bool True if configured, false otherwise.
     */
    private function is_configured() {
        return ! empty( $this->client_id ) && ! empty( $this->client_secret );
    }
}

/**
 * MultiVendorX Twitter Verification Class.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class TwitterVerification {

    /**
     * The API key for Twitter.
     *
     * @var string
     */
    private $api_key;

    /**
     * The API secret key for Twitter.
     *
     * @var string
     */
    private $api_secret_key;

    /**
     * The redirect URI for Twitter callback.
     *
     * @var string
     */
    private $redirect_uri;

    /**
     * Initialize TwitterVerification.
     */
    public function __construct() {
        $settings         = MultiVendorX()->setting->get_setting( 'all_verification_methods' );
        $twitter_settings = $settings['social-verification']['social_verification_methods']['twitter-connect'] ?? array();

        $this->api_key        = $twitter_settings['api_key'] ?? '';
        $this->api_secret_key = $twitter_settings['api_secret_key'] ?? '';

        // Set proper redirect URI for callback.
        $this->redirect_uri = $twitter_settings['redirect_uri'] ?? '';

        // Log configuration status.
        $this->log( 'Twitter Verification initialized - API Key: ' . ( ! empty( $this->api_key ) ? 'Set' : 'Missing' ) );
    }

    /**
     * Get the authentication URL for Twitter.
     *
     * @return string|false The authentication URL or false on failure.
     */
    public function get_auth_url() {
        if ( ! $this->is_configured() ) {
            $this->log( 'Twitter not configured properly' );
            return false;
        }

        $temp_credentials = $this->get_request_token();

        if ( $temp_credentials && isset( $temp_credentials['oauth_token'] ) ) {
            // Store the token secret for later use.
            set_transient(
                'twitter_oauth_token_secret_' . $temp_credentials['oauth_token'],
                $temp_credentials['oauth_token_secret'],
                15 * MINUTE_IN_SECONDS
            );

            $auth_url = 'https://api.twitter.com/oauth/authenticate?oauth_token=' . $temp_credentials['oauth_token'];
            $this->log( 'Twitter auth URL generated: ' . $auth_url );
            return $auth_url;
        }

        $this->log( 'Failed to get Twitter request token' );
        return false;
    }

    /**
     * Get request token from Twitter.
     *
     * @return array|false The request token data or false on failure.
     */
    private function get_request_token() {
        $url = 'https://api.twitter.com/oauth/request_token';

        $params = array(
            'oauth_callback' => $this->redirect_uri,
        );

        $headers = array(
            'Authorization' => $this->build_oauth_header( $params, $url, 'POST' ),
        );

        $this->log( 'Requesting Twitter token with callback: ' . $this->redirect_uri );

        $response = wp_remote_post(
            $url,
            array(
				'headers' => $headers,
				'timeout' => 30,
			)
        );

        if ( is_wp_error( $response ) ) {
            $this->log( 'Twitter request token error: ' . $response->get_error_message() );
            return false;
        }

        $body   = wp_remote_retrieve_body( $response );
        $status = wp_remote_retrieve_response_code( $response );

        $this->log( "Twitter request token response - Status: $status, Body: $body" );

        if ( $status === 200 ) {
            parse_str( $body, $credentials );
            return $credentials;
        }

        return false;
    }

    /**
     * Verify callback from Twitter.
     *
     * @param string $oauth_token The OAuth token.
     * @param array  $request_data The request data.
     *
     * @return array|false The user profile data or false on failure.
     */
    public function verify_callback( $oauth_token, $request_data ) {
        if ( ! $this->is_configured() ) {
            $this->log( 'Twitter not configured in callback' );
            return false;
        }

        $oauth_verifier = $request_data['oauth_verifier'] ?? '';

        $this->log( "Twitter callback received - Token: $oauth_token, Verifier: $oauth_verifier" );

        if ( ! $oauth_token || ! $oauth_verifier ) {
            $this->log( 'Missing Twitter callback parameters' );
            return false;
        }

        // Retrieve the token secret we stored earlier.
        $oauth_token_secret = get_transient( 'twitter_oauth_token_secret_' . $oauth_token );
        delete_transient( 'twitter_oauth_token_secret_' . $oauth_token );

        if ( ! $oauth_token_secret ) {
            $this->log( "No token secret found for token: $oauth_token" );
            return false;
        }

        // Exchange for access token.
        $access_token = $this->get_access_token( $oauth_token, $oauth_token_secret, $oauth_verifier );

        if ( $access_token && isset( $access_token['user_id'] ) ) {
            $this->log( 'Twitter access token successful for user: ' . $access_token['user_id'] );

            // Get user profile information.
            $user_profile = $this->get_user_profile( $access_token );

            return array(
                'social_id'           => $access_token['user_id'],
                'screen_name'         => $access_token['screen_name'] ?? '',
                'name'                => $user_profile['name'] ?? $access_token['screen_name'] ?? '',
                'profile_url'         => 'https://twitter.com/' . ( $access_token['screen_name'] ?? '' ),
                'access_token'        => $access_token['oauth_token'] ?? '',
                'access_token_secret' => $access_token['oauth_token_secret'] ?? '',
            );
        }

        $this->log( 'Twitter access token exchange failed' );
        return false;
    }

    /**
     * Exchange temporary credentials for access token.
     *
     * @param string $oauth_token        The temporary OAuth token.
     * @param string $oauth_token_secret The temporary OAuth token secret.
     * @param string $oauth_verifier     The OAuth verifier.
     *
     * @return array|false The access token data or false on failure.
     */
    private function get_access_token( $oauth_token, $oauth_token_secret, $oauth_verifier ) {
        $url = 'https://api.twitter.com/oauth/access_token';

        $params = array(
            'oauth_token'    => $oauth_token,
            'oauth_verifier' => $oauth_verifier,
        );

        $headers = array(
            'Authorization' => $this->build_oauth_header( $params, $url, 'POST', $oauth_token_secret ),
        );

        $this->log( 'Exchanging for access token' );

        $response = wp_remote_post(
            $url,
            array(
				'headers' => $headers,
				'timeout' => 30,
			)
        );

        if ( is_wp_error( $response ) ) {
            $this->log( 'Twitter access token error: ' . $response->get_error_message() );
            return false;
        }

        $body   = wp_remote_retrieve_body( $response );
        $status = wp_remote_retrieve_response_code( $response );

        $this->log( "Twitter access token response - Status: $status, Body: $body" );

        if ( $status === 200 ) {
            parse_str( $body, $access_token );
            return $access_token;
        }

        return false;
    }

    /**
     * Get user profile information from Twitter.
     *
     * @param array $access_token The access token data.
     *
     * @return array The user profile data.
     */
    private function get_user_profile( $access_token ) {
        $url = 'https://api.twitter.com/1.1/account/verify_credentials.json';

        $headers = array(
            'Authorization' => $this->build_oauth_header(
                array(),
                $url,
                'GET',
                $access_token['oauth_token_secret'] ?? '',
                $access_token['oauth_token'] ?? ''
            ),
        );

        $response = wp_remote_get(
            $url,
            array(
				'headers' => $headers,
				'timeout' => 30,
			)
        );

        if ( ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) === 200 ) {
            return json_decode( wp_remote_retrieve_body( $response ), true );
        }

        return array();
    }

    /**
     * Build OAuth header for Twitter API requests.
     *
     * @param array  $params       Additional parameters for the request.
     * @param string $url          The request URL.
     * @param string $method       The request method (default: 'POST').
     * @param string $token_secret The token secret (default: '').
     * @param string $oauth_token  The OAuth token (default: '').
     *
     * @return string The OAuth header.
     */
    private function build_oauth_header( $params, $url, $method = 'POST', $token_secret = '', $oauth_token = '' ) {
        $defaults = array(
            'oauth_consumer_key'     => $this->api_key,
            'oauth_nonce'            => wp_generate_password( 32, false ),
            'oauth_signature_method' => 'HMAC-SHA1',
            'oauth_timestamp'        => time(),
            'oauth_version'          => '1.0',
        );

        if ( $oauth_token ) {
            $defaults['oauth_token'] = $oauth_token;
        }

        $params = array_merge( $defaults, $params );

        // Create signature base string.
        $base_string = $method . '&' . rawurlencode( $url ) . '&';
        $base_params = array();

        foreach ( $params as $key => $value ) {
            $base_params[ rawurlencode( $key ) ] = rawurlencode( $value );
        }

        ksort( $base_params );
        $base_string .= rawurlencode( $this->build_http_query( $base_params ) );

        // Create signing key.
        $signing_key = rawurlencode( $this->api_secret_key ) . '&' . rawurlencode( $token_secret );

        // Generate signature.
        $signature                 = base64_encode( hash_hmac( 'sha1', $base_string, $signing_key, true ) );
        $params['oauth_signature'] = $signature;

        // Build header.
        ksort( $params );
        $header_parts = array();
        foreach ( $params as $key => $value ) {
            $header_parts[] = $key . '="' . rawurlencode( $value ) . '"';
        }

        return 'OAuth ' . implode( ', ', $header_parts );
    }

    private function build_http_query( $params ) {
        $pairs = array();
        foreach ( $params as $key => $value ) {
            $pairs[] = $key . '=' . $value;
        }
        return implode( '&', $pairs );
    }

    private function is_configured() {
        $configured = ! empty( $this->api_key ) && ! empty( $this->api_secret_key );
        if ( ! $configured ) {
            $this->log(
                'Twitter not configured - API Key: ' . ( $this->api_key ? 'Set' : 'Empty' ) .
                        ', API Secret: ' . ( $this->api_secret_key ? 'Set' : 'Empty' )
            );
        }
        return $configured;
    }

    private function log( $message ) {
        $log_file  = plugin_dir_path( __FILE__ ) . '/twitter_oauth.log';
        $timestamp = date( 'd/m/Y H:i:s', time() );
        file_put_contents( $log_file, $timestamp . ': ' . $message . "\n", FILE_APPEND );
    }
}

/**
 * MultiVendorX LinkedIn Verification.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class LinkedInVerification {

    /**
     * Client ID for LinkedIn.
     *
     * @var string
     */
    private $client_id;

    /**
     * Client secret for LinkedIn.
     *
     * @var string
     */
    private $client_secret;

    /**
     * Redirect URI for LinkedIn.
     *
     * @var string
     */
    private $redirect_uri;

    /**
     * LinkedInVerification constructor.
     */
    public function __construct() {
        $settings          = MultiVendorX()->setting->get_setting( 'all_verification_methods' );
        $linkedin_settings = $settings['social-verification']['social_verification_methods']['linkedin-connect'] ?? array();

        $this->client_id     = $linkedin_settings['client_id'] ?? '';
        $this->client_secret = $linkedin_settings['client_secret'] ?? '';
        $this->redirect_uri  = $linkedin_settings['redirect_uri'] ?? '';
    }

    /**
     * Get LinkedIn authorization URL.
     *
     * @return string|false
     */
    public function get_auth_url() {
        if ( ! $this->is_configured() ) {
            return false;
        }

        $params = array(
            'client_id'     => $this->client_id,
            'redirect_uri'  => $this->redirect_uri,
            'scope'         => 'r_liteprofile r_emailaddress',
            'state'         => wp_create_nonce( 'social_verification_linkedin' ),
            'response_type' => 'code',
        );

        return 'https://www.linkedin.com/oauth/v2/authorization?' . http_build_query( $params );
    }

    /**
     * Verify LinkedIn callback.
     *
     * @param string $code
     * @param array  $request_data
     *
     * @return array|false
     */
    public function verify_callback( $code, $request_data ) {
        if ( ! $this->is_configured() ) {
            return false;
        }

        // Exchange code for access token.
        $token_response = wp_remote_post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            array(
				'body' => array(
					'client_id'     => $this->client_id,
					'client_secret' => $this->client_secret,
					'code'          => $code,
					'grant_type'    => 'authorization_code',
					'redirect_uri'  => $this->redirect_uri,
				),
			)
        );

        if ( is_wp_error( $token_response ) ) {
            error_log( 'LinkedIn token exchange error: ' . $token_response->get_error_message() );
            return false;
        }

        $token_data = json_decode( wp_remote_retrieve_body( $token_response ), true );

        if ( isset( $token_data['access_token'] ) ) {
            // Get basic profile.
            $profile_response = wp_remote_get(
                'https://api.linkedin.com/v2/me',
                array(
					'headers' => array(
						'Authorization' => 'Bearer ' . $token_data['access_token'],
					),
				)
            );

            if ( is_wp_error( $profile_response ) ) {
                error_log( 'LinkedIn profile fetch error: ' . $profile_response->get_error_message() );
                return false;
            }

            $profile_data = json_decode( wp_remote_retrieve_body( $profile_response ), true );

            // Get email address.
            $email_response = wp_remote_get(
                'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
                array(
					'headers' => array(
						'Authorization' => 'Bearer ' . $token_data['access_token'],
					),
				)
            );

            $email_data = is_wp_error( $email_response ) ? array() : json_decode( wp_remote_retrieve_body( $email_response ), true );

            if ( isset( $profile_data['id'] ) ) {
                return array(
                    'social_id'       => $profile_data['id'],
                    'first_name'      => $profile_data['localizedFirstName'] ?? '',
                    'last_name'       => $profile_data['localizedLastName'] ?? '',
                    'name'            => ( $profile_data['localizedFirstName'] ?? '' ) . ' ' . ( $profile_data['localizedLastName'] ?? '' ),
                    'email'           => $email_data['elements'][0]['handle~']['emailAddress'] ?? '',
                    'profile_picture' => $this->get_linkedin_profile_picture( $token_data['access_token'] ),
                    'profile_url'     => 'https://linkedin.com/in/' . ( $profile_data['vanityName'] ?? $profile_data['id'] ),
                );
            }
        }

        error_log( 'LinkedIn verification failed: ' . wp_remote_retrieve_body( $token_response ) );
        return false;
    }

    /**
     * Get LinkedIn profile picture
     *
     * @param string $access_token Access token.
     * @return string
     */
    private function get_linkedin_profile_picture( $access_token ) {
        $picture_response = wp_remote_get(
            'https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))',
            array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $access_token,
				),
			)
        );

        if ( ! is_wp_error( $picture_response ) ) {
            $picture_data = json_decode( wp_remote_retrieve_body( $picture_response ), true );
            return $picture_data['profilePicture']['displayImage~']['elements'][0]['identifiers'][0]['identifier'] ?? '';
        }

        return '';
    }

    /**
     * Check if LinkedIn is configured
     *
     * @return bool
     */
    private function is_configured() {
        return ! empty( $this->client_id ) && ! empty( $this->client_secret );
    }
}

// // Initialize the social verification system
// new SocialVerification();

/**
 * Get the social verification system
 *
 * @param string $provider Provider.
 * @return
 */
function get_social_auth_url( $provider ) {
    $social_verification = get_social_verification();
    return $social_verification->get_auth_url( $provider );
}

/**
 * Get connected social profiles for a user
 *
 * @param int $user_id User ID.
 * @return array
 */
function get_connected_social_profiles( $user_id = null ) {
    $social_verification = get_social_verification();
    return $social_verification->get_social_profiles( $user_id );
}

/**
 * Check if a user is connected to a social provider
 *
 * @param int    $user_id User ID.
 * @param string $provider Provider.
 * @return bool
 */
function is_social_connected( $user_id, $provider ) {
    $connections = get_connected_social_profiles( $user_id );
    return isset( $connections[ $provider ] ) && $connections[ $provider ]['is_verified'];
}

/**
 * Check if social verification is enabled for a provider
 *
 * @param string $provider Provider.
 * @return bool
 */
function is_social_verification_enabled( $provider ) {
    $social_verification = get_social_verification();
    return $social_verification->is_social_enabled( $provider );
}
