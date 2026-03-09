<?php
namespace MultiVendorX\Elementor;

defined( 'ABSPATH' ) || exit;

class WidgetLoader {

	public function __construct() {
		add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );
		add_action( 'elementor/elements/categories_registered', array( $this, 'register_category' ) );
		add_action( 'elementor/dynamic_tags/register_tags', array( $this, 'register_dynamic_tags' ) );
	}

	public function register_category( $elements_manager ) {
		$elements_manager->add_category(
			'multivendorx',
			array(
				'title' => __( 'MultiVendorX Store Widgets', 'multivendorx' ),
				'icon'  => 'fa fa-store',
			)
		);
	}

	public function register_widgets( $widgets_manager ) {

		// Default widgets
		$widgets = array(
			'StoreName'        => 'MultiVendorX\Elementor\Widgets\Store_Name',
			'StoreDescription' => 'MultiVendorX\Elementor\Widgets\Store_Description',
			'StoreBanner'      => 'MultiVendorX\Elementor\Widgets\Store_Banner',
			'StoreChat'        => 'MultiVendorX\Elementor\Widgets\Store_Chat_Button',
			'StoreGetSupport'  => 'MultiVendorX\Elementor\Widgets\Store_Get_Support',
			'StoreInfo'        => 'MultiVendorX\Elementor\Widgets\Store_Info',
			'StoreLogo'        => 'MultiVendorX\Elementor\Widgets\Store_Logo',
			'StoreRating'      => 'MultiVendorX\Elementor\Widgets\Store_Rating',
			'StoreSocial'      => 'MultiVendorX\Elementor\Widgets\Store_Social',
			'StoreTab'         => 'MultiVendorX\Elementor\Widgets\Store_Tab',
		);

		/**
		 * Filter #1: Allow modules to add or modify widgets
		 * $widgets = [ 'WidgetFileName' => 'Full\Class\Name', ... ]
		 */
		$widgets = apply_filters( 'multivendorx_elementor_widgets', $widgets, $widgets_manager );

		// Loop through widgets
		foreach ( $widgets as $file => $class ) {

			// Default path
			$path = MultiVendorX()->plugin_path . 'modules/Elementor/widgets/' . $file . '.php';

			/**
			 * Filter #2: Allow modules to override widget file path
			 * $path = full path to widget PHP file
			 */
			$path = apply_filters( 'multivendorx_elementor_widget_path', $path, $file, $class );

			if ( file_exists( $path ) ) {
				require_once $path;

				if ( class_exists( $class ) ) {
					$widgets_manager->register( new $class() );
				}
			}
		}
	}

	public function register_dynamic_tags( $dynamic_tags ) {

		$dynamic_tags->register_group(
			'multivendorx',
			array(
				'title' => __( 'MultiVendorX', 'multivendorx' ),
			)
		);

		$default_tags = glob( MultiVendorX()->plugin_path . 'modules/Elementor/Tags/*.php' );

		$all_tag_files = apply_filters( 'multivendorx_elementor_tag_files', $default_tags );

		foreach ( $all_tag_files as $file ) {

			if ( ! file_exists( $file ) ) {
				continue;
			}

			require_once $file;

			// Get class name from file name
			$class_name = basename( $file, '.php' );

			// Default namespace for Elementor tags
			$full_class = '\\MultiVendorX\\Elementor\\Tags\\' . $class_name;

			// Apply filter: allow module to override class namespace if needed
			$full_class = apply_filters( 'multivendorx_elementor_tag_class', $full_class, $class_name, $file );

			// Register the dynamic tag
			if ( class_exists( $full_class ) ) {
				$dynamic_tags->register( new $full_class() );
			}
		}
	}
}
