<?php
namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

class Widgets {

    public function __construct() {
        add_action( 'widgets_init', array( $this, 'register_sidebar' ) );
        add_filter( 'register_block_type_args', array( $this, 'attach_sidebar_render_callback' ), 10, 2 );
        add_filter( 'block_categories_all', array( $this, 'filter_store_block_category' ), 10, 2 );
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
        <aside class="multivendorx-store-sidebar multivendorx-store-sidebar-<?php echo esc_attr( $sidebar_position ); ?>">
            <?php dynamic_sidebar( 'multivendorx-store-sidebar' ); ?>
        </aside>
        <?php
        return ob_get_clean();
    }

    /**
     * Hide MultiVendorX block category everywhere except store page
     */
    public function filter_store_block_category( $categories, $editor_context ) {

        $store_page = get_page_by_path( 'store' );

        if ( ! $store_page ) {
            return $categories;
        }

        $store_page_id = $store_page->ID;

        $current_page_id = ( $editor_context->post instanceof \WP_Post )
            ? $editor_context->post->ID
            : get_queried_object_id();

        if ( $current_page_id !== $store_page_id ) {
            $categories = array_filter(
                $categories,
                function ( $category ) {
					return $category['slug'] !== 'multivendorx-store-shop';
				}
            );
        }

        return array_values( $categories );
    }
}
