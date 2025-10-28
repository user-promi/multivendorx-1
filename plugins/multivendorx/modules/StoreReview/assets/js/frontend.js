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
                const data = res.data;
                const total = data.total_reviews || 0;
                const overall = Math.round(data.overall * 10) / 10;
                const breakdown = data.breakdown || {};

                //Build HTML
                let html = `<div class="avg-rating-summary">
                                <div class="overall-wrapper"> 
                                    <div class="overall-rating">
                                        <div class="total">${overall}</div> 
                                        <div class="stars">`;

                // Render stars dynamically
                for (let i = 1; i <= 5; i++) {
                    html += i <= Math.round(overall)
                        ? `<i class="adminlib-star"></i>`
                        : `<i class="adminlib-star-o"></i>`;
                }

                html += `</div>
                         <div class="total-number">${total} Rating${total !== 1 ? 's' : ''}</div>
                         </div>
                         <div class="rating-breakdown">`;

                //Add breakdown dynamically
                for (let i = 5; i >= 1; i--) {
                    const count = breakdown[i] || 0;
                    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                    html += `
                        <div class="rating">
                            ${i} <i class="adminlib-star"></i> 
                            <div class="bar"><span style="width:${percent}%;"></span></div> 
                            <span>${count} Review${count !== 1 ? 's' : ''}</span>
                        </div>`;
                }

                html += `</div></div><ul>`;

                for (let p in data.averages) {
                    html += `<li><span>${Math.round(data.averages[p] * 10) / 10}</span> ${p}</li>`;
                }

                html += `</ul></div>`;

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

    $(document).on('click', '#write-review-btn', function () {
        const $form = $('#commentform');
        $form.slideToggle(300, () => {
            const formVisible = $form.is(':visible');
            $('#write-review-btn').text(formVisible ? 'Cancel Review' : 'Write a Review');
        });
    });

    // Initial Load
    loadAverageRatings();
    loadReviews();
});
