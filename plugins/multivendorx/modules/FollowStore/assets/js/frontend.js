/*global jQuery followStoreFrontend*/
jQuery(document).ready(function ($) {
	// Initialize buttons
	$('.follow-btn').each(function () {
		var btn = $(this);
		var store_id = btn.data('store-id');
	
		$.post(
			followStoreFrontend.ajaxurl,
			{
				action: 'mvx_get_follow_data',
				store_id: store_id,
				nonce: followStoreFrontend.nonce,
			},
			function (res) {
				if (!res.success) {
					return;
				}
	
				var isFollowing = res.data.follow;
				var count = parseInt(res.data.follower_count, 10) || 0;
	
				/**
				 * Button text
				 */
				btn.text(isFollowing ? 'Unfollow' : 'Follow').show();
	
				/**
				 * Follower count text
				 */
				var label = count === 1 ? 'Follower' : 'Followers';
				$('#followers-count-' + store_id).text(count + ' ' + label);
			}
		);
	});
	

	// Handle follow/unfollow click
	$(document).on('click', '.follow-btn', function () {
		var btn = $(this);
		var store_id = btn.data('store-id');
		var user_id = btn.data('user-id');
	
		if (!user_id || btn.text().trim() === 'Login to Follow') {
			return;
		}
	
		btn.prop('disabled', true);
	
		$.post(
			followStoreFrontend.ajaxurl,
			{
				action: 'mvx_follow_store',
				store_id: store_id,
				user_id: user_id,
				nonce: followStoreFrontend.nonce,
			},
			function (res) {
				if (!res.success) {
					btn.prop('disabled', false);
					return;
				}
	
				var isFollowing = res.data.follow;
				var count = parseInt(res.data.follower_count, 10) || 0;
	
				/**
				 * Button text
				 */
				btn.text(isFollowing ? 'Unfollow' : 'Follow');
	
				/**
				 * Follower count
				 */
				var label = count === 1 ? 'Follower' : 'Followers';
				$('#followers-count-' + store_id).text(count + ' ' + label);
	
				btn.prop('disabled', false);
			}
		);
	});
	
});
