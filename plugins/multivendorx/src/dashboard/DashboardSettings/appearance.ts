/* global appLocalizer */
import { __ } from '@wordpress/i18n';

export default {
	id: 'appearance',
	priority: 2,
	headerTitle: __('Appearance', 'multivendorx'),
	headerDescription: __(
		'Manage your store’s profile image, banner, and video.',
		'multivendorx'
	),
	headerIcon: 'appearance',
	submitUrl: `stores/${appLocalizer.store_id}`,
	modal: [
		{
			type: 'attachment',
			label: __('Profile Image', 'multivendorx'),
			key: 'image',
			imageWidth: 75,
			imageHeight: 75,
			openUploader: __('Upload Image', 'multivendorx'),
		},
		{
			type: 'attachment',
			label: __('Banner Image', 'multivendorx'),
			key: 'banner',
			imageWidth: 300,
			imageHeight: 100,
			openUploader: __('Upload Banner', 'multivendorx'),
		}
	],
};
