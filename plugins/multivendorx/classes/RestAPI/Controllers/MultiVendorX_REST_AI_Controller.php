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
            '/' . $this->rest_base . '/suggestions',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'generate_suggestions' ),
                'permission_callback' => array( $this, 'generate_suggestions_permissions_check' ),
                'args' => array(
                    'user_prompt' => array(
                        'required' => true,
                        'type'     => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                        'validate_callback' => function($param) {
                            return ! empty(trim($param));
                        }
                    ),
                ),
            )
        );
    }

    /**
     * Permissions.
     */
    public function generate_suggestions_permissions_check( $request ) {
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

                case 'grok_api':
                    $json_response = $this->call_grok_api($settings['grok_key'], $base_prompt);
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
            MultiVendorX()->util->log("MVX AI Error: " . $e->getMessage());
            return new \WP_Error('server_error', __( 'Server error during AI call.', 'multivendorx' ), array( 'status' => 500 ));
        }
    }

    /**
     * Fetch AI settings.
     */
    private function get_ai_settings() {
        return array(
            'provider'         => MultiVendorX()->setting->get_setting('choose_ai_provider'),
            'gemini_key'       => MultiVendorX()->setting->get_setting('gemini_api_key'),
            'openai_key'       => MultiVendorX()->setting->get_setting('openai_api_key'),
            'openai_model'     => MultiVendorX()->setting->get_setting('openai_api_model'),
            'openrouter_key'   => MultiVendorX()->setting->get_setting('openrouter_api_key'),
            'openrouter_model' => MultiVendorX()->setting->get_setting('openrouter_api_model'), // ← FIXED TYPO
            'grok_key'         => MultiVendorX()->setting->get_setting('grok_api_key'),
        );
    }

    /**
     * Gemini API
     */
    private function call_gemini_api($key, $prompt) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        $body = array(
            'contents' => array(
                array('parts' => array( array('text' => $prompt) ))
            )
        );

        $response = wp_remote_post($url, array(
            'headers' => array(
                'Content-Type'   => 'application/json',
                'x-goog-api-key' => $key,
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
     * OpenAI (Responses API)
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
     * OpenRouter
     */
    private function call_openrouter_api($key, $prompt) {
        $url = "https://openrouter.ai/api/v1/chat/completions";

        $model = MultiVendorX()->setting->get_setting('openrouter_api_model');
        if (!$model) $model = "openai/gpt-4o-mini";

        $body = array(
            "model" => $model,
            "messages" => array(
                array("role" => "user", "content" => $prompt)
            )
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

        return $data['choices'][0]['message']['content'] ?? json_encode(['error' => 'No content from OpenRouter']);
    }
}
