import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, MultiCalendarInput, Table, TableCell } from 'zyra';
import axios from 'axios';
import { formatCurrency } from '../../services/commonFunction';

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
	date?: {
		start_date?: string;
		end_date?: string;
	};
};

interface StoreRow {
	order_id: number;
	customer_name: string;
	store_name: string;
	amount: string;
	reason: string;
	status: string;
	date: string;
}

interface RowSelectionState {
	[key: string]: boolean;
}

interface PaginationState {
	pageIndex: number;
	pageSize: number;
}

const RefundedOrderReport: React.FC = () => {
	const [data, setData] = useState<StoreRow[] | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [store, setStore] = useState<any[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Fetch store list and total refunds on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((response) => {
				setStore(response.data.stores || []);
			})
			.catch(() => {
				setError(__('Failed to load stores', 'multivendorx'));
				setStore([]);
			});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'refund'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true },
		})
			.then((response) => {
				const total = response.data || 0;
				setTotalRows(total);
				setPageCount(Math.ceil(total / pagination.pageSize));
			})
			.catch(() => {
				setError(__('Failed to load total rows', 'multivendorx'));
			});
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, []);

	const columns: ColumnDef<RefundRow>[] = [
		{
			id: 'select',
			header: ({ table }: any) => (
				<input
					type="checkbox"
					checked={table.getIsAllRowsSelected()}
					onChange={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }: any) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			id: 'order_id',
			accessorKey: 'order_id',
			enableSorting: true,
			header: __('Order', 'multivendorx'),
			cell: ({ row }: any) => {
				const orderId = row.original.order_id;
				const url = orderId
					? `${appLocalizer.site_url.replace(
						/\/$/,
						''
					)}/wp-admin/post.php?post=${orderId}&action=edit`
					: '#';

				return (
					<TableCell title={orderId ? `#${orderId}` : '-'}>
						{orderId ? (
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="link-item"
							>
								#{orderId}
							</a>
						) : (
							'-'
						)}
					</TableCell>
				);
			},
		},
		{
			header: __('Customer', 'multivendorx'),
			cell: ({ row }: any) => {
				const name = row.original.customer_name?.trim();
				const link = row.original.customer_edit_link;

				return (
					<TableCell title={name || '-'}>
						{name ? (
							link ? (
								<a
									href={link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline"
								>
									{name}
								</a>
							) : (
								name
							)
						) : (
							'-'
						)}
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
								className="text-purple-600 hover:underline"
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
			header: __('Refund Amount', 'multivendorx'),
			cell: ({ row }: any) => (
				<TableCell title={row.original.amount || ''}>
					{formatCurrency(row.original.amount)}
				</TableCell>
			),
		},
		{
			header: __('Refund Reason', 'multivendorx'),
			cell: ({ row }: any) => (
				<TableCell title={row.original.customer_reason || ''}>
					{row.original.customer_reason || '-'}
				</TableCell>
			),
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				const status = row.original.status || '';
				const formattedStatus = status
					?.replace(/[-_]/g, ' ')
					.toLowerCase()
					.replace(/^\w/, (c) => c.toUpperCase());

				const getStatusBadge = (status: string) => {
					switch (status) {
						case 'completed':
							return (
								<span className="admin-badge green">
									Completed
								</span>
							);
						case 'private':
							return (
								<span className="admin-badge yellow">
									Private
								</span>
							);
						default:
							return (
								<span className="admin-badge gray">
									{formattedStatus}
								</span>
							);
					}
				};

				return (
					<TableCell title={`${status}`}>
						{getStatusBadge(status)}
					</TableCell>
				);
			},
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }: any) => {
				const date = row.original.date;
				if (!date) {
					return <TableCell>-</TableCell>;
				}

				const formattedDate = new Date(date).toLocaleDateString(
					'en-US',
					{
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					}
				);

				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
			},
		},
	];

	// Fetch data from backend
	function requestData(
		rowsPerPage = 10,
		currentPage = 1,
		searchAction = 'order_id',
		searchField = '',
		store_id = '',
		orderBy = '',
		order = '',
		startDate = new Date(0),
		endDate = new Date()
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'refund'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				searchField,
				searchAction,
				store_id,
				orderBy,
				order,
				startDate,
				endDate,
			},
		})
			.then((response) => {
				setData(response.data || []);
			})
			.catch(() => {
				setError(__('Failed to load refund data', 'multivendorx'));
				setData([]);
			});
	}

	// Handle pagination & filter
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.searchAction,
			filterData?.searchField,
			filterData?.store_id,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchAction',
			render: (updateFilter, filterValue) => (
				<div className="search-action">
					<select
						value={filterValue || ''}
						onChange={(e) =>
							updateFilter('searchAction', e.target.value || '')
						}
					>
						<option value="order_id">
							{__('Order Id', 'multivendorx')}
						</option>
						<option value="customer">
							{__('Customer', 'multivendorx')}
						</option>
					</select>
				</div>
			),
		},
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
					/>
					<i className="adminlib-search"></i>
				</div>
			),
		},
	];
	const actionButton: RealtimeFilter[] = [
		{
			name: 'actionButton',
			render: () => (
				<>
					<div className="admin-btn btn-purple-bg"><i className="adminlib-download"></i> Download CSV</div>
				</>
			),
		},
	];
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
							{__('All Store', 'multivendorx')}
						</option>
						{store?.map((s: any) => (
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

	return (
		<>
			<Table
				data={data}
				columns={columns as any}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={10}
				pageCount={pageCount}
				pagination={pagination}
				searchFilter={searchFilter}
				actionButton={actionButton}
				onPaginationChange={setPagination}
				realtimeFilter={realtimeFilter}
				handlePagination={requestApiForData}
				perPageOption={[10, 25, 50]}
				totalCounts={totalRows}
			/>
		</>
	);
};

export default RefundedOrderReport;
