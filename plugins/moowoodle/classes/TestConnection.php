<?php
/**
 * MooWoodle TestConnection file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * Plugin TestConnection class
 *
 * @version 3.1.7
 * @package MooWoodle
 * @author  DualCube
 */
class TestConnection {

	/**
	 * Get Site info of the Moodle site.
     *
	 * @return mixed
	 */
	public static function get_site_info() {
		// Get the site info.
		$response = MooWoodle()->external_service->do_request( 'get_site_info' );

		if ( $response && ! isset( $response['error'] ) ) {
			$response = $response['data'];

			// Get all webservice functions.
			$webservice_functions = MooWoodle()->external_service->get_core_functions();
			$webservice_functions = array_values( $webservice_functions );

			// Get register webservice functions.
			$register_functions = array_map(
                function ( $all_function ) {
					return $all_function['name'];
				},
                $response['functions']
            );

			// Get missing functions.
			$missing_functions = array_diff( $webservice_functions, $register_functions );

			if ( $missing_functions ) {
				MooWoodle()->util->log( 'It seems that Moodle external web service functions [' . implode( ', ', $missing_functions ) . '] not configured correctly.' );
			}

			// Check missing setting on pro active.
			if ( MooWoodle()->util->is_khali_dabba() ) {
				if ( ! in_array( 'auth_moowoodle_user_sync_get_all_users_data', $missing_functions, true ) ) {
					MooWoodle()->util->log( "It seems that you are using MooWoodle Pro but Moodle external web service functions 'auth_moowoodle_user_sync_get_all_users_data' is not configured correctly.\n\n" );
                }

				if ( ! in_array( 'auth_moowoodle_user_sync', $missing_functions, true ) ) {
					MooWoodle()->util->log( "It seems that you are using MooWoodle Pro but Moodle external web service functions 'auth_moowoodle_user_sync' is not configured correctly.\n\n" );
                }

				if ( 1 !== $response['downloadfiles'] ) {
					MooWoodle()->util->log( "It seems that you are using MooWoodle Pro but Moodle external web service is not configured correctly. Please edit your Moodle External service and enable 'Can download files' (you can find it from 'Show more...' options)\n\n" );
                }
			}

			update_option( 'moowoodle_moodle_site_name', $response['sitename'] );
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Get all Moodle Course.
     *
	 * @return array
	 */
	public static function get_course() {
		$response = MooWoodle()->external_service->do_request( 'get_courses' );

		if ( $response && ! isset( $response['error'] ) && count( $response['data'] ) > 0 ) {
			$response = array(
				'courses' => $response['data'],
				'success' => true,
			);
		}

		return $response;
	}

	/**
	 * Get all Moodle Catagory.
     *
	 * @return array
	 */
	public static function get_catagory() {
		$response = MooWoodle()->external_service->do_request( 'get_categories' );

		if ( $response && ! isset( $response['error'] ) ) {
			$response = array(
				'catagories' => $response['data'],
				'success'    => true,
			);
		}

		return $response;
	}

	/**
	 * Create a dumy user for test connection.
     *
	 * @return string[]
	 */
	public static function create_user() {
		// find user on moodle with moodle externel function.
		$response = MooWoodle()->external_service->do_request(
			'get_moodle_users',
			array(
				'criteria' => array(
					array(
						'key'   => 'username',
						'value' => 'moowoodletestuser',
					),
				),
			)
		);

		if ( ! empty( $response['data']['users'] ) ) {
			$user = reset( $response['data']['users'] );
		    self::delete_users( $user['id'] );
		}

		$response = MooWoodle()->external_service->do_request(
            'create_users',
            array(
				'users' => array(
					array(
						'email'       => 'moowoodletestuser@gmail.com',
						'username'    => 'moowoodletestuser',
						'password'    => 'Moowoodle@123',
						'auth'        => 'manual',
						'firstname'   => 'moowoodle',
						'lastname'    => 'testuser',
						'city'        => 'moowoodlecity',
						'country'     => 'IN',
						'preferences' => array(
							0 => array(
								'type'  => 'auth_forcepasswordchange',
								'value' => 1,
							),
						),
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Get the previously created dummy user.
     *
	 * @return array
	 */
	public static function get_user() {
		$response = MooWoodle()->external_service->do_request(
            'get_moodle_users',
            array(
				'criteria' => array(
					array(
						'key'   => 'username',
						'value' => 'moowoodletestuser',
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) && count( $response['data']['users'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Update Moodle dummy user.
     *
	 * @param int $user_id dummy user id.
	 * @return mixed
	 */
	public static function update_user( $user_id ) {
		$response = MooWoodle()->external_service->do_request(
            'update_users',
            array(
				'users' => array(
					array(
						'id'          => $user_id,
						'email'       => 'moowoodletestuser@gmail.com',
						'username'    => 'moowoodletestuser',
						'password'    => 'Moowoodle@123',
						'auth'        => 'manual',
						'firstname'   => 'moowoodle',
						'lastname'    => 'testuser',
						'city'        => 'citymoowoodle',
						'country'     => 'IN',
						'preferences' => array(
							0 => array(
								'type'  => 'auth_forcepasswordchange',
								'value' => 1,
							),
						),
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Enrol a user to a particular course.
     *
	 * @param mixed $user_id user id.
	 * @param mixed $course_id course id.
	 * @return mixed response
	 */
	public static function enrol_users( $user_id, $course_id ) {
		$response = MooWoodle()->external_service->do_request(
            'enrol_users',
            array(
				'enrolments' => array(
					array(
						'courseid' => "$course_id",
						'userid'   => "$user_id",
						'roleid'   => '5',
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Unnrol a user to a particular course.
     *
	 * @param mixed $user_id user id.
	 * @param mixed $course_id course id.
	 * @return mixed response
	 */
	public static function unenrol_users( $user_id, $course_id ) {
		$response = MooWoodle()->external_service->do_request(
            'unenrol_users',
            array(
				'enrolments' => array(
					array(
						'courseid' => "$course_id",
						'userid'   => "$user_id",
					),
				),
			)
        );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}

	/**
	 * Summary of delete_users.
     *
	 * @param mixed $user_id user id.
	 * @return mixed
	 */
	public static function delete_users( $user_id ) {
		$response = MooWoodle()->external_service->do_request( 'delete_users', array( 'userids' => array( $user_id ) ) );

		if ( $response && ! isset( $response['error'] ) ) {
			$response['success'] = true;
		}

		return $response;
	}
}
