/* global appLocalizer */
import { useState, useEffect } from 'react';
import { SettingsNavigator, useModules, getApiLink } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';
import PendingStores from './PendingStores';
import PendingProducts from './PendingProducts';
import PendingCoupons from './PendingCoupons';
import PendingWithdrawal from './PendingWithdrawalRequests';
import PendingDeactivateRequests from './PendingDeactivateRequests';

if (!window.multivendorxStore) {
	window.multivendorxStore = {
		counts: {},
		listeners: [],
		setCount(id, count) {
			if (this.counts[id] === count) return;
			this.counts[id] = count;
			this.listeners.forEach((fn) => fn(this.counts));
		},
		subscribe(fn) {
			this.listeners.push(fn);
			return () => {
				this.listeners = this.listeners.filter((l) => l !== fn);
			};
		},
	};
}

const ApprovalQueue = () => {
	const [counts, setCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		const store = window.multivendorxStore;

		// initial
		setCounts({ ...store.counts });

		// subscribe
		return store.subscribe((newCounts) => {
			setCounts({ ...newCounts });
		});
	}, []);

	// Initial API fetch (only once)
	useEffect(() => {
		const fetchPendingCount = () => {
			const store = window.multivendorxStore;

			axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'store'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { status: 'pending', page: 1, row: 1 },
			}).then((res) => {
				store.setCount(
					'stores',
					Number(res.headers['x-wp-status-pending']) || 0
				);
			});

			axios
				.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: 1,
						meta_key: 'multivendorx_store_id',
						status: 'pending',
					},
				})
				.then((res) =>
					store.setCount(
						'products',
						parseInt(res.headers['x-wp-total']) || 0
					)
				);

			axios
				.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: 1,
						meta_key: 'multivendorx_store_id',
						status: 'pending',
					},
				})
				.then((res) =>
					store.setCount(
						'coupons',
						parseInt(res.headers['x-wp-total']) || 0
					)
				);

			axios
				.get(getApiLink(appLocalizer, 'store'), {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { page: 1, row: 1, pending_withdraw: true },
				})
				.then((res) =>
					store.setCount(
						'withdrawal',
						Number(res.headers['x-wp-total']) || 0
					)
				);

			axios
				.get(getApiLink(appLocalizer, 'store'), {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { page: 1, row: 1, deactivate: true },
				})
				.then((res) =>
					store.setCount(
						'deactivate-requests',
						Number(res.headers['x-wp-total']) || 0
					)
				);
		};

		fetchPendingCount();
	}, []);

	const { modules } = useModules();
	const settings = appLocalizer.settings_databases_value || {};
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const baseSettingContent = [
		{
			type: 'file',
			condition: settings?.onboarding?.approve_store === 'manually',
			content: {
				id: 'stores',
				headerTitle: __('Stores', 'multivendorx'),
				headerDescription: __(
					'Eager to join the marketplace',
					'multivendorx'
				),
				settingTitle: __('Store in review queue', 'multivendorx'),
				settingSubTitle: __(
					'Next in line! Approve or reject new store join requests.',
					'multivendorx'
				),
				headerIcon: 'storefront yellow',
				count: counts['stores'] || 0,
			},
		},
		{
			type: 'file',
			condition: settings?.['store-permissions']?.products?.includes('publish_products'),
			content: {
				id: 'products',
				headerTitle: __('Products', 'multivendorx'),
				headerDescription: __('Pending your approval', 'multivendorx'),
				settingTitle: __('Products awaiting review', 'multivendorx'),
				settingSubTitle: __(
					'Approve these listings to start generating sales in your marketplace.',
					'multivendorx'
				),
				headerIcon: 'multi-product red',
				count: counts['products'] || 0,
			},
		},
		{
			type: 'file',
			condition: settings?.['store-permissions']?.coupons?.includes('publish_coupons'),
			content: {
				id: 'coupons',
				headerTitle: __('Coupons', 'multivendorx'),
				headerDescription: __('Need a quick review', 'multivendorx'),
				settingTitle: __('Coupons up for review', 'multivendorx'),
				settingSubTitle: __(
					'Approve, decline, or tweak before they go live.',
					'multivendorx'
				),
				headerIcon: 'coupon green',
				count: counts['coupons'] || 0,
			},
		},
		{
			type: 'file',
			condition: settings?.payouts?.withdraw_type === 'manual',
			content: {
				id: 'withdrawal',
				headerTitle: __('Withdrawals', 'multivendorx'),
				headerDescription: __(
					'Queued for disbursement',
					'multivendorx'
				),
				settingTitle: __(
					'Withdrawals awaiting approval',
					'multivendorx'
				),
				settingSubTitle: __(
					'Review and process store payouts.',
					'multivendorx'
				),
				headerIcon: 'bank orange',
				count: counts['withdrawal'] || 0,
			},
		},
		{
			type: 'file',
			content: {
				id: 'deactivate-requests',
				headerTitle: __('Deactivations', 'multivendorx'),
				headerDescription: __(
					'Permanent store closure request',
					'multivendorx'
				),
				settingTitle: __(
					'Stores requesting deactivation',
					'multivendorx'
				),
				settingSubTitle: __(
					'Approve or reject marketplace joiners.',
					'multivendorx'
				),
				headerIcon: 'rejecte teal',
				count: counts['deactivate-requests'] || 0,
			},
		},
	];

	const filteredSettings = applyFilters(
		'multivendorx_approval_queue_tab',
		baseSettingContent,
		{ settings, modules }
	);

	const settingContent = filteredSettings.filter(
		(tab) =>
			(!tab.module || modules.includes(tab.module)) &&
			(tab.condition === undefined || tab.condition)
	);

	const getForm = (tabId: string) => {
		const defaultForm = (() => {
			switch (tabId) {
				case 'stores':
					return <PendingStores />;
				case 'products':
					return <PendingProducts />;
				case 'coupons':
					return <PendingCoupons />;
				case 'withdrawal':
					return <PendingWithdrawal />;
				case 'deactivate-requests':
					return <PendingDeactivateRequests />;
				default:
					return null;
			}
		})();

		return applyFilters(
			'multivendorx_approval_queue_tab_content',
			defaultForm,
			{
				tabId,
			}
		);
	};

	return (
		<SettingsNavigator
			settingContent={settingContent}
			currentSetting={location.get('subtab') as string}
			getForm={getForm}
			prepareUrl={(subTab: string) =>
				`?page=multivendorx#&tab=approval-queue&subtab=${subTab}`
			}
			appLocalizer={appLocalizer}
			menuIcon={true}
			Link={Link}
			variant={'card'}
			headerIcon="approval"
			headerTitle={__('Approval Queue', 'multivendorx')}
			headerDescription={__(
				'Manage all pending administrative actions including approvals, payouts, and notifications.',
				'multivendorx'
			)}
		/>
	);
};

export default ApprovalQueue;