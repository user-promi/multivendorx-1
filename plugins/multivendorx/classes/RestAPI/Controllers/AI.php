<?php
/**
 * AI Assistant REST API Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

class AI extends \WP_REST_Controller {

    /**
     * Route Base.
     *
     * @var string
     */
    protected $rest_base = 'ai-assistant';

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
     * Permission check for AI Operations
     *
     * @param mixed $request
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'edit_products' );
    }

    /**
     * Handle AI request (main entry point)
     *
     * @param mixed $request
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
                        [
                            'success' => false,
                            'code'    => 'invalid_endpoint',
                            'message' => __( 'Invalid AI endpoint.', 'multivendorx' ),
                        ],
                        400
                    );
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
        }
    }

    /**
     * Generate AI Suggestions
     *
     * @param mixed $request
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
                    $json_response = $this->call_gemini_api( MultiVendorX()->setting->get_setting( 'gemini_api_key' ), $base_prompt );
                    break;

                case 'openai_api':
                    $json_response = $this->call_openai_api( MultiVendorX()->setting->get_setting( 'openai_api_key' ), $base_prompt );
                    break;

                case 'openrouter_api':
                    $json_response = $this->call_openrouter_api( MultiVendorX()->setting->get_setting( 'openrouter_api_key' ), $base_prompt );
                    break;
            }

            MultiVendorX()->util->log( 'AI Raw Response: ' . $json_response );

            $suggestions = json_decode( $json_response, true );

            if ( ! is_array( $suggestions ) ) {
                return new \WP_REST_Response(
                    [
                        'success' => false,
                        'code'    => 'invalid_response',
                        'message' => 'Invalid response from AI provider.',
                    ],
                    500
                );
            }

            return rest_ensure_response([
                'productName'        => array_slice((array) $suggestions['productName'], 0, 2),
                'shortDescription'   => array_slice((array) $suggestions['shortDescription'], 0, 2),
                'productDescription' => array_slice((array) $suggestions['productDescription'], 0, 2),
            ]);
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
        }
    }

    /**
     * Gemini API for text
     *
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    private function call_gemini_api( $key, $prompt ) {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

        $body = array(
            'contents' => array(
                array(
                    'parts' => array(
                        array('text' => $prompt)
                    )
                )
            ),
            'generationConfig' => array(
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024,
                'response_mime_type' => 'application/json',
            ),
        );        

        $response = wp_remote_post(
            $url . '?key=' . $key,
            array(
                'headers' => array(
                    'Content-Type' => 'application/json',
                ),
                'body'    => wp_json_encode($body),
                'timeout' => 20,
            )
        );

        if (is_wp_error($response)) {
            return array('error' => $response->get_error_message());
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        
        // Directly access parsed JSON (NO regex, NO trimming)
        $result = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
        
        if (!$result) {
            return array('error' => 'Invalid Gemini response');
        }
        return $result;
    }

    /**
     * OpenAI API for text
     *
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    private function call_openai_api( $key, $prompt ) {
        $url = 'https://api.openai.com/v1/responses';

        $body = array(
            'model' => 'gpt-5-nano',
            'input' => $prompt,
        );

        $response = wp_remote_post(
            $url,
            array(
                'headers' => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => "Bearer $key",
                ),
                'body'    => wp_json_encode( $body ),
                'timeout' => 45,
            )
        );

        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        $result = $data['output'][0]['content'][0]['text'] ?? '';

        if (!$result) {
            return array('error' => 'Invalid OpenAI response');
        }

        return $result;
    }

    /**
     * OpenRouter API for text
     *
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    private function call_openrouter_api( $key, $prompt ) {
        $url = 'https://openrouter.ai/api/v1/chat/completions';

        $model = MultiVendorX()->setting->get_setting( 'openrouter_api_model' );
        if ( ! $model ) {
            $model = 'openai/gpt-4o-mini';
        }

        $body = array(
            'model' => $model,
            'messages' => array(
                array(
                    'role' => 'system',
                    'content' => 'You must respond ONLY with valid JSON. No explanations.',
                ),
                array(
                    'role' => 'user',
                    'content' => $prompt,
                ),
            ),
            'response_format' => array( 'type' => 'json_object' ),
        );        

        $response = wp_remote_post(
            $url,
            array(
                'headers' => array(
                    'Authorization' => "Bearer $key",
                    'HTTP-Referer'  => site_url(),
                    'X-Title'       => get_bloginfo( 'name' ),
                    'Content-Type'  => 'application/json',
                ),
                'body'    => wp_json_encode( $body ),
                'timeout' => 30,
            )
        );

        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        $result = $data['choices'][0]['message']['content'] ?? '';

        if (!$result) {
            return array('error' => 'Invalid OpenRouter response');
        }
        
        return (string) $result;
    }
}
