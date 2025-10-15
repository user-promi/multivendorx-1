<?php
/**
 * MultiVendorX LiveChat class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\LiveChat;


/**
 * MultiVendorX LiveChat class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class LiveChat {
    
    /**
     * LiveChat constructor.
     */
    public function __construct() {
        // Add hooks for button display
        add_action('woocommerce_after_shop_loop_item', array($this, 'add_button_in_shop_page'), 20);
        add_action('woocommerce_single_product_summary', array($this, 'add_button_in_single_product'), 25);
        
        // Scripts and AJAX
        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
        add_action('wp_ajax_send_chat_message', array($this, 'handle_chat_message'));
        add_action('wp_ajax_nopriv_send_chat_message', array($this, 'handle_chat_message'));
    }

    /**
     * Enqueue scripts and styles
     */
    public function frontend_scripts() {
        if (is_product() || is_shop() || is_product_category()) {
            wp_enqueue_script('multivendorx-livechat', plugins_url('assets/livechat-frontend.js', __FILE__), array('jquery'), '1.0.0', true);
            wp_enqueue_style('multivendorx-livechat', plugins_url('assets/livechat-frontend.css', __FILE__), array(), '1.0.0');
            
            // Localize script for AJAX
            wp_localize_script('multivendorx-livechat', 'livechat_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('livechat_nonce')
            ));
        }
    }

    /**
     * Add live chat button in single product page
     */
    public function add_button_in_single_product() {
        global $product;
        $this->add_livechat_button($product->get_id());
    }

    /**
     * Add live chat button in shop page
     */
    public function add_button_in_shop_page() {
        global $product;

        $this->add_livechat_button($product->get_id(), 'shop');
    }

    /**
     * Main method to add live chat button
     *
     * @param int $product_id Product ID
     * @param string $context Display context (product/shop)
     */
    public function add_livechat_button($product_id, $context = 'product') {
        
        $product = wc_get_product($product_id);
        if (empty($product)) {
            return;
        }

        $store_id = get_post_meta($product_id, 'multivendorx_store_id', true);
        if (!$store_id) {
            return;
        }

        $store = new \MultiVendorX\Store\Store($store_id);
        $store_name = $store->get('name');

        // Get button settings (you can add these to your plugin settings)
        $button_text = 'chat';
        $button_css = '';
        ob_start();
        ?>
        <div class="multivendorx-livechat-wrapper multivendorx-livechat-<?php echo esc_attr($context); ?>">
            <?php if ($context === 'shop'): ?>
                <button type="button" class="multivendorx-livechat-btn button" 
                        style="<?php echo esc_attr($button_css); ?>"
                        data-store-id="<?php echo esc_attr($store_id); ?>"
                        data-product-id="<?php echo esc_attr($product_id); ?>"
                        data-store-name="<?php echo esc_attr($store_name); ?>">
                    <span class="chat-icon">💬</span>
                    <?php echo esc_html($button_text); ?>
                </button>
            <?php else: ?>
                <div class="multivendorx-livechat-single-product">
                    <button type="button" class="multivendorx-livechat-btn button alt" 
                            style="<?php echo esc_attr($button_css); ?>"
                            data-store-id="<?php echo esc_attr($store_id); ?>"
                            data-product-id="<?php echo esc_attr($product_id); ?>"
                            data-store-name="<?php echo esc_attr($store_name); ?>">
                        <span class="chat-icon">💬</span>
                        <?php echo esc_html($button_text); ?>
                    </button>
                </div>
            <?php endif; ?>
            
            <!-- Chat Modal -->
            <div class="multivendorx-chat-modal" style="display: none;">
                <div class="chat-modal-header">
                    <h3>Chat with <?php echo esc_html($store_name); ?></h3>
                    <button class="close-chat">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages-<?php echo esc_attr($store_id); ?>">
                    <!-- Messages will be loaded here -->
                    <div class="chat-welcome-message">
                        <p>Hello! How can we help you with <?php echo esc_html($product->get_name()); ?>?</p>
                    </div>
                </div>
                <div class="chat-input-area">
                    <textarea placeholder="Type your message..." class="chat-message-input"></textarea>
                    <button class="send-message-btn">Send</button>
                </div>
            </div>
        </div>
        <?php
        echo ob_get_clean();
    }

    /**
     * Handle chat message via AJAX
     */
    public function handle_chat_message() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'livechat_nonce')) {
            wp_send_json_error(array('message' => 'Security check failed'));
        }

        $message = sanitize_textarea_field($_POST['message']);
        $product_id = intval($_POST['product_id']);
        $store_id = intval($_POST['store_id']);
        $user_id = get_current_user_id();
        $user_name = $user_id ? wp_get_current_user()->display_name : 'Guest';

        // Prepare message data
        $message_data = array(
            'message' => $message,
            'sender_id' => $user_id,
            'sender_name' => $user_name,
            'product_id' => $product_id,
            'store_id' => $store_id,
            'timestamp' => current_time('mysql'),
            'message_id' => uniqid()
        );

        $preferred_chat = 'talkjs';
        $chat_preferences = array(); // You can get this from store settings

        // Send message based on preferred chat platform
        $result = $this->send_via_chat_platform($message_data, $preferred_chat, $chat_preferences);

        if ($result['success']) {
            // Store message in database
            $this->store_chat_message($message_data);
            
            wp_send_json_success(array(
                'message' => 'Message sent successfully',
                'message_id' => $message_data['message_id'],
                'timestamp' => $message_data['timestamp'],
                'sender_name' => $user_name
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to send message: ' . $result['error']
            ));
        }
    }

    /**
     * Send message via selected chat platform
     */
    private function send_via_chat_platform($message_data, $platform, $preferences) {
        switch ($platform) {
            case 'facebook':
                return $this->send_via_facebook($message_data, $preferences);
            case 'whatsapp':
                return $this->send_via_whatsapp($message_data, $preferences);
            case 'talkjs':
            default:
                return $this->send_via_talkjs($message_data, $preferences);
        }
    }

    /**
     * Send via Facebook Messenger
     */
    private function send_via_facebook($message_data, $preferences) {
        // Implementation for Facebook Messenger
        return array('success' => true);
    }

    /**
     * Send via WhatsApp
     */
    private function send_via_whatsapp($message_data, $preferences) {
        // Implementation for WhatsApp
        return array('success' => true);
    }

    /**
     * Send via TalkJS
     */
    private function send_via_talkjs($message_data, $preferences) {
        // For TalkJS, we'll handle it on frontend
        return array('success' => true);
    }

    /**
     * Store chat message in database
     */
    private function store_chat_message($message_data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'multivendorx_chat_messages';
        
        $wpdb->insert(
            $table_name,
            array(
                'message_id' => $message_data['message_id'],
                'sender_id' => $message_data['sender_id'],
                'product_id' => $message_data['product_id'],
                'store_id' => $message_data['store_id'],
                'message' => $message_data['message'],
                'timestamp' => $message_data['timestamp'],
                'status' => 'sent'
            ),
            array('%s', '%d', '%d', '%d', '%s', '%s', '%s')
        );
    }
}