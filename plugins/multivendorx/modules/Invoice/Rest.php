<?php
/**
 * Modules REST API Announcement controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Invoice;

use Dompdf\Dompdf;
use Dompdf\Options;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Announcement controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rest extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'pdf';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
				),
			)
        );
    }
    /**
     * Create item permissions check.
     *
     * @param object $request The request object.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * Create a single item.
     *
     * @param object $request Full data about the request.
     */
    public function create_item( $request ) {
        // Validate nonce.
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            $html = $request->get_param( 'html' );

            if ( empty( $html ) ) {
                return new WP_Error(
                    'missing_html',
                    __( 'HTML content is required', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            // Sanitize but keep styles
            $html = $this->sanitize_html( $html );

            // DOMPDF options
            $options = new Options();
            $options->set( 'isRemoteEnabled', true );
            $options->set( 'isHtml5ParserEnabled', true );
            $options->set( 'defaultFont', 'DejaVu Sans' );

            $dompdf = new Dompdf( $options );

            // Page settings (future-ready)
            $paper       = $request->get_param( 'paper' ) ?: 'A4';
            $orientation = $request->get_param( 'orientation' ) ?: 'portrait';

            $dompdf->loadHtml( $html, 'UTF-8' );
            $dompdf->setPaper( $paper, $orientation );
            $dompdf->render();

            // Stream response
            $pdf = $dompdf->output();

            nocache_headers();
            header( 'Content-Type: application/pdf' );
            header( 'Content-Disposition: attachment; filename=invoice.pdf' );
            header( 'Content-Length: ' . strlen( $pdf ) );

            echo $pdf;
            exit;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Minimal safe HTML sanitization
     */
    protected function sanitize_html( $html ) {
        // Allow styles, tables, svg, etc. (DOMPDF safe)
        $allowed = wp_kses_allowed_html( 'post' );

        $allowed['style'] = array();
        $allowed['svg']   = array(
            'xmlns'   => true,
            'width'   => true,
            'height'  => true,
            'viewBox' => true,
            'fill'    => true,
        );
        $allowed['path']  = array(
            'd'    => true,
            'fill' => true,
        );

        return wp_kses( $html, $allowed );
    }
}
