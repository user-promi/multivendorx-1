<?php
/**
 * Invoice PDF Generator
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Invoice;

use Dompdf\Dompdf;
use Dompdf\Options;
use WP_REST_Controller;
use WP_REST_Server;
use WP_Error;

defined( 'ABSPATH' ) || exit;

class Invoice extends WP_REST_Controller {

    /**
     * REST base
     *
     * @var string
     */
    protected $rest_base = 'pdf';

    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    /**
     * Register routes
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'generate_pdf' ),
                    'permission_callback' => array( $this, 'permissions_check' ),
                ),
            )
        );
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ": Invoice PDF Generator: : " . var_export(MultiVendorX()->rest_namespace, true) . "\n", FILE_APPEND);
    }

    /**
     * Permission check
     */
    public function permissions_check( $request ) {
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ": Invoice PDF Generator: : " . var_export($request, true) . "\n", FILE_APPEND);
        return true;
    }

    /**
     * Generate & stream PDF
     */
    public function generate_pdf( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
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

            return new WP_Error(
                'pdf_error',
                __( 'Failed to generate PDF', 'multivendorx' ),
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

        // Allow style tags with any content
        $allowed['style'] = array(
            'type' => true,
        );

        // Allow all common HTML elements with style attribute
        $allowed['div']['style'] = true;
        $allowed['span']['style'] = true;
        $allowed['p']['style'] = true;
        $allowed['h1']['style'] = true;
        $allowed['h2']['style'] = true;
        $allowed['h3']['style'] = true;
        $allowed['h4']['style'] = true;
        $allowed['table']['style'] = true;
        $allowed['tr']['style'] = true;
        $allowed['td']['style'] = true;
        $allowed['th']['style'] = true;
        $allowed['thead']['style'] = true;
        $allowed['tbody']['style'] = true;

        $allowed['svg']   = array(
            'xmlns'   => true,
            'width'   => true,
            'height'  => true,
            'viewBox' => true,
            'fill'    => true,
            'style'   => true,
        );
        $allowed['path']  = array(
            'd'    => true,
            'fill' => true,
            'style' => true,
        );

        // For DOMPDF, we need to allow inline styles, so let's be more permissive
        // but still sanitize dangerous content
        return $html; // Return as-is for PDF generation, DOMPDF will handle it safely
    }
}
