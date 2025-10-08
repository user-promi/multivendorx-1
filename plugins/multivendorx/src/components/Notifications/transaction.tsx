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
    const handleTransactionAction = (action: 'approve' | 'reject', transactionId: number) => {
        let newStatus = action === 'approve' ? 'Completed' : 'Rejected';

        axios.put(
            `${appLocalizer.apiUrl}/transactions/${transactionId}`, // replace with your actual endpoint
            { status: newStatus },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        )
            .then(() => {
                console.log(`Transaction ${action}d successfully`);
                requestData(pagination.pageSize, pagination.pageIndex + 1); // refresh table
            })
            .catch((error) => {
                console.error(`Failed to ${action} transaction`, error.response || error.message);
            });
    };

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
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => <TableCell>{row.original.store_name || '-'}</TableCell>,
        },
        {
            header: __('Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {`${appLocalizer.currency_symbol}${Number(row.original.amount).toFixed(2)}`}
                </TableCell>
            ),
        },
        {
            header: __('Requested Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {`${appLocalizer.currency_symbol}${Number(row.original.balance).toFixed(2)}`}
                </TableCell>
            ),
        },
        {
            header: __('Payment Method', 'multivendorx'),
            cell: ({ row }) => <TableCell>{row.original.payment_method || '-'}</TableCell>,
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
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('Approve', 'multivendorx'),
                                icon: 'adminlib-check',
                                onClick: (rowData) => {
                                    handleTransactionAction('approve', rowData.id!);
                                },
                                hover: true,
                            },
                            {
                                label: __('Reject', 'multivendorx'),
                                icon: 'adminlib-close',
                                onClick: (rowData) => {
                                    handleTransactionAction('reject', rowData.id!);
                                },
                                hover: true,
                            },
                        ],
                    }}
                />
            ),
        }
        
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
                    totalCounts={totalRows}
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
