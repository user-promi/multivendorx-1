/* global review */
jQuery(document).ready(function($) {

    function load_reviews(store_id, page = 1) {
        if (!store_id) return;

        $.ajax({
            url: review.ajaxurl,
            type: 'POST',
            data: {
                action: 'store_review_list',
                store_id: store_id,
                page: page,
                nonce: review.nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#mvx_vendor_reviews_list').html(response.data.html);
                    $('#review_pagination').html(response.data.pagination);

                    // Attach pagination click events
                    $('.mvx-review-page').off('click').on('click', function() {
                        let page = $(this).data('page');
                        load_reviews(store_id, page);
                    });
                }
            }
        });
    }

    // Submit review
    $('#review_submit').on('click', function(e) {
        e.preventDefault();

        let rating  = $('#rating').val();
        let comment = $('#comment').val();
        let store   = $('#store_for_rating').val();

        if (!rating || !comment) {
            alert('Please provide both rating and review.');
            return;
        }

        $.ajax({
            url: review.ajaxurl,
            type: 'POST',
            data: {
                action: 'store_review_submit',
                rating: rating,
                comment: comment,
                store_id: store,
                nonce: review.nonce
            },
            beforeSend: function() {
                $('#review_submit').attr('disabled', true).val('Submitting...');
            },
            success: function(response) {
                $('#review_submit').attr('disabled', false).val('Submit');
                if (response.success) {
                    alert(response.data.message);
                    $('#commentform')[0].reset();
                    $('#review_form_wrapper').html('<div class="woocommerce-info">You have already reviewed this store.</div>');
                    load_reviews(store); // reload reviews including replies
                } else {
                    alert(response.data.message);
                }
            },
            error: function() {
                $('#review_submit').attr('disabled', false).val('Submit');
                alert('Something went wrong. Please try again.');
            }
        });
    });

    // Load reviews on page load for everyone (logged-in or guest)
    load_reviews($('#store_for_rating').val());
});