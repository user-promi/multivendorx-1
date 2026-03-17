jQuery(document).ready(function ($) {
// theme color
	const root = document.documentElement;

	const primary = getComputedStyle(root)
		.getPropertyValue('--theme-primary')
		.trim();

	if (!primary || primary === '#1e73be') {
		const $btn = $('button, .button, .btn').first();

		if ($btn.length) {
		const color = $btn.css('background-color');
		root.style.setProperty('--theme-primary', color);
		}
	}
});