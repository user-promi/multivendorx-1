<?php

namespace MultiVendorX\ZoneShipping;
use MultiVendorX\Utill;
use WC_Data_Store;
use WC_Shipping_Zone;
use WC_Shipping_Zones;

defined('ABSPATH') || exit;

class Util {
    public static function get_zones( $store_id ) {
        $data_store = WC_Data_Store::load( 'shipping-zone' );
        $raw_zones  = $data_store->get_zones();
        $zones      = array();

        foreach ( $raw_zones as $raw_zone ) {
            $zone               = new WC_Shipping_Zone( $raw_zone );
            $enabled_methods    = $zone->get_shipping_methods( true );
            $methods_id         = wp_list_pluck( $enabled_methods, 'id' );

            if ( in_array( 'multivendorx_store_shipping', $methods_id ) ) {
                $zones[$zone->get_id()]                            = $zone->get_data();
                $zones[$zone->get_id()]['zone_id']                 = $zone->get_id();
                $zones[$zone->get_id()]['formatted_zone_location'] = $zone->get_formatted_location();
                $zones[$zone->get_id()]['shipping_methods']        = self::get_shipping_methods( $zone->get_id(), $store_id );
            }
        }
        // Everywhere zone if has method called vendor shipping
        $overall_zone       = new WC_Shipping_Zone(0);
        $enabled_methods    = $overall_zone->get_shipping_methods( true );
        $methods_id         = wp_list_pluck( $enabled_methods, 'id' );

        if ( in_array( 'multivendorx_store_shipping', $methods_id ) ) {
            $zones[$overall_zone->get_id()]                            = $overall_zone->get_data();
            $zones[$overall_zone->get_id()]['zone_id']                 = $overall_zone->get_id();
            $zones[$overall_zone->get_id()]['formatted_zone_location'] = $overall_zone->get_formatted_location();
            $zones[$overall_zone->get_id()]['shipping_methods']        = self::get_shipping_methods( $overall_zone->get_id(), $vendor_id );
        }

        return $zones;
    }

    public static function get_zone( $zone_id, $store_id ) {
        $zone = array();
        $zone_obj = WC_Shipping_Zones::get_zone_by( 'zone_id', $zone_id );
        $enabled_methods    = $zone_obj->get_shipping_methods( true );
        $methods_ids        = wp_list_pluck( $enabled_methods, 'id' );

        if ( in_array( 'multivendorx_vendor_shipping', $methods_ids ) ) {
            $zone['data']                    = $zone_obj->get_data();
            $zone['formatted_zone_location'] = $zone_obj->get_formatted_location();
            $zone['shipping_methods']        = self::get_shipping_methods( $zone_id, $store_id );
            $zone['locations']               = self::get_locations( $zone_id );
        }
        return $zone;
    }

    public static function get_shipping_methods( $zone_id, $store_id ) {
        $store = new \MultiVendorX\Store\Store( $store_id );
    
        $all_meta = $store->get_all_meta();
    
        $methods = [];
    
        foreach ( $all_meta as $key => $value ) {
            // Match keys ending with _{zone_id}
            if ( preg_match( '/_(\d+)$/', $key, $matches ) && intval($matches[1]) === $zone_id ) {
                $method_id = str_replace( '_' . $zone_id, '', $key );
    
                // Ensure $value is array (decode if JSON)
                if ( is_string( $value ) ) {
                    $value = json_decode( $value, true );
                }
    
                $methods[] = [
                    'id'       => $method_id,
                    'title'    => isset($value['title']) ? $value['title'] : $method_id,
                    'settings' => $value,
                    'enabled'  => 'yes',
                ];
            }
        }
    
        return $methods;
    }
    
    public static function get_shipping_method( $store_id, $method_id, $zone_id ) {
        $store = new \MultiVendorX\Store\Store( $store_id );
    
        // Build the meta key
        $meta_key = $method_id . '_' . $zone_id;
    
        // Get the meta value
        $settings = $store->get_meta( $meta_key );
    
        if ( empty( $settings ) ) {
            return new \WP_Error(
                'shipping_method_not_found',
                __( 'Shipping method not found.', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // Decode JSON if stored as string
        if ( is_string( $settings ) ) {
            $settings = json_decode( $settings, true );
        }
    
        return [
            'method_id' => $method_id,
            'zone_id'   => $zone_id,
            'settings'  => $settings,
            'enabled'   => 'yes', // keep previous behavior
        ];
    }
    
    public static function delete_shipping_method( $store_id, $zone_id, $method_id ) {
        $store = new \MultiVendorX\Store\Store( $store_id );
        $meta_key = $method_id . '_' . $zone_id; // Same key format as update_shipping_method
    
        // Check if the shipping method exists
        $existing = $store->get_meta( $meta_key );
        if ( ! $existing ) {
            return new \WP_Error(
                'shipping_method_not_found',
                __( 'Shipping method not found', 'multivendorx' ),
                [ 'status' => 404 ]
            );
        }
    
        // Delete the method from store meta
        $store->delete_meta( $meta_key );
    
        return true;
    }
    public static function update_shipping_method( $args ) {
        $store = new \MultiVendorX\Store\Store( $args['store_id'] );
        $meta_key = $args['method_id'] . '_' . $args['zone_id']; // key format: methodId_zoneId
        $store->update_meta( $meta_key, $args['settings'] );
    
        return [
            'method_id' => $args['method_id'],
            'zone_id'   => $args['zone_id'],
            'store_id'  => $args['store_id'],
            'settings'  => $args['settings']
        ];
    }
    
    public static function get_locations( $zone_id, $store_id = 0 ) {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['shipping_zone_locations'];

        $results = $wpdb->get_results( $wpdb->prepare("SELECT * FROM $table WHERE zone_id=%s AND store_id=%d", $zone_id, $store_id) );

        $locations = array();

        if ( $results ) {
            foreach ( $results as $key => $result ) {
                $locations[] = array(
                    'code' => $result->location_code,
                    'type' => $result->location_type
                );
            }
        }

        return $locations;
    }

    public static function save_location( $location, $zone_id, $vendor_id = 0 ) {
        global $wpdb;

        // Setup arrays for Actual Values, and Placeholders
        $values        = array();
        $place_holders = array();
        $vendor_id     = $vendor_id ? $vendor_id : apply_filters( 'mvx_current_vendor_id', get_current_user_id() );
        $table_name    = "{$wpdb->prefix}mvx_shipping_zone_locations";

        $query = "INSERT INTO {$table_name} (vendor_id, zone_id, location_code, location_type) VALUES ";

        if ( ! empty( $location ) ) {
            foreach( $location as $key => $value ) {
                array_push( $values, $vendor_id, $zone_id, $value['code'], $value['type'] );
                $place_holders[] = "('%d', '%d', '%s', '%s')";
            }

            $query .= implode(', ', $place_holders);

            $wpdb->query( $wpdb->prepare( "DELETE FROM {$table_name} WHERE zone_id=%d AND vendor_id=%d", $zone_id, $vendor_id ) );

            if ( $wpdb->query( $wpdb->prepare( wc_clean($query), $values ) ) ) {
                return true;
            }
        } else {
            if( $wpdb->query( $wpdb->prepare( "DELETE FROM {$table_name} WHERE zone_id=%d AND vendor_id=%d", $zone_id, $vendor_id ) ) ) {
                return true;
            }
        }

        return false;
    }
}