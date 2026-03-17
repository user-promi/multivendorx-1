<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Image;
use MultiVendorX\Elementor\StoreHelper;

class Store_Banner extends Widget_Image {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_banner';
	}

	public function get_title() {
		return __( 'Store Banner', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-image-box';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
            'section_image',
            array(
				'label' => __( 'Banner', 'multivendorx' ),
			)
		);

		$this->remove_control( 'caption_source' );
		$this->remove_control( 'caption' );
	}

	/**
	 * Render widget output.
	 *
	 * @return void
	 */
	protected function render() {

		$store = $this->get_store_data();
		if ( empty( $store ) || ! is_array( $store ) ) {
			return;
		}

		// Get banner from existing structure.
		$banner       = $store['storeBanner'] ?? '';

		// If banner stored as attachment ID, convert to URL.
		if ( is_numeric( $banner ) ) {
			$banner = wp_get_attachment_url( $banner );
		}

		// Get settings for width.
		$settings  = $this->get_settings_for_display();

		printf(
			'<div class="multivendorx-store-banner" style="background-image: url(%1$s);"> </div>',
			esc_url( $banner ),
		);
	}
}