jQuery(document).ready(function ($) {
    const store_id = $('#store_for_rating').val();

    // Load Average Ratings
    function loadAverageRatings() {
        $.post(review.ajaxurl, {
            action: 'store_review_avg',
            store_id: store_id,
            nonce: review.nonce,
        }, function (res) {
            if (res.success) {
                let html = `<div class="avg-rating-summary"><strong>Overall: ${res.data.overall} ★</strong><ul>`;
                for (let p in res.data.averages) {
                    html += `<li>${p}: ${res.data.averages[p]} ★</li>`;
                }
                html += '</ul></div>';
                $('#mvx_avg_rating').html(html);
            } else {
                $('#mvx_avg_rating').html('<p>No ratings yet.</p>');
            }
        });
    }

    // Load Reviews
    function loadReviews() {
        $.post(review.ajaxurl, {
            action: 'store_review_list',
            store_id: store_id,
            nonce: review.nonce,
        }, function (res) {
            if (res.success) {
                $('#mvx_vendor_reviews_list').html(res.data.html);
            }
        });
    }

    // Submit Review
    $('#review_submit').on('click', function (e) {
        e.preventDefault();

        let ratings = {};
        $('.mvx-rating-select').each(function () {
            const key = $(this).attr('name').replace('rating[', '').replace(']', '');
            ratings[key] = $(this).val();
        });

        const data = {
            action: 'store_review_submit',
            nonce: review.nonce,
            store_id: store_id,
            review_title: $('#review_title').val(),
            review_content: $('#review_content').val(),
            rating: ratings
        };

        $.post(review.ajaxurl, data, function (res) {
            alert(res.data.message);
            if (res.success) {
                $('#review_form_wrapper').html('<div class="woocommerce-info">Thank you for your review!</div>');
                loadAverageRatings();
                loadReviews();
            }
        });
    });

    // Initial Load
    loadAverageRatings();
    loadReviews();
});
