<?php
/**
 * Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Intelligence;

/**
 * MultiVendorX Store Intelligence Util class
 *
 * @class       Util class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Util {

    /**
     * Gemini API for text
     *
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    public static function call_gemini_api( $key, $prompt ) {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

        $body = array(
            'contents'         => array(
                array(
                    'parts' => array(
                        array( 'text' => $prompt ),
                    ),
                ),
            ),
            'generationConfig' => array(
                'temperature'        => 0.7,
                'topK'               => 40,
                'topP'               => 0.95,
                'maxOutputTokens'    => 1024,
                'response_mime_type' => 'application/json',
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
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders: : " . var_export($response, true) . "\n", FILE_APPEND);
        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        // Directly access parsed JSON (NO regex, NO trimming).
        $result = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if ( ! $result ) {
            return array( 'error' => 'Invalid Gemini response' );
        }
        return $result;
    }

    /**
     * OpenAI API for text
     *
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    public static function call_openai_api( $key, $prompt ) {
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

        if ( ! $result ) {
            return array( 'error' => 'Invalid OpenAI response' );
        }

        return $result;
    }

    /**
     * OpenRouter API for text
     *
     * @param string $key The API key.
     * @param string $prompt The prompt to use.
     */
    public static function call_openrouter_api( $key, $prompt ) {
        $url = 'https://openrouter.ai/api/v1/chat/completions';

        $model = MultiVendorX()->setting->get_setting( 'openrouter_api_model' );
        if ( ! $model ) {
            $model = 'openai/gpt-4o-mini';
        }

        $body = array(
            'model'           => $model,
            'messages'        => array(
                array(
                    'role'    => 'system',
                    'content' => 'You must respond ONLY with valid JSON. No explanations.',
                ),
                array(
                    'role'    => 'user',
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

        if ( ! $result ) {
            return array( 'error' => 'Invalid OpenRouter response' );
        }

        return (string) $result;
    }
}
