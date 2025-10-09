<?php

namespace MultiVendorX\Geolocation;

class GooglePlaces {
    
    private $api_key = 'AIzaSyAEUy5ZtNn9Q8EmTp09h_MP7te3_IRkKwc';
    
    public function __construct() {
        $this->log('GooglePlaces class constructor called');
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        $this->log('register_routes() method called - Starting route registration');
        
        // Test if REST API is available
        if (!function_exists('register_rest_route')) {
            $this->log('ERROR: register_rest_route function does not exist!');
            return;
        }
        
        $this->log('REST API functions are available');
        
        // Register store endpoint
        $result1 = register_rest_route('multivendorx', '/store/(?P<id>\d+)', [
            [
                'methods' => \WP_REST_Server::READABLE,
                'callback' => [$this, 'get_store_data'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods' => \WP_REST_Server::EDITABLE,
                'callback' => [$this, 'update_store_data'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        ]);
        
        $this->log('Store route registered: ' . ($result1 ? 'SUCCESS' : 'FAILED'));
        
        // Register geocode endpoint
        $result2 = register_rest_route('multivendorx', '/geocode', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'geocode_address'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        $this->log('Geocode route registered: ' . ($result2 ? 'SUCCESS' : 'FAILED'));
        
        // Register reverse geocode endpoint
        $result3 = register_rest_route('multivendorx', '/reverse-geocode', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'reverse_geocode'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        $this->log('Reverse geocode route registered: ' . ($result3 ? 'SUCCESS' : 'FAILED'));
        
        $this->log('All routes registration completed');
        
        // Test if routes are actually registered
        $this->test_routes_registered();
    }
    
    private function test_routes_registered() {
        $this->log('Testing if routes are properly registered...');
        
        // Get all registered routes
        $routes = rest_get_server()->get_routes();
        $multivendorx_routes = [];
        
        foreach ($routes as $route => $handlers) {
            if (strpos($route, '/multivendorx/') !== false) {
                $multivendorx_routes[] = $route;
            }
        }
        
        $this->log('Found multivendorx routes: ' . implode(', ', $multivendorx_routes));
        
        if (empty($multivendorx_routes)) {
            $this->log('ERROR: No multivendorx routes found!');
        } else {
            $this->log('SUCCESS: Multivendorx routes found in REST API');
        }
    }
    
    public function check_permission($request) {
        $user_id = get_current_user_id();
        $has_permission = current_user_can('manage_options');
        
        $this->log("Permission check - User ID: {$user_id}, Has Permission: " . ($has_permission ? 'Yes' : 'No'));
        
        return $has_permission;
    }
    
    public function get_store_data($request) {
        $store_id = $request->get_param('id');
        $this->log("GET Store Data - Store ID: " . $store_id);
        $this->log("GET Request headers: " . json_encode($request->get_headers()));
        $this->log("GET Request params: " . json_encode($request->get_params()));
        
        // Verify store exists
        $store = get_userdata($store_id);
        if (!$store) {
            $this->log("Store not found for ID: " . $store_id);
            return new \WP_Error('store_not_found', 'Store not found', ['status' => 404]);
        }
        
        $meta_fields = [
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
        
        $data = [];
        foreach ($meta_fields as $field) {
            $meta_key = '_mvx_' . $field;
            $value = get_user_meta($store_id, $meta_key, true);
            $data[$field] = $value;
            $this->log("Meta field {$field} ({$meta_key}): " . ($value ? $value : 'empty'));
        }
        
        $this->log("Returning store data for store {$store_id}: " . json_encode($data));
        
        return rest_ensure_response($data);
    }
    
    public function update_store_data($request) {
        $store_id = $request->get_param('id');
        $this->log("UPDATE Store Data - Store ID: " . $store_id);
        $this->log("PUT Request headers: " . json_encode($request->get_headers()));
        $this->log("PUT Request params: " . json_encode($request->get_params()));
        
        // Verify store exists
        $store = get_userdata($store_id);
        if (!$store) {
            $this->log("Store not found for ID: " . $store_id);
            return new \WP_Error('store_not_found', 'Store not found', ['status' => 404]);
        }
        
        $data = $request->get_json_params();
        $this->log("Received raw data: " . print_r($data, true));
        
        if (empty($data)) {
            $this->log("No data received in request body");
            return new \WP_Error('no_data', 'No data received', ['status' => 400]);
        }
        
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
        
        $updated_count = 0;
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $meta_key = '_mvx_' . $field;
                $value = sanitize_text_field($data[$field]);
                $old_value = get_user_meta($store_id, $meta_key, true);
                
                update_user_meta($store_id, $meta_key, $value);
                $this->log("Updated field {$field}: '{$old_value}' -> '{$value}'");
                $updated_count++;
            }
        }
        
        $this->log("Store data updated successfully. {$updated_count} fields updated.");
        return rest_ensure_response([
            'success' => true, 
            'message' => 'Store data updated successfully',
            'updated_fields' => $updated_count
        ]);
    }
    
    public function geocode_address($request) {
        $address = $request->get_param('address');
        $this->log("Geocode request - Address: " . $address);
        
        if (empty($address)) {
            $this->log("Geocode error: Missing address");
            return new \WP_Error('missing_address', 'Address is required', ['status' => 400]);
        }
        
        $url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($address) . '&key=' . $this->api_key;
        $this->log("Geocode URL: " . $url);
        
        $response = wp_remote_get($url, [
            'timeout' => 30,
        ]);
        
        if (is_wp_error($response)) {
            $this->log("Geocode WP Error: " . $response->get_error_message());
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        
        $this->log("Geocode Response Code: " . $response_code);
        $this->log("Geocode Response Status: " . ($data['status'] ?? 'unknown'));
        
        if ($data['status'] !== 'OK') {
            $this->log("Geocode API Error: " . $data['status']);
            return new \WP_Error('geocoding_failed', 'Geocoding failed: ' . $data['status'], ['status' => 400]);
        }
        
        $formatted_response = $this->format_geocoding_response($data['results'][0]);
        $this->log("Geocode successful, formatted address: " . $formatted_response['formatted_address']);
        
        return rest_ensure_response($formatted_response);
    }
    
    public function reverse_geocode($request) {
        $lat = $request->get_param('lat');
        $lng = $request->get_param('lng');
        
        $this->log("Reverse Geocode request - Lat: " . $lat . ", Lng: " . $lng);
        
        if (!$lat || !$lng) {
            $this->log("Reverse Geocode error: Missing coordinates");
            return new \WP_Error('missing_coordinates', 'Coordinates are required', ['status' => 400]);
        }
        
        $url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' . $lat . ',' . $lng . '&key=' . $this->api_key;
        $this->log("Reverse Geocode URL: " . $url);
        
        $response = wp_remote_get($url, [
            'timeout' => 30,
        ]);
        
        if (is_wp_error($response)) {
            $this->log("Reverse Geocode WP Error: " . $response->get_error_message());
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        
        $this->log("Reverse Geocode Response Code: " . $response_code);
        $this->log("Reverse Geocode Response Status: " . ($data['status'] ?? 'unknown'));
        
        if ($data['status'] !== 'OK') {
            $this->log("Reverse Geocode API Error: " . $data['status']);
            return new \WP_Error('reverse_geocoding_failed', 'Reverse geocoding failed: ' . $data['status'], ['status' => 400]);
        }
        
        $formatted_response = $this->format_geocoding_response($data['results'][0]);
        $this->log("Reverse Geocode successful, formatted address: " . $formatted_response['formatted_address']);
        
        return rest_ensure_response($formatted_response);
    }
    
    private function format_geocoding_response($result) {
        $components = [];
        
        $this->log("Formatting geocoding response, address components count: " . count($result['address_components']));
        
        foreach ($result['address_components'] as $component) {
            $types = $component['types'];
            
            if (in_array('street_number', $types)) {
                $components['address'] = $component['long_name'];
            } elseif (in_array('route', $types)) {
                $components['address'] = ($components['address'] ?? '') . ' ' . $component['long_name'];
            } elseif (in_array('locality', $types)) {
                $components['city'] = $component['long_name'];
            } elseif (in_array('administrative_area_level_1', $types)) {
                $components['state'] = $component['long_name'];
            } elseif (in_array('country', $types)) {
                $components['country'] = $component['long_name'];
            } elseif (in_array('postal_code', $types)) {
                $components['zip'] = $component['long_name'];
            }
        }
        
        $response = [
            'formatted_address' => $result['formatted_address'],
            'latitude' => $result['geometry']['location']['lat'],
            'longitude' => $result['geometry']['location']['lng'],
            'components' => $components
        ];
        
        $this->log("Formatted response with coordinates: " . $response['latitude'] . ", " . $response['longitude']);
        return $response;
    }
    
    private function log($message) {
        $log_file = plugin_dir_path(__FILE__) . "/geolocation-debug.log";
        $timestamp = date("d/m/Y H:i:s", time());
        file_put_contents($log_file, $timestamp . ": " . $message . "\n", FILE_APPEND);
    }
}

// // Test if the class is being loaded
// file_put_contents(plugin_dir_path(__FILE__) . "/geolocation-debug.log", date("d/m/Y H:i:s", time()) . ": GooglePlaces file loaded\n", FILE_APPEND);

// new GooglePlaces();