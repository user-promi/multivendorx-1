<?php
/**
 * Admin class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Admin class
 *
 * @class       Admin class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Admin constructor.
     */
    public function __construct() {
        // admin pages manu and submenu.
        add_action( 'admin_menu', array( $this, 'add_menus' ), 10 );
        // admin script and style.
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );

        // create custom column.
        add_action( 'manage_edit-product_columns', array( $this, 'display_subscriber_header' ) );
        // manage notifima column.
        add_action( 'manage_product_posts_custom_column', array( $this, 'display_subscriber_count_in_column' ), 10, 2 );

        // show number of subscribers for individual product.
        add_action( 'woocommerce_product_options_inventory_product_data', array( $this, 'display_product_subscriber_count_in_metabox' ), 10 );
        add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'display_product_subscriber_count_in_variation_metabox' ), 10, 3 );

        // bulk action to remove subscribers.
        add_filter( 'bulk_actions-edit-product', array( $this, 'register_subscribers_bulk_actions' ) );
        add_filter( 'handle_bulk_actions-edit-product', array( $this, 'subscribers_bulk_action_handler' ), 10, 3 );
        add_action( 'admin_notices', array( $this, 'subscribers_bulk_action_admin_notice' ) );

        // Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_notifima_redirect_host' ) );
        // For loco translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
    }

    /**
     * Add options page.
     */
    public function add_menus() {
        if ( is_admin() ) {
            add_menu_page(
                'Notifima',
                'Notifima',
                'manage_options',
                'notifima',
                array( $this, 'create_setting_page' ),
                'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMTA1OS41NSAxMDc4Ljk1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDU5LjU1IDEwNzguOTU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMWQyMzI3O30KCS5zdDF7ZmlsbDojZmZmO30KPC9zdHlsZT4KPGc+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzYyLjUsNDc5LjQ0Yy0xMTYuNTksMC0xOTMuODEsNzcuMjItMTkzLjgxLDIwNy44NWMwLDEzMC42LDc3LjIyLDIwNy44NSwxOTMuODEsMjA3Ljg1CgkJYzExNy45NiwwLDE5NS4yMS03Ny4yNSwxOTUuMjEtMjA3Ljg1QzU1Ny43Miw1NTYuNjUsNDgwLjQ3LDQ3OS40NCwzNjIuNSw0NzkuNDR6Ii8+CgkKCQk8ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCgwLjcwNzEgLTAuNzA3MSAwLjcwNzEgMC43MDcxIDk0LjE1NzIgNjU5LjM1NDkpIiBjbGFzcz0ic3QwIiBjeD0iODQyLjk5IiBjeT0iMjE2LjAyIiByeD0iOTIuMTMiIHJ5PSI5Mi4xMyIvPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTM2My45MSwzMjQuOTRDMTQ2LjIsMzI0Ljk0LDAuMTYsNDcwLjk4LDAuMTYsNjg4LjY2djM5MC4yOWM0My44Ni0zMy40Myw4Ny43Mi02Ni44NywxMzEuNTgtMTAwLjMKCQljMzIuMTcsMjEuNDcsMTIxLjQ0LDc0Ljg0LDI0NC44MSw3MC45OGM0MS44NS0xLjMxLDE0My45OC02LDIzMS45OS04Mi4wNkM3MjYuNDYsODY1LjY3LDcyNi4yNSw3MTUuOCw3MjYuMjUsNjg1Ljg1CgkJQzcyNi4yNSw0NjkuNTgsNTgwLjE4LDMyNC45NCwzNjMuOTEsMzI0Ljk0eiBNMzYyLjUsODk1LjEzYy0xMTYuNTksMC0xOTMuODEtNzcuMjUtMTkzLjgxLTIwNy44NQoJCWMwLTEzMC42Myw3Ny4yMi0yMDcuODUsMTkzLjgxLTIwNy44NWMxMTcuOTYsMCwxOTUuMjEsNzcuMjIsMTk1LjIxLDIwNy44NUM1NTcuNzIsODE3Ljg4LDQ4MC40Nyw4OTUuMTMsMzYyLjUsODk1LjEzeiIvPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTg0Mi45OSwxLjA1Yy0xMTguNzIsMC0yMTQuOTcsOTYuMjQtMjE0Ljk3LDIxNC45N2MwLDExOC43Miw5Ni4yNSwyMTQuOTcsMjE0Ljk3LDIxNC45NwoJCWMxMTguNzIsMCwyMTQuOTctOTYuMjQsMjE0Ljk3LTIxNC45N0MxMDU3Ljk2LDk3LjMsOTYxLjcxLDEuMDUsODQyLjk5LDEuMDV6IE04NDIuOTksMzA4LjE1Yy01MC44OCwwLTkyLjEzLTQxLjI1LTkyLjEzLTkyLjEzCgkJYzAtNTAuODgsNDEuMjUtOTIuMTMsOTIuMTMtOTIuMTNjNTAuODgsMCw5Mi4xMyw0MS4yNSw5Mi4xMyw5Mi4xM0M5MzUuMTIsMjY2LjksODkzLjg3LDMwOC4xNSw4NDIuOTksMzA4LjE1eiIvPgo8L2c+Cjwvc3ZnPgo=',
                50
            );

            $pro_sticker = ! Utill::is_khali_dabba() ?
            '<span 
                class="notifima-pro-tag"
                style="
                font-size: 0.5rem;
                background: #e35047;
                padding: 0.125rem 0.5rem;
                color: #F9F8FB;
                font-weight: 700;
                line-height: 1;
                position: absolute;
                margin-left: 0.25rem;
                border-radius: 2rem 0;
                top: 50%;
                transform: translateY(-50%);
                "
            > Pro </span>' : '';

            // Array contain notifima submenu.
            $submenus = array(
                'settings'          => array(
                    'name'   => __( 'Settings', 'notifima' ),
                    'subtab' => 'appearance',
                ),
                'subscribers-list'  => array(
                    'name'   => __( 'Subscriber List', 'notifima' ) . $pro_sticker,
                    'subtab' => '',
                ),
                'inventory-manager' => array(
                    'name'   => __( 'Inventory Manager', 'notifima' ) . $pro_sticker,
                    'subtab' => '',
                ),
            );

            foreach ( $submenus as $slug => $submenu ) {
                // prepare subtab if subtab is exist.
                $subtab = '';

                if ( $submenu['subtab'] ) {
                    $subtab = '&subtab=' . $submenu['subtab'];
                }

                add_submenu_page(
                    'notifima',
                    $submenu['name'],
                    "<span style='position: relative; display: block; width: 100%;' class='admin-menu'>" . $submenu['name'] . '</span>',
                    'manage_options',
                    'notifima#&tab=' . $slug . $subtab,
                    '_-return_null'
                );
            }

            // Register upgrade to pro submenu page.
            if ( ! Utill::is_khali_dabba() ) {
                add_submenu_page(
                    'notifima',
                    __( 'Upgrade to Pro', 'notifima' ),
                    '<style>
                        a:has(.upgrade-to-pro){
                            background: #65438f !important;
                            color: White !important;
                        };
                    </style>
                    <div class="upgrade-to-pro"><i class="dashicons dashicons-awards"></i>' . esc_html__( 'Upgrade to Pro', 'notifima' ) . '</div> ',
                    'manage_options',
                    '',
                    array( self::class, 'handle_external_redirects' )
                );
            }

            remove_submenu_page( 'notifima', 'notifima' );
        }
    }

    /**
     * Create empty div. React root from here.
     *
     * @return void
     */
    public function create_setting_page() {
        echo '<div id="admin-main-wrapper"></div>';
    }

    /**
     * Register bulk action in 'all product' table.
     *
     * @param  mixed $bulk_actions bulk actions.
     * @return mixed
     */
    public function register_subscribers_bulk_actions( $bulk_actions ) {
        $bulk_actions['remove_subscribers'] = __( 'Remove Subscribers', 'notifima' );

        return $bulk_actions;
    }

    /**
     * Bulk action handler function.
     *
     * @param  mixed $redirect_to redirect link.
     * @param  mixed $doaction the action of bulk action.
     * @param  mixed $post_ids Array of post IDs.
     * @return mixed
     */
    public function subscribers_bulk_action_handler( $redirect_to, $doaction, $post_ids ) {
        if ( 'remove_subscribers' !== $doaction ) {
            return $redirect_to;
        }
        foreach ( $post_ids as $post_id ) {
            $product_ids = Subscriber::get_related_product( wc_get_product( $post_id ) );
            foreach ( $product_ids as $product_id ) {
                $emails = Subscriber::get_product_subscribers_email( $product_id );
                foreach ( $emails as $alert_id => $to ) {
                    Subscriber::update_subscriber( $alert_id, 'unsubscribed' );
                }
                delete_post_meta( $product_id, 'no_of_subscribers' );
            }
        }
        $redirect_to = add_query_arg( 'bulk_remove_subscribers', count( $post_ids ), $redirect_to );

        return $redirect_to;
    }

    /**
     * Set Admin notice in time of bulk action.
     *
     * @return void
     */
    public function subscribers_bulk_action_admin_notice() {
        if ( ! empty( filter_input( INPUT_POST, 'bulk_remove_subscribers', FILTER_SANITIZE_NUMBER_INT ) ) ) {
            $bulk_remove_count = filter_input( INPUT_POST, 'bulk_remove_subscribers', FILTER_SANITIZE_NUMBER_INT );
            // Translators: This message is to display removed subscribers count for the product.
            printf( '<div id="message" class="updated fade"><p>' . esc_html( _n( 'Removed subscribers from %s product.', 'Removed subscribers from %s products.', $bulk_remove_count, 'notifima' ) ) . '</p></div>', esc_html( $bulk_remove_count ) );
        }
    }

    /**
     * Enqueue JavaScript for admin fronend page and localize script.
     *
     * @return void
     */
    public function enqueue_admin_script() {
        if ( get_current_screen()->id === 'toplevel_page_notifima' ) {
            wp_enqueue_script( 'wp-element' );

            FrontendScripts::admin_load_scripts();
            FrontendScripts::enqueue_script( 'notifima-components-script' );
            FrontendScripts::enqueue_script( 'notifima-admin-script' );
			FrontendScripts::enqueue_style( 'notifima-components-style' );
			FrontendScripts::enqueue_style( 'notifima-style' );
			FrontendScripts::localize_scripts( 'notifima-admin-script' );
        }

        FrontendScripts::enqueue_style( 'notifima-admin-style' );
    }

    /**
     * Custom column addition.
     *
     * @param array $columns Existing column headers.
     * @return array Modified column headers.
     */
    public function display_subscriber_header( $columns ) {
        return array_merge( $columns, array( 'product_subscriber' => __( 'Interested Person( s )', 'notifima' ) ) );
    }

    /**
     * Manage custom column for Notifima.
     *
     * @param string $column_name The name of the column to display.
     * @param int    $post_id     The current post ID.
     */
    public function display_subscriber_count_in_column( $column_name, $post_id ) {
        if ( 'product_subscriber' === $column_name ) {
            $no_of_subscriber = get_post_meta( $post_id, 'no_of_subscribers', true );
            echo '<div class="product-subscribtion-column">' . esc_html( ( isset( $no_of_subscriber ) && $no_of_subscriber > 0 ) ? $no_of_subscriber : 0 ) . '</div>';
        }
    }

    /**
     * Notifima news on Product edit page ( simple ).
     */
    public function display_product_subscriber_count_in_metabox() {
        global $post;
        $product = wc_get_product( $post->ID );
        if ( Subscriber::is_product_outofstock( $product ) ) {
            $no_of_subscriber = $product->get_meta( 'no_of_subscribers', true );
            ?>
            <p class="form-field">
                <label class=""><?php esc_attr_e( 'Number of Interested Person( s )', 'notifima' ); ?></label>
                <span class="no-subscriber"><?php echo esc_html( ( isset( $no_of_subscriber ) && $no_of_subscriber > 0 ) ? $no_of_subscriber : 0 ); ?></span>
            </p>
            <?php
        }
    }

    /**
     * Notifima news on Product edit page (variable product).
     *
     * Displays the subscriber count inside each variation metabox on the product edit page.
     *
     * @param int     $loop            The index of the current variation loop.
     * @param array   $variation_data  The data array for the current variation.
     * @param WP_Post $variation       The WP_Post object for the variation.
     */
    public function display_product_subscriber_count_in_variation_metabox( $loop, $variation_data, $variation ) {
        $product = wc_get_product( $variation->ID );
        if ( Subscriber::is_product_outofstock( $product ) ) {
            $product_subscriber = $product->get_meta( 'no_of_subscribers', true );
            ?>
            <p class="form-row form-row-full interested-person">
                <label class="stock-label"><?php esc_attr_e( 'Number of Interested Person( s ) : ', 'notifima' ); ?></label>
                <div class="variation-no-subscriber"><?php echo esc_html( ( isset( $product_subscriber ) && $product_subscriber > 0 ) ? $product_subscriber : 0 ); ?></div>
            </p>
            <?php
        }
    }

    /**
     * Filters the relative path for the plugin's textdomain.
     *
     * This method can be used to adjust the location where translation files are loaded from.
     *
     * @param string $path Relative path to the .mo file.
     * @param string $url  URL to the .mo file.
     * @return string Modified path.
     */
    public function textdomain_relative_path( $path, $url ) {

        if ( strpos( $url, 'woocommerce-product-stock-alert' ) !== false ) {
            foreach ( Notifima()->block_paths as $key => $new_path ) {
                if ( strpos( $url, $key ) !== false ) {
                    $path = $new_path;
                }
            }

            if ( strpos( $url, 'block' ) === false ) {
                $path = 'build/index.js';
            }
        }

        return $path;
    }

    /**
	 * Redirct to pro shop url.
     *
	 * @return never
	 */
	public static function handle_external_redirects() {
		wp_safe_redirect( esc_url_raw( NOTIFIMA_PRO_SHOP_URL ) );
		exit;
	}

    /**
     * Allow Notifima domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with Notifima domain included.
     */
    public function allow_notifima_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( NOTIFIMA_PRO_SHOP_URL );

        if ( isset( $parsed_url['host'] ) ) {
            $hosts[] = $parsed_url['host'];
        }

        return $hosts;
    }
}
