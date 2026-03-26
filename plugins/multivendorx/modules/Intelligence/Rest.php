<?php
/**
 * AI Assistant REST API Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Intelligence;

defined( 'ABSPATH' ) || exit;

/**
 * Class AI
 *
 * REST controller for AI Assistant operations.
 *
 * @package MultiVendorX\Intelligence
 */
class Rest extends \WP_REST_Controller {

    /**
     * Route Base.
     *
     * @var string
     */
    protected $rest_base = 'intelligence';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    /**
     * Register AI Assistant API routes
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Get items permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'edit_products' );
    }

    /**
     * Handle AI request (main entry point).
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );

        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_REST_Response(
                array(
                    'success' => false,
                    'code'    => 'invalid_nonce',
                    'message' => __( 'Invalid nonce.', 'multivendorx' ),
                ),
                401
            );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            $endpoint = sanitize_text_field( $request->get_param( 'endpoint' ) );

            switch ( $endpoint ) {
                case 'suggestions':
                    return $this->generate_suggestions( $request );

                case 'generate_image':
                    $response = apply_filters(
                        'multivendorx_ai_handle_endpoint',
                        $request
                    );

                    if ( $response ) {
                        return $response;
                    }

                    return new \WP_REST_Response(
                        array(
                            'success' => false,
                            'code'    => 'invalid_endpoint',
                            'message' => __( 'Invalid AI endpoint.', 'multivendorx' ),
                        ),
                        400
                    );
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
        }
    }

    /**
     * Generate AI suggestions based on user prompt.
     *
     * @param \WP_REST_Request $request REST request object containing 'user_prompt'.
     * @return \WP_REST_Response
     */
    private function generate_suggestions( $request ) {
        try {
            $user_prompt = sanitize_textarea_field( $request->get_param( 'user_prompt' ) );

            if ( empty( $user_prompt ) ) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'prompt_missing',
                        'message' => __( 'Prompt is required.', 'multivendorx' ),
                    ),
                    400
                );
            }

            $provider = MultiVendorX()->setting->get_setting( 'choose_ai_provider' );

            $base_prompt =
                "You are an expert product content generator. Based on the user's request: '{$user_prompt}', " .
                'generate 2 options for each of the following: a catchy Product Name, a short description (max 20 words), ' .
                'and a detailed description (max 100 words). IMPORTANT: return ONLY a valid JSON object with keys: ' .
                "'productName', 'shortDescription', 'productDescription', each containing exactly 2 strings. " .
                'Do NOT include Markdown, backticks, explanations, or any extra text. ONLY the JSON object.';

            $json_response = '';

            switch ( $provider ) {
                case 'gemini_api':
                    $json_response = Util::call_gemini_api( MultiVendorX()->setting->get_setting( 'gemini_api_key' ), $base_prompt );
                    break;

                case 'openai_api':
                    $json_response = Util::call_openai_api( MultiVendorX()->setting->get_setting( 'openai_api_key' ), $base_prompt );
                    break;

                case 'openrouter_api':
                    $json_response = Util::call_openrouter_api( MultiVendorX()->setting->get_setting( 'openrouter_api_key' ), $base_prompt );
                    break;
            }

            MultiVendorX()->util->log( 'AI Raw Response: ' . $json_response );

            $suggestions = json_decode( $json_response, true );

            if ( ! is_array( $suggestions ) ) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'invalid_response',
                        'message' => 'Invalid response from AI provider.',
                    ),
                    500
                );
            }

            return rest_ensure_response(
                array(
					'productName'        => array_slice( (array) $suggestions['productName'], 0, 3 ),
					'shortDescription'   => array_slice( (array) $suggestions['shortDescription'], 0, 3 ),
					'productDescription' => array_slice( (array) $suggestions['productDescription'], 0, 3 ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
        }
    }
}
