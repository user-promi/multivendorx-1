<?php
/**
 * Admin class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultivendorX
 */
class Admin {

    /**
     * Constructor for Admin class
     */
    public function __construct() {
        // Register admin menu.
        add_action( 'admin_menu', array( $this, 'add_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
		// Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_catalogx_redirect_host' ) );
        // For load translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
    }

    /**
     * Add menu in admin panal
     *
     * @return void
     */
    public function add_menu() {

        add_menu_page(
            'CatalogX',
            'CatalogX',
            'manage_woocommerce',
            'catalogx',
            array( $this, 'menu_page_callback' ),
            'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNTAwIDUwMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTAwIDUwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNmZmY7fQo8L3N0eWxlPgo8Zz4KCTxnPgoJCTxnPgoJCQk8Zz4KCQkJCTxnPgoJCQkJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMjQuNzMsMTA5LjM1Qzk3LDEwOC43OCw3My43MSwxNDEsODUuMjUsMTYwLjg5bDkxLjA3LDE1N2M0Ljk5LDguNiwxNC43MiwxNC42NywyNi4wNywxNi43OQoJCQkJCQljMC4xLTAuMTYsMC4xOS0wLjMyLDAuMy0wLjQ3YzYuMzgtOS4zOSwxNy4xMy0xNS41NSwyOS4zNC0xNS41NWMxMi4yLDAsMjIuOTYsNi4xNywyOS4zNCwxNS41NWMwLjMsMC40NCwwLjU3LDAuOSwwLjg1LDEuMzYKCQkJCQkJYzE1LjIxLDAsMzIuNTIsMCw0OC44MywwYzAuMjgtMC40NiwwLjU1LTAuOTIsMC44NS0xLjM2YzYuMzgtOS4zOSwxNy4xMy0xNS41NSwyOS4zNC0xNS41NWMxMi4yLDAsMjIuOTYsNi4xNywyOS4zNCwxNS41NQoJCQkJCQljMC4zLDAuNDQsMC41NywwLjksMC44NSwxLjM2YzUuOTUsMCw5LjY1LTYuNDksNi42MS0xMS42Yy01LjQxLTkuMDctMjQuMTUtMjguODYtMzcuNjMtMjkuMTJjLTAuNTYtMC4wMS0xLjEyLDAuMDQtMS42NywwLjE1CgkJCQkJCWMtMTcuOTIsMy41Mi0zOS43Niw2LjM3LTY0LjY3LDYuNjFjLTguMDEsMC4wOC0xNS43MS0wLjEyLTIzLjA5LTAuNTNjLTI5LjU3LTEuNjQtNDkuMS00LjctNjMuOTYtMzAuMzIKCQkJCQkJYy0xMS45Ni0yMC42MS0yMy45MS00MS4yMy0zNS44Ny02MS44NGMtMTUuOTYtMjcuNTIsMy44Mi02NC40MywzNS42My02My43OGwxOTYuNCw0LjA0YzEzLjgxLDAuMjgsMjguOTMtMTUuNjUsMzQuNzctMjQuNzYKCQkJCQkJYzMuMjMtNS4wMywxLjU1LTkuMDEtNC40My05LjE0TDEyNC43MywxMDkuMzV6Ii8+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTIyOC41OSwzMzIuNTJjLTkuOCwwLTE4LjQ0LDQuOTUtMjMuNTYsMTIuNDljLTAuMDgsMC4xMi0wLjE2LDAuMjYtMC4yNCwwLjM4CgkJCQkJCWMtNC40LDYuNy02LjA4LDE1LjM0LTMuMzQsMjQuMzljMi42OSw4Ljg4LDkuODYsMTUuOTUsMTguNzksMTguNDljMTkuMyw1LjUsMzYuODItOC44NSwzNi44Mi0yNy4yOAoJCQkJCQljMC01LjQ2LTEuNTUtMTAuNTUtNC4yMi0xNC44OGMtMC4yMy0wLjM3LTAuNDQtMC43NC0wLjY4LTEuMDlDMjQ3LjAzLDMzNy40NywyMzguMzksMzMyLjUyLDIyOC41OSwzMzIuNTJ6Ii8+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTMzNy44LDMzMi41MmMtOS44LDAtMTguNDQsNC45NS0yMy41NiwxMi40OWMtMC4yNCwwLjM1LTAuNDYsMC43My0wLjY4LDEuMDkKCQkJCQkJYy00LjEsNi42Ni01LjU3LDE1LjEyLTIuOCwyMy45NmMyLjc0LDguNzYsOS44NywxNS42OSwxOC43LDE4LjJjMTkuMjksNS40OSwzNi44MS04Ljg1LDM2LjgxLTI3LjI4CgkJCQkJCWMwLTUuNDYtMS41NS0xMC41NS00LjIyLTE0Ljg4Yy0wLjIzLTAuMzctMC40NC0wLjc0LTAuNjgtMS4wOUMzNTYuMjQsMzM3LjQ3LDM0Ny42LDMzMi41MiwzMzcuOCwzMzIuNTJ6Ii8+CgkJCQk8L2c+CgkJCTwvZz4KCQk8L2c+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTM5MS43NiwyMDAuMDZIMjc5LjIyYy0wLjI3LDAtMC40OS0wLjIyLTAuNDktMC40OXYtNi43NGMwLTAuMjcsMC4yMi0wLjQ5LDAuNDktMC40OWgxMTIuNTUKCQkJCWMwLjI3LDAsMC40OSwwLjIyLDAuNDksMC40OXY2Ljc0QzM5Mi4yNSwxOTkuODQsMzkyLjAzLDIwMC4wNiwzOTEuNzYsMjAwLjA2eiIvPgoJCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzY0LjMzLDIyOC41NEgyNzcuNGMtMC4yNywwLTAuNDktMC4yMi0wLjQ5LTAuNDl2LTYuNzRjMC0wLjI3LDAuMjItMC40OSwwLjQ5LTAuNDloODYuOTIKCQkJCWMwLjI3LDAsMC40OSwwLjIyLDAuNDksMC40OXY2Ljc0QzM2NC44MiwyMjguMzIsMzY0LjYsMjI4LjU0LDM2NC4zMywyMjguNTR6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zMzMuMjgsMjU3LjAxaC01NC4wNmMtMC4yNywwLTAuNDktMC4yMi0wLjQ5LTAuNDl2LTYuNzRjMC0wLjI3LDAuMjItMC40OSwwLjQ5LTAuNDloNTQuMDYKCQkJCWMwLjI3LDAsMC40OSwwLjIyLDAuNDksMC40OXY2Ljc0QzMzMy43NywyNTYuNzksMzMzLjU1LDI1Ny4wMSwzMzMuMjgsMjU3LjAxeiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
            50
        );

        $submenus = array(
            'enquiry-messages' => array(
                'name'   => __( 'Enquiry Messages', 'catalogx' ),
                'subtab' => '',
            ),
            'quote-requests'   => array(
                'name'   => __( 'Quotation Requests', 'catalogx' ),
                'subtab' => '',
            ),
            'wholesale-users'  => array(
                'name'   => __( 'Wholesale Users', 'catalogx' ),
                'subtab' => '',
            ),
            'rules'            => array(
                'name'   => __( 'Dynamic Pricing Rules', 'catalogx' ),
                'subtab' => '',
            ),
            'settings'         => array(
                'name'   => __( 'Settings', 'catalogx' ),
                'subtab' => 'all-settings',
            ),
            'modules'          => array(
                'name'   => __( 'Modules', 'catalogx' ),
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
                'catalogx',
                $submenu['name'],
                $submenu['name'],
                'manage_woocommerce',
                'catalogx#&tab=' . $slug . $subtab,
                '__return_null'
            );
        }

        if ( ! Utill::is_khali_dabba() ) {
            add_submenu_page(
                'catalogx',
                __( 'Upgrade to Pro', 'catalogx' ),
                '<style>
                    a:has(.upgrade-to-pro){
                        background: linear-gradient(-28deg, #C4A9E8, #7848B9, #852AFF) !important;
                        color: White !important;
                    };
                    padding: 5px 0;
                </style>
                <div class="upgrade-to-pro"><i style="margin-right: 0.25rem" class="dashicons dashicons-awards"></i>' . __( 'Upgrade to pro', 'catalogx' ) . '</div>',
                'manage_woocommerce',
                '',
                array( $this, 'handle_external_redirects' )
            );
        }

        remove_submenu_page( 'catalogx', 'catalogx' );
    }

    /**
     * Callback function for menu page
     *
     * @return void
     */
    public function menu_page_callback() {
        echo '<div id="admin-main-wrapper"></div>';
    }

    /**
     * Enqueue javascript and css
     *
     * @return void
     */
    public function enqueue_admin_script() {

        if ( get_current_screen()->id !== 'toplevel_page_catalogx' ) {
			return;
        }

        // Support for media.
        wp_enqueue_media();

        // Enque script and style.
        FrontendScripts::admin_load_scripts();
        FrontendScripts::enqueue_script( 'catalogx-admin-script' );
        FrontendScripts::enqueue_script( 'catalogx-components-script' );
        FrontendScripts::enqueue_style( 'catalogx-components-style' );
        FrontendScripts::localize_scripts( 'catalogx-admin-script' );
        wp_set_script_translations( 'catalogx-script', 'catalogx' );
    }

    /**
	 * Redirct to pro shop url.
     *
	 * @return never
	 */
	public function handle_external_redirects() {
		wp_safe_redirect( esc_url_raw( CATALOGX_PRO_SHOP_URL ) );
		exit;
	}

	/**
     * Allow CatalogX domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with CatalogX domain included.
     */
    public function allow_catalogx_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( CATALOGX_PRO_SHOP_URL );

        if ( isset( $parsed_url['host'] ) ) {
            $hosts[] = $parsed_url['host'];
        }

        return $hosts;
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
        if ( strpos( $url, 'woocommerce-catalog-enquiry' ) !== false ) {
            foreach ( CatalogX()->block_paths as $key => $new_path ) {
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
