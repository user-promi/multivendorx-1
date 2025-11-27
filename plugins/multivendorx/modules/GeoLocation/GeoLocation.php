<?php

namespace MultiVendorX\Geolocation;

class GeoLocation {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'geolocation';
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'), 10);
    }
    
    public function register_routes() {
        
        if (!function_exists('register_rest_route')) {
            return;
        }

        // Register geocode endpoint only - remove store-specific routes
        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/geocode', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'geocode_address'],
            'permission_callback' => [$this, 'get_items_permissions_check'],
        ]);

        // Register reverse geocode endpoint
        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/reverse-geocode', [
            'methods' => \WP_REST_Server::READABLE,
            'callback' => [$this, 'reverse_geocode'],
            'permission_callback' => [$this, 'get_items_permissions_check'],
        ]);
    }

    public function get_items_permissions_check($request) {
        $has_permission = current_user_can('read') || current_user_can('edit_stores');
        return $has_permission;
    }

    public function update_item_permissions_check($request) {
        $has_permission = current_user_can('edit_stores');
        return $has_permission;
    }
    
    // Remove get_store_data and update_store_data methods since they're handled by main store controller
    
    public function geocode_address($request) {
        $address = $request->get_param('address');
        
        if (empty($address)) {
            return new \WP_Error('missing_address', 'Address is required', ['status' => 400]);
        }
        
        $url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($address) . '&key=' . $this->api_key;
        
        $response = wp_remote_get($url, [
            'timeout' => 30,
        ]);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        
        if ($data['status'] !== 'OK') {
            return new \WP_Error('geocoding_failed', 'Geocoding failed: ' . $data['status'], ['status' => 400]);
        }
        
        $formatted_response = $this->format_geocoding_response($data['results'][0]);
        
        return rest_ensure_response($formatted_response);
    }
    
    public function reverse_geocode($request) {
        $lat = $request->get_param('lat');
        $lng = $request->get_param('lng');
        
        if (!$lat || !$lng) {
            return new \WP_Error('missing_coordinates', 'Coordinates are required', ['status' => 400]);
        }
        
        $url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' . $lat . ',' . $lng . '&key=' . $this->api_key;
        
        $response = wp_remote_get($url, [
            'timeout' => 30,
        ]);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        
        
        if ($data['status'] !== 'OK') {
            return new \WP_Error('reverse_geocoding_failed', 'Reverse geocoding failed: ' . $data['status'], ['status' => 400]);
        }
        
        $formatted_response = $this->format_geocoding_response($data['results'][0]);
        
        return rest_ensure_response($formatted_response);
    }
    
    private function format_geocoding_response($result) {
        $components = [];
        
        foreach ($result['address_components'] as $component) {
            $types = $component['types'];
            
            if (in_array('street_number', $types)) {
                $components['location_address'] = $component['long_name'];
            } elseif (in_array('route', $types)) {
                $components['location_address'] = ($components['location_address'] ?? '') . ' ' . $component['long_name'];
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
        
        return $response;
    }    
}

new GeoLocation();