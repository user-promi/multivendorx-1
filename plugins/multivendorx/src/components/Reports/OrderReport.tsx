import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, MultiCalendarInput, Table, TableCell } from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { formatCurrency } from '../../services/commonFunction';

interface StoreRow {
	id: number;
	store_name: string;
	amount: string;
	commission_amount: string;
	date: string;
	status: string;
	currency_symbol: string;
}

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

type FilterData = {
	searchAction?: string;
	searchField?: string;
	store_id?: string;
	orderBy?: any;
	order?: any;
};

const OrderReport: React.FC = () => {
	const [data, setData] = useState<StoreRow[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pageCount, setPageCount] = useState<number>(0);
	const [store, setStore] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Fetch store list on mount
	 */
	useEffect(() => {
		// Fetch store list
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => setStore(response.data.stores || []))
			.catch(() => {
				setError(__('Failed to load stores', 'multivendorx'));
				setStore([]);
			});
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, []);

	/**
	 * Fetch data from backend (WooCommerce Orders)
	 */
	const requestData = (
		rowsPerPage = 10,
		currentPage = 1,
		searchField = '',
		store_id = '',
		orderBy = '',
		order = '',
		startDate = new Date( new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date()
	) => {
		setData([]);

		const params: any = {
			page: currentPage,
			per_page: rowsPerPage,
			meta_key: 'multivendorx_store_id',
			value: store_id,
			search: searchField,
		};

		if (startDate && endDate) {
			params.after = startDate.toISOString();
			params.before = endDate.toISOString();
		}

		if (orderBy) {
			params.orderby = orderBy;
			params.order = order || 'asc';
		}

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params,
		})
			.then((response) => {
				const total = Number(response.headers['x-wp-total']) || 0;
				setTotalRows(total);
				setPageCount(Math.ceil(total / rowsPerPage));

				const orders: StoreRow[] = response.data.map((order: any) => {
					const metaData = order.meta_data || [];
					const storeMeta = metaData.find(
						(meta: any) => meta.key === 'multivendorx_store_id'
					);
					const store_id = storeMeta ? storeMeta.value : null;

					return {
						id: order.id,
						store_id,
						store_name: order.store_name || '-',
						amount: formatCurrency(order.total),
						commission_amount: order.commission_amount
							? formatCurrency(order.commission_amount)
							: '-',
						date: new Date(order.date_created).toLocaleDateString(
							undefined,
							{
								year: 'numeric',
								month: 'short',
								day: '2-digit',
							}
						),
						status: order.status,
						currency_symbol: order.currency_symbol,
					};
				});

				setData(orders);
			})
			.catch((error) => {
				setError(__('Failed to load order data', 'multivendorx'));
				setData([]);
			});
	};

	/**
	 * Handle pagination & filter
	 */
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.searchField,
			filterData?.store_id,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	/**
	 * Realtime Filters
	 */
	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'store_id',
			render: (updateFilter, filterValue) => (
				<div className="group-field">
					<select
						name="store_id"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('All Stores', 'multivendorx')}
						</option>
						{store.map((s: any) => (
							<option key={s.id} value={s.id}>
								{s.store_name.charAt(0).toUpperCase() +
									s.store_name.slice(1)}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<div className="right">
					<MultiCalendarInput
						onChange={(range: any) => {
							updateFilter('date', {
								start_date: range.startDate,
								end_date: range.endDate,
							});
						}}
					/>
				</div>
			),
		},
	];

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<div className="search-section">
					<input
						name="searchField"
						type="text"
						placeholder={__('Search', 'multivendorx')}
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					/>
					<i className="adminfont-search"></i>
				</div>
			),
		},
	];
	const actionButton: RealtimeFilter[] = [
		{
			name: 'actionButton',
			render: () => (
				<>
					<div className="admin-btn btn-purple-bg"><i className="adminfont-download"></i> Download CSV</div>
				</>
			),
		},
	];
	/**
	 * Table Columns
	 */
	const columns: ColumnDef<StoreRow>[] = [
		{
			id: 'order_id',
			header: __('Order', 'multivendorx'),
			cell: ({ row }) => {
				const id = row.original.id;
				const url = `${appLocalizer.site_url.replace(
					/\/$/,
					''
				)}/wp-admin/post.php?post=${id}&action=edit`;
				return (
					<TableCell>
						<a href={url} target="_blank" rel="noopener noreferrer">
							#{id}
						</a>
					</TableCell>
				);
			},
		},
		{
			header: __('Store', 'multivendorx'),
			cell: ({ row }) => {
				const { store_id, store_name } = row.original;
				const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
				const storeLink = store_id
					? `${baseUrl}&edit/${store_id}/&subtab=store-overview`
					: '#';

				return (
					<TableCell title={store_name || ''}>
						{store_id ? (
							<a
								href={storeLink}
								target="_blank"
								rel="noopener noreferrer"
							>
								{store_name || '-'}
							</a>
						) : (
							store_name || '-'
						)}
					</TableCell>
				);
			},
		},
		{
			header: __('Amount', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.amount}</TableCell>,
		},
		{
			header: __('Commission', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>{row.original.commission_amount}</TableCell>
			),
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.date}</TableCell>,
		},
		{
			id: 'status',
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.status} />;
			},
		},
	];

	return (
		<>
			<Table
				data={data}
				columns={columns as ColumnDef<Record<string, any>, any>[]}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={pagination.pageSize}
				pageCount={pageCount}
				pagination={pagination}
				onPaginationChange={setPagination}
				handlePagination={requestApiForData}
				perPageOption={[10, 25, 50]}
				realtimeFilter={realtimeFilter}
				searchFilter={searchFilter}
				actionButton={actionButton}
				totalCounts={totalRows}
			/>
		</>
	);
};

export default OrderReport;
