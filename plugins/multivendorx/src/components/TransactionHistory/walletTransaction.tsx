/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput, CommonPopup, BasicInput, ToggleSetting, TextArea } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { formatCurrency } from '../../services/commonFunction';
import ViewCommission from '../Commission/viewCommission';

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
    const [storeTransaction, setTtoreTransaction] = useState<any>(null);
    const [wallet, setWallet] = useState<any[]>([]);
    const [recentDebits, setRecentDebits] = useState<any[]>([]);
    const [storeData, setStoreData] = useState<any>(null);
    const [requestWithdrawal, setRequestWithdrawal] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ amount?: string; paymentMethod?: string }>({});
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string>("");
    const [note, setNote] = useState<any | "">("");
    const freeAmount = amount ? amount * 0.05 : 0;
    const totalAmount = amount ? amount + freeAmount : 0;
    const [paymentMethod, setPaymentMethod] = useState<any | "">("");
    const [optionList, setOptionList] = React.useState([]);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [allStores, setAllStores] = useState<any[]>([]);
    const [filteredStores, setFilteredStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus[] | null>(null);
    const [currentFilterData, setCurrentFilterData] = useState<FilterData>({});
    const [viewCommission, setViewCommission] = useState(false);
    const [selectedCommissionId, setSelectedCommissionId] = useState<number | null>(null);

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
            url: getApiLink(appLocalizer, `transaction/${storeId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { id: appLocalizer.store_id }
        })
            .then((response) => {
                setTtoreTransaction(response.data || []);
            })

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
        orderBy = '',
        order = '',
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
            const statuses = [
                { key: 'all', name: 'All', count: response.data.all || 0 },
                { key: 'completed', name: 'Completed', count: response.data.completed || 0 },
                { key: 'processed', name: 'Processed', count: response.data.processed || 0 },
                { key: 'upcoming', name: 'Upcoming', count: response.data.upcoming || 0 },
                { key: 'failed', name: 'Failed', count: response.data.failed || 0 },
            ];

            setTransactionStatus(statuses);

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
            header: __("ID", "multivendorx"),
            cell: ({ row }) => <TableCell>#{row.original.id}</TableCell>,
        },
        {
            id: 'status',
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => {
                return (
                    <TableCell
                        type="status"
                        status={row.original.status}
                    />
                );
            },
        },
        {
            header: __('Transaction Type', 'multivendorx'),
            cell: ({ row }) => {
                const type = row.original.transaction_type?.toLowerCase();
                const commissionId = row.original.commission_id;
                const paymentMethod = row.original.payment_method;
                const orderId = row.original.order_details;
                const formatText = (text) =>
                    text
                        ?.replace(/-/g, ' ')
                        ?.replace(/\b\w/g, (c) => c.toUpperCase())
                    || '-';

                let displayValue = '-';
                let content = displayValue;

                // Commission Transaction (clickable)
                if (type === 'commission') {
                    displayValue = `Commission #${commissionId || '-'}`;
                    content = commissionId ? (
                        <span
                            className="link-item"
                            onClick={() => {
                                setSelectedCommissionId(commissionId);
                                setViewCommission(true);
                            }}
                        >
                            {displayValue}
                        </span>
                    ) : displayValue;
                }

                // Withdrawal
                else if (type === 'withdrawal') {
                    const formattedMethod = formatText(paymentMethod);
                    const accNo = row.original.account_number;

                    let maskedAccount = "";
                    if (paymentMethod === "bank-transfer" && accNo) {
                        const last2 = accNo.slice(-2);
                        maskedAccount = ` (A/C...${last2})`;
                    }

                    displayValue = `Withdrawal via ${formattedMethod}${maskedAccount}`;
                    content = displayValue;
                }
                else if (type === 'refund') {
                    displayValue = `Refund for Order #${orderId || '-'}`;

                    const orderEditUrl = `${appLocalizer.site_url}/wp-admin/admin.php?page=wc-orders&action=edit&id=${orderId}`;
                    content = orderId ? (
                        <a
                            href={orderEditUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-item"
                        >
                            {displayValue}
                        </a>
                    ) : (
                        displayValue
                    );
                }

                else if (row.original.transaction_type) {
                    displayValue = formatText(row.original.transaction_type);
                    content = displayValue;
                }

                return <TableCell title={displayValue}>{content}</TableCell>;
            },
        },
        {
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
            header: __('Credit', 'multivendorx'),
            cell: ({ row }) => {
                const credit = row.original.credit;
                return <TableCell>{credit ? formatCurrency(credit) : '-'}</TableCell>;
            },
        },
        {
            header: __('Debit', 'multivendorx'),
            cell: ({ row }) => {
                const debit = row.original.debit;
                return <TableCell>{debit ? formatCurrency(debit) : '-'}</TableCell>;
            },
        },
        {
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
                        <option value="">{__('Financial Transactions', 'multivendorx')}</option>
                        <option value="Cr">{__('Credit', 'multivendorx')}</option>
                        <option value="Dr">{__('Debit', 'multivendorx')}</option>
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
            url: getApiLink(appLocalizer, `transaction/${storeId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setWallet(response?.data || {});
                setAmount(response?.data.available_balance);
            })

        axios({
            method: "GET",
            url: getApiLink(appLocalizer, `store/${storeId}`),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
        })
            .then((response) => {
                setStoreData(response.data || {});
            })

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: 1,
                row: 3,
                store_id: storeId,
                filter_status: 'Dr',
                transaction_type: 'Withdrawal',
                orderBy: 'created_at',
                order: 'DESC',
            },
        })
            .then((response) => {
                setRecentDebits(response.data.transaction || []);
                console.log("last 3", response.data.transaction)
            })
            .catch((error) => {
                console.error('Error fetching recent debit transactions:', error);
                setRecentDebits([]);
            });
    }, [storeId]);
    const handleWithdrawal = () => {
        // Clear all old errors first
        setValidationErrors({});

        const newErrors: { amount?: string; paymentMethod?: string } = {};
        console.log('is')
        // Amount validations
        if (!amount || amount <= 0) {
            newErrors.amount = "Please enter a valid amount.";
        } else if (amount > (wallet.available_balance ?? 0)) {
            newErrors.amount = `Amount cannot be greater than available balance (${formatCurrency(wallet.available_balance)})`;
        }

        // Payment method validation
        if (!storeData.payment_method) {
            newErrors.paymentMethod = "Please select a payment processor.";
        }

        // If any validation errors exist, show them and stop
        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        // Clear old generic error
        setError("");

        // Submit request
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `transaction/${selectedStore?.value}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                disbursement: true,
                amount,
                store_id: selectedStore?.value,
                method: paymentMethod,
                note,
            },
        })
            .then((res) => {
                if (res.data.success) {
                    setRequestWithdrawal(false);
                    setTimeout(() => {
                        window.location.reload();
                    }, 200);
                } else if (res.data?.message) {
                    setError(`Server: ${res.data.message}`);
                }
            })
            .catch((err) => {
                setError("Server: Failed to submit withdrawal. Please try again.");
                console.error(err);
            });
    };

    const AmountChange = (value: number) => {
        setAmount(value);
    };

    const formatMethod = (method) => {
        if (!method) return "";
        return method
            .replace(/-/g, " ")       // stripe-connect → stripe connect
            .replace(/\b\w/g, c => c.toUpperCase());  // Stripe connect → Stripe Connect
    };

    const freeLeft = wallet?.withdrawal_setting?.[0]?.free_withdrawals - wallet?.free_withdrawal;
    const percentage = Number(wallet?.withdrawal_setting?.[0]?.withdrawal_percentage || 0);
    const fixed = Number(wallet?.withdrawal_setting?.[0]?.withdrawal_fixed || 0);

    // fee calculation
    const fee = (amount * (percentage / 100)) + fixed;
    console.log(wallet?.withdrawal_setting)
    return (
        <>
            <div className="general-wrapper">
                <div className="row">
                    <div className="col">
                        <div className="data-card-wrapper">
                            <div className="data-card">
                                <div className="title">Wallet balance</div>
                                <div className="number">{formatCurrency(wallet.wallet_balance)} <i className="adminlib-wallet"></i></div>
                            </div>
                            <div className="data-card">
                                <div className="title">Upcoming balance</div>
                                <div className="number">{formatCurrency(wallet.locking_balance)} <i className="adminlib-cash "></i></div>
                            </div>
                        </div>

                        {recentDebits.length > 0 ? (
                            <div className="column debit-transactions">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">Recent Debit Transactions</div>
                                    </div>
                                </div>
                                {recentDebits.map((txn) => {
                                    // Format payment method nicely (e.g., "stripe-connect" -> "Stripe Connect")
                                    const formattedPaymentMethod = txn.payment_method
                                        ? txn.payment_method
                                            .replace(/[-_]/g, ' ')                // replace - and _ with spaces
                                            .replace(/\b\w/g, char => char.toUpperCase()) // capitalize each word
                                        : 'N/A';

                                    return (
                                        <div key={txn.id} className="info-item">
                                            <div className="details-wrapper">
                                                <div className="details">
                                                    <div className="name">{formattedPaymentMethod}</div>
                                                    <div className="des">
                                                        {new Date(txn.date).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "2-digit",
                                                            year: "numeric",
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`right-details ${parseFloat(txn.debit) < 0 ? 'negative' : 'positive'
                                                    }`}
                                            >
                                                <div className={`price ${parseFloat(txn.debit) < 0 ? 'negative' : 'positive'
                                                    }`}>   {formatCurrency(txn.debit)}</div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="column">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">Recent payouts</div>
                                    </div>
                                </div>
                                <div className="des">
                                    No recent payouts transactions found.
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="column">

                        <div className="payout-wrapper">
                            <div className="payout-header">
                                <div className="price-wrapper">
                                    <div className="price-title">Available balance</div>
                                    <div className="price">{formatCurrency(wallet.available_balance)} <div className="admin-badge green">Ready to withdraw</div></div>
                                </div>
                            </div>

                            <div className="small-text"><b>{formatCurrency(storeTransaction?.thresold)} </b> minimum required to withdraw</div>

                            <div className="payout-card-wrapper">
                                <div className="payout-card">
                                    <div className="card-title">Upcoming Balance</div>
                                    <div className="card-price">{formatCurrency(wallet.locking_balance)}</div>
                                    <div className="card-des">Pending settinglement. Released soon</div>
                                </div>
                                {wallet?.withdrawal_setting?.length > 0 && (

                                    <div className="payout-card">
                                        <div className="card-title">Free Withdrawals</div>

                                        <div className="card-price">
                                            {wallet?.withdrawal_setting?.[0]?.free_withdrawals - wallet?.free_withdrawal} Left
                                        </div>

                                        <div className="card-des">
                                            Then {(Number(wallet?.withdrawal_setting?.[0]?.withdrawal_percentage) || 0)}% +
                                            {formatCurrency(Number(wallet?.withdrawal_setting?.[0]?.withdrawal_fixed) || 0)} fee
                                        </div>


                                    </div>
                                )}
                            </div>
                            <div className="small-text">some funds locked during settlement</div>
                            {wallet?.payment_schedules ? (
                                <div className="small-text">Auto payouts run {wallet.payment_schedules}</div>
                            ) : (
                                <div className="small-text">Auto payouts not set</div>
                            )}

                            <div className="buttons-wrapper">
                                <div className="admin-btn btn-purple-bg" onClick={() => setRequestWithdrawal(true)}>
                                    Disburse Payment
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <CommonPopup
                    open={requestWithdrawal}
                    width="450px"
                    height="75%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-wallet"></i>
                                Disburse payment
                            </div>
                            <i
                                className="icon adminlib-close"
                                onClick={() => {
                                    setRequestWithdrawal(false);
                                    resetWithdrawalForm(); //reset form on close
                                }}
                            ></i>
                            <div className="des">Release earnings to your stores in a few simple steps - amount, payment processor, and an optional note.</div>
                        </>
                    }
                    footer={
                        <>
                            <div
                                className="admin-btn btn-purple"
                                onClick={() => handleWithdrawal()}
                            >
                                Disburse
                            </div>
                        </>
                    }
                >
                    <div className="content">
                        {/* start left section */}
                        <div className="form-group-wrapper">
                            <div className="available-balance">Withdrawable balance <div>{formatCurrency(wallet.available_balance)}</div></div>

                            <div className="form-group">
                                <label htmlFor="payment_method">Payment Processor</label>

                                <div className="payment-method">
                                    {storeData?.payment_method ? (
                                        <div className="method">
                                            <i className="adminlib-bank"></i>
                                            {formatMethod(storeData.payment_method)}
                                        </div>
                                    ) : (
                                        <span>
                                            No payment method saved
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="amount">Amount</label>

                                <BasicInput
                                    type="number"
                                    name="amount"
                                    value={amount}
                                    onChange={(e) => AmountChange(Number(e.target.value))}
                                />

                                <div className="free-wrapper">
                                    {wallet?.withdrawal_setting?.length > 0 && wallet?.withdrawal_setting?.[0]?.free_withdrawals ? (
                                        <>
                                            {freeLeft > 0 ? (
                                                <span>Burning 1 out of {freeLeft} free withdrawals</span>
                                            ) : (
                                                <span> Free withdrawal limit reached</span>
                                            )}
                                            <span>Total: {formatCurrency(amount || 0)}</span>
                                            <span>| Fee: {formatCurrency(fee)}</span>
                                        </>
                                    ) : (
                                        <span>Actual withdrawal: {formatCurrency(amount || 0)}</span>
                                    )}
                                </div>


                                {validationErrors.amount && (
                                    <div className="invalid-massage">{validationErrors.amount}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="note">Note</label>
                                <TextArea
                                    name="note"
                                    wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description"
                                    value={note}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CommonPopup>
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

export default TransactionHistoryTable;