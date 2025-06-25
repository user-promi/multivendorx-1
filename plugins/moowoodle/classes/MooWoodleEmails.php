<?php
/**
 * Email class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * MooWoodle Emails class
 *
 * @class       Emails class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class MooWoodleEmails {
	/**
     * Emails constructor.
     */
	public function __construct() {
		add_filter( 'woocommerce_email_classes', array( &$this, 'moowoodle_emails' ) );
		add_action( 'moowoodle_after_enrol_moodle_user', array( &$this, 'send_enrollment_confirmation_email' ), 10, 2 );
	}

	/**
	 * MooWoodle emails
     *
	 * @param array $emails all email class array.
	 * @return array
	 */
	public function moowoodle_emails( $emails ) {
		$emails['EnrollmentEmail'] = new Emails\EnrollmentEmail();
		return $emails;
	}

	/**
	 * Send confirmation for enrollment in Moodle courses.
	 *
	 * @param array $enrollment_details Detailed data about enrollments (e.g., course IDs).
	 * @param int   $user_id            WordPress user ID.
	 * @return void
	 */
	public function send_enrollment_confirmation_email( $enrollment_details, $user_id ) {
		$emails = WC()->mailer()->get_emails();

		$user = get_userdata( $user_id );
		if ( empty( $user ) || empty( $user->user_email ) ) {
			return;
		}

		// Allow deeply customizable data injection via filter.
		$email_data = apply_filters( 'moowoodle_enrollment_email_data', array(), $enrollment_details );

		// Gracefully gather course information if available.
		if ( ! empty( $enrollment_details['course'] ) ) {
			$course_ids = array_keys( $enrollment_details['course'] );
			$courses    = MooWoodle()->course->get_course_information( array( 'id' => $course_ids ) );

			if ( ! empty( $courses ) ) {
				foreach ( $courses as $course ) {
					$course_id                                  = (int) $course['id'];
					$email_data['course_details'][ $course_id ] = array(
						'id'   => $course_id,
						'name' => $course['fullname'],
					);
				}
			}
		}

		return $emails['EnrollmentEmail']->trigger( $user->user_email, $email_data );
	}
}
