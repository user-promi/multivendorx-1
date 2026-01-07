/* global jQuery, qnaFrontend */
jQuery(document).ready(function ($) {

    let productId = $('#product-qna').data('product');

    // Load all questions on page load
    loadQuestions('');

    // Show form
    $(document).on('click', '#qna-show-form', function () {
        $('#qna-form').slideDown();
        $(this).hide();
    });

    // Submit question
    $(document).on('click', '#qna-submit', function () {
        let question = $('#qna-question').val().trim();
        if (!question) return;

        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_submit',
            product_id: productId,
            question: question,
            nonce: qnaFrontend.nonce
        }, function (res) {
            if (res.success) {
                $('#qna-question').val('');
                $('#qna-form').slideUp();
                $('#qna-show-form').show();
                $('#qna-success-message').fadeIn().delay(2000).fadeOut(function () {
                    loadQuestions('');
                });
            } else {
                alert(res.data.message);
            }
        });
    });

    // Search questions
    $(document).on('keyup', '#qna-search', function () {
        let keyword = $(this).val().trim();
        if (keyword) {
            $('#qna-direct-submit').hide(); // default hide
            loadQuestions(keyword);
        } else {
            $('#qna-direct-submit').hide();
            loadQuestions('');
        }
    });

    // Submit search as direct question
    $(document).on('click', '#qna-direct-submit', function () {
        let question = $(this).data('question');
        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_submit',
            product_id: productId,
            question: question,
            nonce: qnaFrontend.nonce
        }, function (res) {
            if (res.success) {
                $('#qna-direct-submit').hide();
                $('#qna-search').val('');
                $('#qna-success-message').fadeIn().delay(4000).fadeOut(function () {
                    loadQuestions('');
                });
            } else alert(res.data.message);
        });
    });

    // Voting
    $(document).on('click', '.qna-vote', function () {
        let $vote = $(this),
            type = $vote.data('type'),
            $item = $vote.closest('.qna-item'),
            qnaId = $item.data('qna');

        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_vote',
            qna_id: qnaId,
            type: type,
            nonce: qnaFrontend.nonce
        }, function (res) {
            if (res.success) {
                $item.find('.qna-votes p').text(res.data.total_votes);
            } else alert(res.data.message);
        });
    });

    // Function to load questions via AJAX
    function loadQuestions(search) {
        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_search',
            product_id: productId,
            search: search || '',
            nonce: qnaFrontend.nonce
        }, function (res) {
            if (res.success) {
                $('#qna-list').html(res.data.html);
                const count = $('#qna-list .qna-item').length;
                if (count === 0 && search) {
                    $('#qna-direct-submit').show().data('question', search);
                } else {
                    $('#qna-direct-submit').hide();
                }
            }
        });
    }

});
