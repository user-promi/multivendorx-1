<?php
/**
 * AI Assistant REST API Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_AI_Controller extends \WP_REST_Controller {

    protected $rest_base = 'ai-assistant';

    /**
     * Register routes.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'handle_ai_request' ),
                    'permission_callback' => array( $this, 'generate_suggestions_permissions_check' ),
                    'args' => array(
                        'endpoint' => array(
                            'required' => true,
                            'type'     => 'string',
                            'enum'     => array('suggestions', 'enhance_image'),
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                        'user_prompt' => array(
                            'required' => true,
                            'type'     => 'string',
                            'sanitize_callback' => 'sanitize_textarea_field',
                            'validate_callback' => function($param) {
                                return !empty(trim($param));
                            }
                        ),
                        'image_url' => array(
                            'required' => false,
                            'type'     => 'string',
                            'sanitize_callback' => 'esc_url_raw',
                        ),
                        'image_data' => array(
                            'required' => false,
                            'type'     => 'string',
                        ),
                    ),
                ),
            )
        );
    }


    /**
     * Handle AI requests - routes to appropriate endpoint
     * 
     * @param object $request The request object.
     */
    public function handle_ai_request( $request ) {
        $endpoint = sanitize_text_field( $request->get_param( 'endpoint' ) );
        
        switch ($endpoint) {
            case 'suggestions':
                return $this->generate_suggestions( $request );
            case 'enhance_image':
                return $this->enhance_image( $request );
            default:
                return new \WP_Error(
                    'invalid_endpoint',
                    __( 'Invalid AI endpoint requested.', 'multivendorx' ),
                    array( 'status' => 400 )
                );
        }
    }

     /**
     * Permissions.
     */
    public function generate_suggestions_permissions_check() {
        if ( current_user_can( 'edit_products' ) ) {
            return true;
        }
        return new \WP_Error(
            'rest_forbidden',
            __( 'You do not have permission to access this resource.', 'multivendorx' ),
            array( 'status' => rest_authorization_required_code() )
        );
    }

    /**
     * Generate suggestions using selected AI provider.
     * 
     * @param object $request The request object.
     */
    public function generate_suggestions( $request ) {
        try {
            $user_prompt = sanitize_textarea_field( $request->get_param( 'user_prompt' ) );
            $settings    = $this->get_ai_settings();
            $provider    = $settings['provider'];

            if ( empty($user_prompt) ) {
                return new \WP_Error(
                    'prompt_missing',
                    __( 'Please provide a prompt.', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            $base_prompt =
                "You are an expert product content generator. Based on the user's request: '{$user_prompt}', ".
                "generate 2 options for each of the following: a catchy Product Name, a short description (max 20 words), ".
                "and a detailed description (max 100 words). IMPORTANT: return ONLY a valid JSON object with keys: ".
                "'productName', 'shortDescription', 'productDescription', each containing exactly 2 strings. ".
                "Do NOT include Markdown, backticks, explanations, or any extra text. ONLY the JSON object.";

            $json_response = '';

            /** Provider Switch */
            switch ($provider) {
                case 'gemini_api':
                    $json_response = $this->call_gemini_api($settings['gemini_key'], $base_prompt);
                    break;

                case 'openai_api':
                    $json_response = $this->call_openai_api($settings['openai_key'], $base_prompt);
                    break;

                case 'openrouter_api':
                    $json_response = $this->call_openrouter_api($settings['openrouter_key'], $base_prompt);
                    break;

                default:
                    return new \WP_Error('api_missing', 'No valid AI provider selected.', array('status' => 400));
            }

            /** Log raw response */
            file_put_contents(
                plugin_dir_path(__FILE__) . "/error.log",
                date("d/m/Y H:i:s").": json_response: ".var_export($json_response, true)."\n",
                FILE_APPEND
            );

            /** Parse JSON safely */
            $suggestions = json_decode($json_response, true);

            if (
                !is_array($suggestions) ||
                !isset($suggestions['productName']) ||
                !isset($suggestions['shortDescription']) ||
                !isset($suggestions['productDescription'])
            ) {
                return new \WP_Error(
                    'ai_parse_error',
                    __( 'AI response format invalid.', 'multivendorx' ),
                    array( 'status' => 500 )
                );
            }

            /** Normalize counts */
            $productName        = array_slice((array)$suggestions['productName'], 0, 2);
            $shortDescription   = array_slice((array)$suggestions['shortDescription'], 0, 2);
            $productDescription = array_slice((array)$suggestions['productDescription'], 0, 2);

            while(count($productName) < 2)        $productName[] = '';
            while(count($shortDescription) < 2)   $shortDescription[] = '';
            while(count($productDescription) < 2) $productDescription[] = '';

            return rest_ensure_response(array(
                'productName'        => $productName,
                'shortDescription'   => $shortDescription,
                'productDescription' => $productDescription,
            ));

        } catch (\Exception $e) {
            MultiVendorX()->util->log("MultiVendorX AI Error: " . $e->getMessage());
            return new \WP_Error('server_error', __( 'Server error during AI call.', 'multivendorx' ), array( 'status' => 500 ));
        }
    }

    /**
     * Enhance image using selected AI provider
     * 
     * @param object $request The request object.
     */
    public function enhance_image( $request ) {
        try {
            $user_prompt = sanitize_textarea_field( $request->get_param( 'user_prompt' ) );
            $image_url = esc_url_raw( $request->get_param( 'image_url' ) );
            $image_data = $request->get_param( 'image_data' );
            
            $settings = $this->get_ai_settings();
            $image_provider = $settings['image_enhancement_provider'];

            if ( empty($user_prompt) ) {
                return new \WP_Error(
                    'prompt_missing',
                    __( 'Please provide a prompt for image enhancement.', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            if ( empty($image_url) && empty($image_data) ) {
                return new \WP_Error(
                    'image_missing',
                    __( 'Please provide an image to enhance.', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            $response = array();

            // Choose provider based on settings
            switch ($image_provider) {
                case 'gemini_api':
                    if ( empty($settings['gemini_api_image_enhancement_key']) ) {
                        return new \WP_Error(
                            'api_key_missing',
                            __( 'Gemini API key for image enhancement is missing.', 'multivendorx' ),
                            array( 'status' => 400 )
                        );
                    }
                    $response = $this->call_gemini_image_generation_api( 
                        $settings['gemini_api_image_enhancement_key'], 
                        $user_prompt, 
                        $image_url, 
                        $image_data 
                    );
                    break;

                case 'openrouter_api':
                    if ( empty($settings['openrouter_api_image_enhancement_key']) ) {
                        return new \WP_Error(
                            'api_key_missing',
                            __( 'OpenRouter API key for image enhancement is missing.', 'multivendorx' ),
                            array( 'status' => 400 )
                        );
                    }
                    $response = $this->call_openrouter_image_generation_api( 
                        $settings['openrouter_api_image_enhancement_key'], 
                        $settings['openrouter_api_image_model'],
                        $user_prompt, 
                        $image_url, 
                        $image_data 
                    );
                    break;

                default:
                    return new \WP_Error(
                        'provider_not_supported',
                        __( 'Selected image enhancement provider is not supported.', 'multivendorx' ),
                        array( 'status' => 400 )
                    );
            }

            // Parse and return the enhanced image
            if ( isset($response['error']) ) {
                return new \WP_Error(
                    'ai_api_error',
                    $response['error'],
                    array( 'status' => 500 )
                );
            }

            // Check if we got image data back
            if ( empty($response['image_data']) ) {
                return new \WP_Error(
                    'no_image_generated',
                    __( 'No image was generated by the AI.', 'multivendorx' ),
                    array( 'status' => 500 )
                );
            }

            return rest_ensure_response( array(
                'success' => true,
                'image_data' => $response['image_data'],
                'image_mime_type' => $response['mime_type'],
                'message' => __( 'Image enhanced and generated successfully', 'multivendorx' )
            ) );

        } catch (\Exception $e) {
            MultiVendorX()->util->log("MultiVendorX AI Image Generation Error: " . $e->getMessage());
            return new \WP_Error('server_error', __( 'Server error during AI image generation.', 'multivendorx' ), array( 'status' => 500 ));
        }
    }

    /**
     * Fetch AI settings.
     */
    private function get_ai_settings() {
        return array(
            'provider' => MultiVendorX()->setting->get_setting('choose_ai_provider'),
            'gemini_key' => MultiVendorX()->setting->get_setting('gemini_api_key'),
            'openai_key' => MultiVendorX()->setting->get_setting('openai_api_key'),
            'openrouter_key' => MultiVendorX()->setting->get_setting('openrouter_api_key'),
            'openrouter_model' => MultiVendorX()->setting->get_setting('openrouter_api_model'),
            'image_enhancement_provider' => MultiVendorX()->setting->get_setting('image_enhancement_provider') ?? 'gemini_api_image_enhancement',
            'gemini_api_image_enhancement_key' => MultiVendorX()->setting->get_setting('gemini_api_image_enhancement_key') ?? MultiVendorX()->setting->get_setting('gemini_api_key'),
            'openrouter_api_image_enhancement_key' => MultiVendorX()->setting->get_setting('openrouter_api_image_enhancement_key') ?? MultiVendorX()->setting->get_setting('openrouter_api_key'),
            'openrouter_api_image_model' => MultiVendorX()->setting->get_setting('openrouter_api_image_model') ?? 'google/gemini-2.5-flash-image-preview',
        );
    }

    /**
     * Gemini API for text
     * 
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    private function call_gemini_api($key, $prompt) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        $body = array(
            'contents' => array(
                array('parts' => array( array('text' => $prompt) ))
            ),
            'generationConfig' => array(
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024,
            )
        );

        $response = wp_remote_post($url . '?key=' . $key, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body'    => wp_json_encode($body),
            'timeout' => 20,
        ));

        if (is_wp_error($response)) {
            return json_encode(['error' => $response->get_error_message()]);
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($data['error'])) {
            return json_encode(['error' => $data['error']['message']]);
        }

        $raw = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

        $clean = trim(str_replace(['```json', '```'], '', $raw));

        if (preg_match('/\{.*\}/s', $clean, $match)) {
            return $match[0];
        }

        return json_encode(['error' => 'No valid JSON found in Gemini response']);
    }

    /**
     * OpenAI API for text
     * 
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    private function call_openai_api($key, $prompt) {
        $url = "https://api.openai.com/v1/responses";

        $body = array(
            'model' => 'gpt-5-nano',
            'input' => $prompt
        );

        $response = wp_remote_post($url, array(
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => "Bearer $key"
            ),
            'body' => wp_json_encode($body),
            'timeout' => 45,
        ));

        if (is_wp_error($response)) {
            return json_encode(['error' => $response->get_error_message()]);
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        file_put_contents(
            plugin_dir_path(__FILE__) . "/error.log",
            date("d/m/Y H:i:s").": openai_raw: ".var_export($data, true)."\n",
            FILE_APPEND
        );

        if (isset($data['error'])) {
            return json_encode(['error' => $data['error']['message']]);
        }

        $content = $data['output'][0]['content'][0]['text'] ?? '';

        $clean = trim(str_replace(['```json', '```'], '', $content));

        if (preg_match('/\{.*\}/s', $clean, $match)) {
            return $match[0];
        }

        return json_encode(['error' => 'No valid JSON in OpenAI response']);
    }

    /**
     * OpenRouter API for text
     * 
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    private function call_openrouter_api($key, $prompt) {
        $url = "https://openrouter.ai/api/v1/chat/completions";

        $model = MultiVendorX()->setting->get_setting('openrouter_api_model');
        if (!$model) $model = "openai/gpt-4o-mini";

        $body = array(
            "model" => $model,
            "messages" => array(
                array("role" => "user", "content" => $prompt)
            ),
            "temperature" => 0.7,
            "max_tokens" => 1024
        );

        $response = wp_remote_post($url, array(
            'headers' => array(
                "Authorization" => "Bearer $key",
                "HTTP-Referer"  => site_url(),
                "X-Title"       => get_bloginfo('name'),
                "Content-Type"  => "application/json"
            ),
            'body' => wp_json_encode($body),
            'timeout' => 30
        ));

        if (is_wp_error($response)) {
            return json_encode(['error' => $response->get_error_message()]);
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($data['error'])) {
            return json_encode(['error' => $data['error']['message']]);
        }

        return $data['choices'][0]['message']['content'] ?? json_encode(['error' => 'No content from OpenRouter']);
    }

    /**
     * Gemini API for image generation/editing
     * 
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     * @param string $image_url The image URL to use.
     * @param string $image_data The image data to use.
     */
    private function call_gemini_image_generation_api( $key, $prompt, $image_url, $image_data = null ) {
        // $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
        // $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent";
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-image:generateContent";

        // Prepare the content array
        $contents = array();
        
        // Add text prompt
        $parts = array(
            array('text' => $prompt)
        );
        
        // Add image if available
        if ( $image_data ) {
            // Handle base64 image data
            $parts[] = array(
                'inline_data' => array(
                    'mime_type' => 'image/jpeg',
                    'data' => $image_data
                )
            );
        } elseif ( $image_url ) {
            // Handle image URL - download and convert to base64
            $image_content = @file_get_contents($image_url);
            if ($image_content === false) {
                return array( 'error' => 'Could not download image from URL' );
            }
            
            $parts[] = array(
                'inline_data' => array(
                    'mime_type' => $this->get_mime_type_from_url($image_url),
                    'data' => base64_encode( $image_content )
                )
            );
        }

        $body = array(
            'contents' => array(
                array('parts' => $parts)
            ),
            'generationConfig' => array(
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024,
            )
        );

        $response = wp_remote_post( $url . '?key=' . $key, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body'    => wp_json_encode( $body ),
            'timeout' => 60, // Longer timeout for image generation
        ) );

        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $response_code = wp_remote_retrieve_response_code( $response );
        $response_body = wp_remote_retrieve_body( $response );
        
        file_put_contents(plugin_dir_path(__FILE__) . "/error.log", 
            date("d/m/Y H:i:s").": gemini_image_raw: ".var_export($response_body, true)."\n", 
            FILE_APPEND
        );
        
        if ( $response_code != 200 ) {
            MultiVendorX()->util->log("Gemini Image API Error - Code: $response_code, Body: $response_body");
            return array( 'error' => "API returned status code $response_code" );
        }

        $data = json_decode( $response_body, true );

        if ( isset( $data['error'] ) ) {
            return array( 'error' => $data['error']['message'] );
        }

        // Extract image data from response
        return $this->extract_image_from_response($data);
    }

    /**
     * OpenRouter API for image generation/editing
     * 
     * @param string $key The API key.
     * @param string $model The model to use.
     * @param string $prompt The prompt to use.
     * @param string $image_url The image URL to use.
     * @param string $image_data The image data to use.
     */
    private function call_openrouter_image_generation_api( $key, $model, $prompt, $image_url, $image_data = null ) {
        $url = "https://openrouter.ai/api/v1/chat/completions";

        // Prepare messages array
        $messages = array(
            array(
                "role" => "user",
                "content" => array(
                    array(
                        "type" => "text",
                        "text" => $prompt
                    )
                )
            )
        );

        // Add image to content if available
        if ( $image_data ) {
            $messages[0]['content'][] = array(
                "type" => "image_url",
                "image_url" => array(
                    "url" => "data:image/jpeg;base64," . $image_data
                )
            );
        } elseif ( $image_url ) {
            $messages[0]['content'][] = array(
                "type" => "image_url",
                "image_url" => array(
                    "url" => $image_url
                )
            );
        }

        $body = array(
            "model" => $model,
            "messages" => $messages,
            "temperature" => 0.7,
            "max_tokens" => 1024
        );

        $response = wp_remote_post( $url, array(
            'headers' => array(
                "Authorization" => "Bearer $key",
                "HTTP-Referer"  => site_url(),
                "X-Title"       => get_bloginfo('name'),
                "Content-Type"  => "application/json"
            ),
            'body' => wp_json_encode( $body ),
            'timeout' => 60,
        ) );

        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $response_code = wp_remote_retrieve_response_code( $response );
        $response_body = wp_remote_retrieve_body( $response );
        
        file_put_contents(plugin_dir_path(__FILE__) . "/error.log", 
            date("d/m/Y H:i:s").": openrouter_image_raw: " . $response_body . "\n", 
            FILE_APPEND
        );
        
        if ( $response_code != 200 ) {
            MultiVendorX()->util->log("OpenRouter Image API Error - Code: $response_code, Body: $response_body");
            return array( 'error' => "API returned status code $response_code" );
        }

        $data = json_decode( $response_body, true );

        if ( isset( $data['error'] ) ) {
            return array( 'error' => $data['error']['message'] );
        }

        // Check if response has images array
        if ( isset( $data['choices'][0]['message']['images'] ) && 
            is_array( $data['choices'][0]['message']['images'] ) ) {
            
            foreach ( $data['choices'][0]['message']['images'] as $image ) {
                if ( isset( $image['type'] ) && $image['type'] === 'image_url' && 
                    isset( $image['image_url']['url'] ) ) {
                    
                    $image_url = $image['image_url']['url'];
                    
                    // Extract base64 data from data URL
                    if ( preg_match('/data:image\/(png|jpeg|jpg);base64,([^\"]+)/', $image_url, $matches) ) {
                        return array(
                            'image_data' => $matches[2],
                            'mime_type' => 'image/' . $matches[1],
                            'text_response' => isset($data['choices'][0]['message']['content']) ? 
                                $data['choices'][0]['message']['content'] : ''
                        );
                    }
                }
            }
        }
        
        // Fallback: Check if there's text content with base64 image
        if ( isset( $data['choices'][0]['message']['content'] ) ) {
            $text_response = $data['choices'][0]['message']['content'];
            
            // Check if response contains base64 image data
            if ( preg_match('/data:image\/(png|jpeg|jpg);base64,([^\"]+)/', $text_response, $matches) ) {
                return array(
                    'image_data' => $matches[2],
                    'mime_type' => 'image/' . $matches[1],
                    'text_response' => $text_response
                );
            }
            
            // Return text response if no image found
            return array(
                'text_response' => $text_response,
                'image_data' => null,
                'mime_type' => null
            );
        }

        // If no image found
        return array(
            'error' => 'No image generated in OpenRouter response',
            'text_response' => 'Image generation completed but no image data returned.',
            'image_data' => null,
            'mime_type' => null
        );
    }

    /**
     * Helper function to extract image from Gemini response
     * 
     * @param array $data The response data from the API.
     */
    private function extract_image_from_response( $data ) {
        $image_data = '';
        $mime_type = 'image/png';
        
        if ( isset($data['candidates'][0]['content']['parts']) ) {
            foreach ( $data['candidates'][0]['content']['parts'] as $part ) {
                if ( isset($part['inline_data']) ) {
                    $image_data = $part['inline_data']['data'];
                    $mime_type = $part['inline_data']['mime_type'];
                    break;
                }
            }
        }

        // If no inline data found, check for text response with image data
        if ( empty($image_data) && isset($data['candidates'][0]['content']['parts'][0]['text']) ) {
            $text_response = $data['candidates'][0]['content']['parts'][0]['text'];
            
            // Try to extract base64 image data from text response
            if ( preg_match('/data:image\/(png|jpeg|jpg);base64,([^\"]+)/', $text_response, $matches) ) {
                $image_data = $matches[2];
                $mime_type = 'image/' . $matches[1];
            }
        }

        if ( empty($image_data) ) {
            // Fallback to text description if image not generated
            $text_response = isset($data['candidates'][0]['content']['parts'][0]['text']) 
                ? $data['candidates'][0]['content']['parts'][0]['text'] 
                : 'Image generation completed but no image data returned.';
            
            return array(
                'text_response' => $text_response,
                'image_data' => null,
                'mime_type' => null
            );
        }

        return array(
            'image_data' => $image_data,
            'mime_type' => $mime_type,
            'text_response' => isset($data['candidates'][0]['content']['parts'][0]['text']) 
                ? $data['candidates'][0]['content']['parts'][0]['text'] 
                : 'Image generated successfully.'
        );
    }

    /**
     * Helper function to get MIME type from URL
     * 
     * @param string $url The URL of the image.
     */
    private function get_mime_type_from_url( $url ) {
        $extension = pathinfo( parse_url( $url, PHP_URL_PATH ), PATHINFO_EXTENSION );
        
        $mime_types = array(
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'bmp'  => 'image/bmp',
        );
        
        $ext = strtolower( $extension );
        return isset( $mime_types[$ext] ) ? $mime_types[$ext] : 'image/jpeg';
    }
}