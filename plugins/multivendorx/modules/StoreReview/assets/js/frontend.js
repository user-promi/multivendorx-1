jQuery(document).ready(function ($) {
    const store_id = $('#store_for_rating').val();

    // Load Average Ratings
    function loadAverageRatings() {
        $.post(review.ajaxurl, {
            action: 'multivendorx_store_review_avg',
            store_id: store_id,
            nonce: review.nonce,
        }, function (res) {
            if (res.success) {
                let html = `<div class="avg-rating-summary">

                                <div class="overall-wrapper"> 
                                    <div class="overall-rating">
                                        <div class="total">${res.data.overall}</div> 
                                        <div class="stars">
                                            <i class="adminlib-star"></i><i class="adminlib-star"></i><i class="adminlib-star"></i><i class="adminlib-star"></i> <i class="adminlib-star"></i>
                                        </div>
                                        <div class="total-number">35k rating</div>
                                    </div>
                                    <div class="rating-breakdown">
                                        <div class="rating">5 <i class="adminlib-star"></i> <div class="bar"></div> <span>6 Reviews</span></div>
                                        <div class="rating">4 <i class="adminlib-star"></i> <div class="bar"></div> <span>51 Reviews</span></div>
                                        <div class="rating">3 <i class="adminlib-star"></i> <div class="bar"></div> <span>5 Reviews</span></div>
                                        <div class="rating">2 <i class="adminlib-star"></i> <div class="bar"></div> <span>63 Reviews</span></div>
                                        <div class="rating">1 <i class="adminlib-star"></i> <div class="bar"></div> <span>9 Reviews</span></div>
                                    </div>
                                </div>
                                <ul>`;
                for (let p in res.data.averages) {
                    html += `<li><span>${res.data.averages[p]} </span>${p}</li>`;
                }
                html += '</ul></div>';
                $('#avg-rating').html(html);
            } else {
                $('#avg-rating').html('<p>No ratings yet.</p>');
            }
        });
    }

    // Load Reviews
    function loadReviews() {
        $.post(review.ajaxurl, {
            action: 'multivendorx_store_review_list',
            store_id: store_id,
            nonce: review.nonce,
        }, function (res) {
            if (res.success) {
                $('#multivendorx-vendor-reviews-list').html(res.data.html);
            }
        });
    }

    // Submit Review
    $('#review_submit').on('click', function (e) {
        e.preventDefault();

        let ratings = {};
        $('.multivendorx-rating-select').each(function () {
            const key = $(this).attr('name').replace('rating[', '').replace(']', '');
            ratings[key] = $(this).val();
        });

        const data = {
            action: 'multivendorx_store_review_submit',
            nonce: review.nonce,
            store_id: store_id,
            review_title: $('#review_title').val(),
            review_content: $('#review_content').val(),
            rating: ratings
        };

        $.post(review.ajaxurl, data, function (res) {
            alert(res.data.message);
            if (res.success) {
                $('#review-form-wrapper').html('<div class="woocommerce-info">Thank you for your review!</div>');
                loadAverageRatings();
                loadReviews();
            }
        });
    });

    // hover star
    $('.rating i').on('mouseenter', function () {
        var value = $(this).data('value');
        var $rating = $(this).closest('.rating');

        $rating.find('i').each(function () {
            $(this).toggleClass('hover', $(this).data('value') <= value);
        });
    });

    $('.rating').on('mouseleave', function () {
        $(this).find('i').removeClass('hover');
    });

    $('.rating i').on('click', function () {
        var value = $(this).data('value');
        var $rating = $(this).closest('.rating');

        $rating.attr('data-selected', value);

        $rating.find('i').each(function () {
            $(this).toggleClass('active', $(this).data('value') <= value);
            $(this).toggleClass('inactive', $(this).data('value') > value);
        });

        // update hidden input value
        $rating.find('input[type="hidden"]').val(value);
    });
    // Initial Load
    loadAverageRatings();
    loadReviews();
});
