<?php
/**
 * MultiVendorX Store Util Class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Store Util Class.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class StoreUtil {

    /**
     * Constructor
     */
    public function __construct() {

        add_action( 'multivendorx_after_store_active', array( $this, 'create_store_shipping_class' ) );
    }
    /**
     * Create a WooCommerce shipping class when store becomes active.
     *
     * @param int $store_id Store ID.
     */
    public function create_store_shipping_class( $store_id ) {
        // Load store object.
        $store = new \MultiVendorX\Store\Store( $store_id );

        // Check if class already exists for this store.
        $existing_class_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['shipping_class_id'] );
        if ( $existing_class_id ) {
            return; // Skip creation.
        }

        // Prepare unique shipping class slug.
        $store_name = sanitize_title( $store->get( 'name' ) );
        $slug       = $store_name . '-' . $store_id;

        // Check if the shipping class already exists.
        $shipping_term = get_term_by( 'slug', $slug, Utill::WORDPRESS_SETTINGS['product_shipping_class'], ARRAY_A );

        // Create a new shipping class if missing.
        if ( ! $shipping_term ) {
            $shipping_term = wp_insert_term(
                $store->get( 'name' ) . ' Shipping', // Shipping class name.
                Utill::WORDPRESS_SETTINGS['product_shipping_class'],
                array(
                    'slug' => $slug,
                )
            );
        }

        // Validate creation.
        if ( ! is_wp_error( $shipping_term ) ) {
            $class_id = $shipping_term['term_id'];

            // Save class ID in store meta.
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['shipping_class_id'], $class_id );

            // Save MultiVendorX store reference in term meta.
            update_term_meta( $class_id, Utill::POST_META_SETTINGS['store_id'], $store_id );

            // Optional: add origin help.
            update_term_meta( $class_id, Utill::WORDPRESS_SETTINGS['shipping_origin_country'], get_option( Utill::WOO_SETTINGS['default_country'] ) );
        }
    }

    /**
     * Add store users
     *
     * @param array $args Array of arguments.
     */
    public static function add_store_users( $args ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];

        $store_id = $args['store_id'] ?? 0;
        $role_id  = $args['role_id'] ?? '';
        $owners   = $args['users'] ?? array();

        // Remove old users not in list.
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$table} WHERE store_id = %d AND role_id = %s AND user_id NOT IN (" . implode( ',', array_map( 'intval', $owners ) ) . ')',
                $store_id,
                $role_id
            )
        );

        // Insert new users.
        foreach ( $owners as $user_id ) {
            $exists = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT ID FROM {$table} WHERE store_id = %d AND role_id = %s AND user_id = %d",
                    $store_id,
                    $role_id,
                    $user_id
                )
            );

            if ( ! $exists ) {
                $wpdb->insert(
                    $table,
                    array(
                        'store_id' => $store_id,
                        'user_id'  => $user_id,
                        'role_id'  => $role_id,
                    ),
                    array( '%d', '%d', '%s' )
                );
            }
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }
    }

    /**
     * Get store users
     *
     * @param int $store_id Store ID.
     * @return array
     */
    public static function get_store_users( $store_id ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];

        $primary_owner_id = self::get_primary_owner( $store_id );
        $users            = $wpdb->get_results( $wpdb->prepare( "SELECT user_id FROM $table WHERE store_id = %d", $store_id ), ARRAY_A );
        $user_ids         = wp_parse_id_list( wp_list_pluck( $users, 'user_id' ) );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return array(
            'users'         => $user_ids,
            'primary_owner' => $primary_owner_id,
        );
    }

    /**
     * Get stores from user id
     *
     * @param int $user_id User ID.
     * @return array
     */
    public static function get_stores_from_user_id( $user_id ) {
        global $wpdb;

        $store_users = "{$wpdb->prefix}" . Utill::TABLES['store_users'];
        $stores      = "{$wpdb->prefix}" . Utill::TABLES['store'];

        $excluded_statuses = array( 'permanently_rejected', 'deactivated' );
        $placeholders      = implode( ', ', array_fill( 0, count( $excluded_statuses ), '%s' ) );
        $params            = array_merge( array( $user_id ), $excluded_statuses );

        $sql    = "
            SELECT 
                su.store_id AS id,
                s.name AS name
            FROM {$store_users} su
            INNER JOIN {$stores} s ON s.ID = su.store_id
            WHERE su.user_id = %d
            AND s.status NOT IN ($placeholders)
        ";
        $result = $wpdb->get_results( $wpdb->prepare( $sql, $params ), ARRAY_A );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $result;
    }

    /**
     * Get all stores
     *
     * @return array
     */
    public static function get_store() {
        global $wpdb;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table}" ), ARRAY_A );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $store ? $store : array();
    }

    /**
     * Get store by primary owner
     *
     * @param string $status Store status.
     * @return array
     */
    public static function get_store_by_primary_owner( $status = 'active' ) {
        global $wpdb;

        $table  = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $stores = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table WHERE who_created = %d AND status = %s", get_current_user_id(), $status ), ARRAY_A );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $stores ? $stores : array();
    }

    /**
     * Get store tabs
     *
     * @param int $store_id Store ID.
     * @return array
     */
    public function get_store_tabs( $store_id ) {

        $tabs = array(
            'products' => array(
                'title' => __( 'Products', 'multivendorx' ),
                'url'   => $this->get_store_url( $store_id ),
            ),
        );

        return apply_filters( 'multivendorx_store_tabs', $tabs, $store_id );
    }

    /**
     * Get store URL
     *
     * @param int    $store_id Store ID.
     * @param string $tab Optional tab.
     * @return string
     */
    public function get_store_url( $store_id, $tab = '' ) {
        if ( ! $store_id ) {
            return '';
        }

        $store_data       = new Store( $store_id );
        $store_slug       = $store_data ? $store_data->get( 'slug' ) : '';
        $custom_store_url = MultiVendorX()->setting->get_setting( 'store_url', 'store' );

        $path = '/' . $custom_store_url . '/' . $store_slug . '/';
        if ( $tab ) {
            $tab   = untrailingslashit( trim( $tab, " \n\r\t\v\0/\\" ) );
            $path .= $tab;
            $path  = trailingslashit( $path );
        }

        return apply_filters( 'multivendorx_get_store_url', home_url( $path ), $custom_store_url, $store_id, $tab );
    }

    /**
     * Get store capability
     *
     * @return array
     */
    public static function get_store_capability() {
        $capabilities = array(
            'products'   => array(
                'label'      => 'Manage products',
                'desc'       => 'Allow stores to create, edit, and control their product listings, including uploading media and publishing items for sale.',
                'capability' =>
                array(
                    // 'manage_users' => 'Manage Users',
                    'manage_products'  => 'Manage products',
                    'read_products'    => 'View products',
                    'edit_products'    => 'Edit products',
                    'delete_products'  => 'Delete products',
                    'publish_products' => 'Publish products',
                    'upload_files'     => 'Upload files',
                ),
            ),
            'orders'     => array(
                'label'      => 'Manage orders',
                'desc'       => 'Define how stores interact with customer orders, from viewing and updating details to adding order notes or processing cancellations.',
                'capability' =>
                array(
                    'read_shop_orders'     => 'View orders',
                    'view_shop_orders'     => 'Manage orders',
                    'edit_shop_orders'     => 'Edit orders',
                    'delete_shop_orders'   => 'Delete orders',
                    'add_shop_orders_note' => 'Add order notes',
                ),
            ),
            'coupons'    => array(
                'label'      => 'Coupon management',
                'desc'       => 'Enable stores to create and manage discount codes, adjust coupon settings, and track active promotions.',
                'capability' =>
                array(
                    'manage_shop_coupons' => 'Manage coupons',
                    'read_shop_coupons'   => 'View coupons',
                    'edit_shop_coupons'   => 'Edit coupons',
                    'delete_shop_coupons' => 'Delete coupons',
                    'publish_coupons'     => 'Publish coupons',
                ),
            ),
            'analytics'  => array(
                'label'      => 'Analytics & report',
                'desc'       => 'Give stores access to performance insights, sales data editing, and export options for business tracking and analysis.',
                'capability' =>
                array(
                    'read_shop_report'   => 'View reports',
                    'export_shop_report' => 'Export data',
                ),
            ),
            'inventory'  => array(
                'label'      => 'Inventory management',
                'desc'       => 'Let stores monitor stock levels, update quantities, and set alerts to prevent overselling or stockouts.',
                'capability' =>
                array(
                    'read_shop_report'  => 'Manage inventory',
                    'edit_shop_report'  => 'Track stock',
                    'edit_stock_alerts' => 'Set stock alerts',
                ),
            ),
            'commission' => array(
                'label'      => 'Commission & earning',
                'desc'       => 'Provide stores with tools to review their earnings, track commission history, and request withdrawals when eligible.',
                'capability' =>
                array(
                    'read_shop_earning'       => 'View earning',
                    'edit_withdrawl_request'  => 'Request withdrawl',
                    'view_commission_history' => 'Commission history',
                ),
            ),
        );

        return $capabilities;
    }

    /**
     * Get store data for a product.
     *
     * @param int $product_id Product ID.
     *
     * @return object|false
     */
    public static function get_products_store( $product_id ) {
        $vendor_data = false;
        if ( $product_id > 0 ) {
            $vendor     = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
            $vendor_obj = Store::get_store_by_id( $vendor );

            if ( $vendor_obj ) {
                $vendor_data = $vendor_obj;
            }
        }
        return $vendor_data;
    }

    /**
     * Get store registration form data.
     *
     * @param int $store_id Store ID.
     *
     * @return array
     */
    public static function get_store_registration_form( $store_id ) {
        $store = Store::get_store_by_id( $store_id );

        // Get core fields from store object.
        $core_fields = array(
            'name'        => 'Store Name',
            'description' => 'Store Description',
            'status'      => 'status',
        );

        $core_data             = array();
        $all_registration_data = array();
        foreach ( $core_fields as $field_key => $field_label ) {
            $core_data[ $field_label ]           = $store->get( $field_key );
            $all_registration_data[ $field_key ] = $store->get( $field_key );
        }

        $all_registration_data['id'] = $store_id;

        // Get registration form data (serialized meta).
        $store_meta     = $store->get_meta( Utill::STORE_SETTINGS_KEYS['registration_data'] );
        $submitted_data = array();
        if ( ! empty( $store_meta ) && is_serialized( $store_meta ) ) {
            $submitted_data = unserialize( $store_meta );
        }

		$meta_keys = array(
			Utill::STORE_SETTINGS_KEYS['phone'],
            Utill::STORE_SETTINGS_KEYS['paypal_email'],
            Utill::STORE_SETTINGS_KEYS['address_1'],
            Utill::STORE_SETTINGS_KEYS['address_2'],
            Utill::STORE_SETTINGS_KEYS['city'],
            Utill::STORE_SETTINGS_KEYS['state'],
            Utill::STORE_SETTINGS_KEYS['country'],
            Utill::STORE_SETTINGS_KEYS['postcode'],
		);

        foreach ( $meta_keys as $key ) {
            $meta_value = $store->get_meta( $key );
            if ( ! empty( $meta_value ) ) {
                $submitted_data[ $key ] = $meta_value;
            }
        }

        // Fetch form settings.
        $form_settings = MultivendorX()->setting->get_option(
            'multivendorx_store_registration_form_settings',
            array()
        );

        // Build map: field_name => field_label.
        $name_label_map   = array();
        $option_label_map = array();
        if ( isset( $form_settings['store_registration_from']['formfieldlist'] ) ) {
            foreach ( $form_settings['store_registration_from']['formfieldlist'] as $field ) {
                if ( ! empty( $field['name'] ) && ! empty( $field['label'] ) ) {
                    $name_label_map[ $field['name'] ] = $field['label'];
                }
                if ( ! empty( $field['options'] ) ) {
                    foreach ( $field['options'] as $key => $options ) {
                        $option_label_map[ $options['value'] ] = $options['label'];
                    }
                }
            }
        }

        $primary_owner_id   = self::get_primary_owner( $store_id );
        $primary_owner_info = get_userdata( $primary_owner_id );

        // Prepare structured response.
        $response = array(
            'core_data'              => $core_data,
            'registration_data'      => array(),
            'all_registration_data'  => $all_registration_data,
            'primary_owner_info'     => $primary_owner_info,
            'store_application_note' => unserialize( $store->get_meta( 'store_reject_note' ) ),
            'store_permanent_reject' => $store->get( Utill::STORE_SETTINGS_KEYS['status'] ) === 'permanently_rejected',
        );

        foreach ( $submitted_data as $field_name => $field_value ) {
            $label = $name_label_map[ $field_name ] ?? $field_name;
            $value = is_array( $field_value )
                    ? implode( ', ', array_values( array_intersect_key( $option_label_map, array_flip( $field_value ) ) ) )
                    : ( $option_label_map[ $field_value ] ?? $field_value );

            $response['all_registration_data'][ $field_name ] = $field_value;
            if ( in_array( $field_name, $meta_keys, true ) ) {
                $response['core_data'][ $label ] = $field_value;
            } else {
                $response['registration_data'][ $label ] = $value;
            }
        }

        return $response;
    }

    /**
     * Get stores by status.
     *
     * @param string $status Store status.
     *
     * @return array Stores.
     */
    public static function get_stores_by_status( $status ) {
        global $wpdb;

        $table  = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $stores = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE status = %s",
                $status
            ),
            ARRAY_A
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $stores ? $stores : array();
    }

    /**
     * Get primary owner for a store.
     *
     * @param int $store_id Store ID.
     *
     * @return int User ID.
     */
    public static function get_primary_owner( $store_id ) {
        global $wpdb;
        $table_name    = $wpdb->prefix . Utill::TABLES['store_users'];
        $primary_owner = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT primary_owner FROM $table_name WHERE store_id = %d",
                $store_id
            )
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $primary_owner;
    }

    /**
     * Set primary owner for a store.
     *
     * @param int $user_id User ID.
     * @param int $store_id Store ID.
     *
     * @return void
     */
    public static function set_primary_owner( $user_id, $store_id ) {
        global $wpdb;

        $table_name = $wpdb->prefix . Utill::TABLES['store_users'];

        // Check if store_id already exists.
        $exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM $table_name WHERE store_id = %d",
                $store_id
            )
        );

        if ( $exists ) {
            // Update.
            $wpdb->update(
                $table_name,
                array( 'primary_owner' => $user_id ),
                array( 'store_id' => $store_id ),
                array( '%d' ),
                array( '%d' )
            );
        } else {
            // Insert.
            $wpdb->insert(
                $table_name,
                // [
                // 'store_id'      => $store_id,
                // 'user_id'       => $user_id,
                // 'role_id'       => MultiVendorX()->setting->get_setting( 'approve_store' ) == 'automatically' ? 'store_owner' : null,
                // 'primary_owner' => MultiVendorX()->setting->get_setting( 'approve_store' ) == 'automatically' ? $user_id : null,
                // ],
                array(
                    'store_id'      => $store_id,
                    'user_id'       => $user_id,
                    'role_id'       => 'store_owner',
                    'primary_owner' => $user_id,
                ),
                array( '%d', '%d', '%s', '%d' )
            );
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }
    }

    /**
     * Get store product policies
     *
     * @param int $product_id Product ID.
     *
     * @return array
     */
    public static function get_store_product_policies( $product_id = 0 ) {
        $product  = wc_get_product( $product_id );
        $policies = array();
        if ( $product ) {
            $shipping_policy     = get_post_meta( $product_id, Utill::POST_META_SETTINGS['shipping_policy'], true );
            $refund_policy       = get_post_meta( $product_id, Utill::POST_META_SETTINGS['refund_policy'], true );
            $cancellation_policy = get_post_meta( $product_id, Utill::POST_META_SETTINGS['cancellation_policy'], true );

            $store_policy = MultiVendorX()->setting->get_setting( 'store_policy', array() );
            if ( ! empty( $shipping_policy ) ) {
                $shipping_policy = MultiVendorX()->setting->get_setting( 'shipping_policy', array() );
            }
            if ( ! empty( $refund_policy ) ) {
                $refund_policy = MultiVendorX()->setting->get_setting( 'refund_policy', array() );
            }
            if ( ! empty( $cancellation_policy ) ) {
                $cancellation_policy = MultiVendorX()->setting->get_setting( 'cancellation_policy', array() );
            }

            $store_id                  = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
            $store                     = new Store( $store_id );
            $privacy_override_settings = MultiVendorX()->setting->get_setting( 'store_policy_override', array() );

            if ( in_array( 'store', $privacy_override_settings, true ) ) {
                $store_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['store_policy'] );
            }
            if ( in_array( 'shipping', $privacy_override_settings, true ) ) {
                $shipping_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['shipping_policy'] );
            }
            if ( in_array( 'refund_return', $privacy_override_settings, true ) ) {
                $refund_policy       = $store->get_meta( Utill::STORE_SETTINGS_KEYS['return_policy'] );
                $cancellation_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['exchange_policy'] );
            }

            if ( ! empty( $store_policy ) ) {
                $policies['store_policy'] = $store_policy;
            }

            if ( ! empty( $shipping_policy ) ) {
                $policies['shipping_policy'] = $shipping_policy;
            }

            if ( ! empty( $refund_policy ) ) {
                $policies['refund_policy'] = $refund_policy;
            }
            if ( ! empty( $cancellation_policy ) ) {
                $policies['cancellation_policy'] = $cancellation_policy;
            }
        }
        return $policies;
    }

    /**
     * Get store policies
     *
     * @param int $store_id Store ID.
     * @return array
     */
    public static function get_store_policies( $store_id = 0 ) {
        $policies                = array();
            $store_policy        = MultiVendorX()->setting->get_setting( 'store_policy', array() );
            $shipping_policy     = MultiVendorX()->setting->get_setting( 'shipping_policy', array() );
            $refund_policy       = MultiVendorX()->setting->get_setting( 'refund_policy', array() );
            $cancellation_policy = MultiVendorX()->setting->get_setting( 'cancellation_policy', array() );

		if ( $store_id ) {
			$store                     = new Store( $store_id );
			$privacy_override_settings = MultiVendorX()->setting->get_setting( 'store_policy_override', array() );

			if ( in_array( 'store', $privacy_override_settings, true ) ) {
				$store_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['store_policy'] );
			}
			if ( in_array( 'shipping', $privacy_override_settings, true ) ) {
				$shipping_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['shipping_policy'] );
			}
			if ( in_array( 'refund_return', $privacy_override_settings, true ) ) {
				$refund_policy       = $store->get_meta( Utill::STORE_SETTINGS_KEYS['refund_policy'] );
				$cancellation_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['exchange_policy'] );
			}
		}

		if ( ! empty( $store_policy ) ) {
			$policies['store_policy'] = $store_policy;
		}

		if ( ! empty( $shipping_policy ) ) {
			$policies['shipping_policy'] = $shipping_policy;
		}

		if ( ! empty( $refund_policy ) ) {
			$policies['refund_policy'] = $refund_policy;
		}
		if ( ! empty( $cancellation_policy ) ) {
			$policies['cancellation_policy'] = $cancellation_policy;
		}

        return $policies;
    }

    /**
     * Get the store dashboard endpoint URL.
     *
     * @param string $tab   The tab name.
     * @param string $sub   The sub-tab name.
     * @param string $value The value for the sub-tab.
     * @return string The endpoint URL.
     */
    public static function get_endpoint_url( $tab = '', $sub = '', $value = '' ) {

        // Set your Dashboard Page ID.
        $page_id = MultiVendorX()->setting->get_setting( 'store_dashboard_page' );

        // Pretty permalinks.
        if ( get_option( Utill::WORDPRESS_SETTINGS['permalink'] ) ) {
            $url = home_url( '/dashboard' );

            if ( $tab ) {
                $url .= '/' . sanitize_title( $tab );
            }
            if ( $sub ) {
                $url .= '/' . sanitize_title( $sub );
            }
            if ( $value ) {
                $url .= '/' . sanitize_title( $value );
            }

            return esc_url( trailingslashit( $url ) );
        }

        $url = add_query_arg( array( 'page_id' => $page_id ), home_url( '/' ) );

        if ( $tab ) {
            $url = add_query_arg( 'segment', sanitize_text_field( $tab ), $url );
        }
        if ( $sub ) {
            $url = add_query_arg( 'element', sanitize_text_field( $sub ), $url );
        }
        if ( $value ) {
            $url = add_query_arg( 'value', sanitize_text_field( $value ), $url );
        }

        return esc_url( $url );
    }



    /**
     * Get store records from the database based on given filters.
     *
     * @param array $args Filter options like 'ID', 'status', 'name', 'slug', 'description', 'who_created', 'create_time', 'limit', 'offset', 'count'.
     * @return array|int List of stores (array) or count (int) if 'count' is set.
     */
    public static function get_store_information( $args = array() ) {
        global $wpdb;

        $where = array();

        if ( isset( $args['ID'] ) ) {
            $ids     = is_array( $args['ID'] ) ? $args['ID'] : array( $args['ID'] );
            $ids     = implode( ',', array_map( 'intval', $ids ) );
            $where[] = "ID IN ($ids)";
        }

        if ( isset( $args['status'] ) ) {
            $where[] = "status = '" . esc_sql( $args['status'] ) . "'";
        }

        if ( isset( $args['name'] ) ) {
            $where[] = "name LIKE '%" . esc_sql( $args['name'] ) . "%'";
        }

        if ( isset( $args['slug'] ) ) {
            $where[] = "slug = '" . esc_sql( $args['slug'] ) . "'";
        }

        if ( isset( $args['searchField'] ) ) {
            $search  = esc_sql( $args['searchField'] );
            $where[] = "(name LIKE '%$search%')";
        }

        if ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) {
            $where[] = "create_time BETWEEN '" . esc_sql( $args['start_date'] ) . "' AND '" . esc_sql( $args['end_date'] ) . "'";
        }

        $table = $wpdb->prefix . Utill::TABLES['store'];

        if ( isset( $args['count'] ) ) {
            $query = "SELECT COUNT(*) FROM {$table}";
        } else {
            $query = "SELECT * FROM {$table}";
        }

        if ( ! empty( $where ) ) {
            $condition = $args['condition'] ?? ' AND ';
            $query    .= ' WHERE ' . implode( $condition, $where );
        }

        // ADD SORTING SUPPORT HERE.
        if ( ! empty( $args['orderBy'] ) ) {
            // Only allow safe columns to sort by (avoid SQL injection).
            $allowed_columns = array( 'ID', 'name', 'status', 'slug', 'create_time' );
            $orderBy         = in_array( $args['orderBy'], $allowed_columns, true ) ? $args['orderBy'] : 'ID';
            $order           = ( isset( $args['order'] ) && strtolower( $args['order'] ) === 'desc' ) ? 'DESC' : 'ASC';
            $query          .= " ORDER BY {$orderBy} {$order}";
        }

        // Keep your pagination logic.
        if ( isset( $args['limit'] ) && isset( $args['offset'] ) && empty( $args['count'] ) ) {
            $limit  = intval( $args['limit'] );
            $offset = intval( $args['offset'] );
            $query .= " LIMIT $limit OFFSET $offset";
        }

        if ( isset( $args['count'] ) ) {
            $results = $wpdb->get_var( $query );
        } else {
            $results = $wpdb->get_results( $query, ARRAY_A );
        }

        /** Centralized error logging (only once) */
        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $results ?? ( isset( $args['count'] ) ? 0 : array() );
    }

    /**
     * Get all product IDs that should be excluded based on conditions.
     *
     * @param int  $product_id Product ID.
     * @param int  $store_id Store ID.
     * @param bool $check_payouts Whether to check for payouts.
     * @return boolean
     */
    public static function get_excluded_products( $product_id = '', $store_id = '', $check_payouts = false ) {

        $store_id = ! empty( $store_id ) ? $store_id : get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );

        if ( ! $store_id ) {
            return false;
        }
        $store = Store::get_store_by_id( $store_id );

        $status           = $store->get( 'status' );
        $review_settings  = MultiVendorX()->setting->get_setting( 'restriction_for_under_review', array() );
        $suspend_settings = MultiVendorX()->setting->get_setting( 'restriction_for_sunspended', array() );

        if ( $check_payouts ) {
            if ( 'under_review' === $status && in_array( 'hold_payments_release', $review_settings, true ) ) {
                return true;
            }

            if ( 'suspended' === $status && in_array( 'freeze_all_payments', $suspend_settings, true ) ) {
                return true;
            }
        } else {
            if ( 'under_review' === $status && in_array( 'pause_selling_products', $review_settings, true ) ) {
                return true;
            }

            if ( 'suspended' === $status && in_array( 'store_visible_in_checkout', $suspend_settings, true ) ) {
                return true;
            }
        }

        return false;
    }
}
