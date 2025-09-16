/* global dashboard */
jQuery(document).ready(function ($) {
    $(document).on('click', '.switch-store', function (e) {
        e.preventDefault();

        const storeId = $(this).data('store-id');

        $.post(dashboard.ajaxurl, {
            action: 'switch_store',
            store_id: storeId
        }, function (response) {
            if (response.success) {
                window.location.href = response.data.redirect;
            }
        });
    });

    // dashboard sub menu show hide start
        $(".dashboard-tabs .subtabs").hide();
        $(".dashboard-tabs .tab").on("click", function (e) {
            const $arrow = $(this).find(".admin-arrow");

            if ($arrow.length) {
                e.preventDefault();

                const $submenu = $(this).next(".subtabs");

                $(".dashboard-tabs .subtabs").not($submenu).slideUp(200);

                $submenu.slideToggle(200);
            }
        }); // dashboard sub menu show hide end


    // Product Type tabs start
    $(".tab-titles .title").on("click", function () {
        const targetId = this.id.replace("-tab", "");
        $(".tab-titles .title").removeClass("active");
        $(this).addClass("active");

        $(".tab-content .tab-panel").hide();
        $("#" + targetId).show();

    });  // Product Type tabs end

});
