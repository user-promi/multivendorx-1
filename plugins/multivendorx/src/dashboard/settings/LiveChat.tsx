import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';
import axios from 'axios';


const LiveChat = () => {
    const appLocalizer = (window as any).appLocalizer;
    const product_page_chat = appLocalizer.product_page_chat;
    const chat_provider = appLocalizer.chat_provider;
    const messenger_color = appLocalizer.messenger_color;
    const whatsapp_opening_pattern = appLocalizer.whatsapp_opening_pattern;
    const whatsapp_pre_filled = appLocalizer.whatsapp_pre_filled;
    const app_id = appLocalizer.app_id;
    const app_secret = appLocalizer.app_secret;
    const [chatPreferences, setChatPreferences] = useState({
        preferred_chat: 'talkjs',
        facebook_user_id: '',
        whatsapp_number: '',
        talkjs_app_id: '',
        talkjs_secret_key: ''
    });
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);

    useEffect(() => {
        loadChatPreferences();
        loadConversations();
    }, []);

    const loadChatPreferences = async () => {
        try {
            const response = await axios.get(getApiLink('multivendorx/v1/chat-preferences'), {
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce
                }
            });
            if (response.data.success) {
                setChatPreferences(response.data.data);
            }
        } catch (error) {
            console.error('Error loading chat preferences:', error);
        }
    };

    const loadConversations = async () => {
        try {
            const response = await axios.get(getApiLink('multivendorx/v1/chat-conversations'), {
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce
                }
            });
            if (response.data.success) {
                setConversations(response.data.data);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const sendMessage = async (message: any, conversationId: any) => {
        try {
            const response = await axios.post(
                getApiLink('multivendorx/v1/send-chat-message'),
                {
                    message,
                    conversation_id: conversationId,
                    chat_type: chatPreferences.preferred_chat
                },
                {
                    headers: {
                        'X-WP-Nonce': appLocalizer.nonce,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                loadConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="multivendorx-livechat-admin">

            <div className="conversations-section">
                <h2>Customer Conversations</h2>
                <div className="conversations-list">
                    {conversations.map(conversation => (
                        <div 
                            key={conversation.id}
                            className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                            onClick={() => setSelectedConversation(conversation)}
                        >
                            <div className="customer-name">{conversation.customer_name}</div>
                            <div className="last-message">{conversation.last_message}</div>
                            <div className="timestamp">{conversation.last_activity}</div>
                        </div>
                    ))}
                </div>

                {selectedConversation && (
                    <div className="chat-window">
                        <div className="chat-header">
                            <h3>Chat with {selectedConversation.customer_name}</h3>
                        </div>
                        <div className="chat-messages">
                            {selectedConversation.messages.map((message: { id: Key | null | undefined; sender_type: any; content: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; timestamp: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
                                <div key={message.id} className={`message ${message.sender_type}`}>
                                    <div className="message-content">{message.content}</div>
                                    <div className="message-time">{message.timestamp}</div>
                                </div>
                            ))}
                        </div>
                        <div className="chat-input">
                            <TextArea
                                placeholder="Type your response..."
                                onKeyPress={(e: { key: string; shiftKey: any; preventDefault: () => void; target: { value: string; }; }) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(e.target.value, selectedConversation.id);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button onClick={(e) => {
                                const input = e.target.previousSibling;
                                sendMessage(input.value, selectedConversation.id);
                                input.value = '';
                            }}>
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveChat;