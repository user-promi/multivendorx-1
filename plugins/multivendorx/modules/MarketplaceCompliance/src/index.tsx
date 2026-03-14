import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingReportAbuse from './PendingAbuseReports';

let reportAbuseCount = 0;

// function to update count
const setReportAbuseCount = (count: number) => {
	reportAbuseCount = count;
};

addFilter(
	'multivendorx_approval_queue_tab',
	'multivendorx/report-abuse-tab',
	(settingContent) => {

		settingContent.push({
			type: 'file',
			module: 'marketplace-compliance',
			content: {
				id: 'report-abuse',
				headerTitle: __('Flagged', 'multivendorx'),
				headerDescription: __('Product reported for assessment', 'multivendorx'),
				settingTitle: __('Flagged products awaiting action', 'multivendorx'),
				settingSubTitle: __('Review reports and maintain quality.', 'multivendorx'),
				headerIcon: 'product indigo',
				count: reportAbuseCount,
			},
		});

		return settingContent;
	}
);

addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/report-abuse-tab-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'report-abuse') {
			return <PendingReportAbuse setCount={setReportAbuseCount} />;
		}

		return defaultForm;
	}
);