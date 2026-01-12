/*global jQuery reportAbuseFrontend */
jQuery(function ($) {
	function showThemeNotice(container, type, message) {
		var $container = $(container);
		$container.empty(); // Clear previous messages

		var noticeHtml = '<div class="wc-block-components-notice-banner is-' + type + '">' +
			'<div class="wc-block-components-notice-banner__content">' +
			'<strong>' + capitalizeFirstLetter(type) + ':</strong> ' + message +
			'</div>' +
			'</div>';

		$container.html(noticeHtml);
	}

	function capitalizeFirstLetter(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// Fetch reasons dynamically on form open
	$(document).on('click', '.open-report-abuse', function (e) {
		e.preventDefault();
		e.stopPropagation();

		var $form = $(this).siblings('.report-abuse-form');

		// Close other open popups (optional but recommended)
		$('.report-abuse-form').not($form).fadeOut(200);

		// Toggle current popup
		$form.fadeToggle(200);

		var $wrapper = $form.find('.report-abuse-reasons-wrapper');

		// If not already loaded, fetch reasons
		if ($wrapper.children().length === 0) {
			$.ajax({
				url: reportAbuseFrontend.ajaxurl,
				type: 'POST',
				data: { action: 'get_report_reasons' },
				success: function (res) {
					if (res.success) {
						$.each(res.data, function (i, reason) {
							var radio =
								'<div class="woocommerce-form__radio">' +
								'<label class="woocommerce-form__label woocommerce-form__label-for-radio">' +
								'<input type="radio" class="woocommerce-form__input woocommerce-form__input-radio" ' +
								'name="report_abuse_reason_' +
								$form.find('.report_abuse_product_id').val() +
								'" value="' +
								reason +
								'"> <span>' +
								reason +
								'</span></label></div>';

							$wrapper.append(radio);
						});
					}
				},
			});
		}
	});

	// Close popup on X click
	$(document).on('click', '.popup-close', function (e) {
		e.preventDefault();
		e.stopPropagation();
		$(this).closest('.report-abuse-form').fadeOut(200);
	});

	// Prevent closing when clicking inside the form
	$(document).on(
		'click',
		'.woocommerce-form.woocommerce-form-login.login',
		function (e) {
			e.stopPropagation();
		}
	);

	// Close popup when clicking outside
	$(document).on('click', function () {
		$('.report-abuse-form').fadeOut(200);
	});

	// Show/hide custom message textarea if "Other" is selected
	$(document).on(
		'change',
		'.report-abuse-reasons-wrapper input[type=radio]',
		function () {
			var $form = $(this).closest('.report-abuse-form');
			if ($(this).val().toLowerCase() === 'other') {
				$form.find('.report-abuse-custom-msg').show();
			} else {
				$form.find('.report-abuse-custom-msg').hide();
			}
		}
	);

	// Submit abuse report
	$(document).on('click', '.submit-report-abuse', function (e) {
		e.preventDefault();
		var $btn = $(this);
		if ($btn.prop('disabled')) {
			return;
		}

		var $form = $btn.closest('.report-abuse-form');
		var name = $form.find('.report-abuse-name').val().trim();
		var email = $form.find('.report-abuse-email').val().trim();
		var reason = $form
			.find('.report-abuse-reasons-wrapper input[type=radio]:checked')
			.val();
		var msg =
			reason === 'Other'
				? $form.find('.report-abuse-msg').val().trim()
				: reason;
		var pid = $form.find('.report_abuse_product_id').val();
		var $msgBox = $form.find('.report-abuse-msg-box');

		// Clear previous messages
		$msgBox.empty();

		// Simple email regex validation
		var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!name || !email || !reason || !msg) {
			showThemeNotice($msgBox, 'error', 'All fields are required.');
			return;
		}

		if (!emailRegex.test(email)) {
			showThemeNotice($msgBox, 'error', 'Please enter a valid email address.');
			return;
		}

		$btn.prop('disabled', true);
		$btn.find('.btn-text').hide();
		$btn.find('.btn-spinner').show();

		$.ajax({
			url: reportAbuseFrontend.ajaxurl,
			type: 'POST',
			data: {
				action: 'multivendorx_submit_report_abuse',
				nonce: reportAbuseFrontend.nonce,
				name: name,
				email: email,
				message: msg,
				product_id: pid,
			},
			success: function (res) {
				if (res.success) {
					$msgBox.html(
						'<div class="wc-block-components-notice-banner is-success">' +
						'<div class="wc-block-components-notice-banner__content">' +
						'<strong>Success:</strong> ' + res.data +
						'</div>' +
						'</div>'
					);

					// Hide the form after success
					setTimeout(function () {
						$form.slideUp(function () {
							$form.find('.report-abuse-msg-box').empty();
						});
					}, 1000);

					// Reset form fields
					$form
						.find('input[type=text], input[type=email], textarea')
						.val('');
					$form.find('input[type=radio]').prop('checked', false);
					$form.find('.report-abuse-custom-msg').hide();

					// Reset button
					$btn.prop('disabled', false);
					$btn.find('.btn-text').show();
					$btn.find('.btn-spinner').hide();
				} else {
					$msgBox.html(
						'<span style="color:red;">' + res.data + '</span>'
					);
					$btn.prop('disabled', false);
					$btn.find('.btn-text').show();
					$btn.find('.btn-spinner').hide();
				}
			},
			error: function () {
				$msgBox.html(
					'<span style="color:red;">Something went wrong. Try again.</span>'
				);
				$btn.prop('disabled', false);
				$btn.find('.btn-text').show();
				$btn.find('.btn-spinner').hide();
			},
		});
	});
});
