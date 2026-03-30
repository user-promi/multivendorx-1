import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingReportAbuse from './PendingAbuseReports';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';

const [reportAbuseCount, setReportAbuseCount] = useState<number>(0);

useEffect(() => {
	axios
		.get(getApiLink(appLocalizer, 'report-abuse'), {
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 1,
			},
		})
		.then((res) => {
			setReportAbuseCount(Number(res.headers['x-wp-total']) || 0);
		});
}, []);

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
				headerDescription: __(
					'Product reported for assessment',
					'multivendorx'
				),
				settingTitle: __(
					'Flagged products awaiting action',
					'multivendorx'
				),
				settingSubTitle: __(
					'Review reports and maintain quality.',
					'multivendorx'
				),
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
