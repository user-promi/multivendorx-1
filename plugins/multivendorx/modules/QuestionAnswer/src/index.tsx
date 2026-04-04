import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import Qna from './QnATable';

addFilter(
	'multivendorx_customers-feedback_tab',
	'multivendorx/question-answer-tab',
	(tabs) => {
		tabs.push({
			type: 'file',
			module: 'question-answer',
			content: {
				id: 'questions',
				headerTitle: __('Customer Queries', 'multivendorx'),
				settingTitle: __('Product questions in queue', 'multivendorx'),
				settingSubTitle: __(
					'Waiting for your response',
					'multivendorx'
				),
				headerIcon: 'question',
			},
		});

		return tabs;
	}
);

addFilter(
	'multivendorx_customers_feedback_tab_content',
	'multivendorx/question-answer-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'questions') {
			return <Qna />;
		}

		return defaultForm;
	}
);
