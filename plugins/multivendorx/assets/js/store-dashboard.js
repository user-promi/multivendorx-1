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
    const $allSubtabs = $(".dashboard-tabs .subtabs");
    const $allTabNames = $(".dashboard-tabs .tab-name");
    const $allArrows = $(".dashboard-tabs .admin-arrow");

    // 1️⃣ Hide all subtabs on load
    $allSubtabs.hide();

    // 2️⃣ If a tab-name is active, show its submenu
    $allTabNames.each(function () {
        if ($(this).hasClass("active")) {
            $(this).children(".subtabs").show();
            $(this).find(".admin-arrow").addClass("rotate");
        }
    });

    // 3️⃣ If a submenu item is active, open its parent submenu
    $(".dashboard-tabs .subtabs li.active").each(function () {
        const $subtab = $(this).closest(".subtabs");
        $subtab.show();
        $subtab.prev(".tab").find(".admin-arrow").addClass("rotate");
    });

    // 4️⃣ Toggle submenu on tab click
    $(".dashboard-tabs .tab").on("click", function (e) {
        const $arrow = $(this).find(".admin-arrow.adminlib-pagination-right-arrow");
        const $submenu = $(this).next(".subtabs");

        if ($arrow.length) {
            e.preventDefault();

            // Close other open subtabs & reset arrows
            $allSubtabs.not($submenu).slideUp(200);
            $allArrows.not($arrow).removeClass("rotate");

            // Toggle submenu and arrow
            $submenu.slideToggle(200);
            $arrow.toggleClass("rotate");
        }
    });// dashboard sub menu show hide end

    // my acoount start
    const $dropdown = $(".login-user .dropdown-menu");
    const $avatar = $(".login-user .avatar-wrapper");

    $dropdown.hide();
    $avatar.on("click", function (e) {
        e.stopPropagation();
        $dropdown.toggle();
    });
    $(document).on("click", function (e) {
        if (!$(e.target).closest(".login-user").length) {
            $dropdown.hide();
        }
    }); // my acoount start


    // all tab
    $(".tab-pane").hide();
    $('.nav.nav-tabs li:first-child').addClass('active');
    $('.tab-pane:first').show();
    $('.nav.nav-tabs li').click(function () {
        $('.nav.nav-tabs li').removeClass('active');
        $(this).addClass('active');
        $('.tab-pane.fade').hide();

        var activeTab = $(this).find('a').attr('href');
        $(activeTab).fadeIn();
        return false;
    });


    // General tab
    $('.sale_price_dates_fields').hide();
    $(document).on('click', '.sale_schedule', function (e) {
        e.preventDefault();
        $('.sale_price_dates_fields').slideDown();
        $('.sale_schedule').hide();
    });

    $(document).on('click', '.cancel_sale_schedule', function (e) {
        e.preventDefault();
        $('.sale_price_dates_fields').slideUp();
        $('.sale_schedule').show();
    });


    // Inventory tab
    function toggleStockFields() {
        if ($('#_manage_stock').is(':checked')) {
            $('.stock_fields').slideDown();
            $('.stock_status_field').slideUp();
        } else {
            $('.stock_fields').slideUp();
            $('.stock_status_field').slideDown();
        }
    }
    toggleStockFields();
    $(document).on('change', '#_manage_stock', function () {
        toggleStockFields();
    });

    // select 
mvxAfmLibrary.wcEnhancedSelectInit();
    
});
