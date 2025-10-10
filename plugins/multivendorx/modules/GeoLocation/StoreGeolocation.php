<?php

namespace MultiVendorX\Geolocation;

class StoreGeolocation {
    
    private $store_id;
    private $store;
    
    public function __construct($store_id) {
        $this->store_id = $store_id;
        $this->store = new \MultiVendorX\Store\Store($store_id);
    }
    
    // Use only location_address - remove the address field
    private $meta_fields = [
        'location_address' => 'store_location_address',
        'location_lat' => 'store_location_lat', 
        'location_lng' => 'store_location_lng',
        'city' => 'store_city',
        'state' => 'store_state',
        'country' => 'store_country',
        'zip' => 'store_zip',
        'timezone' => 'store_timezone'
    ];
    
    public function get_data() {
        $data = [];
        foreach ($this->meta_fields as $field => $meta_key) {
            $data[$field] = $this->store->get_meta($meta_key) ?? '';
        }
        return $data;
    }
    
    public function update_data($data) {
        $validated_data = $this->validate_geolocation_data($data);
        
        foreach ($validated_data as $field => $value) {
            if (isset($this->meta_fields[$field])) {
                $meta_key = $this->meta_fields[$field];
                $this->store->update_meta($meta_key, $value);
            }
        }
        
        $this->log("Store {$this->store_id} geolocation data updated");
        
        return true;
    }
    
    private function validate_geolocation_data($data) {
        $validated = [];
        
        foreach ($data as $key => $value) {
            switch ($key) {
                case 'location_lat':
                case 'location_lng':
                    if (is_numeric($value) && floatval($value) != 0) {
                        $validated[$key] = floatval($value);
                    } else {
                        $validated[$key] = '';
                    }
                    break;
                    
                case 'location_address':
                    // Ensure location_address is never empty if coordinates are set
                    if (!empty($data['location_lat']) && empty($value)) {
                        $validated[$key] = 'Address required';
                    } else {
                        $validated[$key] = sanitize_text_field($value);
                    }
                    break;
                    
                default:
                    $validated[$key] = sanitize_text_field($value);
                    break;
            }
        }
        
        return $validated;
    }
    
    private function log($message) {
        $log_file = plugin_dir_path(__FILE__) . "/geolocation-data.log";
        file_put_contents($log_file, date("d/m/Y H:i:s") . ": " . $message . "\n", FILE_APPEND);
    }
}