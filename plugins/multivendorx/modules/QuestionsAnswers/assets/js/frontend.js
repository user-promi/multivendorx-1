/* global jQuery qnaFrontend */
jQuery(document).ready(function ($) {
    // Show hidden form when clicking "Post your Question"
    $(document).on('click', '#qna-show-form', function () {
        $('#qna-form').slideDown();
        $(this).hide();
    });

    // Submit new question
    $(document).on('click', '#qna-submit', function () {
        let question = $('#qna-question').val();
        let productId = $('#product-qna').data('product');
        if (!question.trim()) return;

        $.post(
            qnaFrontend.ajaxurl,
            {
                action: 'qna_submit',
                product_id: productId,
                question: question,
                nonce: qnaFrontend.nonce,
            },
            function (res) {
                if (res.success) {
                    $('#qna-question').val('');
                    $('#qna-form').slideUp();
                    $('#qna-show-form').show();
                    $('#qna-success-message')
                        .stop(true, true)
                        .fadeIn()
                        .delay(4000)
                        .fadeOut(function () {
                            loadDefaultQnaList(); // reload all questions
                        });
                } else {
                    alert(res.data.message);
                }
            }
        );
    });

    // Search questions
    $(document).on('keyup', '#qna-search', function () {
        let keyword = $(this).val().trim();
        let productId = $('#product-qna').data('product');

        if (!keyword) {
            $('#qna-direct-submit').hide();
            return;
        }

        $.post(
            qnaFrontend.ajaxurl,
            {
                action: 'qna_search',
                product_id: productId,
                search: keyword,
                nonce: qnaFrontend.nonce,
            },
            function (res) {
                if (res.success) {
                    $('#qna-list').html(res.data.html);

                    const count = $('#qna-list .qna-item').length;
                    if (count === 0 && keyword !== '') {
                        $('#qna-direct-submit').show().data('question', keyword);
                    } else {
                        $('#qna-direct-submit').hide();
                    }
                }
            }
        );
    });

    // Submit search "direct question"
    $(document).on('click', '#qna-direct-submit', function () {
        let question = $(this).data('question');
        let productId = $('#product-qna').data('product');

        $.post(
            qnaFrontend.ajaxurl,
            {
                action: 'qna_submit',
                product_id: productId,
                question: question,
                nonce: qnaFrontend.nonce,
            },
            function (res) {
                if (res.success) {
                    $('#qna-success-message')
                        .stop(true, true)
                        .fadeIn()
                        .delay(4000)
                        .fadeOut(function () {
                            loadDefaultQnaList(); // reload all questions
                        });

                    $('#qna-direct-submit').hide();
                    $('#qna-search').val('');
                } else {
                    alert(res.data.message);
                }
            }
        );
    });

    // Voting (upvote/downvote)
    $(document).on('click', '.qna-vote', function () {
        let $vote = $(this);
        let type = $vote.data('type'); // up or down
        let $item = $vote.closest('.qna-item');
        let qnaId = $item.data('qna');

        $.post(
            qnaFrontend.ajaxurl,
            {
                action: 'qna_vote',
                qna_id: qnaId,
                type: type,
                nonce: qnaFrontend.nonce,
            },
            function (res) {
                if (res.success) {
                    // Update vote count visually
                    $item.find('p').last().text(res.data.total_votes);
                } else {
                    alert(res.data.message);
                }
            }
        );
    });

    // Function to reload default questions
    function loadDefaultQnaList() {
        let productId = $('#product-qna').data('product');

        $.post(
            qnaFrontend.ajaxurl,
            {
                action: 'qna_search',
                product_id: productId,
                search: '', // empty to load all
                nonce: qnaFrontend.nonce,
            },
            function (res) {
                if (res.success) {
                    $('#qna-list').html(res.data.html);
                    $('#qna-direct-submit').hide();
                    $('#qna-search').val('');
                }
            }
        );
    }
});
