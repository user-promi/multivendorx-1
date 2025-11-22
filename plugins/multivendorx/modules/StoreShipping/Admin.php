<?php
namespace MultiVendorX\StoreShipping;

class Admin {

    public function __construct() {
        add_filter( 'multivendorx_get_all_store_zones', [ $this, 'get_all_store_shipping_zones' ] );
    }

    /**
     * Returns all WooCommerce shipping zones in your required format.
     */
    public function get_all_store_shipping_zones( $zones = [] ) {

        $shipping_zones = \WC_Shipping_Zones::get_zones();
        $formatted = [];
    
        foreach ( $shipping_zones as $zone ) {
    
            $zone_id   = $zone['id'] ?? 0;
            $zone_name = $zone['zone_name'] ?? '';
    
            // Get shipping methods for this zone
            $wc_zone = new \WC_Shipping_Zone( $zone_id );
            $methods = $wc_zone->get_shipping_methods();
            $has_mvx_store_shipping = false;
    
            foreach ( $methods as $method ) {
                if ( $method->id === 'multivendorx_store_shipping' ) {
                    $has_mvx_store_shipping = true;
                    break;
                }
            }
    
            // Skip zones that do NOT have this method
            if ( ! $has_mvx_store_shipping ) {
                continue;
            }
    
            // Include only allowed zones
            $formatted[] = [
                'name' => $zone_name,
                'url'  => admin_url( 'admin.php?page=wc-settings&tab=shipping&zone_id=' . $zone_id ),
            ];
        }
    
        return $formatted;
    }    
}
