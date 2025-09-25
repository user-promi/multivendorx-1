/* global mvx_follow_obj */
jQuery(document).ready(function($){

    // Handle follow/unfollow button click
    $(document).on('click', '.mvx-follow-btn', function(){
        var btn = $(this);
        var store_id = btn.data('store-id');
        var user_id  = btn.data('user-id');
        // If user is not logged in, do nothing
        if(!user_id || btn.text().trim() === 'Login to Follow') {
            return;
        }

        $.post(followStoreFrontend.ajaxurl, {
            action: 'mvx_follow_store',
            store_id: store_id,
            user_id: user_id,
            nonce: followStoreFrontend.nonce
        }, function(res){
            if(res.success){
                // Update button text dynamically
                btn.text(res.data.new_status);
            } else if(res.data && res.data.message){
                alert(res.data.message);
            }
        });
    });

});
