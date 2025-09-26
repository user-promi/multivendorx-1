jQuery(document).ready(function($){
    // Open form
    $(document).on('click', '.open-report-abuse', function(){
        $(this).siblings('.report-abuse-form').toggle();
    });

    // Submit form
    $(document).on('click', '.submit-report-abuse', function(){
        let wrapper = $(this).closest('.report-abuse-form');
        let data = {
            action: 'mvx_submit_report_abuse',
            name: wrapper.find('.report_abuse_name').val(),
            email: wrapper.find('.report_abuse_email').val(),
            message: wrapper.find('.report_abuse_msg').val(),
            product_id: wrapper.find('.report_abuse_product_id').val(),
        };

        $.post(mvx_params.ajax_url, data, function(response){
            alert(response.data); // show server message
            wrapper.hide();
        });
    });
});
