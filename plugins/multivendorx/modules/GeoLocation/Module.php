<?php
namespace MultiVendorX\GeoLocation;

use MultiVendorX\GeoLocation\GooglePlaces;

class Module {
    private $container = array();
    private static $instance = null;

    public function __construct() {
        $this->init_classes();
    }

    public function init_classes() {
        $this->container['geo_location'] = new GooglePlaces();
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