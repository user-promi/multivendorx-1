/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell } from 'zyra';
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

const TransactionHistoryTable: React.FC = ({ storeId }) => {
    const [data, setData] = useState<StoreRow[] | null>(null);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);

    // Fetch total rows on mount
    useEffect(() => {
        if (!storeId) return;
    
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, store_id: storeId },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => {
                setError(__('Failed to load total rows', 'multivendorx'));
            });
    }, [storeId]);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination,storeId]);
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
    ) {
        if (!storeId) return;
    
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                store_id: storeId,
            },
        })
            .then((response) => {
                setData(response.data || []);
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
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
        );
    };

    // Column definitions
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
            header: __('Order ID', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.order_details || ''}>
                    #{row.original.order_details || '-'}
                </TableCell>
            ),
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
            header: __('Payment Method', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.payment_method || ''}>
                    {row.original.payment_method || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Credit', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.credit || ''}>
                    {row.original.credit ? `${appLocalizer.currency_symbol}${row.original.credit}` : '-'}
                </TableCell>
            ),
        },
        {
            header: __('Debit', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.debit || ''}>
                    {row.original.debit ? `${appLocalizer.currency_symbol}${row.original.debit}` : '-'}
                </TableCell>
            ),
        },
        {
            header: __('Balance', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.balance || ''}>
                    {row.original.balance ? `${appLocalizer.currency_symbol}${row.original.balance}` : '-'}
                </TableCell>
            ),
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
    ];

    return (
        <>
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
                    typeCounts={[]}
                    totalCounts={totalRows}
                />
            </div>
        </>
    );
};

export default TransactionHistoryTable;
