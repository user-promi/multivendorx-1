<?php
/**
 * Admin class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Admin class
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

        // Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_multivendorx_redirect_host' ) );
        // For loco translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
    }

    /**
     * Add options page.
     */
    public function add_menus() {
        if ( is_admin() ) {
            add_menu_page(
                'MultiVendorX',
                'MultiVendorX',
                'manage_options',
                'multivendorx',
                array( $this, 'create_setting_page' ),
                'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjU2IDI1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNmZmY7fQo8L3N0eWxlPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yMTUuMDksNTYuNTlDOTcuMiw4Ni45MSw0OC4wMiwyNC45MywyMy4wOSw2Mi42NWMtMTMuNDcsMjEuNTYsMy4zNyw5Ny42OCwxNS40OSwxNjYuNAoJCWMyNS42LDE2Ljg0LDU2LjU5LDI2Ljk1LDg5LjYsMjYuOTVjMzQuMzYsMCw2Ni42OS0xMC43OCw5Mi45Ny0yOC45N0MyMzguNjcsMTU3LjY0LDI1MC4xMyw0Ny44MywyMTUuMDksNTYuNTl6IE0xNDYuMzYsMjA2LjgzCgkJbC0xNi45OC0yMS45OGwtMTYuOTgsMjEuOThINjcuNzRsMzkuNzktNDguNDdMNzAuMzMsMTEyLjdoNDQuODVsMTQuMjcsMTkuMTVsMTQuNTItMTkuMTVoNDQuNjZsLTM3LjAzLDQ1LjU1bDM5LjgsNDguNTdIMTQ2LjM2eiIKCQkvPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTkyLjQ4LDM1LjcxYzAtMTYuMTcsMTMuNDctMjkuNjQsMjkuNjQtMjkuNjRoMTYuMTdjMTYuMTcsMCwyOS42NCwxMy40NywyOS42NCwyOS42NHYyMi4yMwoJCWMyLjAyLDAsNC4wNCwwLDYuMDYtMC42N1YzNS43MUMxNzQsMTYuMTcsMTU4LjUxLDAsMTM4LjI5LDBoLTE2LjE3Yy0xOS41NCwwLTM1LjcxLDE2LjE3LTM1LjcxLDM1LjcxdjE0LjgyCgkJYzIuMDIsMC42Nyw0LjA0LDAuNjcsNi4wNiwxLjM1VjM1LjcxeiIvPgo8L2c+Cjwvc3ZnPgo=',
                 50
            );

            $pro_sticker = ! Utill::is_khali_dabba() ?
            '<span 
                class="multivendorx-pro-tag"
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

            // Array contain multivendorx submenu.
            $submenus = array(
                'dashboard' => array(
                    'name'   => __( 'Dashboard', 'multivendorx' ),
                    'subtab' => '',
                ),
                'work-board' => array(
                    'name'   => __( 'Work Board', 'multivendorx' ),
                    'subtab' => '',
                ),
                'stores' => array(
                    'name'   => __( 'Stores', 'multivendorx' ),
                    'subtab' => '',
                ),
                'Commissions' => array(
                    'name'   => __( 'Commissions', 'multivendorx' ),
                    'subtab' => '',
                ),
                'analytics' => array(
                    'name'   => __( 'Analytics', 'multivendorx' ),
                    'subtab' => '',
                ),
                'memberships' => array(
                    'name'   => __( 'Memberships', 'multivendorx' ),
                    'subtab' => 'message-mail',
                ),
                'settings' => array(
                    'name'   => __( 'Settings', 'multivendorx' ),
                    'subtab' => 'marketplace-settings',
                ),
                'modules' => array(
                    'name'   => __( 'Modules', 'multivendorx' ),
                    'subtab' => '',
                ),
                'status-and-tools' => array(
                    'name'   => __( 'Status and Tools', 'multivendorx' ),
                    'subtab' => '',
                ),

                'help-and-support' => array(
                    'name'   => __( 'Help and Support', 'multivendorx' ),
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
                    'multivendorx',
                    $submenu['name'],
                    "<span style='position: relative; display: block; width: 100%;' class='admin-menu'>" . $submenu['name'] . '</span>',
                    'manage_options',
                    'multivendorx#&tab=' . $slug . $subtab,
                    '_-return_null'
                );
            }

            // Register upgrade to pro submenu page.
            if ( ! Utill::is_khali_dabba() ) {
                add_submenu_page(
                    'multivendorx',
                    __( 'Upgrade to Pro', 'multivendorx' ),
                    '<style>
                        a:has(.upgrade-to-pro){
                            background: linear-gradient(-28deg, #c4a9e8, #7848b9, #852aff) !important;
                            color: White !important;
                        }
                        padding: 5px 0;
                    </style>
                    <div style="margin-left: -12px;" class="upgrade-to-pro"><i class="dashicons dashicons-awards"></i>' . esc_html__( 'Upgrade to Pro', 'multivendorx' ) . '</div> ',
                    'manage_options',
                    '',
                    array( self::class, 'handle_external_redirects' )
                );
            }

            remove_submenu_page( 'multivendorx', 'multivendorx' );
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
     * Enqueue JavaScript for admin fronend page and localize script.
     *
     * @return void
     */
    public function enqueue_admin_script() {
        if ( get_current_screen()->id === 'toplevel_page_multivendorx' ) {
            wp_enqueue_script( 'wp-element' );
            // Support for media
            wp_enqueue_media();
            FrontendScripts::admin_load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-components-script' );
            FrontendScripts::enqueue_script( 'multivendorx-admin-script' );
			FrontendScripts::enqueue_style( 'multivendorx-components-style' );
			FrontendScripts::localize_scripts( 'multivendorx-admin-script' );
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

        if ( strpos( $url, 'dc-woocommerce-product-vendor' ) !== false ) {
            foreach ( MultiVendorX()->block_paths as $key => $new_path ) {
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
		wp_safe_redirect( esc_url_raw( MULTIVENDORX_PRO_SHOP_URL ) );
		exit;
	}

    /**
     * Allow MultiVendorX domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with MultiVendorX domain included.
     */
    public function allow_multivendorx_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( MULTIVENDORX_PRO_SHOP_URL );

        if ( isset( $parsed_url['host'] ) ) {
            $hosts[] = $parsed_url['host'];
        }

        return $hosts;
    }
}
