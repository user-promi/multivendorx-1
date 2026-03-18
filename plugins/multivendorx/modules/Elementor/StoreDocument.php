<?php
/**
 * Elementor Store Document
 *
 * Provides a custom Elementor document type for MultiVendorX store pages.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Core\Base\Document;

/**
 * StoreDocument class.
 */
class StoreDocument extends Document {

	/**
	 * Get document properties.
	 *
	 * @return array
	 */
	public static function get_properties() {
		$properties                    = parent::get_properties();
		$properties['support_kit']     = true;
		$properties['show_in_library'] = true;
		$properties['cpt']             = array( 'elementor_library' );
		return $properties;
	}

	/**
	 * Get document name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'multivendorx-store';
	}

	/**
	 * Get document title.
	 *
	 * @return string
	 */
	public static function get_title() {
		return __( 'Store Page', 'multivendorx' );
	}

	/**
	 * Get document type plural label.
	 *
	 * @return string
	 */
	public static function get_plural_title() {
		return __( 'Store Pages', 'multivendorx' );
	}

	/**
	 * Get CSS wrapper selector.
	 *
	 * @return string
	 */
	public function get_css_wrapper_selector() {
		return 'body.store-page';
	}

	/**
	 * Register controls for the document.
	 *
	 * Calls parent registration.
     * @phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found
     *
	 * @return void
	 */
	protected function register_controls() {
		parent::register_controls();
	}
}
