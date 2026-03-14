<?php

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Heading;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Description extends Widget_Heading {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_description';
	}

	public function get_title() {
		return __( 'Store Description', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-editor-paragraph';
	}

	public function get_categories() {
		return array( 'multivendorx' );
	}

	protected function register_controls() {
		parent::register_controls();

		$this->remove_control( 'title' );
		$this->remove_control( 'link' );

		$this->update_control(
			'header_size',
			array(
				'default' => 'p',
			)
		);
	}

	protected function render() {

		$store = $this->get_store_data();
		if ( ! $store || ! is_array( $store ) ) {
			return;
		}

		$description = ! empty( $store['storeDescription'] )
			? $store['storeDescription']
			: '';

		if ( empty( $description ) ) {
			return;
		}

		echo '<div class="multivendorx-store-description">';
		echo wp_kses_post( wpautop( $description ) );
		echo '</div>';
	}
}