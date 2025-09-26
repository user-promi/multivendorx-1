jQuery(function($){
    // Toggle form using event delegation
    $(document).on('click', '.open-report-abuse', function(e){
        e.preventDefault();
        $(this).siblings('.report-abuse-form').toggle();
    });

    // Submit abuse report
    $(document).on('click', '.submit-report-abuse', function(e){
        e.preventDefault();
        var $btn = $(this);
        if ($btn.prop('disabled')) return;

        var $form = $btn.closest('.report-abuse-form');
        var name  = $form.find('.report_abuse_name').val();
        var email = $form.find('.report_abuse_email').val();
        var msg   = $form.find('.report_abuse_msg').val();
        var pid   = $form.find('.report_abuse_product_id').val();
        var $msgBox = $form.find('.report-abuse-msg-box');

        if(!name || !email || !msg){
            $msgBox.html('<span style="color:red;">All fields are required.</span>');
            return;
        }

        // Disable button & show spinner
        $btn.prop('disabled', true);
        $btn.find('.btn-text').hide();
        $btn.find('.btn-spinner').show();

        $.ajax({
            url: reportAbuseFrontend.ajaxurl,
            type: 'POST',
            data: {
                action: 'mvx_submit_report_abuse',
                nonce: reportAbuseFrontend.nonce,
                name: name,
                email: email,
                message: msg,
                product_id: pid
            },
            success: function(res){
                if(res.success){
                    // Show success message instead of button
                    $btn.replaceWith('<span class="report-sent" style="color:green; font-weight:bold;">Report has been sent ✅</span>');
                    $msgBox.html('<span style="color:green;">'+res.data+'</span>');
                } else {
                    $msgBox.html('<span style="color:red;">'+res.data+'</span>');
                    $btn.prop('disabled', false);
                    $btn.find('.btn-text').show();
                    $btn.find('.btn-spinner').hide();
                }
            },
            error: function(){
                $msgBox.html('<span style="color:red;">Something went wrong. Try again.</span>');
                $btn.prop('disabled', false);
                $btn.find('.btn-text').show();
                $btn.find('.btn-spinner').hide();
            }
        });
    });
});
