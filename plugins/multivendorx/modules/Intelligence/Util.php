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

    /**
     * OpenRouter API: Generate or enhance a single image
     */
    public static function call_openrouter_image_api( $key, $model, $prompt, $image_url = null, $image_data = null ) {
        $url = 'https://openrouter.ai/api/v1/chat/completions';

        $content = array(
            array('type' => 'text', 'text' => $prompt),
        );

        if ( $image_data ) {
            $content[] = array('type' => 'image_url', 'image_url' => array('url' => 'data:image/png;base64,' . $image_data));
        } elseif ( $image_url ) {
            $content[] = array('type' => 'image_url', 'image_url' => array('url' => $image_url));
        }

        $messages = array(
            array('role' => 'user', 'content' => $content),
        );

        $body = array(
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 1024,
            'modalities' => array('image'),
        );

        $response = wp_remote_post(
            $url,
            array(
                'headers' => array(
                    'Authorization' => "Bearer $key",
                    'Content-Type'  => 'application/json',
                    'HTTP-Referer'  => site_url(),
                    'X-Title'       => get_bloginfo('name'),
                ),
                'body' => wp_json_encode($body),
                'timeout' => 60,
            )
        );

        if ( is_wp_error($response) ) {
            return array('image_base64' => null, 'mime_type' => null, 'error' => $response->get_error_message());
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        $image_base64 = $data['choices'][0]['message']['images'][0]['image_base64'] ?? null;

        if ( ! $image_base64 ) {
            return array('image_base64' => null, 'mime_type' => null, 'error' => 'No image returned from OpenRouter API');
        }

        return array('image_base64' => $image_base64, 'mime_type' => 'image/png', 'error' => null);
    }

    /**
     * Gemini API for image generation / enhancement (single image)
     */
    public static function call_gemini_image_api( $api_key, $prompt, $image_data = null ) {
        $request_body = array(
            'contents' => array(
                array('parts' => array(array('text' => $prompt))),
            ),
        );

        if ( $image_data ) {
            $request_body['contents'][0]['parts'][] = array(
                'inline_data' => array(
                    'mime_type' => 'image/jpeg',
                    'data' => $image_data,
                ),
            );
        }

        $response = wp_remote_post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' . $api_key,
            array('method' => 'POST', 'headers' => array('Content-Type' => 'application/json'), 'body' => wp_json_encode($request_body), 'timeout' => 30)
        );

        if ( is_wp_error($response) ) {
            return array('image_base64' => null, 'mime_type' => null, 'error' => $response->get_error_message());
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        $candidate = $body['candidates'][0] ?? null;

        if ( ! $candidate ) {
            return array('image_base64' => null, 'mime_type' => null, 'error' => 'No candidates returned.');
        }

        $image_base64 = null;
        foreach ( $candidate['content']['parts'] ?? array() as $p ) {
            if ( ! empty( $p['inlineData']['data'] ) ) {
                $image_base64 = $p['inlineData']['data'];
                break;
            }
        }

        if ( empty($image_base64) ) {
            return array('image_base64' => null, 'mime_type' => null, 'error' => 'No image returned from Gemini API');
        }

        return array('image_base64' => $image_base64, 'mime_type' => 'image/png', 'error' => null);
    }
}
