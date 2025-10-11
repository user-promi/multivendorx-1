<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Store_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'store';

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'create_item' ],
                'permission_callback' => [ $this, 'create_item_permissions_check' ],
            ],
        ] );

        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
            ],
        ]);

        register_rest_route(MultiVendorX()->rest_namespace, '/states/(?P<country>[A-Z]{2})', [
            'methods'               => \WP_REST_Server::READABLE,
            'callback'              => [$this, 'get_states_by_country'],
            'permission_callback'   => [$this, 'get_items_permissions_check'],
        ]);

    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' ) || current_user_can('edit_stores');
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'create_stores' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('edit_stores');
    }


    // GET 
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
            
            // Log the error
            if ( is_wp_error( $error ) ) {
				MultiVendorX()->util->log(
                    "MVX REST Error:\n" .
                    "\tCode: " . $error->get_error_code() . "\n" .
                    "\tMessage: " . $error->get_error_message() . "\n" .
                    "\tData: " . wp_json_encode( $error->get_error_data() ) . "\n"
                );
            }

            return $error;
        }

        try {
            $options = $request->get_param( 'options' );
            if( $options ){
                return $this->get_stores_dropdown( $request );
            }

            $status = $request->get_param( 'status' );
            if( $status ){
                return $this->get_pending_stores( $request );
            }

            $follower = $request->get_param( 'follower' );
            if( $follower ){
                return $this->get_store_follower( $request );
            }
            $count          = $request->get_param( 'count' );

            if ( $count ) {
                return StoreUtil::get_store_information(['count' => true]);
            }

            $limit          = max( intval( $request->get_param( 'row' ) ), 10 );
            $page           = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset         = ( $page - 1 ) * $limit;
            $filter_status          = $request->get_param( 'filter_status' );
            $searchField  = sanitize_text_field( $request->get_param( 'searchField' ) );
            $start_date_raw = sanitize_text_field( $request->get_param( 'startDate' ) );
            $end_date_raw   = sanitize_text_field( $request->get_param( 'endDate' ) );

            // Convert to proper timestamps
            $start_timestamp = ! empty( $start_date_raw ) ? strtotime( str_replace('T', ' ', preg_replace('/\.\d+Z?$/', '', $start_date_raw)) ) : false;
            $end_timestamp   = ! empty( $end_date_raw )   ? strtotime( str_replace('T', ' ', preg_replace('/\.\d+Z?$/', '', $end_date_raw)) )   : false;

            $start_date = $start_timestamp ? date( 'Y-m-d 00:00:00', $start_timestamp ) : '';
            $end_date   = $end_timestamp   ? date( 'Y-m-d 23:59:59', $end_timestamp )   : '';

            $args = [
                'limit'  => $limit,
                'offset' => $offset,
            ];
            
            // Pass search to StoreUtil
            if ( $searchField ) {
                $args['searchField'] = $searchField;
            } elseif ( $start_date && $end_date ) {
                // Only apply date filter if no search
                $args['start_date'] = $start_date;
                $args['end_date']   = $end_date;
            }
            
            if ( ! empty( $filter_status ) ) {
                $args['status'] = $filter_status;
            }
            

            $stores = StoreUtil::get_store_information( $args );

            $formatted_stores = array();
            foreach ( $stores as $store ) {
                $store_meta = Store::get_store_by_id( (int) $store['ID'] );

                $formatted_stores[] = apply_filters(
                    'multivendorx_stores',
                    array(
                        'id'         => (int) $store['ID'],
                        'store_name' => $store['name'],
                        'store_slug' => $store['slug'],
                        'status'     => $store['status'],
                        'email'      => $store_meta->meta_data['email'] ?? '',
                        'applied_on' => $store['create_time'],
                    )
                );
            }
            $all = StoreUtil::get_store_information(['count' => true]);
            $active = StoreUtil::get_store_information(['status' => 'active','count' => true]);
            $pending = StoreUtil::get_store_information(['status' => 'pending','count' => true]);

            $response = [
                'stores'  => $formatted_stores,
                'all'     => $all,
                'active'  => $active,
                'pending' => $pending,
            ];
            return rest_ensure_response( $response);

        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                "MVX REST Exception:\n" .
                "\tMessage: " . $e->getMessage() . "\n" .
                "\tFile: " . $e->getFile() . "\n" .
                "\tLine: " . $e->getLine() . "\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function get_pending_stores( $request ) {
        global $wpdb;
    
        $limit      = max( intval( $request->get_param( 'row' ) ), 10 );
        $page       = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset     = ( $page - 1 ) * $limit;
        $count      = $request->get_param( 'count' );
    
        $start_date = $request->get_param( 'start_date' ); // ISO8601 string
        $end_date   = $request->get_param( 'end_date' );   // ISO8601 string
    
        $table_name = "{$wpdb->prefix}" . Utill::TABLES['store'];
    
        if ( $count ) {
            // Get total count with optional date filter
            $sql = "SELECT COUNT(*) FROM $table_name WHERE status = 'pending'";
            $params = [];
    
            if ( $start_date && $end_date ) {
                $sql .= " AND create_time BETWEEN %s AND %s";
                $params[] = $start_date;
                $params[] = $end_date;
            }
    
            $total_count = $params ? $wpdb->get_var( $wpdb->prepare( $sql, ...$params ) ) : $wpdb->get_var( $sql );
            return rest_ensure_response( (int) $total_count );
        }
    
        // Get pending stores
        $sql = "SELECT * FROM $table_name WHERE status = 'pending'";
        $params = [];
    
        if ( $start_date && $end_date ) {
            $sql .= " AND create_time BETWEEN %s AND %s";
            $params[] = $start_date;
            $params[] = $end_date;
        }
    
        $sql .= " ORDER BY create_time DESC LIMIT %d OFFSET %d";
        $params[] = $limit;
        $params[] = $offset;
    
        $stores = $params ? $wpdb->get_results( $wpdb->prepare( $sql, ...$params ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A );
    
        $formatted_stores = array();
        foreach ( $stores as $store ) {
            $store_id    = (int) $store['ID'];
            $store_name  = $store['name'];
            $store_slug  = $store['slug'];
            $status      = $store['status'];
            $applied_on  = $store['create_time'];
    
            $formatted_stores[] = apply_filters(
                'multivendorx_stores',
                array(
                    'id'         => $store_id,
                    'store_name' => $store_name,
                    'store_slug' => $store_slug,
                    'status'     => $status,
                    'applied_on' => $applied_on,
                )
            );
        }
    
        return rest_ensure_response( $formatted_stores );
    }
    
    public function get_stores_dropdown( $request ) {
        $stores = StoreUtil::get_store();
    
        $formatted_stores = array();
        foreach ( $stores as $store ) {
            $formatted_stores[] = array(
                'id'         => (int) $store['ID'],
                'store_name' => $store['name'],
            );
        }
    
        return rest_ensure_response( $formatted_stores );
    }
    

    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
        $registrations = $request->get_header( 'registrations' );
        $store_data = $request->get_param('formData');

        $current_user = wp_get_current_user();

        // Create store object
        $store = new \MultiVendorX\Store\Store();
        
        $core_fields = [ 'name', 'slug', 'description', 'who_created', 'status' ];
        $store_data['who_created'] = $current_user->ID;

        if ( MultiVendorX()->setting->get_setting( 'approve_store' ) == 'automatically' ) {
            $store_data['status'] = 'active';
        } else {
            $store_data['status'] = 'pending';
        }

        foreach ( $core_fields as $field ) {
            if ( isset( $store_data[ $field ] ) ) {
                $store->set( $field, $store_data[ $field ] );
            }
        }

        $insert_id = $store->save();

        if ( $insert_id && ! $registrations ) {
            foreach ( $store_data as $key => $value ) {
                if ( ! in_array( $key, $core_fields, true ) ) {
                    $store->update_meta( $key, $value );
                }
            }
        }

        if ( $registrations ) {
            // Collect all non-core fields into one array
            $non_core_fields = [];
            foreach ( $store_data as $key => $value ) {
                if ( ! in_array( $key, $core_fields, true ) ) {
                    $non_core_fields[$key] = $value;
                }
            }

            // Save them under one key
            if ( ! empty( $non_core_fields ) ) {
                $store->update_meta( 'multivendorx_registration_data', serialize($non_core_fields) );
            }


            if ( MultiVendorX()->setting->get_setting( 'approve_store' ) == 'automatically' ) {
                $current_user->set_role( 'store_owner' );
            } else {
                if ( ! in_array( 'store_owner', (array) $current_user->roles ) ) {
                    $role = get_option( 'default_role' );
                    $current_user->set_role( $role );
                }
            }

            StoreUtil::set_primary_owner($current_user->ID, $insert_id);

            update_user_meta($current_user->ID, 'multivendorx_active_store', $insert_id);

            // wp_set_current_user( $current_user->ID );
            // wp_set_auth_cookie( $current_user->ID );
            // do_action( 'wp_login', $current_user->user_login, $current_user );

            return rest_ensure_response( [
                'success' => true,
                'id'      => $insert_id,
                'redirect'  => get_permalink( MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) ),
            ] );
        }

        return rest_ensure_response( [
            'success' => true,
            'id'      => $insert_id
        ] );
    }

    public function get_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );
        $store = $request->get_param( 'store' );
        if( $store ){
            return $this->get_store_products_and_category( $request );
        }
        $fetch_user = $request->get_param( 'fetch_user' );
        $registrations = $request->get_header( 'registrations' );
        if ($fetch_user) {
            $users = StoreUtil::get_store_users($id);

            $response = [
                'id'           => $id,
                'store_owners' => $users,
            ];
            return rest_ensure_response( $response );
        }

        // Load the store
        $store = new \MultiVendorX\Store\Store( $id );
        if ( $registrations ) {
            $response = StoreUtil::get_store_registration_form( $store->get_id() );
            return rest_ensure_response( $response );
        }

        $response = [
            'id'          => $store->get_id(),
            'name'        => $store->get('name'),
            'slug'        => $store->get('slug'),
            'description' => $store->get('description'),
            'who_created' => $store->get('who_created'),
            'status'      => $store->get('status'),
        ];

        // Add meta data
        foreach ( $store->meta_data as $key => $values ) {
            $response[ $key ] = is_array( $values ) ? $values[0] : $values;
        }

        return rest_ensure_response( $response );
    }

    public function update_item( $request ) {
        $id   = absint( $request->get_param( 'id' ) );
        $data = $request->get_json_params();
    
        $store = new \MultiVendorX\Store\Store( $id );
    
        // Handle registration & core data
        if (!empty($data['registration_data']) && !empty($data['core_data'])) {
            if (isset($data['status']) && $data['status'] === 'approve') {
                $users = StoreUtil::get_store_users($id);
                $user = get_userdata( reset($users) );
                if ( $user ) {
                    $user->set_role( 'store_owner' ); 
                    StoreUtil::set_primary_owner($user->ID, $id);
                    return rest_ensure_response([ 'success' => true ]);
                }
            } elseif (isset($data['status']) && $data['status'] === 'rejected') {
                $store->set('status', 'rejected');
    
                // Save _reject_note if provided
                if (!empty($data['_reject_note'])) {
                    $store->update_meta('_reject_note', sanitize_text_field($data['_reject_note']));
                }
    
                $store->save();
                return rest_ensure_response([ 'success' => true ]);
            }
            return;
        }
    
        // Handle adding store owners
        if (!empty($data['store_owners'])) {
            StoreUtil::add_store_users([
                'store_id' => $data['id'],
                'users'    => $data['store_owners'],
                'role_id'  => 'store_owner',
            ]);
    
            return rest_ensure_response([ 'success' => true ]);
        }
    
        // Update basic store info
        $store->set('name',        $data['name'] ?? $store->get('name'));
        $store->set('slug',        $data['slug'] ?? $store->get('slug'));
        $store->set('description', $data['description'] ?? $store->get('description'));
        $store->set('who_created', 'admin');
        $store->set('status',      $data['status'] ?? $store->get('status'));
    
        // Save all other meta dynamically
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                if (!in_array($key, ['id','name','slug','description','who_created','status'], true)) {
                    $store->update_meta($key, $value);
                }
            }
        }
    
        $store->save();
    
        return rest_ensure_response([
            'success' => true,
            'id'      => $store->get_id(),
        ]);
    }
    

    public function get_states_by_country($request) {
        $country_code = $request->get_param('country');
        $states = WC()->countries->get_states($country_code);

        $state_list = [];

        if (is_array($states)) {
            foreach ($states as $code => $name) {
                $state_list[] = [
                    'label' => $name,
                    'value' => $code,
                ];
            }
        }

        return rest_ensure_response($state_list);
    }

    public function get_store_products_and_category( $request ) {
        $id = absint( $request->get_param( 'id' ) );
    
        if ( ! $id ) {
            return new \WP_Error(
                'invalid_store_id',
                __( 'Invalid store ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    
        // ✅ Fetch products for this store
        $products = wc_get_products( array(
            'status'     => 'publish', // or use your $status variable if dynamic
            'limit'      => -1,
            'return'     => 'ids',
            'meta_key'   => 'multivendorx_store_id',
            'meta_value' => $id,
        ) );
    
        $product_data = array();
        if ( ! empty( $products ) ) {
            foreach ( $products as $product_id ) {
                $product_obj = wc_get_product( $product_id );
                if ( $product_obj ) {
                    $product_data[] = array(
                        'value'    => $product_obj->get_id(),
                        'label'  => $product_obj->get_name(),
                    );
                }
            }
        }
    
        // ✅ Fetch categories
        $categories = get_terms( array(
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
        ) );
    
        $category_data = array();
        if ( ! is_wp_error( $categories ) && ! empty( $categories ) ) {
            foreach ( $categories as $cat ) {
                $category_data[] = array(
                    'value'    => $cat->term_id,
                    'label'  => $cat->name,
                );
            }
        }
    
        return rest_ensure_response( array(
            'products'   => $product_data,
            'categories' => $category_data,
        ) );
    }
    /**
     * Get paginated followers of a store
     */
    public function get_store_follower( $request ) {
        $store_id = intval( $request->get_param( 'store_id' ) );
        if ( ! $store_id ) {
            return rest_ensure_response( ['error' => 'Invalid store ID'] );
        }
    
        // Check if count param is requested
        $count = $request->get_param( 'count' );
    
        // Get store object
        $store = new \MultiVendorX\Store\Store( $store_id );
    
        // Fetch followers from meta_data
        $followers_raw = $store->meta_data['followers'] ?? '[]';
        $followers = json_decode( $followers_raw, true );
        if ( ! is_array( $followers ) ) {
            $followers = [];
        }
    
        // ✅ Handle old format (plain array of user IDs)
        // Convert to new format with id + empty date
        if ( isset( $followers[0] ) && is_int( $followers[0] ) ) {
            $followers = array_map( fn( $uid ) => ['id' => $uid, 'date' => '' ], $followers );
        }
    
        if ( $count ) {
            return rest_ensure_response( count( $followers ) );
        }
    
        // Pagination
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $offset = ( $page - 1 ) * $limit;
    
        // Paginate followers
        $followers_page = array_slice( $followers, $offset, $limit );
    
        $formatted_followers = [];
        foreach ( $followers_page as $follower ) {
            $user_id = $follower['id'] ?? 0;
            $follow_date = $follower['date'] ?? '';
    
            $user = get_userdata( $user_id );
            if ( $user ) {
                // Get first + last name
                $first_name = get_user_meta( $user_id, 'first_name', true );
                $last_name  = get_user_meta( $user_id, 'last_name', true );
    
                // Combine names, fallback to display_name if empty
                $full_name = trim( "$first_name $last_name" );
                if ( empty( $full_name ) ) {
                    $full_name = $user->display_name;
                }
    
                $formatted_followers[] = [
                    'id'    => $user_id,
                    'name'  => $full_name,
                    'email' => $user->user_email,
                    'date'  => $follow_date, // ✅ Include follow date
                ];
            }
        }
    
        return rest_ensure_response( $formatted_followers );
    }
    
    
}