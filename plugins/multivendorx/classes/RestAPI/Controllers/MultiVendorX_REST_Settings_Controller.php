<?php

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Modules;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Settings_Controller extends \WP_REST_Controller {

    /**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'multivendorx/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base    = 'settings';
	protected $modules_base = 'modules';

    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
        // enable/disable the module.
        register_rest_route(
            $this->namespace,
            '/' . $this->modules_base,
            array(
                array(
                    'methods'             => 'POST',
                    'callback'            => array( $this, 'set_modules' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
                array(
                    'methods'             => 'GET',
                    'callback'            => array( $this, 'get_modules' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );
    }


    // POST permission
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }


    public function update_item( $request ) {
        $all_details       = array();
        $get_settings_data = $request->get_param( 'setting' );
        $settingsname      = $request->get_param( 'settingName' );
        $settingsname      = str_replace( '-', '_', $settingsname );
        $optionname        = 'multivendorx_' . $settingsname . '_settings';

        // save the settings in database.
        MultiVendorX()->setting->update_option( $optionname, $get_settings_data );

        do_action( 'multivendorx_after_save_settings', $settingsname, $get_settings_data );

        $all_details['error'] = __( 'Settings Saved', 'multivendorx' );

        if ($settingsname == 'role_manager') {
            $roles_caps = MultiVendorX()->setting->get_option('multivendorx_role_manager_settings');
            // Make sure WP_Roles is ready
            if ( ! function_exists( 'wp_roles' ) ) {
                require_once ABSPATH . 'wp-includes/pluggable.php';
            }

            $wp_roles = wp_roles();

            foreach ( $roles_caps as $role_key => $caps ) {

                $role = $wp_roles->get_role( $role_key );
                if ( $role ) {
                    // First remove all capabilities for a clean reset
                    foreach ( $role->capabilities as $existing_cap => $grant ) {
                        $role->remove_cap( $existing_cap );
                    }

                    // Add the new capabilities
                    foreach ( $caps as $cap ) {
                        $role->add_cap( $cap );
                    }

                }
            }

            // Force refresh global $wp_roles for current request
            global $wp_roles;
            $wp_roles->for_site();
            flush_rewrite_rules();
        }
        return $all_details;
    }

    /**
     * Manage module setting. Active or Deactive modules.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return void
     */
    public function set_modules( $request ) {
        $module_id = $request->get_param( 'id' );
        $action    = $request->get_param( 'action' );

        // Setup wizard module.
        $modules = $request->get_param( 'modules' );
        foreach ( $modules as $module_id ) {
            MultivendorX()->modules->activate_modules( array( $module_id ) );
        }

        // Handle the actions.
        switch ( $action ) {
            case 'activate':
                MultivendorX()->modules->activate_modules( array( $module_id ) );
                break;

            default:
                MultivendorX()->modules->deactivate_modules( array( $module_id ) );
                break;
        }
    }

    /**
     * Get the list of active CatalogX modules.
     *
     * @return array
     */
    public function get_modules() {
        $modules_instance = new Modules();
        return $modules_instance->get_active_modules();
    }
}
