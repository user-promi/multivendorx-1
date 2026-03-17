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

		$this->update_control(
            'image',
            array(
				'dynamic'   => array(
					'default' => \Elementor\Plugin::instance()
								->dynamic_tags
								->tag_data_to_tag_text( null, 'multivendorx-store-banner' ),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-widget-container > .elementor-image > img' => 'width: 100%;',
				),
			),
            array(
				'recursive' => true,
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
		$width     = isset( $settings['width']['size'] ) ? $settings['width']['size'] . $settings['width']['unit'] : '100%';
		$max_width = isset( $settings['image_max_width']['size'] ) ? $settings['image_max_width']['size'] . $settings['image_max_width']['unit'] : '100%';
		$alignment = isset( $settings['align'] ) ? $settings['align'] : 'center';

		printf(
			'<div class="multivendorx-store-banner" style="text-align: %4$s;">
				<img class="multivendorx-store-banner-img" src="%1$s" alt="%2$s" style="width: %5$s; max-width: %6$s;" />
			</div>',
			esc_url( $banner ),
			esc_attr( $store['storeName'] ?? '' ),
			esc_attr( $store['storeName'] ?? '' ),
			esc_attr( $alignment ),
			esc_attr( $width ),
			esc_attr( $max_width )
		);
	}
}
