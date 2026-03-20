/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	CategoryCount,
	getApiLink,
	ItemListUI,
	NavigatorHeader,
	QueryProps,
	TableCard,
	TableRow,
} from 'zyra';

import ViewCommission from './viewCommission';
import {
	dashNavigate,
	downloadCSV,
	formatLocalDate,
} from '../services/commonFunction';
import { useNavigate } from 'react-router-dom';

type CommissionRow = {
	id: number;
	orderId: number;
	totalOrderAmount: string;
	commissionAmount: string;
	shippingAmount: string;
	taxAmount: string;
	commissionTotal: string;
	status: 'paid' | 'unpaid' | string;
};

const StoreCommission: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [modalCommission, setModalCommission] =
		useState<CommissionRow | null>(null);
	const navigate = useNavigate();

	const headers = {
		id: {
			label: __('ID', 'multivendorx'),
			isSortable: true,
			render: (row) => (
				<span
					onClick={() => {
						setModalCommission(row);
					}}
				>
					#{row.id}
				</span>
			),
		},
		order_id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
			render: (row) => (
				<span
					onClick={() =>
						dashNavigate(navigate, [
							'orders',
							'view',
							String(row.order_id),
						])
					}
				>
					#{row.order_id}
				</span>
			),
		},
		total_order_amount: {
			label: __('Order Amount', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		commission_summary: {
			label: __('Commission Summary', 'multivendorx'),
			render: (row) => (
				<ItemListUI
					className="feature-list"
					items={Object.entries(row)
						.filter(([key]) =>
							[
								'store_earning',
								'shipping_amount',
								'tax_amount',
								'gateway_fee',
								'marketplace_commission',
							].includes(key)
						)
						.map(([key, val]) => ({
							icon: 'adminfont-commissions',
							title: key
								.split('_')
								.map(
									(w) =>
										w.charAt(0).toUpperCase() + w.slice(1)
								)
								.join(' '),
							desc: val,
						}))}
				/>
			),
			csvDisplay: false,
		},
		marketplace_payable: {
			label: __('Total Earned', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		created_at: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		action: {
			label: __('Action', 'multivendorx'),
			type: 'action',
			csvDisplay: false,
			actions: [
				{
					label: __('View Commission', 'multivendorx'),
					icon: 'eye',
					onClick: (row) => {
						setModalCommission(row);
					},
				},
			],
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: buildCommissionQueryParams(query),
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item) => item?.id != null)
					.map((item) => item.id);

				setRowIds(ids);
				setRows(items);

				setCategoryCounts([
					{
						value: 'all',
						label: __('All', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'paid',
						label: __('Paid', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-paid']) || 0,
					},
					{
						value: 'unpaid',
						label: __('Unpaid', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-unpaid']) || 0,
					},
					{
						value: 'refunded',
						label: __('Refunded', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-refunded']) ||
							0,
					},
					{
						value: 'partially_refunded',
						label: __('Partially Refunded', 'multivendorx'),
						count:
							Number(
								response.headers[
									'x-wp-status-partially-refunded'
								]
							) || 0,
					},
					{
						value: 'cancelled',
						label: __('Cancelled', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-cancelled']) ||
							0,
					},
				]);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
				console.error(error);
			});
	};

	const filters = [
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const downloadCommissionsCSV = (selectedIds: number[]) => {
		if (!selectedIds) {
			return;
		}

		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { ids: selectedIds },
			})
			.then((response) => {
				const rows = response.data || [];
				downloadCSV(
					headers,
					rows,
					`selected-commissions-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};

	const downloadCommissionsCSVByQuery = (query: QueryProps) => {
		// Call the API
		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: buildCommissionQueryParams(query, false),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					headers,
					rows,
					`commissions-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};

	const buildCommissionQueryParams = (
		query: QueryProps,
		includePagination: boolean = true
	) => {
		const params = {
			status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
			search_action: query.searchAction || 'commission_id',
			search_value: query.searchValue || '',
			start_date: query.filter?.created_at?.startDate
				? formatLocalDate(query.filter.created_at.startDate)
				: '',
			end_date: query.filter?.created_at?.endDate
				? formatLocalDate(query.filter.created_at.endDate)
				: '',
			store_id: appLocalizer.store_id,
			order_by: query.orderby,
			order: query.order,
		};

		if (includePagination) {
			params.page = query.paged || 1;
			params.row = query.per_page || 10;
		}

		return params;
	};
	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
			onClickWithQuery: downloadCommissionsCSVByQuery,
		},
	];
	return (
		<>
			<NavigatorHeader
				headerTitle={__('Commission', 'multivendorx')}
				headerDescription={__(
					'Details of commissions earned by your store for every order, including order amount, commission rate and payout status.',
					'multivendorx'
				)}
				buttons={[
					{
						label: __('Export', 'multivendorx'),
						icon: 'export',
						// onClick: handleExportAll
					},
				]}
			/>

			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{
					placeholder: __('Search...', 'multivendorx'),
					options: [
						{
							label: __('Commission Id', 'multivendorx'),
							value: 'commission_id',
						},
						{
							label: __('Order Id', 'multivendorx'),
							value: 'order_id',
						},
					],
				}}
				filters={filters}
				buttonActions={buttonActions}
				bulkActions={[]}
				onSelectCsvDownloadApply={downloadCommissionsCSV}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>

			{modalCommission && (
				<ViewCommission
					open={!!modalCommission}
					onClose={() => setModalCommission(null)}
					commissionId={modalCommission.id}
				/>
			)}
		</>
	);
};

export default StoreCommission;
