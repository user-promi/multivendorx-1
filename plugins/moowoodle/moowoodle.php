<?php
/**
 * Plugin Name: MooWoodle
 * Plugin URI: https://dualcube.com/?utm_source=wordpress.org&utm_medium=freelandingpage&utm_campaign=MooWoodleFree
 * Description: The MooWoodle plugin is an extention of WooCommerce that acts as a bridge between WordPress/Woocommerce and Moodle.
 * Author: DualCube
 * Version: 3.3.0
 * Author URI: https://dualcube.com/
 * Requires at least: 6.0.0
 * Tested up to: 6.8.1
 * WC requires at least: 8.4.0
 * WC tested up to: 9.9.5
 *
 * Text Domain: moowoodle
 * Domain Path: /languages/
 *
 * @package MooWoodle
 */

defined( 'ABSPATH' ) || exit;

// autoload classes.
require_once __DIR__ . '/vendor/autoload.php';

/**
 * Returns the main instance of the MooWoodle plugin.
 *
 * @return \MooWoodle\MooWoodle
 */
function MooWoodle() {
    return \MooWoodle\MooWoodle::init( __FILE__ );
}

MooWoodle();
