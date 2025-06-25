<?php
/**
 * New enrollment email (plain text)
 *
 * Override this template by copying it to yourtheme/moowoodle/emails/plain/EnrollmentEmail.php
 *
 * @author    DualCube
 * @package   moowoodle/templates
 * @version   3.3.0
 */

defined( 'ABSPATH' ) || exit();

$user = get_user_by( 'email', $args['user_email'] );

echo esc_html(
	sprintf(
		// translators: %s: User's first name.
		__( 'Hi %s,', 'moowoodle' ),
		$user->first_name ?? ''
	)
) . "\n\n";

echo esc_html(
	sprintf(
		// translators: %s: Blog name.
		__( 'Welcome to %s! We’re excited to have you onboard.', 'moowoodle' ),
		get_bloginfo( 'name' )
	)
) . "\n\n";

echo esc_html__(
	'An account has been created for you on our learning platform so you can begin your journey with us. Below are your login details:',
	'moowoodle'
) . "\n\n";

echo esc_html__( 'Your Account Information', 'moowoodle' ) . "\n";
echo "-------------------------\n";
echo esc_html__( 'Website:', 'moowoodle' ) . ' ' . esc_url( home_url() ) . "\n";
echo esc_html__( 'Username:', 'moowoodle' ) . ' ' . esc_html( $user->user_login ?? 'John Doe' ) . "\n";

$wp_pwd         = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_user_pwd', true );
$moodle_pwd     = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_user_pwd', true );
$wp_created     = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_new_user_created', true );
$moodle_created = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_new_user_created', true );

if ( $wp_created && $moodle_created && $wp_pwd === $moodle_pwd ) {
	echo esc_html__( 'Password:', 'moowoodle' ) . ' ' . esc_html( $wp_pwd ) . "\n";
	echo esc_html__(
		'This password will work for both your WordPress and Moodle accounts. You will be required to change your Moodle password after your first login.',
		'moowoodle'
	) . "\n";
} else {
	if ( $wp_created ) {
		echo esc_html__( 'WordPress Password:', 'moowoodle' ) . ' ' . esc_html( $wp_pwd ) . "\n";
	}
	if ( $moodle_created ) {
		echo esc_html__( 'Moodle Password:', 'moowoodle' ) . ' ' . esc_html( $moodle_pwd ) . "\n";
		echo esc_html__(
			'Note: You will be required to change your Moodle password after your first login.',
			'moowoodle'
		) . "\n";
	}
}

echo "\n" . esc_html__( 'Enrollment Details', 'moowoodle' ) . "\n";
echo "--------------------\n";

echo esc_html__( 'Course(s):', 'moowoodle' ) . "\n";
if ( ! empty( $args['enrollments']['course'] ) && is_array( $args['enrollments']['course'] ) ) {
	foreach ( $args['enrollments']['course'] as $product_id => $product_name ) {
		echo '- ' . esc_html( $product_name ) . "\n";
	}
} else {
	echo '- ' . esc_html__( 'Dummy Course', 'moowoodle' ) . "\n";
}

echo "\n" . esc_html__( 'Access Your Courses', 'moowoodle' ) . "\n";
echo "----------------------\n";
echo esc_html__( 'To get started with your courses, please visit:', 'moowoodle' ) . "\n";
echo '👉 ' . esc_url( wc_get_page_permalink( 'myaccount' ) . 'my-courses/' ) . "\n\n";

$support_email = 'support@' . wp_parse_url( home_url(), PHP_URL_HOST );

echo esc_html(
	sprintf(
		// translators: %s: support email address.
		__( 'If you have any questions or face any issues logging in, feel free to reach out to our support team at %s.', 'moowoodle' ),
		$support_email
	)
) . "\n\n";

echo esc_html__( 'Wishing you a great learning experience!', 'moowoodle' ) . "\n";
