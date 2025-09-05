/* global dashboard */
jQuery(document).ready(function($) {
    $(document).on('click', '.switch-store', function(e) {
        e.preventDefault();

        const storeId = $(this).data('store-id');

        $.post(dashboard.ajaxurl, {
            action: 'switch_store',
            store_id: storeId
        }, function(response) {
            if (response.success) {
                window.location.href = response.data.redirect;
            }
        });
    });
});
