<?php
namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

class Widgets {

    public function __construct() {
        add_action( 'widgets_init', array( $this, 'register_sidebar' ) );
        add_filter( 'register_block_type_args', array( $this, 'attach_sidebar_render_callback' ), 10, 2 );
        add_filter( 'allowed_block_types_all', array( $this, 'restrict_store_blocks' ),10,2); 
    }

    /**
     * Register classic widget sidebar
     */
    public function register_sidebar() {
        register_sidebar(
            array(
				'name'          => __( 'MultiVendorX Store Sidebar', 'multivendorx' ),
				'id'            => 'multivendorx-store-sidebar',
				'description'   => __( 'Widgets for MultiVendorX store pages only.', 'multivendorx' ),
				'before_widget' => '<div class="multivendorx-widget %2$s">',
				'after_widget'  => '</div>',
				'before_title'  => '<h3 class="multivendorx-widget-title">',
				'after_title'   => '</h3>',
            )
        );
    }

    public function attach_sidebar_render_callback( $args, $block_type ) {
        if ( isset( $block_type ) && $block_type === 'multivendorx/store-sidebar' ) {
            $args['render_callback'] = array( $this, 'render_sidebar' );
        }

        return $args;
    }


    /**
     * Render sidebar output (used by block templates)
     */
    public function render_sidebar() {
        if ( ! is_active_sidebar( 'multivendorx-store-sidebar' ) ) {
            return '';
        }
        $sidebar_position_setting = MultiVendorX()->setting->get_setting( 'store_sidebar', array() );
        $sidebar_position         = is_array( $sidebar_position_setting ) ? reset( $sidebar_position_setting ) : $sidebar_position_setting;

        ob_start();
        ?>
        <aside class="multivendorx-store-sidebar <?php echo esc_attr( $sidebar_position ); ?>">
            <?php dynamic_sidebar( 'multivendorx-store-sidebar' ); ?>
        </aside>
        <?php
        return ob_get_clean();
    }

    /**
     * Restrict MultiVendorX store blocks outside store page
     */
    public function restrict_store_blocks( $allowed_blocks, $editor_context ) {

        $restricted_category = 'multivendorx-store-shop';

        // If we are on store page → allow everything
        if ( Utill::is_store_page() ) {
            return $allowed_blocks;
        }

        $registry   = \WP_Block_Type_Registry::get_instance();
        $all_blocks = $registry->get_all_registered();
        $filtered   = array();

        foreach ( $all_blocks as $block_name => $block_type ) {

            $category = $block_type->category ?? '';

            if ( $category === $restricted_category ) {
                continue;
            }

            $filtered[] = $block_name;
        }

        return $filtered;
    }
}
