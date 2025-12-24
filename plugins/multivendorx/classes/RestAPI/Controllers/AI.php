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

                case 'enhance_image':
                    return $this->enhance_image( $request );
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
                    array(
                        'success' => false,
                        'code'    => 'invalid_response',
                        'message' => __( 'Invalid response from AI.', 'multivendorx' ),
                    ),
                    500
                );
            }

            return rest_ensure_response(
                array(
                    'productName'        => array_slice( (array) $suggestions['productName'], 0, 2 ),
                    'shortDescription'   => array_slice( (array) $suggestions['shortDescription'], 0, 2 ),
                    'productDescription' => array_slice( (array) $suggestions['productDescription'], 0, 2 ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
        }
    }

    /**
     * Generate AI Image (without existing image)
     *
     * @param mixed $request
     */
    private function generate_image($request) {
        try {
            $user_prompt = sanitize_textarea_field($request->get_param('user_prompt'));
            $num_images = absint($request->get_param('num_images')) ?: 1;
            
            if (empty($user_prompt)) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'prompt_missing',
                        'message' => __('Prompt is required.', 'multivendorx'),
                    ),
                    400
                );
            }

            $provider = MultiVendorX()->setting->get_setting('image_generation_provider');
            if (!$provider) {
                // Fallback to enhancement provider if specific generation provider not set
                $provider = MultiVendorX()->setting->get_setting('image_enhancement_provider');
            }

            switch ($provider) {
                case 'gemini_api':
                    $response = $this->call_gemini_image_generation_api(
                        MultiVendorX()->setting->get_setting('gemini_api_key'),
                        $user_prompt,
                        null, // No image URL
                        null, // No image data
                        $num_images
                    );
                    break;
                    
                case 'openrouter_api':
                    $response = $this->call_openrouter_image_generation_api(
                        MultiVendorX()->setting->get_setting('openrouter_api_image_generation_key'),
                        MultiVendorX()->setting->get_setting('openrouter_api_key'),
                        $user_prompt,
                        null, // No image URL
                        null, // No image data
                        $num_images
                    );
                    break;
                    
                default:
                    return new \WP_REST_Response(
                        array(
                            'success' => false,
                            'code'    => 'provider_not_set',
                            'message' => __('Image generation provider not configured.', 'multivendorx'),
                        ),
                        400
                    );
            }

            if (!empty($response['error'])) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'image_generation_failed',
                        'message' => $response['error'],
                    ),
                    500
                );
            }

            return rest_ensure_response(
                array(
                    'success'         => true,
                    'images'          => $response['images'],
                    'image_mime_type' => $response['mime_type'],
                    'message'         => __('Image generation successful.', 'multivendorx'),
                )
            );
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);
            return new \WP_REST_Response(
                array(
                    'success' => false,
                    'code'    => 'image_generation_error',
                    'message' => __('Image generation failed.', 'multivendorx'),
                ),
                500
            );
        }
    }

    /**
     * Update the enhance_image method to handle both enhancement and generation
     */
    private function enhance_image($request) {
        try {
            $user_prompt = sanitize_textarea_field($request->get_param('user_prompt'));
            $image_url   = esc_url_raw($request->get_param('image_url'));
            $image_data  = $request->get_param('image_data');
            $num_images  = absint($request->get_param('num_images')) ?: 1;
            
            // If no image provided, switch to generation mode
            if (empty($image_url) && empty($image_data)) {
                return $this->generate_image($request);
            }

            if (empty($user_prompt)) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'prompt_missing',
                        'message' => __('Prompt is required.', 'multivendorx'),
                    ),
                    400
                );
            }

            $provider = MultiVendorX()->setting->get_setting('image_enhancement_provider');

            switch ($provider) {
                case 'gemini_api':
                    $response = $this->call_gemini_image_generation_api(
                        MultiVendorX()->setting->get_setting('gemini_api_key'),
                        $user_prompt,
                        $image_url,
                        $image_data,
                        $num_images
                    );
                    break;                

                case 'openrouter_api':
                    $response = $this->call_openrouter_image_generation_api(
                        MultiVendorX()->setting->get_setting('openrouter_api_image_enhancement_key'),
                        MultiVendorX()->setting->get_setting('openrouter_api_key'),
                        $user_prompt,
                        $image_url,
                        $image_data,
                        $num_images
                    );
                    break;
            }

            if (!empty($response['error'])) {
                return new \WP_REST_Response(
                    array(
                        'success' => false,
                        'code'    => 'image_enhancement_failed',
                        'message' => $response['error'],
                    ),
                    500
                );
            }

            return rest_ensure_response(
                array(
                    'success'         => true,
                    'images'          => $response['images'],
                    'image_mime_type' => $response['mime_type'],
                    'message'         => __('Image enhancement successful.', 'multivendorx'),
                )
            );
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);
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
            'contents'         => array(
                array( 'parts' => array( array( 'text' => $prompt ) ) ),
            ),
            'generationConfig' => array(
                'temperature'     => 0.7,
                'topK'            => 40,
                'topP'            => 0.95,
                'maxOutputTokens' => 1024,
            ),
        );

        $response = wp_remote_post(
            $url . '?key=' . $key,
            array(
                'headers' => array(
                    'Content-Type' => 'application/json',
                ),
                'body'    => wp_json_encode( $body ),
                'timeout' => 20,
            )
        );

        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        $raw = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

        $clean = trim( str_replace( array( '```json', '```' ), '', $raw ) );

        if ( preg_match( '/\{.*\}/s', $clean, $match ) ) {
            return $match[0];
        }

        return array( 'error' => 'No valid JSON found in Gemini response' );
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

        if ( ! empty( $data['error'] ) ) {
            return array( 'error' => $data['error']['message'] );
        }

        $content = $data['output'][0]['content'][0]['text'] ?? '';

        $clean = trim( str_replace( array( '```json', '```' ), '', $content ) );

        if ( preg_match( '/\{.*\}/s', $clean, $match ) ) {
            return $match[0];
        }

        return array( 'error' => 'No valid JSON in OpenAI response' );
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

        if ( ! empty( $data['error'] ) ) {
            return array( 'error' => $data['error']['message'] );
        }

        if ( empty( $data['choices'][0]['message']['content'] ) ) {
            throw new \Exception( 'Empty content from OpenRouter' );
        }
        
        return (string) $data['choices'][0]['message']['content'];
        
    }

    /**
     * Gemini API for image generation/editing
     *
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     * @param string $image_url The image URL to use.
     * @param string $image_data The image data to use.
     * @param int $num_images Number of images to generate
     */
    private function call_gemini_image_generation_api( $api_key, $prompt, $image_url, $image_data, $num_images = 1 ) {

        $request_body = array(
            'contents' => array(
                array(
                    'parts' => array(
                        array( 'text' => $prompt ),
                    ),
                ),
            ),
        );

        // Add inline image if provided.
        if ( ! empty( $image_data ) ) {
            $request_body['contents'][0]['parts'][] = array(
                'inline_data' => array(
                    'mime_type' => 'image/jpeg',
                    'data'      => $image_data,
                ),
            );
        }

        // For multiple images, we need to make multiple requests
        $all_images = array();
        for ($i = 0; $i < $num_images; $i++) {
            $response = wp_remote_post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' . $api_key,
                array(
                    'method'  => 'POST',
                    'headers' => array(
                        'Content-Type' => 'application/json',
                    ),
                    'body'    => wp_json_encode( $request_body ),
                    'timeout' => 30,
                )
            );

            if ( is_wp_error( $response ) ) {
                return array( 'error' => $response->get_error_message() );
            }

            $body = json_decode( wp_remote_retrieve_body( $response ), true );

            /** Extract the returned image */
            $candidate = $body['candidates'][0] ?? null;

            if ( ! $candidate ) {
                return array( 'error' => 'No candidates returned.' );
            }

            $parts = $candidate['content']['parts'] ?? array();

            foreach ( $parts as $p ) {
                if ( ! empty( $p['inlineData']['data'] ) ) {
                    $all_images[] = $p['inlineData']['data'];
                    break;
                }
            }
        }

        if ( empty( $all_images ) ) {
            // If no image, return text (fallback).
            return array(
                'images'        => null,
                'mime_type'     => null,
                'text_response' => wp_json_encode( $body ),
            );
        }

        return array(
            'images'        => $all_images,
            'mime_type'     => 'image/png',
            'text_response' => null,
        );
    }

    /**
     * OpenRouter API for image generation/editing
     *
     * @param string $key The API key.
     * @param string $model The model to use.
     * @param string $prompt The prompt to use.
     * @param string $image_url The image URL to use.
     * @param string $image_data The image data to use.
     * @param int $num_images Number of images to generate
     */
    private function call_openrouter_image_generation_api( $key, $model, $prompt, $image_url, $image_data = null, $num_images = 1 ) {
        $url = 'https://openrouter.ai/api/v1/chat/completions';

        // Prepare messages array
        $messages = array(
            array(
                'role'    => 'user',
                'content' => array(
                    array(
                        'type' => 'text',
                        'text' => $prompt . ($num_images > 1 ? " Generate {$num_images} different variations." : ""),
                    ),
                ),
            ),
        );

        // Add image to content if available
        if ( $image_data ) {
            $messages[0]['content'][] = array(
                'type'      => 'image_url',
                'image_url' => array(
                    'url' => 'data:image/jpeg;base64,' . $image_data,
                ),
            );
        } elseif ( $image_url ) {
            $messages[0]['content'][] = array(
                'type'      => 'image_url',
                'image_url' => array(
                    'url' => $image_url,
                ),
            );
        }

        $body = array(
            'model'       => $model,
            'messages'    => $messages,
            'temperature' => 0.7,
            'max_tokens'  => 1024,
            'n'           => $num_images, // Request multiple completions
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
                'timeout' => 60,
            )
        );

        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $response_code = wp_remote_retrieve_response_code( $response );
        $response_body = wp_remote_retrieve_body( $response );

        if ( $response_code != 200 ) {
            MultiVendorX()->util->log( "OpenRouter Image API Error - Code: $response_code, Body: $response_body" );
            return array( 'error' => "API returned status code $response_code" );
        }

        $data = json_decode( $response_body, true );

        if ( ! empty( $data['error'] ) ) {
            return array( 'error' => $data['error']['message'] );
        }

        $all_images = array();
        
        // Process all choices (multiple images)
        foreach ($data['choices'] as $choice) {
            // Check if response has images array
            if ( ! empty( $choice['message']['images'] ) &&
                is_array( $choice['message']['images'] ) ) {
                foreach ( $choice['message']['images'] as $image ) {
                    if ( ! empty( $image['type'] ) && $image['type'] === 'image_url' &&
                        ! empty( $image['image_url']['url'] ) ) {
                        $image_url = $image['image_url']['url'];

                        // Extract base64 data from data URL
                        if ( preg_match( '/data:image\/(png|jpeg|jpg);base64,([^\"]+)/', $image_url, $matches ) ) {
                            $all_images[] = $matches[2];
                            break;
                        }
                    }
                }
            }
            
            // Fallback: Check if there's text content with base64 image
            elseif ( ! empty( $choice['message']['content'] ) ) {
                $text_response = $choice['message']['content'];

                // Check if response contains base64 image data
                if ( preg_match( '/data:image\/(png|jpeg|jpg);base64,([^\"]+)/', $text_response, $matches ) ) {
                    $all_images[] = $matches[2];
                }
            }
        }

        if ( empty( $all_images ) ) {
            // If no image found
            return array(
                'error'         => 'No image generated in OpenRouter response',
                'text_response' => 'Image generation completed but no image data returned.',
                'images'        => null,
                'mime_type'     => null,
            );
        }

        return array(
            'images'        => $all_images,
            'mime_type'     => 'image/png',
            'text_response' => isset($data['choices'][0]['message']['content']) ? $data['choices'][0]['message']['content'] : '',
        );
    }
}
