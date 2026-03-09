/* global multivendorx */
jQuery(document).ready(function ($) {
	$('#linked_store').select2({
		ajax: {
			url: multivendorx.ajaxurl,
			dataType: 'json',
			delay: 250,
			data: function (params) {
				return {
					term: params.term,
					action: 'search_stores',
				};
			},
			processResults: function (data) {
				return {
					results: data,
				};
			},
		},
		minimumInputLength: 3,
		placeholder: multivendorx.select_text,
		allowClear: true,
	});
});

const root = document.documentElement;

if (!getComputedStyle(root).getPropertyValue('--theme-primary')) {

    const btn = document.querySelector('button, .button, .btn');

    if (btn) {
        const color = getComputedStyle(btn).backgroundColor;
        root.style.setProperty('--theme-primary', color);
    }
}