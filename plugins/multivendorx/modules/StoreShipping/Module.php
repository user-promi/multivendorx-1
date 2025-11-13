<?php
/**
 * MultiVendorX Module class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Module class
 *
 * @class       Module
 * @version     6.0.1
 * @author      MultiVendorX
 */
class Module {
    /**
     * Container for helper classes.
     *
     * @var array
     */
    private $container = array();

    /**
     * Singleton instance.
     *
     * @var Module|null
     */
    private static $instance = null;

    /**
     * Constructor.
     */
    public function __construct() {
        // Init helper classes.
        $this->init_classes();

        // Ensure all shipping methods are loaded.
        add_action('woocommerce_shipping_init', [$this, 'include_shipping_classes']);

        // Register all detected shipping methods.
        add_filter('woocommerce_shipping_methods', [$this, 'register_shipping_methods']);
    }

    /**
     * Init helper classes.
     */
    public function init_classes() {
        $this->container['frontend'] = new Frontend();
        $this->container['admin']    = new Admin();
    }

    /**
     * Load all shipping class files dynamically.
     */
    public function include_shipping_classes() {
        $shipping_dir = __DIR__;

        // Load helper if exists.
        $helper = $shipping_dir . '/Shipping_Helper.php';
        if (file_exists($helper)) {
            include_once $helper;
        }

        // Auto-load all files that end with _Shipping.php
        foreach (glob($shipping_dir . '/*_Shipping.php') as $file) {
            include_once $file;
        }
    }

    /**
     * Register shipping methods automatically.
     */
    public function register_shipping_methods($methods) {
        $namespace = __NAMESPACE__ . '\\';

        foreach (glob(__DIR__ . '/*_Shipping.php') as $file) {
            $class_name = basename($file, '.php');
            $full_class = $namespace . $class_name;

            if (class_exists($full_class)) {
                // Instantiate temporarily to access $id.
                $instance = new $full_class();

                if (isset($instance->id)) {
                    $methods[$instance->id] = $full_class;
                }
            }
        }

        return $methods;
    }

    /**
     * Magic getter.
     */
    public function __get($class) {
        if (array_key_exists($class, $this->container)) {
            return $this->container[$class];
        }
        return new \WP_Error(sprintf('Call to unknown class %s.', $class));
    }

    /**
     * Magic setter.
     */
    public function __set($class, $value) {
        $this->container[$class] = $value;
    }

    /**
     * Singleton initializer.
     */
    public static function init() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}
