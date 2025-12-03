<?php
/**
 * Utill class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Utill class
 *
 * @class       Utill class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Utill {

    /**
     * Constent holds table name
     *
     * @var array
     */
    const TABLES = array(
        'commission'              => 'multivendorx_commissions',
        'store'                   => 'multivendorx_store',
        'store_users'             => 'multivendorx_store_users',
        'store_meta'              => 'multivendorx_store_meta',
        'transaction'             => 'multivendorx_transactions',
        'real_time_transaction'   => 'multivendorx_real_time_transactions',
        'product_qna'             => 'multivendorx_questions_and_answers',
        'report_abuse'            => 'multivendorx_report_abuse',
        'shipping_zone'           => 'multivendorx_shipping_zone_methods',
        'shipping_zone_locations' => 'multivendorx_shipping_zone_locations',
        'review'                  => 'multivendorx_store_reviews',
        'rating'                  => 'multivendorx_store_review_ratings',
        'products_map'            => 'multivendorx_products_map',
        'notifications'           => 'multivendorx_store_activity_notifications',
        'system_events'           => 'multivendorx_system_events',
    );

    const ADMIN_SETTINGS = array(
        'general'                        => 'multivendorx_general_settings',
        'store-registration-form'        => 'multivendorx_store_registration_form_settings',
        'menu-manager'                   => 'multivendorx_menu_manager_settings',
        'privacy'                        => 'multivendorx_privacy_settings',
        'coupon'                         => 'multivendorx_coupon_settings',
        'store'                          => 'multivendorx_store_settings',
        'products'                       => 'multivendorx_products_settings',
        'policy'                         => 'multivendorx_policy_settings',
        'disbursement'                   => 'multivendorx_disbursement_settings',
        'commissions'                    => 'multivendorx_commissions_settings',
        'marketplace'                    => 'multivendorx_marketplace_settings',
        'user-capability'                => 'multivendorx_user_capability_settings',
        'store-capability'               => 'multivendorx_store_capability_settings',
        'identity-verification'          => 'multivendorx_identity_verification_settings',
        'commission-rule'                => 'multivendorx_commission_rule_settings',
        'payment-integration'            => 'multivendorx_payment_integration_settings',
        'store-appearance'               => 'multivendorx_store_appearance_settings',
        'product-report-abuse'           => 'multivendorx_product_report_abuse_settings',
        'store-commissions'              => 'multivendorx_store_commissions_settings',
        'store-inventory'                => 'multivendorx_store_inventory_settings',
        'review-management'              => 'multivendorx_review_management_settings',
        'order-actions-refunds'          => 'multivendorx_order_actions_refunds_settings',
        'advertising'                    => 'multivendorx_advertising_settings',
        'product-preferencess'           => 'multivendorx_product_preferencess_settings',
        'category-pyramid-guide'         => 'multivendorx_category_pyramid_guide_settings',
        'geolocation'                    => 'multivendorx_geolocation_settings',
        'shipping'                       => 'multivendorx_shipping_settings',
        'legal-compliance'               => 'multivendorx_legal_compliance_settings',
        'product-compliance'             => 'multivendorx_product_compliance_settings',
        'tax-compliance'                 => 'multivendorx_tax_compliance_settings',
        'custom-css'                     => 'multivendorx_custom_css_settings',
        'single-product-multiple-store'  => 'multivendorx_single_product_multiple_store_settings',
        'pending'                        => 'multivendorx_pending_settings',
        'rejected'                       => 'multivendorx_rejected_settings',
        'permanently-rejected'           => 'multivendorx_permanently_rejected_settings',
        'under-review'                   => 'multivendorx_under_review_settings',
        'suspended'                      => 'multivendorx_suspended_settings',
    );

    const OTHER_SETTINGS = array(
        'installed'           => 'multivendorx_installed',
        'plugin_activated'    => 'multivendorx_plugin_activated',
        'plugin_db_version'   => 'dc_product_vendor_plugin_db_version',
        'plugin_page_install' => 'dc_product_vendor_plugin_page_install',
        'log_file'            => 'multivendorx_log_file',
        'tour_active'         => 'multivendorx_tour_active',
        'admin_email'         => 'admin_email',
        'default_role'        => 'default_role',
    );

    const WOO_SETTINGS = array(
        'taxes'                           => 'woocommerce_calc_taxes',
        'generate_password'               => 'woocommerce_registration_generate_password',
        'default_country'                 => 'woocommerce_default_country',
        'manage_stock'                    => 'woocommerce_manage_stock',
        'weight_unit'                     => 'woocommerce_weight_unit',
        'dimension_unit'                  => 'woocommerce_dimension_unit',
        'notify_low_stock'                => 'woocommerce_notify_low_stock_amount',
        'store_item_commission'           => 'multivendorx_store_item_commission',
        'order_status_synchronized'       => 'mvx_vendor_order_status_synchronized',
        'cod_order_payment'               => 'multivendorx_cod_order_payment',
        'product_shipping_class'          => 'product_shipping_class',
        'shipping_origin_country'         => 'shipping_origin_country',
        '_customer_refund_reason'         => '_customer_refund_reason',
    );

    const WORDPRESS_SETTINGS = array(
        'permalink' => 'permalink_structure',
        'rows'      => 'default_post_edit_rows',
    );
    const POST_META_SETTINGS = array(
        'store_id'                       => 'multivendorx_store_id',
        'fixed_commission'               => 'multivendorx_product_fixed_commission',
        'percentage_commission'          => 'multivendorx_product_percentage_commission',
        'variable_product_percentage'    => 'multivendorx_variable_product_percentage_commission',
        'variable_product_fixed'         => 'multivendorx_variable_product_fixed_commission',
        'shipping_policy'                => 'multivendorx_shipping_policy',
        'refund_policy'                  => 'multivendorx_refund_policy',
        'cancellation_policy'            => 'multivendorx_cancellation_policy',
        'announcement_stores'            => 'multivendorx_announcement_stores',
        'announcement_url'               => 'multivendorx_announcement_url',
        'category_percentage_commission' => 'multivendorx_category_percentage_commission',
        'category_fixed_commission'      => 'multivendorx_category_fixed_commission',
        'commission_id'                  => 'multivendorx_commission_id',
        'commissions_processed'          => 'multivendorx_commissions_processed',
        'sold_by'                        => 'multivendorx_sold_by',
        'has_sub_order'                  => 'has_multivendorx_sub_order',
        'multivendorx_store_order'       => 'multivendorx_store_order',
        'store_order_shipping_item_id'   => 'store_order_shipping_item_id',
        'active_store'                   => 'multivendorx_active_store',
        '_additional_qty'                => '_additional_qty',
        '_additional_price'              => '_additional_price',
    );

    const STORE_SETTINGS_KEYS = array(
        'name'                       => 'name',
        'slug'                       => 'slug',
        'description'                => 'description',
        'who_created'                => 'who_created',
        'status'                     => 'status',
        'withdrawals_count'          => 'withdrawals_count',
        'payment_method'             => 'payment_method',
        'paypal_email'               => 'paypal_email',
        'stripe_account_id'          => '_stripe_connect_account_id',
        'stripe_oauth_state'         => 'stripe_oauth_state',
        'registration_data'          => 'multivendorx_registration_data',
        'request_withdrawal_amount'  => 'request_withdrawal_amount',
        'store_reject_note'          => 'store_reject_note',
        'primary_email'              => 'primary_email',
        'phone'                      => 'phone',
        '_phone'                     => '_phone',
        'contact_number'             => 'contact_number',
        'address_1'                  => 'address_1',
        'address_2'                  => 'address_2',
        'image'                      => 'image',
        'city'                       => 'city',
        'state'                      => 'state',
        'country'                    => 'country',
        'postcode'                   => 'postcode',
        'create_time'                => 'create_time',
        'deactivation_reason'        => 'deactivation_reason',
        'deactivation_request_date'  => 'deactivation_request_date',
        'followers'                  => 'followers',
        'account_number'             => 'account_number',
        'shipping_class_id'          => 'shipping_class_id',
        'store_policy'               => 'store_policy',
        'shipping_policy'            => 'shipping_policy',
        'return_policy'              => 'return_policy',
        'exchange_policy'            => 'exchange_policy',
        '_local_pickup_cost'         => '_local_pickup_cost',
        'shipping_rates'             => 'multivendorx_shipping_rates',
        'additional_qty'             => 'multivendorx_additional_qty',
        'additional_product'         => 'multivendorx_additional_product',
        'shipping_type_price'        => 'multivendorx_shipping_type_price',
        '_free_shipping_amount'      => '_free_shipping_amount',
        'location_lat'               => 'location_lat',
        'location_lng'               => 'location_lng',
        'distance_default_cost'      => 'distance_default_cost',
        'distance_max_km'            => 'distance_max_km',
        'distance_local_pickup_cost' => 'distance_local_pickup_cost',
        'distance_rules'             => 'distance_rules',
        'shipping_options'           => 'shipping_options',
        '_vendor_payment_mode'       => '_vendor_payment_mode',
    );

    const USER_SETTINGS_KEYS = array(
        'first_name'                  => 'first_name',
        'last_name'                   => 'last_name',
        'social_verification'         => 'social_verification_connections',
        'following_stores'            => 'mvx_following_stores',
        'mvx_user_location_lat'       => 'mvx_user_location_lat',
        'mvx_user_location_lng'       => 'mvx_user_location_lng',
    );
    const POST_TYPES = array(
        'announcement'      => 'multivendorx_an',
        'knowledge'         => 'multivendorx_kb',
    );
    const ACTIVE_MODULES_DB_KEY = 'multivendorx_all_active_module_list';

    /**
     * MooWoodle LOG function.
     *
     * @param string $message message.
     * @return bool
     */
	public static function log( $message ) {
		global $wp_filesystem;

		$message = var_export( $message, true ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_var_export

		// Init filesystem.
		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		// log folder create.
		if ( ! file_exists( MultiVendorX()->multivendorx_logs_dir . '/.htaccess' ) ) {
			$result = wp_mkdir_p( MultiVendorX()->multivendorx_logs_dir );
			if ( true === $result ) {
				// Create infrastructure to prevent listing contents of the logs directory.
				try {
					$wp_filesystem->put_contents( MultiVendorX()->multivendorx_logs_dir . '/.htaccess', 'deny from all' );
					$wp_filesystem->put_contents( MultiVendorX()->multivendorx_logs_dir . '/index.html', '' );
				} catch ( Exception $exception ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
					// Creation failed.
				}
			}
			$message = "MultiVendorX Log file Created\n";
		}

		// Clear log file.
		if ( filter_input( INPUT_POST, 'clearlog', FILTER_DEFAULT ) !== null ) {
			$message = "MultiVendorX Log file Cleared\n";
		}

		// Write Log.
		if ( '' !== $message ) {
			$log_entry        = gmdate( 'd/m/Y H:i:s', time() ) . ': ' . $message;
			$existing_content = $wp_filesystem->get_contents( MultiVendorX()->log_file );

			// Append existing content.
			if ( ! empty( $existing_content ) ) {
				$log_entry = "\n" . $log_entry;
			}

			return $wp_filesystem->put_contents( MultiVendorX()->log_file, $existing_content . $log_entry );
		}

		return false;
	}

    /**
     * Check pro plugin is active or not.
     *
     * @return bool
     */
    public static function is_khali_dabba() {
        return apply_filters( 'kothay_dabba', false );
    }

    /**
     * Get other templates ( e.g. product attributes ) passing attributes and including the file.
     *
     * @access public
     * @param  mixed $template_name template name.
     * @param  array $args          ( default: array() ).
     * @return void
     */
    public static function get_template( $template_name, $args = array() ) {

        // Check if the template exists in the theme.
        $theme_template = get_stylesheet_directory() . '/dc-woocommerce-product-vendor/' . $template_name;

        // Use the theme template if it exists, otherwise use the plugin template.
        $located = file_exists( $theme_template ) ? $theme_template : MultiVendorX()->plugin_path . 'templates/' . $template_name;

        // Load the template.
        load_template( $located, false, $args );
    }


    /**
     * Utility function to wrap a string in single quotes.
     *
     * @param string $value The input string to be wrapped.
     *
     * @return string The string wrapped in single quotes, or the original value if not a string.
     */
    public static function add_single_quotes( $value ) {
        if ( is_string( $value ) ) {
            return "'" . $value . "'";
        }

        return $value;
    }

    /**
     * Check if current page is store dashboard page.
     *
     * @return bool
     */
    public static function is_store_dashboard() {
        $dashboard_page = (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' );
        // if (is_page($dashboard_page)) {
        // $has_shortcode = has_shortcode(get_post($dashboard_page)->post_content, 'multivendorx_store_dashboard');
        // return $has_shortcode;
        // }
        return is_page( $dashboard_page );
    }

    /**
     * Check if current page is store registration page.
     *
     * @return bool
     */
    public static function is_store_registration_page() {
        $registration_page = (int) MultiVendorX()->setting->get_setting( 'store_registration_page' );
        // if (is_page($registration_page)) {
        // $has_shortcode = has_shortcode(get_post($registration_page)->post_content, 'multivendorx_store_registration');
        // return $has_shortcode;
        // }
        return is_page( $registration_page );
    }
}
