/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

type TransactionRow = {
    id: number;
    date: string;
    store_name: string;
    order_details: string;
    transaction_type: string;
    payment_mode: string;
    credit: number;
    debit: number;
    balance: number;
    status: string;
};

const Transactions: React.FC = () => {
    const [data, setData] = useState<TransactionRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState<number | false>(false);
    const [modalTransaction, setModalTransaction] = useState<TransactionRow | null>(null);

    // Fetch total pending transactions
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'Completed' },
        })
        .then((response) => {
            setTotalRows(response.data || 0);
            setPageCount(Math.ceil(response.data / pagination.pageSize));
        });
    }, []);

    // Fetch paginated transactions
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
        setPageCount(Math.ceil(totalRows / pagination.pageSize));
    }, [pagination]);

    const toggleDropdown = (id: number) => {
        setShowDropdown(showDropdown === id ? false : id);
    };

    const requestData = (rowsPerPage = 10, currentPage = 1) => {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { row: rowsPerPage, page: currentPage, status: 'Completed' },
        })
        .then((response) => setData(response.data || []))
        .catch(() => setData([]));
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
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => <TableCell>{row.original.store_name || '-'}</TableCell>,
        },
        {
            header: __('Order Details', 'multivendorx'),
            cell: ({ row }) => <TableCell>{row.original.order_details}</TableCell>,
        },
        {
            header: __('Credit', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {(Number(row.original.credit) || 0).toFixed(2)}
                </TableCell>
            ),
        },
        {
            header: __('Debit', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {(Number(row.original.debit) || 0).toFixed(2)}
                </TableCell>
            ),
        },
        {
            header: __('Balance', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {(Number(row.original.balance) || 0).toFixed(2)}
                </TableCell>
            ),
        },
        
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    <span className={`admin-badge ${row.original.status === 'pending' ? 'red' : 'green'}`}>
                        {row.original.status}
                    </span>
                </TableCell>
            ),
        },
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    <div className="action-section">
                        <i className="adminlib-more-vertical" onClick={() => toggleDropdown(row.original.id)}></i>
                        <div className={`action-dropdown ${showDropdown === row.original.id ? 'show' : ''}`}>
                            <ul>
                                <li onClick={() => setModalTransaction(row.original)}>
                                    <i className="adminlib-eye"></i> {__('View', 'multivendorx')}
                                </li>
                            </ul>
                        </div>
                    </div>
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
                    handlePagination={requestData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={[]}
                />
            </div>

            {/* {modalTransaction && (
                <TransactionDetailsModal
                    transaction={modalTransaction}
                    onClose={() => setModalTransaction(null)}
                />
            )} */}
        </>
    );
};

export default Transactions;
