/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, CommonPopup, CalendarInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { useLocation } from 'react-router-dom';
import ViewCommission from './viewCommission';
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
// Type declarations
type CommissionStatus = {
    key: string;
    name: string;
    count: number;
};
type CommissionRow = {
    id?: number;
    orderId?: number;
    storeId?: number;
    storeName?: string;
    commissionAmount?: string;
    shipping?: string;
    tax?: string;
    commissionTotal?: string;
    commissionRefunded?: string;
    paidStatus?: 'paid' | 'unpaid' | string; // enum-like if you want
    commissionNote?: string | null;
    createTime?: string; // ISO datetime string
};

type FilterData = {
    searchAction?: string;
    searchField?: string;
    typeCount?: any;
    store?: string;
};

const Commission: React.FC = () => {
    const [openModal, setOpenModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<string>('');
    const [error, setError] = useState<String>();
    const [data, setData] = useState<CommissionRow[] | null>(null);
    const [store, setStore] = useState<any[] | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [viewCommission, setViewCommission] = useState(false);
    const [selectedCommissionId, setSelectedCommissionId] = useState<number | null>(null);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [commissionStatus, setCommissionStatus] = useState<CommissionStatus[] | null>(null);
    const [pageCount, setPageCount] = useState(0);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setStore(response.data.stores);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setStore([]);
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
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
    }, [pagination]);

    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        typeCount = '',
        store = '',
        startDate =new Date(0),
        endDate = new Date(),
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === 'all' ? '' : typeCount,
                store_id: store,
                startDate ,
                endDate
            },
        })
            .then((response) => {
                setData(response.data.commissions || []);
                setCommissionStatus([
                    {
                        key: 'all',
                        name: 'All',
                        count: response.data.all || 0,
                    },
                    {
                        key: 'paid',
                        name: 'Paid',
                        count: response.data.paid || 0,
                    },
                    {
                        key: 'cancelled',
                        name: 'Cancelled',
                        count: response.data.cancelled || 0,
                    },
                    {
                        key: 'refund',
                        name: 'Refund',
                        count: response.data.refund || 0,
                    },
                    {
                        key: 'trash',
                        name: 'Trash',
                        count: response.data.trash || 0,
                    },
                ]);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setData([]);
            });
    }

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.store,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };

    // Column definitions
    const columns: ColumnDef<CommissionRow>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
        },
        {
            id: 'id',
            accessorKey: 'id',
            accessorFn: row => parseFloat(row.id || '0'),
            enableSorting: true,
            header: __('Comm ID', 'multivendorx'),
            cell: ({ row }) => <TableCell >#{row.original.id}</TableCell>,
        },
        {
            id: 'storeName',
            accessorKey: 'storeName',
            enableSorting: true,
            header: __('Store Name', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.storeName || '-'}>{row.original.storeName || '-'}</TableCell>,
        },
        {
            id: 'orderId',
            accessorKey: 'orderId',
            enableSorting: true,
            header: __('Order ID', 'multivendorx'),
            cell: ({ row }) => {
                const orderId = row.original.orderId;
                const url = orderId
                    ? `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${orderId}&action=edit`
                    : '#';

                return (
                    <TableCell title={orderId ? `#${orderId}` : '-'}>
                        {orderId ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="order-link">
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
            id: 'totalOrderAmount',
            accessorKey: 'totalOrderAmount',
            accessorFn: row => parseFloat(row.totalOrderAmount || '0'),
            enableSorting: true,
            header: __('Order Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.totalOrderAmount ? `${appLocalizer.currency_symbol}${row.original.totalOrderAmount}` : '-'}>{row.original.totalOrderAmount ? `${appLocalizer.currency_symbol}${row.original.totalOrderAmount}` : '-'}</TableCell>,
        },
        {
            id: 'commissionAmount',
            accessorKey: 'commissionAmount',
            accessorFn: row => parseFloat(row.commissionAmount || '0'),
            enableSorting: true,
            header: __('Commi.. Earned', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.commissionAmount ? `${appLocalizer.currency_symbol}${row.original.commissionAmount}` : '-'}>{row.original.commissionAmount ? `${appLocalizer.currency_symbol}${row.original.commissionAmount}` : '-'}</TableCell>,
        },
        {
            id: 'facilitatorFee',
            accessorKey: 'facilitatorFee',
            accessorFn: row => parseFloat(row.facilitatorFee || '0'),
            enableSorting: true,
            header: __('Facilitator Fee', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.facilitatorFee ? `${appLocalizer.currency_symbol}${row.original.facilitatorFee}` : '-'}>{row.original.facilitatorFee ? `${appLocalizer.currency_symbol}${row.original.facilitatorFee}` : '-'}</TableCell>,
        },
        {
            id: 'gatewayFee',
            accessorKey: 'gatewayFee',
            accessorFn: row => parseFloat(row.gatewayFee || '0'),
            enableSorting: true,
            header: __('Gateway Fee', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.gatewayFee ? `${appLocalizer.currency_symbol}${row.original.gatewayFee}` : '-'}>{row.original.gatewayFee ? `${appLocalizer.currency_symbol}${row.original.gatewayFee}` : '-'}</TableCell>,
        },
        {
            id: 'shippingAmount',
            accessorKey: 'shippingAmount',
            accessorFn: row => parseFloat(row.shippingAmount || '0'),
            enableSorting: true,
            header: __('Shipping Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.shippingAmount ? `${appLocalizer.currency_symbol}${row.original.shippingAmount}` : '-'}>{row.original.shippingAmount ? `${appLocalizer.currency_symbol}${row.original.shippingAmount}` : '-'}</TableCell>,
        },
        {
            id: 'taxAmount',
            accessorKey: 'taxAmount',
            accessorFn: row => parseFloat(row.taxAmount || '0'),
            enableSorting: true,
            header: __('Tax Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.taxAmount ? `${appLocalizer.currency_symbol}${row.original.taxAmount}` : '-'}>{row.original.taxAmount ? `${appLocalizer.currency_symbol}${row.original.taxAmount}` : '-'}</TableCell>,
        },
        {
            id: 'commissionTotal',
            accessorKey: 'commissionTotal',
            accessorFn: row => parseFloat(row.commissionTotal || '0'),
            enableSorting: true,
            header: __('Commi.. Total', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.commissionTotal ? `${appLocalizer.currency_symbol}${row.original.commissionTotal}` : '-'}>{row.original.commissionTotal ? `${appLocalizer.currency_symbol}${row.original.commissionTotal}` : '-'}</TableCell>,
        },
        {
            header: __('Paid Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || '-'}>
                    <span className={`admin-badge ${row.original.status === 'paid' ? 'green' : 'red'}`}>
                        {row.original.status
                            ? row.original.status.charAt(0).toLocaleUpperCase() + row.original.status.slice(1)
                            : '-'}

                    </span>
                </TableCell>
            ),
        },
        {
            id: 'action',
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('View Commission', 'multivendorx'),
                                icon: 'adminlib-eye',
                                onClick: (rowData:any) => {
                                    setSelectedCommissionId(rowData.id ?? null);
                                    setViewCommission(true);
                                },
                                hover: true,
                            },
                            {
                                label: __('Regenerate Commission', 'multivendorx'),
                                icon: 'adminlib-refresh',
                                onClick: (rowData:any) => {
                                    if (rowData?.orderId) {
                                        const url = `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/admin.php?page=wc-orders&action=edit&id=${rowData.orderId}`;
                                        window.open(url, '_blank');
                                    } else {
                                        alert(__('Order ID missing for this commission.', 'multivendorx'));
                                    }
                                },

                                hover: true,
                            },
                        ],
                    }}
                />
            ),
        }
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'store',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="store"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">All Store</option>
                        {store?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.store_name.charAt(0).toUpperCase() + s.store_name.slice(1)}
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
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range:any) => {
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
            <AdminBreadcrumbs
                activeTabIcon="adminlib-commission"
                tabTitle="Commissions"
                description={'Details of commissions earned by each store for every order, including order amount, commission rate, and payout status.'}
            />
            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    realtimeFilter={realtimeFilter}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={commissionStatus as CommissionStatus}
                    // bulkActionComp={() => <BulkAction />}
                    totalCounts={totalRows}
                />
            </div>

            {viewCommission && selectedCommissionId !== null && (
                <ViewCommission
                    open={viewCommission}
                    onClose={() => setViewCommission(false)}
                    commissionId={selectedCommissionId}
                />
            )}
        </>
    );
};

export default Commission;
