import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingRefund from './PendingRefund';
import { useEffect, useState } from 'react';
import axios from 'axios';

const [refundCount, setRefundCount] = useState<number>(0);

useEffect(() => {
	axios
		.get(`${appLocalizer.apiUrl}/wp/v2/orders`, {
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				meta_key: 'multivendorx_store_id',
				status: 'refund-requested',
				page: 1,
				per_page: 1,
			},
	}).then((res) => {
			setRefundCount(Number(res.headers['x-wp-total']) || 0);
		});
}, []);

addFilter(
	'multivendorx_approval_queue_tab',
	'multivendorx/refund-tab',
	(settingContent) => {
		settingContent.push({
			type: 'file',
			module: 'marketplace-refund',
			content: {
				id: 'refund-requests',
				headerTitle: __('Refunds', 'multivendorx'),
				headerDescription: __('Need your decision', 'multivendorx'),
				settingTitle: __('Refund tracker', 'multivendorx'),
				settingSubTitle: __(
					'Monitor refund trends and stay informed on returns.',
					'multivendorx'
				),
				headerIcon: 'marketplace-refund blue',
				count: refundCount,
			},
		});

		return settingContent;
	}
);

addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/refund-tab-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'refund-requests') {
			return <PendingRefund setCount={setRefundCount} />;
		}

		return defaultForm;
	}
);
