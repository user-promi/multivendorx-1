<?php
/**
 * RESTAPI class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX RestAPI class
 *
 * @class       RestAPI class
 * @version     3.0.0
 * @author      MultiVendorX
 */
class RestAPI {

    /**
     * RestAPI constructor.
     */
    public function __construct() {
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
        }
    }

    /**
     * Rest api register function call on rest_api_init action hook.
     *
     * @return void
     */
    public function register_rest_api() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/settings',
            array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'set_settings' ),
				'permission_callback' => array( $this, 'multivendorx_permission' ),
			)
        );
    }

    /**
     * multivendorx api permission function.
     *
     * @return bool
     */
    public function multivendorx_permission() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Seve the setting set in react's admin setting page.
     *
     * @param WP_REST_Request|array $request The request object or data array.
     * @return array
     */
    public function set_settings( $request ) {
        $all_details       = array();
        $get_settings_data = $request->get_param( 'setting' );
        $settingsname      = $request->get_param( 'settingName' );
        $settingsname      = str_replace( '-', '_', $settingsname );
        $optionname        = 'multivendorx_' . $settingsname . '_settings';

        // save the settings in database.
        MultiVendorX()->setting->update_option( $optionname, $get_settings_data );

        do_action( 'multivendorx_after_save_settings', $settingsname, $get_settings_data );

        $all_details['error'] = __( 'Settings Saved', 'multivendorx' );

        return $all_details;
    }
}
