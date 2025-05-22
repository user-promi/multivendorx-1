<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class Block {

    private $blocks;

    public function __construct() {
        $this->blocks = $this->initialize_blocks();
        // Register the block
        add_action( 'init', array( $this, 'register_blocks' ) );
        // Enqueue the script and style for block editor
        add_action( 'enqueue_block_assets', array( $this, 'enqueue_all_block_assets' ) );
    }

    public static function get_build_path_name(){
        if(Notifima()->is_dev) return "release/assets/";
        return "assets/";
    }

    public function initialize_blocks() {
        $blocks = array();

        $blocks[] = array(
            'name'       => 'stock-notification-block', // block name
            'textdomain' => 'notifima',
            'block_path' => Notifima()->plugin_path . self::get_build_path_name() . 'block/',
        );

        Notifima()->block_paths += array(
            'block/stock-notification-block' => self::get_build_path_name() . 'block/stock-notification-block/index.js',
        );

        return apply_filters( 'notifima_initialize_blocks', $blocks );
    }

    public function enqueue_all_block_assets() {
        FrontendScripts::load_scripts();
        foreach ( $this->blocks as $block_script ) {
            FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-editor-script' );
            FrontendScripts::localize_scripts( $block_script['textdomain'] . '-' . $block_script['name'] . '-script' );
        }
    }

    public function register_blocks() {

        foreach ( $this->blocks as $block ) {
            register_block_type( $block['block_path'] . $block['name'] );
        }
    }
}
