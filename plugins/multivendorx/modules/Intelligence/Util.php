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
     * Gemini API (text / image / enhance-image / multimodal)
     *
     * @param string $key   API key.
     * @param string $prompt Prompt text.
     * @param string $type  text|image|enhance-image.
     * @param array  $input Optional extra inputs (image, etc).
     */
    public static function call_gemini_api( $key, $prompt, $type = 'text', $input = array() ) {

        $model = 'gemini-2.5-flash';

        if ( $type === 'image' || $type === 'enhance-image' ) {
            $model = 'gemini-2.5-flash-image';
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

        $parts = array();

        if ( $prompt ) {
            $parts[] = array(
                'text' => $prompt,
            );
        }

        if ( ! empty( $input['image'] ) ) {
            $parts[] = array(
                'inlineData' => array(
                    'mimeType' => $input['mimeType'] ?? 'image/png',
                    'data'     => $input['image'],
                ),
            );
        }

        $body = array(
            'contents' => array(
                array(
                    'parts' => $parts,
                ),
            ),
            'generationConfig' => array(
                'temperature'    => 0.7,
                'candidateCount' => 1,
            ),
        );

        if ( $type === 'image' || $type === 'enhance-image' ) {
            $body['generationConfig']['responseModalities'] = array( 'IMAGE' );
        }

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
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders:gemeni : " . var_export($response, true) . "\n", FILE_APPEND);
        if ( is_wp_error( $response ) ) {
            return '';
        }

        $body_raw = wp_remote_retrieve_body( $response );
        $data     = json_decode( $body_raw, true );

        if ( empty( $data['candidates'][0]['content']['parts'][0]['text'] ) ) {
            return '';
        }

        $text = $data['candidates'][0]['content']['parts'][0]['text'];

        // Remove markdown JSON fences if present
        $text = preg_replace('/```json|```/', '', $text);
        $text = trim($text);

        return $text; // return clean JSON string
    }

    /**
     * OpenAI API (text / image / enhance-image)
     *
     * @param string $key
     * @param string $prompt
     * @param string $type text|image|enhance-image
     * @param array  $input
     */
    public static function call_openai_api( $key, $prompt, $type = 'text', $input = array() ) {

        // MODEL SELECTION
        $model = 'gpt-5-nano';

        if ( $type === 'image' || $type === 'enhance-image' ) {
            $model = 'gpt-image-1';
        }

        $url = 'https://api.openai.com/v1/responses';

        $input_parts = array();

        if ( $prompt ) {
            $input_parts[] = array(
                'role'    => 'user',
                'content' => array(
                    array(
                        'type' => 'input_text',
                        'text' => $prompt,
                    ),
                ),
            );
        }

        // Image input (for enhance)
        if ( ! empty( $input['image'] ) ) {
            $input_parts[0]['content'][] = array(
                'type'      => 'input_image',
                'image_url' => 'data:' . ( $input['mimeType'] ?? 'image/png' ) . ';base64,' . $input['image'],
            );
        }

        $body = array(
            'model' => $model,
            'input' => $input_parts,
        );

        // IMAGE OUTPUT
        if ( $type === 'image' || $type === 'enhance-image' ) {
            $body['modalities'] = array( 'image', 'text' );
        }

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
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders:openai : " . var_export($response, true) . "\n", FILE_APPEND);

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

                // TEXT RESPONSE
                if ( isset( $content['text'] ) ) {
                    $text = $content['text'];

                    $text = preg_replace('/```json|```/', '', $text);
                    return trim($text);
                }

                // IMAGE RESPONSE
                if ( isset( $content['image_base64'] ) ) {
                    return $content['image_base64'];
                }
            }
        }

        return '';
    }

    /**
     * OpenRouter API (text / image / enhance-image)
     *
     * @param string $key
     * @param string $prompt
     * @param string $type text|image|enhance-image
     * @param array  $input
     */
    public static function call_openrouter_api( $key, $prompt, $type = 'text', $input = array() ) {

        $url = 'https://openrouter.ai/api/v1/chat/completions';

        $model = MultiVendorX()->setting->get_setting( 'openrouter_api_model' );
        if ( ! $model ) {
            $model = 'openai/gpt-4o-mini';
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

        // IMAGE INPUT (for enhance)
        if ( $type === 'enhance-image' && ! empty( $input['image'] ) ) {
            $messages[1]['content'] = array(
                array(
                    'type' => 'text',
                    'text' => $prompt,
                ),
                array(
                    'type'      => 'image_url',
                    'image_url' => array(
                        'url' => 'data:' . ( $input['mimeType'] ?? 'image/png' ) . ';base64,' . $input['image'],
                    ),
                ),
            );
        }

        $body = array(
            'model'    => $model,
            'messages' => $messages,
        );

        // TEXT JSON MODE
        if ( $type === 'text' ) {
            $body['response_format'] = array(
                'type' => 'json_object',
            );
        }

        // IMAGE GENERATION MODE
        if ( $type === 'image' ) {
            $body['modalities'] = array( 'image', 'text' );
        }

        if ( $type === 'enhance-image' ) {
            $body['modalities'] = array( 'image', 'text' );
        }

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
        file_put_contents( plugin_dir_path(__FILE__) . "/error.log", date("d/m/Y H:i:s", time()) . ":orders:open router : " . var_export($response, true) . "\n", FILE_APPEND);

        if ( is_wp_error( $response ) ) {
            return '';
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $data['choices'][0]['message'] ) ) {
            return '';
        }

        $message = $data['choices'][0]['message'];

        // TEXT RESPONSE
        if ( isset( $message['content'] ) && is_string( $message['content'] ) ) {
            $text = preg_replace('/```json|```/', '', $message['content']);
            return trim($text);
        }

        // IMAGE RESPONSE
        if ( isset( $data['choices'][0]['message']['images'][0]['image_base64'] ) ) {
            return $data['choices'][0]['message']['images'][0]['image_base64'];
        }

        return '';
    }
}
