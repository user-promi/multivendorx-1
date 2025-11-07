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
import { formatCurrency } from '../../services/commonFunction';

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
    date?: string;
    order_details?: string;
    transaction_type?: string;
    credit?: string;
    debit?: string;
    balance?: string;
    payment_method?: string;
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

type FilterData = {
    searchAction?: string;
    searchField?: string;
    typeCount?: any;
    store?: string;
    order?: any;
    orderBy?: any;
    date?: {
        start_date: Date;
        end_date: Date;
    };
    transactionType?: string;
    transactionStatus?: string;
};

// CSV Download Button Component for Transactions (Bulk Action)
const DownloadTransactionCSVButton: React.FC<{
    selectedRows: RowSelectionState;
    data: StoreRow[] | null;
    filterData: FilterData;
    storeId: number | null;
    isLoading?: boolean;
}> = ({ selectedRows, data, filterData, storeId, isLoading = false }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!storeId) {
            alert(__('Please select a store first.', 'multivendorx'));
            return;
        }

        setIsDownloading(true);
        try {
            // Get selected row IDs
            const selectedIds = Object.keys(selectedRows)
                .filter(key => selectedRows[key])
                .map(key => {
                    const rowIndex = parseInt(key);
                    return data?.[rowIndex]?.id;
                })
                .filter(id => id !== undefined);

            // Prepare parameters for CSV download
            const params: any = {
                format: 'csv',
                store_id: storeId,
            };

            // Add date filters if present
            if (filterData?.date?.start_date) {
                params.start_date = filterData.date.start_date.toISOString().split('T')[0];
            }
            if (filterData?.date?.end_date) {
                params.end_date = filterData.date.end_date.toISOString().split('T')[0];
            }

            // Add transaction type filter
            if (filterData?.transactionType) {
                params.transaction_type = filterData.transactionType;
            }

            // Add transaction status filter
            if (filterData?.transactionStatus) {
                params.transaction_status = filterData.transactionStatus;
            }

            // Add status filter (Cr/Dr)
            if (filterData?.typeCount && filterData.typeCount !== 'all') {
                params.filter_status = filterData.typeCount;
            }

            // If specific rows are selected, send their IDs
            if (selectedIds.length > 0) {
                params.ids = selectedIds.join(',');
            } else {
                // If no rows selected, export current page data
                params.page = 1; // You might want to get current page from props
                params.row = 10; // You might want to get current page size from props
            }

            // Make API request for CSV
            const response = await axios({
                method: 'GET',
                url: getApiLink(appLocalizer, 'transaction'),
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Accept': 'text/csv'
                },
                params: params,
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp and store ID
            const timestamp = new Date().toISOString().split('T')[0];
            const context = selectedIds.length > 0 ? 'selected' : 'page';
            const filename = `transactions_${context}_store_${storeId}_${timestamp}.csv`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert(__('Failed to download CSV. Please try again.', 'multivendorx'));
        } finally {
            setIsDownloading(false);
        }
    };

    const hasSelectedRows = Object.keys(selectedRows).some(key => selectedRows[key]);

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading || isLoading || !storeId || (!hasSelectedRows && !data)}
            className="button button-secondary"
        >
            Download CSV
        </button>
    );
};

// Export All CSV Button Component for Transactions - Downloads ALL filtered data
const ExportAllTransactionCSVButton: React.FC<{
    filterData: FilterData;
    storeId: number | null;
}> = ({ filterData, storeId }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleExportAll = async () => {
        if (!storeId) {
            alert(__('Please select a store first.', 'multivendorx'));
            return;
        }

        setIsDownloading(true);
        try {
            // Prepare parameters for CSV download - NO pagination params
            const params: any = {
                format: 'csv',
                store_id: storeId,
            };

            // Add date filters if present
            if (filterData?.date?.start_date) {
                params.start_date = filterData.date.start_date.toISOString().split('T')[0];
            }
            if (filterData?.date?.end_date) {
                params.end_date = filterData.date.end_date.toISOString().split('T')[0];
            }

            // Add transaction type filter
            if (filterData?.transactionType) {
                params.transaction_type = filterData.transactionType;
            }

            // Add transaction status filter
            if (filterData?.transactionStatus) {
                params.transaction_status = filterData.transactionStatus;
            }

            // Add status filter (Cr/Dr)
            if (filterData?.typeCount && filterData.typeCount !== 'all') {
                params.filter_status = filterData.typeCount;
            }

            // Note: We don't send page/row params to get ALL data
            // Note: We don't send IDs since this is for all filtered data

            // Make API request for CSV
            const response = await axios({
                method: 'GET',
                url: getApiLink(appLocalizer, 'transaction'),
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Accept': 'text/csv'
                },
                params: params,
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp and store ID
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `transactions_all_store_${storeId}_${timestamp}.csv`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert(__('Failed to download CSV. Please try again.', 'multivendorx'));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleExportAll}
            disabled={isDownloading || !storeId}
            className="admin-btn btn-purple-bg"
        >
            <span className="adminlib-import"></span>
            Export All CSV
        </button>
    );
};

// Bulk Actions Component for Transactions
const TransactionBulkActions: React.FC<{
    selectedRows: RowSelectionState;
    data: StoreRow[] | null;
    filterData: FilterData;
    storeId: number | null;
    onActionComplete?: () => void;
}> = ({ selectedRows, data, filterData, storeId, onActionComplete }) => {
    return (
        <div>
            <DownloadTransactionCSVButton
                selectedRows={selectedRows}
                data={data}
                filterData={filterData}
                storeId={storeId}
            />
            {/* Add other bulk actions here if needed */}
        </div>
    );
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
    const [currentFilterData, setCurrentFilterData] = useState<FilterData>({});

    // Add search filter with export button
    const actionButton: RealtimeFilter[] = [
        {
            name: 'actionButton',
            render: () => (
                <>
                    <ExportAllTransactionCSVButton
                        filterData={currentFilterData}
                        storeId={storeId}
                    />
                </>
            ),
        },
    ];
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
        orderBy='',
        order='',
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
                transaction_type: transactionType,
                orderBy,
                order,
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
        setCurrentFilterData(filterData);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.transactionType,
            filterData?.transactionStatus,
            filterData?.orderBy,
            filterData?.order,
        );
    };

    // 🔹 Column definitions with Status sorting
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
            id: 'id',
            accessorKey: 'id',
            enableSorting: true,
            header: __("ID", "multivendorx"),
            cell: ({ row }) => <TableCell>#{row.original.id}</TableCell>,
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
            id: 'order_id',
            accessorKey: 'order_id',
            enableSorting: true,
            header: __('Transaction Type', 'multivendorx'),
            cell: ({ row }) => {
                const type = row.original.transaction_type?.toLowerCase();
                const orderId = row.original.order_details;
                const paymentMethod = row.original.payment_method;

                // Format helper → makes text human-readable
                const formatText = (text) =>
                    text
                        ?.replace(/-/g, ' ')                // replace hyphens with spaces
                        ?.replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize each word
                    || '-';

                let displayValue = '-';
                let content = displayValue;

                // Dynamic output
                if (type === 'commission') {
                    displayValue = `Commission #${orderId || '-'}`;
                    if (orderId) {
                        const editLink = `${window.location.origin}/wp-admin/post.php?post=${orderId}&action=edit`;
                        content = (
                            <a href={editLink} target="_blank" rel="noopener noreferrer">
                                {displayValue}
                            </a>
                        );
                    } else {
                        content = displayValue;
                    }
                } else if (type === 'withdrawal') {
                    displayValue = `Withdrawal - ${formatText(paymentMethod)}`;
                    content = displayValue;
                } else if (row.original.transaction_type) {
                    displayValue = formatText(row.original.transaction_type);
                    content = displayValue;
                }

                return <TableCell title={displayValue}>{content}</TableCell>;
            },
        },
        {
            id: 'created_at',
            accessorKey: 'created_at',
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
            // id: 'credit',
            // accessorKey: 'credit',
            // enableSorting: true,
            accessorFn: row => parseFloat(row.credit || '0'),
            header: __('Credit', 'multivendorx'),
            cell: ({ row }) => {
                const credit = row.original.credit;
                return <TableCell>{credit ? formatCurrency(credit) : '-'}</TableCell>;
            },
        },
        {
            // id: 'debit',
            // accessorKey: 'debit',
            // enableSorting: true,
            accessorFn: row => parseFloat(row.debit || '0'),
            header: __('Debit', 'multivendorx'),
            cell: ({ row }) => {
                const debit = row.original.debit;
                return <TableCell>{debit ? formatCurrency(debit) : '-'}</TableCell>;
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
                return <TableCell>{balance ? formatCurrency(balance) : '-'}</TableCell>;
            },
        },
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'transactionType',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="group-field">
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
                <div className="group-field">
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
        if (!storeId) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `reports/${storeId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                const data = response?.data || {};

                const dynamicOverview = [
                    { id: 'commission', label: 'Commission', count: formatCurrency(data.commission_total), icon: 'adminlib-star green' },
                    { id: 'shipping', label: 'Shipping Tax', count: formatCurrency(data.shipping_amount), icon: 'adminlib-clock blue' },
                    { id: 'facilitator', label: 'Facilitator Fee', count: formatCurrency(data.facilitator_fee), icon: 'adminlib-star yellow' },
                    { id: 'gateway_fees', label: 'Gateway Fees', count: formatCurrency(data.gateway_fee), icon: 'adminlib-credit-card red' },
                    { id: 'total_balance', label: 'Total Balance', count: formatCurrency(data.balance), icon: 'adminlib-star green' },
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
            {/* <div className="analytics-container wallet">
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
            </div> */}
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
                    actionButton={actionButton}
                    bulkActionComp={() => (
                        <TransactionBulkActions
                            selectedRows={rowSelection}
                            data={data}
                            filterData={currentFilterData}
                            storeId={storeId}
                        />
                    )}
                />
            </div>
        </>
    );
};

export default TransactionHistoryTable;