
jQuery(document).ready(function($) {
    const chatProvider = livechat_settings.chat_provider;

    if (chatProvider === 'talkjs') {
        let talkJsLoaded = false;

        // Function to initialize TalkJS
        function initializeTalkJS(button) {
            const talkjsAppId = livechat_settings.settings.app_id;
            if (!talkjsAppId) {
                console.error('TalkJS App ID is not configured.');
                return;
            }

            if (!talkJsLoaded) {
                Talk.ready.then(function() {
                    talkJsLoaded = true;
                    createChatbox(button, talkjsAppId);
                });
            } else {
                createChatbox(button, talkjsAppId);
            }
        }

        // Function to create the chatbox
        function createChatbox(button, talkjsAppId) {
            const storeId = $(button).data('store-id');
            const storeName = $(button).data('store-name');

            const me = new Talk.User({
                id: livechat_settings.user_data.id || 'guest-' + Date.now(),
                name: livechat_settings.user_data.name || 'Guest',
                email: livechat_settings.user_data.email,
            });

            const other = new Talk.User({
                id: 'store-' + storeId,
                name: storeName,
            });

            const session = new Talk.Session({
                appId: talkjsAppId,
                me: me,
            });

            const conversation = session.getOrCreateConversation(Talk.oneOnOneId(me, other));
            conversation.setParticipant(me);
            conversation.setParticipant(other);

            const chatbox = session.createChatbox(conversation);
            const chatContainer = $(button).closest('.multivendorx-livechat-wrapper').find('.chat-messages')[0];
            chatbox.mount(chatContainer);

            // Show the modal
            $(button).closest('.multivendorx-livechat-wrapper').find('.multivendorx-chat-modal').show();
        }

        // Open chat modal and initialize TalkJS
        $(document).on('click', '.multivendorx-livechat-btn', function() {
            if ($(this).data('chat-provider') === 'talkjs') {
                initializeTalkJS(this);
            }
        });

        // Close chat modal
        $(document).on('click', '.close-chat', function() {
            var modal = $(this).closest('.multivendorx-chat-modal');
            modal.hide();
        });
    }
});
