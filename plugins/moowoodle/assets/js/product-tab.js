/* global moowoodle */
jQuery(document).ready(function ($) {
	const cohortRadio = $('input[name="link_type"][value="cohort"]');
	const courseRadio = $('input[name="link_type"][value="course"]');

	if (!moowoodle.khali_dabba) {
		cohortRadio.prop('disabled', true).prop('checked', false);
	}

	function fetchAndRenderLinkedItems(type) {
		$.ajax({
			url: moowoodle.ajaxurl,
			type: 'POST',
			data: {
				action: type === 'course' ? 'get_linkable_courses' : 'get_linkable_cohorts',
				nonce: $('input[name="moowoodle_meta_nonce"]').val(),
				post_id: $('#post_id').val(),
			},
			success: function (response) {
				if (response.success) {
					const select = $('#linked_item_id');
					const selectedId = response.data.selected_id;
					const detectedType = response.data.type;

					if (detectedType) {
						$('input[name="link_type"][value="' + detectedType + '"]').prop('checked', true);
					}

					select.empty().append(
						'<option value="">' + moowoodle.select_text + '</option>'
					);

					response.data.items.forEach(function (item) {
						const isSelected = selectedId == item.id ? 'selected' : '';
						const label = [item.fullname, item.cohort_name].filter(Boolean).join(' || ');
						select.append(
							`<option value="${item.id}" ${isSelected}>${label}</option>`
						);
					});

					$('#dynamic-link-select').show();
				}
			},
			error: function (xhr, status, error) {
				console.error('AJAX request failed:', status, error);
			},
		});
	}

	$('input[name="link_type"]').on('change', function () {
		const type = $(this).val();
		if (type) {
			fetchAndRenderLinkedItems(type);
		} else {
			$('#dynamic-link-select').hide();
		}
	});

	// Automatically determine type
	fetchAndRenderLinkedItems('course');
	fetchAndRenderLinkedItems('cohort');
});
