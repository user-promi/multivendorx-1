<?php
namespace MultiVendorX\GeoLocation;

class Module {
    private $container = array();
    private static $instance = null;

    public function __construct() {
        $this->init_classes();
        $this->init_hooks();
    }

    public function init_classes() {
        // Ensure classes are loaded before instantiation
        if (!class_exists('MultiVendorX\\Geolocation\\StoreGeolocation')) {
            require_once plugin_dir_path(__FILE__) . 'StoreGeolocation.php';
        }
        
        if (!class_exists('MultiVendorX\\Geolocation\\GeoLocation')) {
            require_once plugin_dir_path(__FILE__) . 'GeoLocation.php';
        }
        
        $this->container['geo_location'] = new GeoLocation();
    }

    public function init_hooks() {
        add_action('plugins_loaded', array($this, 'ensure_class_autoloading'));
    }

    public function ensure_class_autoloading() {
        // Manual class loading as fallback
        $class_files = [
            'StoreGeolocation' => 'StoreGeolocation.php',
            'GeoLocation' => 'GeoLocation.php'
        ];

        foreach ($class_files as $class_name => $file) {
            $full_class = 'MultiVendorX\\Geolocation\\' . $class_name;
            if (!class_exists($full_class)) {
                $file_path = plugin_dir_path(__FILE__) . $file;
                if (file_exists($file_path)) {
                    require_once $file_path;
                }
            }
        }
    }

    public function __get( $class ) {
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }
        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    public function __set( $class, $value ) {
        $this->container[ $class ] = $value;
    }

    public static function init() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}