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
     * Gemini API (text only)
     *
     * @param string $key    API key.
     * @param string $prompt Prompt text.
     * @param string $type   text|image|enhance-image (only text considered here).
     * @return string        Generated text or empty string on failure.
     */
    public static function call_gemini_api( $key, $prompt ) {

        $model = 'gemini-2.5-flash';
        $url   = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

        $body = array(
            'contents' => array(
                array(
                    'parts' => array(
                        array('text' => $prompt),
                    ),
                ),
            ),
            'generationConfig' => array(
                'temperature'    => 0.7,
                'candidateCount' => 1,
            ),
        );

        // Call API
        $response = wp_remote_post(
            $url . '?key=' . $key,
            array(
                'headers' => array('Content-Type' => 'application/json'),
                'body'    => wp_json_encode( $body ),
                'timeout' => 20,
            )
        );

        if ( is_wp_error( $response ) ) {
            return '';
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $data['candidates'][0]['content']['parts'][0]['text'] ) ) {
            return '';
        }

        $text = $data['candidates'][0]['content']['parts'][0]['text'];
        return trim( preg_replace('/```json|```/', '', $text) );
    }

    /**
     * OpenAI API (text only)
     *
     * @param string $key    API key.
     * @param string $prompt Prompt text.
     * @return string        Generated text or empty string on failure.
     */
    public static function call_openai_api( $key, $prompt ) {

        $model = 'gpt-5-nano'; // text model only
        $url   = 'https://api.openai.com/v1/responses';

        // Build request body
        $body = array(
            'model' => $model,
            'input' => array(
                array(
                    'role'    => 'user',
                    'content' => array(
                        array(
                            'type' => 'input_text',
                            'text' => $prompt,
                        ),
                    ),
                ),
            ),
        );

        // Call API
        $response = wp_remote_post(
            $url,
            array(
                'headers' => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => "Bearer $key",
                ),
                'body'    => wp_json_encode( $body ),
                'timeout' => 30,
            )
        );
        if ( is_wp_error( $response ) ) {
            return '';
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $data['output'] ) ) {
            return '';
        }

        foreach ( $data['output'] as $item ) {
            if ( empty( $item['content'] ) ) {
                continue;
            }
            foreach ( $item['content'] as $content ) {
                if ( isset( $content['text'] ) ) {
                    return trim( preg_replace('/```json|```/', '', $content['text']) );
                }
            }
        }

        return '';
    }

    /**
     * OpenRouter API (text only)
     *
     * @param string $key    API key.
     * @param string $prompt Prompt text.
     * @return string        Generated text or empty string on failure.
     */
    public static function call_openrouter_api( $key, $prompt ) {

        $url   = 'https://openrouter.ai/api/v1/chat/completions';
        $model = MultiVendorX()->setting->get_setting( 'openrouter_api_model' );

        if ( ! $model ) {
            $model = 'openai/gpt-4o-mini'; // default text model
        }

        $messages = array(
            array(
                'role'    => 'system',
                'content' => 'Return only valid JSON. No markdown. No explanations.',
            ),
            array(
                'role'    => 'user',
                'content' => $prompt,
            ),
        );

        $body = array(
            'model'    => $model,
            'messages' => $messages,
            'response_format' => array(
                'type' => 'json_object',
            ),
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
            return '';
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $data['choices'][0]['message']['content'] ) ) {
            return '';
        }

        $text = $data['choices'][0]['message']['content'];

        // Remove any JSON fences
        $text = preg_replace('/```json|```/', '', $text);

        return trim($text);
    }
}
