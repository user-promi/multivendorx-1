<?php

namespace MultiVendorX\Geolocation;
use MultiVendorX\Utill;
class StoreGeolocation {

    private $store_id;
    private $store;

    public function __construct( $store_id ) {
        $this->store_id = $store_id;
        $this->store    = new \MultiVendorX\Store\Store( $store_id );
    }

    // Standardized meta fields - both location_address and address for compatibility
    private $meta_fields = array(
        'location_address' => 'store_location_address',
        'address'          => 'store_address', // Keep both for compatibility
        'location_lat'     => 'store_location_lat',
        'location_lng'     => 'store_location_lng',
        'city'             => 'store_city',
        'state'            => 'store_state',
        'country'          => 'store_country',
        'zip'              => 'store_zip',
        'timezone'         => 'store_timezone',
    );

    public function get_data() {
        $data = array();
        foreach ( $this->meta_fields as $field => $meta_key ) {
            $data[ $field ] = $this->store->get_meta( $meta_key ) ?? '';
        }

        // Ensure both address fields are populated
        if ( empty( $data['location_address'] ) && ! empty( $data['address'] ) ) {
            $data['location_address'] = $data['address'];
        }
        if ( empty( $data['address'] ) && ! empty( $data['location_address'] ) ) {
            $data['address'] = $data['location_address'];
        }

        return $data;
    }

    public function update_data( $data ) {
        $validated_data = $this->validate_geolocation_data( $data );

        // Ensure both address fields stay in sync
        if ( isset( $validated_data['location_address'] ) && ! isset( $validated_data['address'] ) ) {
            $validated_data['address'] = $validated_data['location_address'];
        }
        if ( isset( $validated_data['address'] ) && ! isset( $validated_data['location_address'] ) ) {
            $validated_data['location_address'] = $validated_data['address'];
        }

        foreach ( $validated_data as $field => $value ) {
            if ( isset( $this->meta_fields[ $field ] ) ) {
                $meta_key = $this->meta_fields[ $field ];
                $this->store->update_meta( $meta_key, $value );
            }
        }

        $this->log( "Store {$this->store_id} geolocation data updated" );

        return true;
    }

    private function validate_geolocation_data( $data ) {
        $validated = array();

        foreach ( $data as $key => $value ) {
            switch ( $key ) {
                case 'location_lat':
                case 'location_lng':
                    if ( is_numeric( $value ) && floatval( $value ) != 0 ) {
                        $validated[ $key ] = floatval( $value );
                    } else {
                        $validated[ $key ] = '';
                    }
                    break;

                case 'location_address':
                case 'address':
                    // Ensure addresses are never empty if coordinates are set
                    if ( ! empty( $data['location_lat'] ) && empty( $value ) ) {
                        $validated[ $key ] = 'Address required';
                    } else {
                        $validated[ $key ] = sanitize_text_field( $value );
                    }
                    break;

                default:
                    $validated[ $key ] = sanitize_text_field( $value );
                    break;
            }
        }

        return $validated;
    }

    private function log( $message ) {
        // $log_file = plugin_dir_path(__FILE__) . "/geolocation-data.log";
        file_put_contents( $log_file, date( 'd/m/Y H:i:s' ) . ': ' . $message . "\n", FILE_APPEND );
    }
}
