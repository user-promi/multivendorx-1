<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class Admin {

    public $settings;

    public function __construct() {
        // admin pages manu and submenu
        add_action( 'admin_menu', array( $this, 'add_settings_page' ), 100 );
        // admin script and style
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );

        // create custom column
        add_action( 'manage_edit-product_columns', array( $this, 'set_custom_column_header' ) );
        // manage notifima column
        add_action( 'manage_product_posts_custom_column', array( $this, 'display_subscriber_count_in_custom_column' ), 10, 2 );

        // show number of subscribers for individual product
        add_action( 'woocommerce_product_options_inventory_product_data', array( $this, 'display_product_subscriber_count_in_metabox' ), 10 );
        add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'display_product_subscriber_count_in_variation_metabox' ), 10, 3 );

        // bulk action to remove subscribers
        add_filter( 'bulk_actions-edit-product', array( $this, 'register_subscribers_bulk_actions' ) );
        add_filter( 'handle_bulk_actions-edit-product', array( $this, 'subscribers_bulk_action_handler' ), 10, 3 );
        add_action( 'admin_notices', array( $this, 'subscribers_bulk_action_admin_notice' ) );
        add_action( 'admin_print_styles-plugins.php', array( $this, 'admin_plugin_page_style' ) );

        // For translation
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
    }

    /**
     * Add options page
     */
    public function add_settings_page() {
        $pro_sticker = apply_filters( 'is_notifima_pro_inactive', true ) ?
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
            right: 0.25rem;
            top: 50%;
            transform: translateY(-50%);
            "
        > Pro </span>' : '';

        add_menu_page(
            'Notifima',
            'Notifima',
            'manage_options',
            'notifima',
            array( $this, 'create_setting_page' ),
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGcgZmlsbD0iI2E3YWFhZCIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPHBhdGggZD0iTTE5LjksNS43YzAuMiwwLjktMC4zLDEuOC0xLjEsMmMtMC4yLDAuMS0wLjUsMC4xLTAuNywwYy0wLjYtMC4xLTEuMS0wLjUtMS4zLTEuMiAgICBjLTAuMi0wLjYsMC0xLjIsMC40LTEuNmMwLjItMC4yLDAuNC0wLjMsMC43LTAuNEMxOC44LDQuMywxOS43LDQuOCwxOS45LDUuN3ogTTE3LjgsOC45bC0zLjIsOS45Yy0wLjIsMC41LTAuNywwLjctMS4yLDAuNgogICAgICAgICAgICBMMC42LDE1LjJDMC4xLDE1LTAuMSwxNC41LDAsMTRMNC4zLDEuMmMwLjItMC41LDAuNy0wLjcsMS4yLTAuNkwxNiw0LjFjLTAuNSwwLjctMC43LDEuNy0wLjUsMi42QzE1LjgsNy45LDE2LjcsOC43LDE3LjgsOC45egogICAgICAgICAgICBNMTAuOCw0LjljMC41LDAuMiwxLDAuNSwxLjUsMC43YzAuMi0wLjQsMC0wLjktMC40LTEuMUMxMS40LDQuNCwxMSw0LjUsMTAuOCw0Ljl6IE05LjUsMTUuMmMtMC45LTAuMS0xLjctMC4yLTIuNi0wLjIKICAgICAgICAgICAgYzAuMSwwLjcsMC42LDEuMiwxLjIsMS4yQzguNywxNi4yLDkuMywxNS44LDkuNSwxNS4yeiBNMTIuNyw5YzAtMS43LTEuNC0zLjEtMy4xLTMuMmMtMS4yLDAtMi4yLDAuNS0yLjgsMS41CiAgICAgICAgICAgIGMtMC42LDAuOS0xLjEsMS44LTEuNywyLjdjLTAuMSwwLjEtMC4yLDAuMi0wLjMsMC4xYy0wLjUtMC4yLTAuOCwwLTEuMSwwLjZjLTAuMiwwLjQsMCwwLjgsMC40LDFjMC43LDAuNCwxLjQsMC43LDIuMiwxLjEKICAgICAgICAgICAgYzEuNCwwLjcsMi44LDEuNCw0LjIsMi4xYzAuNCwwLjIsMC44LDAuMSwxLjEtMC40YzAtMC4xLDAuMS0wLjEsMC4xLTAuMmMwLjEtMC4zLDAtMC43LTAuMy0wLjljLTAuMi0wLjEtMC4yLTAuMi0wLjEtMC40CiAgICAgICAgICAgIGMwLjQtMSwwLjgtMiwxLjEtM0MxMi43LDkuNywxMi43LDksMTIuNyw5eiIvPjwvZz48L3N2Zz4=',
            50
        );

        add_submenu_page(
            'notifima',
            __( 'Settings', 'notifima' ),
            __( 'Settings', 'notifima' ),
            'manage_options',
            'notifima#&tab=settings&subtab=appearance',
            '__return_null'
        );

        add_submenu_page(
            'notifima',
            __( 'Subscriber List', 'notifima' ),
            // Translators: Subscriber list with a pro sticker.Variable $pro_sticker contains the sticker text.
            __( 'Subscriber List ', 'notifima' ) . $pro_sticker,
            'manage_woocommerce',
            'notifima#&tab=subscribers-list',
            '__return_null'
        );

        add_submenu_page(
            'notifima',
            __( 'Inventory Manager', 'notifima' ),
            // Translators: Inventory Manager list with a pro sticker.Variable $pro_sticker contains the sticker text.
            __( 'Inventory Manager', 'notifima' ) . $pro_sticker,
            'manage_woocommerce',
            'notifima#&tab=manage-stock',
            '__return_null'
        );

        remove_submenu_page( 'notifima', 'notifima' );
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
     * @param  mixed $bulk_actions
     * @return mixed
     */
    public function register_subscribers_bulk_actions( $bulk_actions ) {
        $bulk_actions['remove_subscribers'] = __( 'Remove Subscribers', 'notifima' );

        return $bulk_actions;
    }

    /**
     * Bulk action handler function.
     *
     * @param  mixed $redirect_to
     * @param  mixed $doaction
     * @param  mixed $post_ids
     * @return mixed
     */
    public function subscribers_bulk_action_handler( $redirect_to, $doaction, $post_ids ) {
        if ( $doaction !== 'remove_subscribers' ) {
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
            // Translators: This message is to display removed subscribers count for the product
            printf( '<div id="message" class="updated fade"><p>' . esc_html( _n( 'Removed subscribers from %s product.', 'Removed subscribers from %s products.', $bulk_remove_count, 'notifima' ) ) . '</p></div>', esc_html( $bulk_remove_count ) );
        }
    }

    /**
     * Set style for admin's setting pages.
     *
     * @return void
     */
    public function admin_plugin_page_style() {
        ?>
        <style>
            a.notifima-pro-plugin {
                font-weight: 700;
                background: linear-gradient( 110deg, rgb( 63, 20, 115 ) 0%, 25%, rgb( 175 59 116 ) 50%, 75%, rgb( 219 75 84 ) 100% );
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            } 
            a.notifima-pro-plugin:hover {
                background: #3f1473;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            } 
        </style>
        <?php
    }

    /**
     * Enqueue JavaScript for admin fronend page and localize script.
     *
     * @return void
     */
    public function enqueue_admin_script() {
        if ( get_current_screen()->id == 'toplevel_page_notifima' ) {
            wp_enqueue_script( 'wp-element' );

            FrontendScripts::admin_load_scripts();
            FrontendScripts::enqueue_script( 'notifima-components-script' );
            FrontendScripts::enqueue_script( 'notifima-admin-script' );
			FrontendScripts::enqueue_style( 'notifima-components-style' );
			FrontendScripts::enqueue_style( 'notifima-style' );
			FrontendScripts::localize_scripts( 'notifima-admin-script' );
        }

        FrontendScripts::enqueue_style( 'notifima-admin-style' );
        error_log( 'all enque finished' );
    }

    /**
     * Custom column addition
     */
    public function set_custom_column_header( $columns ) {
        return array_merge( $columns, array( 'product_subscriber' => __( 'Interested Person( s )', 'notifima' ) ) );
    }

    /**
     * Manage custom column for Notifima
     */
    public function display_subscriber_count_in_custom_column( $column_name, $post_id ) {
        if ( $column_name == 'product_subscriber' ) {
            $no_of_subscriber = get_post_meta( $post_id, 'no_of_subscribers', true );
            echo '<div class="product-subscribtion-column">' . esc_html( ( isset( $no_of_subscriber ) && $no_of_subscriber > 0 ) ? $no_of_subscriber : 0 ) . '</div>';
        }
    }

    /**
     * Notifima news on Product edit page ( simple )
     */
    public function display_product_subscriber_count_in_metabox() {
        global $post;

        if ( Subscriber::is_product_outofstock( wc_get_product( $post->ID ) ) ) {
            $no_of_subscriber = get_post_meta( $post->ID, 'no_of_subscribers', true );
            ?>
            <p class="form-field _stock_field">
                <label class=""><?php esc_attr_e( 'Number of Interested Person( s )', 'notifima' ); ?></label>
                <span class="no_subscriber"><?php echo esc_html( ( isset( $no_of_subscriber ) && $no_of_subscriber > 0 ) ? $no_of_subscriber : 0 ); ?></span>
            </p>
            <?php
        }
    }

    /**
     * Notifima news on Product edit page ( variable )
     */
    public function display_product_subscriber_count_in_variation_metabox( $loop, $variation_data, $variation ) {
        if ( Subscriber::is_product_outofstock( wc_get_product( $variation->ID ) ) ) {
            $product_subscriber = get_post_meta( $variation->ID, 'no_of_subscribers', true );
            ?>
            <p class="form-row form-row-full interested_person">
                <label class="stock_label"><?php esc_attr_e( 'Number of Interested Person( s ) : ', 'notifima' ); ?></label>
                <div class="variation_no_subscriber"><?php echo esc_html( ( isset( $product_subscriber ) && $product_subscriber > 0 ) ? $product_subscriber : 0 ); ?></div>
            </p>
            <?php
        }
    }

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
}
