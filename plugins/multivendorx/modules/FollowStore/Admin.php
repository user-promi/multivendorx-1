<?php
namespace MultiVendorX\FollowStore;

defined( 'ABSPATH' ) || exit;

class Admin {

    public function __construct() {

        add_filter( 'multivendorx_elementor_widgets', array( $this, 'add_follow_store_widget' ), 10, 2 );
        add_filter( 'multivendorx_elementor_widget_path', array( $this, 'override_follow_store_path' ), 10, 3 );
        add_filter( 'multivendorx_elementor_tag_files', array( $this, 'add_follow_store_tags' ), 10, 1 );
        add_filter( 'multivendorx_elementor_tag_class', array( $this, 'override_follow_store_tag_class' ), 10, 3 );
    }

    public function add_follow_store_widget( $widgets, $widgets_manager ) {
        $widgets['StoreFollow'] = 'MultiVendorX\FollowStore\Widgets\Store_Follow_Button';
        return $widgets;
    }

    public function override_follow_store_path( $path, $file, $class ) {
        if ( $file === 'StoreFollow' ) {
            $path = MultiVendorX()->plugin_path . 'modules/FollowStore/widgets/' . $file . '.php';
        }
        return $path;
    }

    /**
     * Add Follow Store tag files to Elementor
     *
     * @param array $tag_files Existing tag files
     * @return array Modified tag files
     */
    public function add_follow_store_tags( $tag_files ) {
        $follow_tags_path = MultiVendorX()->plugin_path . 'modules/FollowStore/Tags/';

        if ( is_dir( $follow_tags_path ) ) {
            foreach ( glob( $follow_tags_path . '*.php' ) as $file ) {
                $tag_files[] = $file;
            }
        }

        return $tag_files;
    }

    /**
     * Override namespace for Follow Store tag classes
     *
     * @param string $full_class Default class namespace
     * @param string $class_name Class name derived from file
     * @param string $file File path of the tag
     * @return string Modified class namespace
     */
    public function override_follow_store_tag_class( $full_class, $class_name, $file ) {
        if ( strpos( $file, 'StoreFollow' ) !== false ) {
            $full_class = '\\MultiVendorX\\FollowStore\\Tags\\' . $class_name;
        }
        return $full_class;
    }
}