<?php
/**
 * Social Verification APIs
 * Handles OAuth integration with Facebook, Google, Twitter, and LinkedIn
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class SocialVerification {
    
    private $apis = [];
    
    public function __construct() {
        $this->initialize_apis();
        add_action('init', [$this, 'handle_oauth_callbacks']);
    }
    
    private function initialize_apis() {
        $this->apis = [
            'facebook' => new FacebookVerification(),
            'google' => new GoogleVerification(),
            'twitter' => new TwitterVerification(),
            'linkedin' => new LinkedInVerification()
        ];
    }
    
    public function get_api($provider) {
        return isset($this->apis[$provider]) ? $this->apis[$provider] : null;
    }

    /**
     * Get auth URL for social provider
     */
    public function get_auth_url($provider) {
        $api = $this->get_api($provider);
        return $api ? $api->get_auth_url() : false;
    }

    /**
     * Process OAuth callback
     */
    public function process_oauth_callback($provider, $code, $request_data) {
        $api = $this->get_api($provider);
        return $api ? $api->verify_callback($code, $request_data) : false;
    }

    /**
     * Get connected social profiles for current vendor
     */
    public function get_social_profiles($vendor_id = null) {
        if (!$vendor_id) {
            $vendor_id = get_current_user_id();
        }
        $connections = get_user_meta($vendor_id, 'social_verification_connections', true) ?: [];
        
        return $connections;
    }

    /**
     * Save social connection
     */
    public function save_social_connection($user_id, $provider, $user_data) {
        $connections = get_user_meta($user_id, 'social_verification_connections', true) ?: [];
        
        $connections[$provider] = [
            'connected_at' => current_time('mysql'),
            'profile_data' => $user_data,
            'is_verified' => true
        ];
        
        update_user_meta($user_id, 'social_verification_connections', $connections);
        
        // Log the connection
        $this->log_verification_attempt($user_id, $provider, 'connected');
        
        return true;
    }

    /**
     * Disconnect social profile
     */
    public function disconnect_social_profile($vendor_id, $provider) {
        $connections = get_user_meta($vendor_id, 'social_verification_connections', true) ?: [];
        
        if (isset($connections[$provider])) {
            unset($connections[$provider]);
            update_user_meta($vendor_id, 'social_verification_connections', $connections);
            
            // Log the disconnection
            $this->log_verification_attempt($vendor_id, $provider, 'disconnected');
            
            return true;
        }
        
        return false;
    }

    /**
     * Check if social verification is enabled for provider
     */
    public function is_social_enabled($provider) {
        $settings = $this->get_social_settings();
        $social_settings = $settings['social-verification']['social_verification_methods'][$provider . '-connect'] ?? null;
        
        return $social_settings && $social_settings['enable'];
    }

    /**
     * Get social settings
     */
    private function get_social_settings() {
        return MultiVendorX()->setting->get_setting('all_verification_methods');
    }

    /**
     * Handle OAuth callbacks
     */
    public function handle_oauth_callbacks() {
        if (isset($_GET['social_verification_callback'])) {
            $this->process_legacy_oauth_callback();
        }
    }
    
    /**
     * Process legacy OAuth callback (for direct links)
     */
    private function process_legacy_oauth_callback() {
        $provider = sanitize_text_field($_GET['provider'] ?? '');
        $code = sanitize_text_field($_GET['code'] ?? '');
        $state = sanitize_text_field($_GET['state'] ?? '');
        
        if (!$provider || !$code) {
            wp_die('Invalid callback parameters');
        }
        
        // Verify nonce
        if (!wp_verify_nonce($state, 'social_verification_' . $provider)) {
            wp_die('Security verification failed');
        }
        
        $user_data = $this->process_oauth_callback($provider, $code, $_GET);
        
        if ($user_data) {
            $this->save_social_connection(get_current_user_id(), $provider, $user_data);
            
            // Redirect back to verification page with success message
            wp_redirect($this->get_redirect_url('success', $provider));
            exit;
        } else {
            wp_redirect($this->get_redirect_url('error', $provider, 'Failed to verify social profile'));
            exit;
        }
    }

    /**
     * Get redirect URL
     */
    private function get_redirect_url($status, $provider = '', $message = '') {
        $redirect_url = wc_get_account_endpoint_url('verification');
        $args = ['verification' => $status];
        
        if ($provider) {
            $args['provider'] = $provider;
        }
        
        if ($message) {
            $args['message'] = urlencode($message);
        }
        
        return add_query_arg($args, $redirect_url);
    }

    /**
     * Log verification activity
     */
    private function log_verification_attempt($user_id, $provider, $status) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vendor_verification_logs';
        
        $wpdb->insert(
            $table_name,
            [
                'vendor_id' => $user_id,
                'verification_type' => 'social_' . $provider,
                'status' => $status,
                'ip_address' => $this->get_client_ip(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'created_at' => current_time('mysql')
            ],
            ['%d', '%s', '%s', '%s', '%s', '%s']
        );
    }

    /**
     * Get client IP address
     */
    private function get_client_ip() {
        $ip_keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = trim(current(explode(',', $_SERVER[$key])));
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return '0.0.0.0';
    }
}

class FacebookVerification {
    private $app_id;
    private $app_secret;
    private $redirect_uri;
    
    public function __construct() {
        $settings = MultiVendorX()->setting->get_setting('all_verification_methods');
        $fb_settings = $settings['social-verification']['social_verification_methods']['facebook-connect'] ?? [];
        
        $this->app_id = $fb_settings['app_id'] ?? '';
        $this->app_secret = $fb_settings['app_secret'] ?? '';
        $this->redirect_uri = home_url('/vendor/v1/verification/oauth-callback?provider=facebook');
    }
    
    public function get_auth_url() {
        if (!$this->is_configured()) {
            return false;
        }
        
        $params = [
            'client_id' => $this->app_id,
            'redirect_uri' => $this->redirect_uri,
            'scope' => 'email,public_profile',
            'state' => wp_create_nonce('social_verification_facebook'),
            'response_type' => 'code'
        ];
        
        return 'https://www.facebook.com/v17.0/dialog/oauth?' . http_build_query($params);
    }
    
    public function verify_callback($code, $request_data) {
        if (!$this->is_configured()) {
            return false;
        }
        
        // Exchange code for access token
        $token_url = 'https://graph.facebook.com/v17.0/oauth/access_token?' . http_build_query([
            'client_id' => $this->app_id,
            'client_secret' => $this->app_secret,
            'redirect_uri' => $this->redirect_uri,
            'code' => $code
        ]);
        
        $response = wp_remote_get($token_url);
        
        if (is_wp_error($response)) {
            error_log('Facebook token exchange error: ' . $response->get_error_message());
            return false;
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($data['access_token'])) {
            // Get user profile
            $profile_url = 'https://graph.facebook.com/v17.0/me?' . http_build_query([
                'access_token' => $data['access_token'],
                'fields' => 'id,name,email,first_name,last_name,picture'
            ]);
            
            $profile_response = wp_remote_get($profile_url);
            
            if (is_wp_error($profile_response)) {
                error_log('Facebook profile fetch error: ' . $profile_response->get_error_message());
                return false;
            }
            
            $profile_data = json_decode(wp_remote_retrieve_body($profile_response), true);
            
            if (isset($profile_data['id'])) {
                return [
                    'social_id' => $profile_data['id'],
                    'name' => $profile_data['name'] ?? '',
                    'first_name' => $profile_data['first_name'] ?? '',
                    'last_name' => $profile_data['last_name'] ?? '',
                    'email' => $profile_data['email'] ?? '',
                    'profile_picture' => $profile_data['picture']['data']['url'] ?? '',
                    'profile_url' => 'https://facebook.com/' . $profile_data['id']
                ];
            }
        }
        
        error_log('Facebook verification failed: ' . wp_remote_retrieve_body($response));
        return false;
    }
    
    private function is_configured() {
        return !empty($this->app_id) && !empty($this->app_secret);
    }
}

class GoogleVerification {
    private $client_id;
    private $client_secret;
    private $redirect_uri;
    
    public function __construct() {
        $settings = MultiVendorX()->setting->get_setting('all_verification_methods');
        $google_settings = $settings['social-verification']['social_verification_methods']['google-connect'] ?? [];
        
        $this->client_id = $google_settings['client_id'] ?? '';
        $this->client_secret = $google_settings['client_secret'] ?? '';
        $this->redirect_uri = home_url('/vendor/v1/verification/oauth-callback?provider=google');
    }
    
    public function get_auth_url() {
        if (!$this->is_configured()) {
            return false;
        }
        
        $params = [
            'client_id' => $this->client_id,
            'redirect_uri' => $this->redirect_uri,
            'scope' => 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            'state' => wp_create_nonce('social_verification_google'),
            'response_type' => 'code',
            'access_type' => 'online',
            'prompt' => 'consent'
        ];
        
        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    }
    
    public function verify_callback($code, $request_data) {
        if (!$this->is_configured()) {
            return false;
        }
        
        // Exchange code for access token
        $token_response = wp_remote_post('https://oauth2.googleapis.com/token', [
            'body' => [
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->redirect_uri
            ]
        ]);
        
        if (is_wp_error($token_response)) {
            error_log('Google token exchange error: ' . $token_response->get_error_message());
            return false;
        }
        
        $token_data = json_decode(wp_remote_retrieve_body($token_response), true);
        
        if (isset($token_data['access_token'])) {
            // Get user profile
            $profile_response = wp_remote_get('https://www.googleapis.com/oauth2/v2/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token_data['access_token']
                ]
            ]);
            
            if (is_wp_error($profile_response)) {
                error_log('Google profile fetch error: ' . $profile_response->get_error_message());
                return false;
            }
            
            $profile_data = json_decode(wp_remote_retrieve_body($profile_response), true);
            
            if (isset($profile_data['id'])) {
                return [
                    'social_id' => $profile_data['id'],
                    'name' => $profile_data['name'] ?? '',
                    'given_name' => $profile_data['given_name'] ?? '',
                    'family_name' => $profile_data['family_name'] ?? '',
                    'email' => $profile_data['email'] ?? '',
                    'profile_picture' => $profile_data['picture'] ?? '',
                    'locale' => $profile_data['locale'] ?? '',
                    'verified_email' => $profile_data['verified_email'] ?? false
                ];
            }
        }
        
        error_log('Google verification failed: ' . wp_remote_retrieve_body($token_response));
        return false;
    }
    
    private function is_configured() {
        return !empty($this->client_id) && !empty($this->client_secret);
    }
}

class TwitterVerification {
    private $api_key;
    private $api_secret_key;
    private $bearer_token;
    private $redirect_uri;
    
    public function __construct() {
        $settings = MultiVendorX()->setting->get_setting('all_verification_methods');
        $twitter_settings = $settings['social-verification']['social_verification_methods']['twitter-connect'] ?? [];
        
        $this->api_key = $twitter_settings['api_key'] ?? '';
        $this->api_secret_key = $twitter_settings['api_secret_key'] ?? '';
        $this->bearer_token = $twitter_settings['bearer_token'] ?? '';
        $this->redirect_uri = home_url('/vendor/v1/verification/oauth-callback?provider=twitter');
    }
    
    public function get_auth_url() {
        if (!$this->is_configured()) {
            return false;
        }
        
        // Note: Twitter OAuth 1.0a is complex - consider using a library
        // This is a simplified implementation
        $temp_credentials = $this->get_request_token();
        
        if ($temp_credentials && isset($temp_credentials['oauth_token'])) {
            return 'https://api.twitter.com/oauth/authenticate?oauth_token=' . $temp_credentials['oauth_token'];
        }
        
        return false;
    }
    
    private function get_request_token() {
        // Simplified implementation - in production, use twitteroauth library
        $args = [
            'headers' => [
                'Authorization' => $this->build_oauth_header([
                    'oauth_callback' => $this->redirect_uri
                ], 'https://api.twitter.com/oauth/request_token')
            ]
        ];
        
        $response = wp_remote_post('https://api.twitter.com/oauth/request_token', $args);
        
        if (!is_wp_error($response)) {
            parse_str(wp_remote_retrieve_body($response), $credentials);
            return $credentials;
        }
        
        error_log('Twitter request token error: ' . $response->get_error_message());
        return false;
    }
    
    public function verify_callback($oauth_token, $request_data) {
        if (!$this->is_configured()) {
            return false;
        }
        
        $oauth_verifier = $request_data['oauth_verifier'] ?? '';
        
        if (!$oauth_token || !$oauth_verifier) {
            return false;
        }
        
        // Exchange for access token
        $access_token = $this->get_access_token($oauth_token, $oauth_verifier);
        
        if ($access_token && isset($access_token['user_id'])) {
            return [
                'social_id' => $access_token['user_id'],
                'screen_name' => $access_token['screen_name'] ?? '',
                'name' => $access_token['screen_name'] ?? '', // Would need additional API call
                'profile_url' => 'https://twitter.com/' . ($access_token['screen_name'] ?? '')
            ];
        }
        
        return false;
    }
    
    private function get_access_token($oauth_token, $oauth_verifier) {
        $args = [
            'headers' => [
                'Authorization' => $this->build_oauth_header([
                    'oauth_token' => $oauth_token,
                    'oauth_verifier' => $oauth_verifier
                ], 'https://api.twitter.com/oauth/access_token')
            ]
        ];
        
        $response = wp_remote_post('https://api.twitter.com/oauth/access_token', $args);
        
        if (!is_wp_error($response)) {
            parse_str(wp_remote_retrieve_body($response), $access_token);
            return $access_token;
        }
        
        error_log('Twitter access token error: ' . $response->get_error_message());
        return false;
    }
    
    private function build_oauth_header($params, $url) {
        // Simplified OAuth 1.0 header builder
        // In production, use a proper OAuth 1.0 library like twitteroauth
        $defaults = [
            'oauth_consumer_key' => $this->api_key,
            'oauth_nonce' => wp_generate_password(32, false),
            'oauth_signature_method' => 'HMAC-SHA1',
            'oauth_timestamp' => time(),
            'oauth_version' => '1.0'
        ];
        
        $params = array_merge($defaults, $params);
        
        // Note: This is simplified and may not work without proper signature
        $header = 'OAuth ';
        $header_parts = [];
        
        foreach ($params as $key => $value) {
            $header_parts[] = $key . '="' . rawurlencode($value) . '"';
        }
        
        return $header . implode(', ', $header_parts);
    }
    
    private function is_configured() {
        return !empty($this->api_key) && !empty($this->api_secret_key);
    }
}

class LinkedInVerification {
    private $client_id;
    private $client_secret;
    private $redirect_uri;
    
    public function __construct() {
        $settings = MultiVendorX()->setting->get_setting('all_verification_methods');
        $linkedin_settings = $settings['social-verification']['social_verification_methods']['linkedin-connect'] ?? [];
        
        $this->client_id = $linkedin_settings['client_id'] ?? '';
        $this->client_secret = $linkedin_settings['client_secret'] ?? '';
        $this->redirect_uri = home_url('/vendor/v1/verification/oauth-callback?provider=linkedin');
    }
    
    public function get_auth_url() {
        if (!$this->is_configured()) {
            return false;
        }
        
        $params = [
            'client_id' => $this->client_id,
            'redirect_uri' => $this->redirect_uri,
            'scope' => 'r_liteprofile r_emailaddress',
            'state' => wp_create_nonce('social_verification_linkedin'),
            'response_type' => 'code'
        ];
        
        return 'https://www.linkedin.com/oauth/v2/authorization?' . http_build_query($params);
    }
    
    public function verify_callback($code, $request_data) {
        if (!$this->is_configured()) {
            return false;
        }
        
        // Exchange code for access token
        $token_response = wp_remote_post('https://www.linkedin.com/oauth/v2/accessToken', [
            'body' => [
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->redirect_uri
            ]
        ]);
        
        if (is_wp_error($token_response)) {
            error_log('LinkedIn token exchange error: ' . $token_response->get_error_message());
            return false;
        }
        
        $token_data = json_decode(wp_remote_retrieve_body($token_response), true);
        
        if (isset($token_data['access_token'])) {
            // Get basic profile
            $profile_response = wp_remote_get('https://api.linkedin.com/v2/me', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token_data['access_token']
                ]
            ]);
            
            if (is_wp_error($profile_response)) {
                error_log('LinkedIn profile fetch error: ' . $profile_response->get_error_message());
                return false;
            }
            
            $profile_data = json_decode(wp_remote_retrieve_body($profile_response), true);
            
            // Get email address
            $email_response = wp_remote_get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token_data['access_token']
                ]
            ]);
            
            $email_data = is_wp_error($email_response) ? [] : json_decode(wp_remote_retrieve_body($email_response), true);
            
            if (isset($profile_data['id'])) {
                return [
                    'social_id' => $profile_data['id'],
                    'first_name' => $profile_data['localizedFirstName'] ?? '',
                    'last_name' => $profile_data['localizedLastName'] ?? '',
                    'name' => ($profile_data['localizedFirstName'] ?? '') . ' ' . ($profile_data['localizedLastName'] ?? ''),
                    'email' => $email_data['elements'][0]['handle~']['emailAddress'] ?? '',
                    'profile_picture' => $this->get_linkedin_profile_picture($token_data['access_token']),
                    'profile_url' => 'https://linkedin.com/in/' . ($profile_data['vanityName'] ?? $profile_data['id'])
                ];
            }
        }
        
        error_log('LinkedIn verification failed: ' . wp_remote_retrieve_body($token_response));
        return false;
    }
    
    private function get_linkedin_profile_picture($access_token) {
        $picture_response = wp_remote_get('https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))', [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token
            ]
        ]);
        
        if (!is_wp_error($picture_response)) {
            $picture_data = json_decode(wp_remote_retrieve_body($picture_response), true);
            return $picture_data['profilePicture']['displayImage~']['elements'][0]['identifiers'][0]['identifier'] ?? '';
        }
        
        return '';
    }
    
    private function is_configured() {
        return !empty($this->client_id) && !empty($this->client_secret);
    }
}

// Initialize the social verification system
new SocialVerification();

// Helper functions
function get_social_verification() {
    static $instance = null;
    
    if (is_null($instance)) {
        $instance = new SocialVerification();
    }
    
    return $instance;
}

function get_social_auth_url($provider) {
    $social_verification = get_social_verification();
    return $social_verification->get_auth_url($provider);
}

function get_connected_social_profiles($user_id = null) {
    $social_verification = get_social_verification();
    return $social_verification->get_social_profiles($user_id);
}

function is_social_connected($user_id, $provider) {
    $connections = get_connected_social_profiles($user_id);
    return isset($connections[$provider]) && $connections[$provider]['is_verified'];
}

function is_social_verification_enabled($provider) {
    $social_verification = get_social_verification();
    return $social_verification->is_social_enabled($provider);
}
