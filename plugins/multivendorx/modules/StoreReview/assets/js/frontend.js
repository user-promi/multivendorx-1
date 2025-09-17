/* global review */
jQuery(document).ready(function($) {

    $('#review_submit').on('click', function(e) {
        alert('button click');
        e.preventDefault();

        let rating  = $('#rating').val();
        let comment = $('#comment').val();
        let store   = $('#store_for_rating').val();
        let author  = $('#author').val();
        let email   = $('#email').val();

        if (rating === '' || comment === '') {
            return;
        }

        $.ajax({
            url: review.ajaxurl,
            type: 'POST',
            data: {
                action: 'store_review_submit',
                rating: rating,
                comment: comment,
                store_for_rating: store,
                author: author,
                email: email,
                nonce: review.nonce
            },
            beforeSend: function() {
                $('#submit').attr('disabled', true).val('Submitting...');
            },
            success: function(response) {
                $('#submit').attr('disabled', false).val('Submit');
                if (response.success) {
                    alert(response.data.message);
                    $('#commentform')[0].reset();
                } else {
                    alert(response.data.message);
                }
            }
        });
    });

});