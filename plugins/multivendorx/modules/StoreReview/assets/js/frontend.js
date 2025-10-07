jQuery(document).ready(function($) {

    // Calculate overall rating when any criteria rating changes
    $('.criteria-select').on('change', function() {
        calculateOverallRating();
        updateRatingComparison();
    });

    function calculateOverallRating() {
        let total = 0;
        let count = 0;
        
        $('.criteria-select').each(function() {
            let rating = $(this).val();
            if (rating && rating !== '') {
                total += parseInt(rating);
                count++;
            }
        });
        
        if (count > 0) {
            let overall = Math.round((total / count) * 2) / 2; // Round to nearest 0.5
            $('#overall_rating_value').text(overall);
            $('#overall_rating').val(overall);
        } else {
            $('#overall_rating_value').text('0');
            $('#overall_rating').val('0');
        }
    }

    function updateRatingComparison() {
        // This function can be used to show visual comparison between user's rating and existing ratings
        $('.criteria-select').each(function() {
            let criteria = $(this).attr('name').replace('rating_', '');
            let userRating = $(this).val();
            let existingRatingElement = $(this).closest('.criteria-rating-wrapper').find('.existing-rating');
            
            if (userRating && existingRatingElement.length) {
                // You can add visual indicators here if needed
                let existingRatingText = existingRatingElement.text();
                let existingRating = parseFloat(existingRatingText.match(/[\d.]+/)[0]);
                
                if (parseInt(userRating) > existingRating) {
                    $(this).css('border-color', '#4CAF50'); // Green for higher rating
                } else if (parseInt(userRating) < existingRating) {
                    $(this).css('border-color', '#f44336'); // Red for lower rating
                } else {
                    $(this).css('border-color', '#2196F3'); // Blue for same rating
                }
            }
        });
    }

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

        let comment = $('#comment').val();
        let store   = $('#store_for_rating').val();
        let overall_rating = $('#overall_rating').val();

        // Check if all criteria ratings are provided
        let allRated = true;
        let rating_data = {};
        
        $('.criteria-select').each(function() {
            let criteria = $(this).attr('name').replace('rating_', '');
            let value = $(this).val();
            
            if (!value) {
                allRated = false;
                $(this).css('border-color', '#f44336'); // Highlight missing fields in red
                return false;
            } else {
                $(this).css('border-color', ''); // Reset border color
            }
            rating_data[criteria] = value;
        });

        if (!allRated) {
            alert('Please provide ratings for all criteria.');
            return;
        }

        if (!comment) {
            alert('Please write a review.');
            $('#comment').focus().css('border-color', '#f44336');
            return;
        }

        if (overall_rating == '0') {
            alert('Please provide ratings for all criteria.');
            return;
        }

        $.ajax({
            url: review.ajaxurl,
            type: 'POST',
            data: {
                action: 'store_review_submit',
                rating_data: rating_data,
                overall_rating: overall_rating,
                comment: comment,
                store_id: store,
                nonce: review.nonce
            },
            beforeSend: function() {
                $('#review_submit').attr('disabled', true).val('Submitting...');
            },
            success: function(response) {
                $('#review_submit').attr('disabled', false).val('Submit Review');
                if (response.success) {
                    alert(response.data.message);
                    $('#commentform')[0].reset();
                    $('#overall_rating_value').text('0');
                    // Reload the page to show updated ratings and hide form
                    location.reload();
                } else {
                    alert(response.data.message);
                }
            },
            error: function() {
                $('#review_submit').attr('disabled', false).val('Submit Review');
                alert('Something went wrong. Please try again.');
            }
        });
    });

    // Load reviews on page load for everyone (logged-in or guest)
    load_reviews($('#store_for_rating').val());
});