/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
};

interface TransactionHistoryTableProps {
    storeId: number | null;
    dateRange: { startDate: Date | null; endDate: Date | null };
}
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
type TransactionStatus = {
    key: string;
    name: string;
    count: number;
};
const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({ storeId, dateRange }) => {
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [activeTab, setActiveTab] = useState("products");
    const [allStores, setAllStores] = useState<any[]>([]);
    const [filteredStores, setFilteredStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [overview, setOverview] = useState<any[]>([]);
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus[] | null>(null);

    // 🔹 Helper: get effective date range
    const getEffectiveDateRange = () => {
        if (dateRange.startDate && dateRange.endDate) return dateRange;
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1); // first day of current month
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // last day of current month
        return { startDate: start, endDate: end };
    };

    // 🔹 Fetch total rows on mount or date change
    useEffect(() => {
        if (!storeId) return;

        const { startDate, endDate } = getEffectiveDateRange();

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                count: true,
                store_id: storeId,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
            },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil((response.data || 0) / pagination.pageSize));
            })
            .catch(() => setData([]));
    }, [storeId, dateRange, pagination.pageSize]);

    // 🔹 Fetch data from backend
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        typeCount = '',
        transactionType = '',
        transactionStatus = '',
    ) {
        if (!storeId) return;

        setData(null);

        const { startDate, endDate } = getEffectiveDateRange();

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                store_id: storeId,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                filter_status: typeCount == 'all' ? '' : typeCount,
                transaction_status: transactionStatus,
                transaction_type: transactionType
            },
        }).then((response) => {
            setData(response.data.transaction || []);
            setTransactionStatus([
                {
                    key: 'all',
                    name: 'All',
                    count: response.data.all || 0,
                },
                {
                    key: 'Cr',
                    name: 'Credit',
                    count: response.data.credit || 0,
                },
                {
                    key: 'Dr',
                    name: 'Debit',
                    count: response.data.debit || 0,
                },
            ]);
        })
            .catch(() => setData([]));
    }

    // 🔹 Handle pagination & date changes
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
        setPageCount(Math.ceil(totalRows / pagination.pageSize));
    }, [pagination, storeId, dateRange, totalRows]);

    const requestApiForData = (rowsPerPage: number, currentPage: number, filterData: FilterData) => {
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.transactionType,
            filterData?.transactionStatus,
        );
    };

    // 🔹 Column definitions
    const columns: ColumnDef<StoreRow>[] = [
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
            id: 'date',
            accessorKey: 'date',
            enableSorting: true,
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.date;
                let formattedDate = '-';
                if (rawDate) {
                    const dateObj = new Date(rawDate);
                    formattedDate = new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }).format(dateObj);
                }
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            },
        },
        {
            header: __("Transaction ID", "multivendorx"),
            cell: ({ row }) => <TableCell>#{row.original.id}</TableCell>,
        },
        {
            id: 'order_details',
            accessorKey: 'order_details',
            enableSorting: true,
            accessorFn: row => parseInt(row.order_details || '0'),
            header: __('Order ID', 'multivendorx'),
            cell: ({ row }) => {
                const orderId = row.original.order_details;
                const editLink = orderId
                    ? `${window.location.origin}/wp-admin/post.php?post=${orderId}&action=edit`
                    : '#';
                return (
                    <TableCell title={orderId || ''}>
                        {orderId ? (
                            <a href={editLink} target="_blank" rel="noopener noreferrer">
                                #{orderId}
                            </a>
                        ) : '-'}
                    </TableCell>
                );
            },
        },
        {
            header: __('Transaction Type', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.transaction_type || ''}>
                    {row.original.transaction_type || '-'}
                </TableCell>
            ),
        },
        {
            id: 'credit',
            accessorKey: 'credit',
            enableSorting: true,
            accessorFn: row => parseFloat(row.credit || '0'),
            header: __('Credit', 'multivendorx'),
            cell: ({ row }) => {
                const credit = row.original.credit;
                return <TableCell>{credit ? `${appLocalizer.currency_symbol}${credit}` : '-'}</TableCell>;
            },
        },
        {
            id: 'debit',
            accessorKey: 'debit',
            enableSorting: true,
            accessorFn: row => parseFloat(row.debit || '0'),
            header: __('Debit', 'multivendorx'),
            cell: ({ row }) => {
                const debit = row.original.debit;
                return <TableCell>{debit ? `${appLocalizer.currency_symbol}${debit}` : '-'}</TableCell>;
            },
        },
        {
            id: 'balance',
            accessorKey: 'balance',
            enableSorting: true,
            accessorFn: row => parseFloat(row.balance || '0'),
            header: __('Balance', 'multivendorx'),
            cell: ({ row }) => {
                const balance = row.original.balance;
                return <TableCell>{balance ? `${appLocalizer.currency_symbol}${balance}` : '-'}</TableCell>;
            },
        },
        
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    <span className={`status-badge status-${row.original.status?.toLowerCase()}`}>
                        {row.original.status || '-'}
                    </span>
                </TableCell>
            ),
        },
        {
            header: __('Payment Method', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.payment_method || ''}>
                    {row.original.payment_method || '-'}
                </TableCell>
            ),
        },
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'transactionType',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="transactionType"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">{__('Transaction Type', 'multivendorx')}</option>
                        <option value="Commission">{__('Commission', 'multivendorx')}</option>
                        <option value="Withdrawal">{__('Withdrawal', 'multivendorx')}</option>
                        <option value="Refund">{__('Refund', 'multivendorx')}</option>
                        <option value="Reversed">{__('Reversed', 'multivendorx')}</option>
                        <option value="COD received">{__('COD received', 'multivendorx')}</option>
                    </select>
                </div>
            ),
        },
        {
            name: 'transactionStatus',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="transactionStatus"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">{__('Select Status', 'multivendorx')}</option>
                        <option value="Pending">{__('Pending', 'multivendorx')}</option>
                        <option value="Processed">{__('Processed', 'multivendorx')}</option>
                        <option value="Completed">{__('Completed', 'multivendorx')}</option>
                        <option value="Failed">{__('Failed', 'multivendorx')}</option>
                    </select>
                </div>
            ),
        },
    ];
    // 🔹 Fetch stores on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { options: true },
        })
            .then((response) => {
                if (response?.data?.length) {
                    const mappedStores = response.data.map((store: any) => ({
                        value: store.id,
                        label: store.store_name,
                    }));
                    setAllStores(mappedStores);
                    setFilteredStores(mappedStores.slice(0, 5));
                    setSelectedStore(mappedStores[0]);
                }
            })
            .catch((error) => console.error("Error fetching stores:", error));
    }, []);

    // 🔹 Fetch wallet/transaction overview whenever store changes
    useEffect(() => {
        if (!selectedStore) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `reports/${storeId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                const data = response?.data || {};
                const currency = appLocalizer.currency_symbol || '';

                const dynamicOverview = [
                    { id: 'commission', label: 'Commission', count: `${currency}${data.commission_total ?? '0'}`, icon: 'adminlib-star green' },
                    { id: 'shipping', label: 'Shipping Tax', count: `${currency}${data.shipping_amount ?? '0'}`, icon: 'adminlib-clock blue' },
                    { id: 'facilator', label: 'Facilitator Fee', count: `${currency}${data.facilitator_fee ?? '0'}`, icon: 'adminlib-star yellow' },
                    { id: 'gateway_fees', label: 'Gateway Fees', count: `${currency}${data.gateway_fee ?? '0'}`, icon: 'adminlib-credit-card red' },
                    { id: 'total_balance', label: 'Total Balance', count: `${currency}${data.balance ?? 0}`, icon: 'adminlib-star green' },
                ];

                setOverview(dynamicOverview);
            })
            .catch(() => {
                setOverview([
                    { id: 'total_balance', label: 'Total Balance', count: `0`, icon: 'adminlib-wallet' },
                    { id: 'pending', label: 'Pending', count: `0`, icon: 'adminlib-clock' },
                    { id: 'locked', label: 'Locked', count: `0`, icon: 'adminlib-lock' },
                    { id: 'withdrawable', label: 'Withdrawable', count: `0`, icon: 'adminlib-cash' },
                    { id: 'commission', label: 'Commission', count: `0`, icon: 'adminlib-star' },
                    { id: 'gateway_fees', label: 'Gateway Fees', count: `0`, icon: 'adminlib-credit-card' },
                ]);
            });
    }, [storeId]);


    return (
        <>
            <div className="analytics-container">
                {overview.map((item, idx) => (
                    <div key={idx} className="analytics-item">
                        <div className="analytics-icon">
                            <i className={item.icon}></i>
                        </div>
                        <div className="details">
                            <div className="number">{item.count}</div>
                            <div className="text">{item.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={transactionStatus as TransactionStatus[]}
                    totalCounts={totalRows}
                    realtimeFilter={realtimeFilter}
                />
            </div>
        </>
    );
};

export default TransactionHistoryTable;
