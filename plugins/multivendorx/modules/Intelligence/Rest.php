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

                case 'image':
                    return $this->generate_image( $request );

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
                "You are an expert product content generator. Based on this request: {$user_prompt}.\n\n"
                . "Generate exactly 3 options for:\n"
                . "- Product Name\n"
                . "- Short Description (max 20 words)\n"
                . "- Product Description (max 100 words)\n\n"
                . "Return ONLY valid JSON in this format:\n"
                . "{productName:[], shortDescription:[], productDescription:[]}";

            switch ( $provider ) {

                case 'gemini_api':
                    $json_response = Util::call_gemini_api(
                        MultiVendorX()->setting->get_setting( 'gemini_api_key' ),
                        $base_prompt
                    );
                    break;

                case 'openai_api':
                    $json_response = Util::call_openai_api(
                        MultiVendorX()->setting->get_setting( 'openai_api_key' ),
                        $base_prompt
                    );
                    break;

                case 'openrouter_api':
                    $json_response = Util::call_openrouter_api(
                        MultiVendorX()->setting->get_setting( 'openrouter_api_key' ),
                        $base_prompt
                    );
                    break;

                default:
                    return new \WP_REST_Response(
                        array(
                            'success' => false,
                            'code'    => 'provider_not_supported',
                            'message' => __( 'Provider not supported.', 'multivendorx' ),
                        ),
                        400
                    );
            }

            MultiVendorX()->util->log( 'AI Raw Response: ' . $json_response );

            $suggestions = json_decode( $json_response, true );

            if ( ! is_array( $suggestions ) ) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'invalid_ai_response',
                        'message' => __( 'Invalid response from AI provider.', 'multivendorx' ),
                    ),
                    500
                );
            }

            return rest_ensure_response(
                array(
                    'success'            => true,
                    'productName'        => array_slice( (array) ( $suggestions['productName'] ?? array() ), 0, 3 ),
                    'shortDescription'   => array_slice( (array) ( $suggestions['shortDescription'] ?? array() ), 0, 3 ),
                    'productDescription' => array_slice( (array) ( $suggestions['productDescription'] ?? array() ), 0, 3 ),
                )
            );

        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
        }
    }

    private function generate_image( $request ) {
        try {
            $type        = sanitize_text_field( $request->get_param( 'type' ) );
            $product     = (array) $request->get_param( 'product' );
            $image       = $request->get_param( 'image_base64' );
            $user_prompt = sanitize_textarea_field( $request->get_param( 'prompt' ) );

            // Validate input: must have either product or prompt
            if ( empty( $product ) && empty( $user_prompt ) ) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'input_missing',
                        'message' => __( 'Either product data or prompt is required.', 'multivendorx' ),
                    ),
                    400
                );
            }

            // Extract product fields if product is provided
            $name        = sanitize_text_field( $product['name'] ?? '' );
            $description = wp_strip_all_tags( $product['description'] ?? '' );
            $category    = sanitize_text_field( $product['category'] ?? '' );
            $attributes  = ! empty( $product['attributes'] ) ? wp_json_encode( $product['attributes'] ) : '';

            /*
            |--------------------------------------------------------------------------
            | Prompt Builder
            |--------------------------------------------------------------------------
            */

            if ( $type === 'enhance' ) {
                if ( empty( $image ) ) {
                    return new \WP_REST_Response(
                        array(
                            'success' => false,
                            'code'    => 'image_missing',
                            'message' => __( 'Image required for enhancement.', 'multivendorx' ),
                        ),
                        400
                    );
                }

                $prompt = "Enhance this ecommerce product image.\n\n";
                if ( ! empty( $product ) ) {
                    $prompt .= "Product: {$name}\nCategory: {$category}\n\n";
                }
                if ( ! empty( $user_prompt ) ) {
                    $prompt .= "User request: {$user_prompt}\n\n";
                }
                $prompt .= "- Improve lighting\n- Improve sharpness\n- Clean background\n- Professional marketplace quality";

                $api_type = 'enhance-image';
                $extra    = array(
                    'image'    => $image,
                    'mimeType' => 'image/png',
                );

            } else {
                // Normal image generation
                $prompt = '';
                if ( ! empty( $product ) ) {
                    $prompt .= "Create a professional ecommerce product image.\n\n";
                    $prompt .= "Product: {$name}\nCategory: {$category}\nDescription: {$description}\nAttributes JSON: {$attributes}\n\n";
                }
                if ( ! empty( $user_prompt ) ) {
                    $prompt .= "User request: {$user_prompt}\n\n";
                }
                $prompt .= "- Studio lighting\n- Clean background\n- High resolution\n- Ecommerce ready";

                $api_type = 'image';
                $extra    = array();
            }

            /*
            |--------------------------------------------------------------------------
            | Provider Call
            |--------------------------------------------------------------------------
            */

            $provider = MultiVendorX()->setting->get_setting( 'choose_ai_provider' );

            switch ( $provider ) {
                case 'gemini_api':
                    $response = Util::call_gemini_api(
                        MultiVendorX()->setting->get_setting( 'gemini_api_key' ),
                        $prompt,
                        $api_type,
                        $extra
                    );
                    break;

                case 'openai_api':
                    $response = Util::call_openai_api(
                        MultiVendorX()->setting->get_setting( 'openai_api_key' ),
                        $prompt,
                        $api_type,
                        $extra
                    );
                    break;

                case 'openrouter_api':
                    $response = Util::call_openrouter_api(
                        MultiVendorX()->setting->get_setting( 'openrouter_api_key' ),
                        $prompt,
                        $api_type,
                        $extra
                    );
                    break;

                default:
                    return new \WP_REST_Response(
                        array(
                            'success' => false,
                            'code'    => 'provider_not_supported',
                            'message' => __( 'Provider not supported.', 'multivendorx' ),
                        ),
                        400
                    );
            }

            if ( empty( $response ) ) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'ai_failed',
                        'message' => __( 'AI failed to generate image.', 'multivendorx' ),
                    ),
                    500
                );
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'image'   => $response,
                )
            );

        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
            return new \WP_REST_Response(
                array(
                    'success' => false,
                    'code'    => 'exception',
                    'message' => __( 'An exception occurred while generating the image.', 'multivendorx' ),
                ),
                500
            );
        }
    }
}
