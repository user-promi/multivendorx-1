'use strict';

// On page load
/* global jQuery, localizeData */
jQuery(function ($) {
    /**
     * Init event listener on page loading.
     * @return {undefined}
     */
    function init() {
        $(document).on('click', '.notifima-subscribe', subscribe);
        $(document).on('click', '.notifima-unsubscribe', unsubscribe);
        $(document).on(
            'change',
            'input.variation_id',
            getVariationSubscribeForm
        );
    }

    /**
     * Subscribe user on subscribe button click.
     *
     * @param {Object} event dom event object.
     * @return {undefined}
     */
    function subscribe(event) {
        // Prevent default form submission.
        event.preventDefault();

        /**
         * Subscriber form dom objects
         *
         * @var {Object} dom objects
         */
        const form = $(this).closest('.notifima-subscribe-form');

        // Set button as processing and disable click event.
        $(this).text(localizeData.processing);
        $(this).addClass('stk_disabled');

        const recaptchaEnabled = localizeData.recaptcha_enabled;

        // Recaptcha is enabled validate recaptcha then process form
        if (recaptchaEnabled) {
            const recaptchaSecret = form.find('#recaptchav3_secretkey').val();
            const recaptchaResponse = form.find('#recaptchav3_response').val();

            // Prepare recaptcha request data.
            const recaptchRequest = {
                action: 'recaptcha_validate_ajax',
                nonce: localizeData.nonce,
                recaptcha_secret: recaptchaSecret,
                recaptcha_response: recaptchaResponse,
            };

            // Request for recaptcha validation
            $.post(localizeData.ajax_url, recaptchRequest, function (response) {
                // If valid response process form submition.
                if (response) {
                    processForm(form);
                } else {
                    // Response is not a valid response alert and enable click.
                    alert('Oops, recaptcha not verified!');
                    $(this).removeClass('stk_disabled');
                }
            });
        } else {
            processForm(form);
        }
    }

    /**
     * Process subscription
     * @param {Object}
     */
    function processForm(form) {
        // Get data from form.
        const customerEmail = form.find('.notifima-email').val();
        const productId = form.find('.notifima-product-id').val();
        const variationId = form.find('.notifima-variation-id').val();
        const productTitle = form.find('.notifima-product-name').val();

        // Get data from localizer
        const buttonHtml = localizeData.button_html;
        let successMessage = localizeData.alert_success;
        const errorMessage = localizeData.error_occurs;
        const tryAgainMessage = localizeData.try_again;
        let emailExist = localizeData.alert_email_exist;
        const validEmail = localizeData.valid_email;
        const unsubButtonHtml = localizeData.unsubscribe_button;

        // Prepare success message
        successMessage = successMessage.replace(
            '%product_title%',
            productTitle
        );
        successMessage = successMessage.replace(
            '%customer_email%',
            customerEmail
        );

        // Prepare email exist data
        emailExist = emailExist.replace('%product_title%', productTitle);
        emailExist = emailExist.replace('%customer_email%', customerEmail);

        if (isEmail(customerEmail)) {
            $(this).toggleClass('alert_loader').blur();

            // Request data for subscription
            const requestData = {
                action: 'subscribe_users',
                nonce: localizeData.nonce,
                customer_email: customerEmail,
                product_id: productId,
                variation_id: variationId,
            };

            // Add additional fields data
            localizeData.additional_fields.forEach((element) => {
                requestData[element] = $('#notifima_' + element).val();
            });

            // Request for subscription
            $.post(localizeData.ajax_url, requestData, function (response) {
                // Handle response
                if (response === '0') {
                    form.html(
                        `<div class="registered-message"> ${errorMessage} <a href="${window.location}"> ${tryAgainMessage} </a></div>`
                    );
                } else if (response != '') {
                    if (response === 'already_registered') {
                        form.html(
                            `<div class="registered-message">${emailExist}</div>${unsubButtonHtml}<input type="hidden" class="notifima_subscribed_email" value="${customerEmail}" /><input type="hidden" class="notifima_product_id" value="${productId}" /><input type="hidden" class="notifima_variation_id" value="${variationId}" />`
                        );
                    } else {
                        form.find(`.responsedata-error-message`).remove() &&
                            form.html(response.message);
                    }
                } else {
                    form.html(
                        `<div class="registered-message">${successMessage}</div>`
                    );
                }
                form.find('.notifima-subscribe').replaceWith(buttonHtml);
            });
        } else {
            form.find('.responsedata-error-message').remove() &&
                form.append(
                    $(
                        `<p style="color:#e2401c;" class="responsedata-error-message">${validEmail}</p>`
                    )
                );
            form.find('.notifima-subscribe').replaceWith(buttonHtml);
        }
    }

    /**
     * Unsubscribe user on subscribe button click.
     * @param {Object} event dom event object.
     * @return {undefined}
     */
    function unsubscribe(event) {
        // Prevent default from submittion.
        event.preventDefault();

        /**
         * Subscriber form dom objects
         * @var {Object} dom objects
         */
        const form = $(this).parent().parent();

        // Set button as processing and disable click event.
        $(this).text(localizeData.processing);
        $(this).addClass('stk_disabled');

        // Unsubscribe request data
        const unsubscribeRequest = {
            action: 'unsubscribe_users',
            nonce: localizeData.nonce,
            customer_email: form.find('.notifima_subscribed_email').val(),
            product_id: form.find('.notifima_product_id').val(),
            variation_id: form.find('.notifima_variation_id').val(),
        };

        // Prepare success message on subscribe.
        let successMessage = localizeData.alert_unsubscribe_message;
        successMessage = successMessage.replace(
            '%customer_email%',
            unsubscribeRequest.customer_email
        );
        const errorMessage = localizeData.error_occurs;

        // Request for unsubscribe user.
        $.post(localizeData.ajax_url, unsubscribeRequest, function (response) {
            // unsubscribe success
            if (response) {
                form.html(
                    `<div class="registered-message"> ${successMessage}</div>`
                );
            } else {
                form.html(
                    `<div class="registered-message"> ${errorMessage}<a href="${window.location}"> ${localizeData.try_again}</a></div>`
                );
            }

            // Enable submit button.
            $(this).removeClass('stk_disabled');
        });
    }

    /**
     * Get subscription form of variation product.
     */
    function getVariationSubscribeForm() {
        const variationId = Number($(this).val());
        const productId = Number(
            $('.notifima-shortcode-subscribe-form').data('product-id')
        );

        // Subscription form exist and variation id exist
        if ($('.notifima-shortcode-subscribe-form').length && variationId) {
            // Request body for subscription form
            const subscriptionFormRequest = {
                action: 'get_subscription_form_for_variation',
                nonce: localizeData.nonce,
                product_id: productId,
                variation_id: variationId,
            };

            // Request for subscription form
            $.post(
                localizeData.ajax_url,
                subscriptionFormRequest,
                function (response) {
                    // Set subscription form as inner-html
                    $('.notifima-shortcode-subscribe-form').html(response);
                }
            );
        } else {
            // Variation not exist.
            $('.notifima-shortcode-subscribe-form').html('');
        }
    }

    /**
     * Check the email is valid email or not.
     * @param {string} email email to check
     * @return {boolean} if the email is valid return true otherwise false
     */
    function isEmail(email) {
        if (!email) return false;

        // Regular expressing for email check
        const regex =
            /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        return regex.test(email);
    }

    // Call init function
    init();
});
