<?php

namespace MultiVendorX\Geolocation;

class GooglePlaces {
    
    /**
     * Google Maps API Key
     */
    private $api_key;
    
    public function __construct() {
        $this->api_key = 'AIzaSyAEUy5ZtNn9Q8EmTp09h_MP7te3_IRkKwc';
        add_action('rest_api_init', [$this, 'register_geolocation_routes']);
        $this->test_api_key();
    }
    
    /**
     * Register REST API routes for geolocation
     */
    public function register_geolocation_routes() {
        $namespace = 'multivendorx/geolocation';

         // Add test endpoint
        register_rest_route($namespace, '/test-api-key', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'test_api_key'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        register_rest_route($namespace, '/geocode', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'geocode_address'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        register_rest_route($namespace, '/reverse-geocode', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'reverse_geocode'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        register_rest_route($namespace, '/autocomplete', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'place_autocomplete'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        register_rest_route($namespace, '/place-details', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'place_details'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }
    /**
     * Check if user has permission to access these endpoints
     */
    public function check_permission() {
        return current_user_can('manage_options') || mvx_is_vendor();
    }

    public function test_api_key() {
        $test_url = add_query_arg([
            'address' => 'New York',
            'key' => $this->api_key
        ], 'https://maps.googleapis.com/maps/api/geocode/json');
        
        $response = wp_remote_get($test_url);
        
        if (is_wp_error($response)) {
            return ['status' => 'error', 'message' => $response->get_error_message()];
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return [
            'status' => $data['status'],
            'api_key_valid' => $data['status'] !== 'REQUEST_DENIED'
        ];
    }    
    
    /**
     * Geocode an address to get coordinates
     */
    public function geocode_address($request) {
        $address = sanitize_text_field($request->get_param('address'));
        
        if (empty($address)) {
            return new \WP_Error('missing_address', 'Address parameter is required', ['status' => 400]);
        }
        
        $url = add_query_arg([
            'address' => urlencode($address),
            'key' => $this->api_key
        ], 'https://maps.googleapis.com/maps/api/geocode/json');
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data['status'] !== 'OK') {
            return new \WP_Error('geocoding_failed', 'Geocoding failed: ' . $data['status'], ['status' => 400]);
        }
        
        return $this->format_geocoding_response($data['results'][0]);
    }
    
    /**
     * Reverse geocode coordinates to get address
     */
    public function reverse_geocode($request) {
        $lat = floatval($request->get_param('lat'));
        $lng = floatval($request->get_param('lng'));
        
        if (!$lat || !$lng) {
            return new \WP_Error('missing_coordinates', 'Latitude and longitude parameters are required', ['status' => 400]);
        }
        
        $url = add_query_arg([
            'latlng' => $lat . ',' . $lng,
            'key' => $this->api_key
        ], 'https://maps.googleapis.com/maps/api/geocode/json');
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data['status'] !== 'OK') {
            return new \WP_Error('reverse_geocoding_failed', 'Reverse geocoding failed: ' . $data['status'], ['status' => 400]);
        }
        
        return $this->format_geocoding_response($data['results'][0]);
    }
    
    /**
     * Place autocomplete for address search
     */
    public function place_autocomplete($request) {
        $input = sanitize_text_field($request->get_param('input'));
        
        if (empty($input)) {
            return new \WP_Error('missing_input', 'Input parameter is required', ['status' => 400]);
        }
        
        $url = add_query_arg([
            'input' => urlencode($input),
            'types' => 'geocode|establishment',
            'key' => $this->api_key
        ], 'https://maps.googleapis.com/maps/api/place/autocomplete/json');
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data['status'] !== 'OK') {
            return new \WP_Error('autocomplete_failed', 'Autocomplete failed: ' . $data['status'], ['status' => 400]);
        }
        
        $predictions = [];
        foreach ($data['predictions'] as $prediction) {
            $predictions[] = [
                'description' => $prediction['description'],
                'place_id' => $prediction['place_id'],
                'structured_formatting' => $prediction['structured_formatting']
            ];
        }
        
        return $predictions;
    }
    
    /**
     * Get place details by place ID
     */
    public function place_details($request) {
        $place_id = sanitize_text_field($request->get_param('place_id'));
        
        if (empty($place_id)) {
            return new \WP_Error('missing_place_id', 'Place ID parameter is required', ['status' => 400]);
        }
        
        $url = add_query_arg([
            'place_id' => $place_id,
            'fields' => 'name,formatted_address,geometry,address_components',
            'key' => $this->api_key
        ], 'https://maps.googleapis.com/maps/api/place/details/json');
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data['status'] !== 'OK') {
            return new \WP_Error('place_details_failed', 'Place details failed: ' . $data['status'], ['status' => 400]);
        }
        
        return $this->format_geocoding_response($data['result']);
    }
    
    /**
     * Format geocoding response consistently
     */
    private function format_geocoding_response($result) {
        $address_components = $result['address_components'] ?? [];
        $geometry = $result['geometry'] ?? [];
        
        $formatted = [
            'formatted_address' => $result['formatted_address'] ?? '',
            'latitude' => $geometry['location']['lat'] ?? null,
            'longitude' => $geometry['location']['lng'] ?? null,
            'address_components' => []
        ];
        
        // Extract specific address components
        foreach ($address_components as $component) {
            $types = $component['types'];
            $formatted['address_components'][] = [
                'types' => $types,
                'long_name' => $component['long_name'],
                'short_name' => $component['short_name']
            ];
            
            // Map to common fields
            if (in_array('street_number', $types)) {
                $formatted['street_number'] = $component['long_name'];
            } elseif (in_array('route', $types)) {
                $formatted['route'] = $component['long_name'];
            } elseif (in_array('locality', $types)) {
                $formatted['city'] = $component['long_name'];
            } elseif (in_array('administrative_area_level_1', $types)) {
                $formatted['state'] = $component['long_name'];
            } elseif (in_array('country', $types)) {
                $formatted['country'] = $component['long_name'];
                $formatted['country_code'] = $component['short_name'];
            } elseif (in_array('postal_code', $types)) {
                $formatted['postal_code'] = $component['long_name'];
            }
        }
        
        return $formatted;
    }
    
    /**
     * Validate and save store location data
     */
    public static function save_store_location($store_id, $location_data) {
        $allowed_fields = [
            'location_address',
            'location_lat', 
            'location_lng',
            'address',
            'city',
            'state',
            'country',
            'zip',
            'timezone'
        ];
        
        $sanitized_data = [];
        foreach ($location_data as $key => $value) {
            if (in_array($key, $allowed_fields)) {
                $sanitized_data[$key] = sanitize_text_field($value);
            }
        }
        
        // Update store meta
        foreach ($sanitized_data as $key => $value) {
            update_user_meta($store_id, '_mvx_' . $key, $value);
        }
        
        return true;
    }
}