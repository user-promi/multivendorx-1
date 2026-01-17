jQuery(document).ready(function ($) {

    let productId = $('#product-qna').data('product');
    let searchTimeout; // For debouncing

    // Load all questions on page load
    loadQuestions('');

    $(document).on('keyup', '#qna-search', function () {
        const keyword = $(this).val().trim();

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadQuestions(keyword);
        }, 300); // 300ms debounce
    });

    // Direct question submission
    $(document).on('click', '#qna-direct-submit', function () {
        const $btn = $(this);
        if ($btn.prop('disabled')) return;

        $btn.prop('disabled', true).text('Submitting...');
        let question = $(this).data('question');

        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_submit',
            product_id: productId,
            question: question,
            nonce: qnaFrontend.nonce
        }, function (res) {
            if (res.success) {
                $('#qna-search').val('');
                $('#qna-success-message')
                    .fadeIn()
                    .delay(2000)
                    .fadeOut(function () {
                        loadQuestions('');
                        $btn.prop('disabled', false).text('Ask now');
                        $('#qna-direct-submit-wrapper').hide();
                    });
            } else {
                alert(res.data.message);
                $btn.prop('disabled', false).text('Ask now');
            }
        });
    });

    function loadQuestions(search) {
        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_search',
            product_id: productId,
            search: search || '',
            nonce: qnaFrontend.nonce
        }, function (res) {
            if (!res.success) return;

            $('#qna-list').empty().html(res.data.html);

            // Show "Ask now" button only if no questions found
            if (!res.data.has_items && search) {
                $('#qna-direct-submit')
                    .data('question', search)
                    .text('Ask now');
                $('#qna-direct-submit-wrapper').show();
            } else {
                $('#qna-direct-submit-wrapper').hide();
            }
        });
    }

});
