import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { CalendarInput, getApiLink, Table, TableCell } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import TransactionDetailsModal from "./TransactionDetailsModal";
import {formatCurrency} from '../services/commonFunction';

type TransactionRow = {
    id: number;
    date: string;
    order_details: string;
    transaction_type: string;
    payment_mode: string;
    credit: number;
    debit: number;
    balance: number;
    status: string;
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
type TransactionStatus = {
    key: string;
    name: string;
    count: number;
};
const Transactions: React.FC = () => {
    const [data, setData] = useState<TransactionRow[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [modalTransaction, setModalTransaction] = useState<TransactionRow | null>(null);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState(0);
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus[] | null>(null);

    // 🔹 Fetch total rows on mount or date change
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                count: true,
                store_id: appLocalizer.store_id,
            },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil((response.data || 0) / pagination.pageSize));
            })
            .catch(() => setData([]));
    }, []);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    // 🔹 Fetch data from backend
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        typeCount = '',
        transactionType='',
        transactionStatus='',
        startDate = new Date(0),
        endDate = new Date(),
    ) {
        setData([]);

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                store_id: appLocalizer.store_id,
                start_date: startDate,
                end_date: endDate,
                filter_status: typeCount == 'all' ? '' : typeCount,
                transaction_status:transactionStatus,
                transaction_type:transactionType
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

    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.transactionType,
            filterData?.transactionStatus,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };

    const columns: ColumnDef<TransactionRow>[] = [
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
                            <a href={'#'} target="_blank" rel="noopener noreferrer">
                                #{orderId}
                            </a>
                        ) : '-'}
                    </TableCell>
                );
            },
        },
        {
            header: __("Transaction Type", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.transaction_type}</TableCell>,
        },
        {
            id: 'credit',
            accessorKey: 'credit',
            enableSorting: true,
            accessorFn: row => parseFloat(row.credit || '0'),
            header: __('Credit', 'multivendorx'),
            cell: ({ row }) => {
                const credit = row.original.credit;
                const status = row.original.status || '';

                let iconClass = '';
                if (credit) {
                    switch (status) {
                        case 'pending':
                            iconClass = 'adminlib-clock';
                            break;
                        case 'Completed':
                            iconClass = 'adminlib-check';
                            break;
                        case 'failed':
                            iconClass = 'adminlib-cross';
                            break;
                    }
                }

                return (
                    <TableCell>
                        {credit ? (
                            <>
                                {iconClass && <i className={iconClass}></i>}
                                {formatCurrency(credit)}
                            </>
                        ) : (
                            '-'
                        )}
                    </TableCell>
                );
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
                const status = row.original.status || '';

                let iconClass = '';
                if (debit) {
                    switch (status) {
                        case 'pending':
                            iconClass = 'adminlib-clock';
                            break;
                        case 'Completed':
                            iconClass = 'adminlib-check';
                            break;
                        case 'failed':
                            iconClass = 'adminlib-cross';
                            break;
                    }
                }

                return (
                    <TableCell>
                        {debit ? (
                            <>
                                {iconClass && <i className={iconClass}></i>}
                                {formatCurrency(debit)}
                            </>
                        ) : (
                            '-'
                        )}
                    </TableCell>
                );
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
                const status = row.original.status || '';

                let iconClass = '';
                if (balance) {
                    switch (status) {
                        case 'pending':
                            iconClass = 'adminlib-clock';
                            break;
                        case 'Completed':
                            iconClass = 'adminlib-check';
                            break;
                        case 'failed':
                            iconClass = 'adminlib-cross';
                            break;
                    }
                }

                return (
                    <TableCell>
                        {balance ? (
                            <>
                                {iconClass && <i className={iconClass}></i>}
                                {formatCurrency(balance)}
                            </>
                        ) : (
                            '-'
                        )}
                    </TableCell>
                );
            },
        },

        {
            header: __("Status", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.status}</TableCell>,
        },
        {
            header: __("Payment Mode", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.payment_mode}</TableCell>,
        },
        {
            header: __("Action", "multivendorx"),
            cell: ({ row }) => (
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __("View", "multivendorx"),
                                icon: "adminlib-eye",
                                onClick: (rowData) => {
                                    setModalTransaction(rowData);
                                },
                                hover: true,
                            },
                        ],
                    }}
                />
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
        {
            name: 'date',
            render: (updateFilter) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
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
        <div className="admin-table-wrapper">
            <Table
                data={data}
                columns={columns as ColumnDef<Record<string, any>, any>[]}
                rowSelection={{}}
                onRowSelectionChange={() => { }}
                defaultRowsPerPage={10}
                pageCount={pageCount}
                pagination={pagination}
                realtimeFilter={realtimeFilter}
                onPaginationChange={setPagination}
                handlePagination={requestApiForData}
                perPageOption={[10, 25, 50]}
                totalCounts={totalRows}
                typeCounts={transactionStatus as TransactionStatus[]}
            />

            {modalTransaction && (
                <TransactionDetailsModal
                    transaction={modalTransaction}
                    onClose={() => setModalTransaction(null)}
                />
            )}
        </div>
    );
};

export default Transactions;
