<?php
/**
 * MultiVendorX Geolocation Module
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Geolocation;

use MultiVendorX\Utill;

/**
 * MultiVendorX Geolocation Module
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class GeoLocation {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'geolocation';

    /**
     * API key for Google Maps API.
     *
     * @var string
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {

        if ( ! function_exists( 'register_rest_route' ) ) {
            return;
        }

        // Register geocode endpoint only - remove store-specific routes.
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/geocode',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'geocode_address' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			)
        );

        // Register reverse geocode endpoint.
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/reverse-geocode',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'reverse_geocode' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			)
        );
    }

    /**
     * Check if a given request has access to read items
     *
     * @param object $request Full data about the request.
     * @return WP_Error|bool
     */
    public function get_items_permissions_check( $request ) {
        $has_permission = current_user_can( 'read' ) || current_user_can( 'edit_stores' );
        return $has_permission;
    }

    /**
     * Check if a given request has access to update a specific item
     *
     * @param object $request Full data about the request.
     * @return WP_Error|bool
     */
    public function update_item_permissions_check( $request ) {
        $has_permission = current_user_can( 'edit_stores' );
        return $has_permission;
    }

    /**
     * Geocode an address to a latitude and longitude coordinate.
     *
     * @param object $request Full details about the request.
     * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
     */
    public function geocode_address( $request ) {
        $address = $request->get_param( 'address' );

        if ( empty( $address ) ) {
            return new \WP_Error( 'missing_address', 'Address is required', array( 'status' => 400 ) );
        }

        $url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode( $address ) . '&key=' . $this->api_key;

        $response = wp_remote_get(
            $url,
            array(
				'timeout' => 30,
			)
        );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code( $response );
        $response_body = wp_remote_retrieve_body( $response );
        $data          = json_decode( $response_body, true );

        if ( 'OK' !== $data['status'] ) {
            return new \WP_Error( 'geocoding_failed', 'Geocoding failed: ' . $data['status'], array( 'status' => 400 ) );
        }

        $formatted_response = $this->format_geocoding_response( $data['results'][0] );

        return rest_ensure_response( $formatted_response );
    }

    /**
     * Reverse geocode a latitude and longitude coordinate to an address.
     *
     * @param object $request Full details about the request.
     * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
     */
    public function reverse_geocode( $request ) {
        $lat = $request->get_param( 'lat' );
        $lng = $request->get_param( 'lng' );

        if ( ! $lat || ! $lng ) {
            return new \WP_Error( 'missing_coordinates', 'Coordinates are required', array( 'status' => 400 ) );
        }

        $url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' . $lat . ',' . $lng . '&key=' . $this->api_key;

        $response = wp_remote_get(
            $url,
            array(
				'timeout' => 30,
			)
        );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code( $response );
        $response_body = wp_remote_retrieve_body( $response );
        $data          = json_decode( $response_body, true );

        if ( 'OK' !== $data['status'] ) {
            return new \WP_Error( 'reverse_geocoding_failed', 'Reverse geocoding failed: ' . $data['status'], array( 'status' => 400 ) );
        }

        $formatted_response = $this->format_geocoding_response( $data['results'][0] );

        return rest_ensure_response( $formatted_response );
    }

    /**
     * Format the response from Google Maps API to match our expected structure.
     *
     * @param array $result The result from Google Maps API.
     * @return array The formatted response.
     */
    private function format_geocoding_response( $result ) {
        $components = array();

        foreach ( $result['address_components'] as $component ) {
            $types = $component['types'];

            if ( in_array( 'street_number', $types, true ) ) {
                $components['location_address'] = $component['long_name'];
            } elseif ( in_array( 'route', $types, true ) ) {
                $components['location_address'] = ( $components['location_address'] ?? '' ) . ' ' . $component['long_name'];
            } elseif ( in_array( 'locality', $types, true ) ) {
                $components['city'] = $component['long_name'];
            } elseif ( in_array( 'administrative_area_level_1', $types, true ) ) {
                $components['state'] = $component['long_name'];
            } elseif ( in_array( 'country', $types, true ) ) {
                $components['country'] = $component['long_name'];
            } elseif ( in_array( 'postal_code', $types, true ) ) {
                $components['zip'] = $component['long_name'];
            }
        }

        $response = array(
            'formatted_address' => $result['formatted_address'],
            'latitude'          => $result['geometry']['location']['lat'],
            'longitude'         => $result['geometry']['location']['lng'],
            'components'        => $components,
        );

        return $response;
    }
}

new GeoLocation();
