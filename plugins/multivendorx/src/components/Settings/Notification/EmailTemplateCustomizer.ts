import { __ } from '@wordpress/i18n';
import { salesReport } from '../../../assets/template/emailTemplate/salesReport';

export default {
	id: 'email-template-customizer',
	priority: 3,
	headerTitle: __('Email Template Customizer', 'multivendorx'),
	headerDescription: __(
		'Edit and manage individual email templates used across the marketplace.',
		'multivendorx'
	),
	headerIcon: 'search-discovery',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_registration_from',
			type: 'block-builder',
			classes: 'full-width',
			// desc: 'Customise personalised store registration form for marketplace.',
			// // Add templates configuration with proper content
			emailTemplates: [salesReport],
			visibleGroups: ['email'],
			defaultTemplateId: 'store-registration',
			context: 'email',
		},
	],
};
