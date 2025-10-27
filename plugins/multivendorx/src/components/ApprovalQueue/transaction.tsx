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

    const handleTransactionAction = (rowData: any) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `transaction/${rowData.id}`), // fix template literal
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { // use data for PUT payload
                withdraw: true,
                store_id: rowData.id,
                amount: rowData.withdraw_amount
            }
        })
        .then((response) => {
            console.log("success", response.data);
            requestData(pagination.pageSize, pagination.pageIndex + 1);
        })
        .catch((error) => {
            console.error(error);
            setData([]);
        });
    };
    
    

    // Fetch paginated transactions
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
        setPageCount(Math.ceil(totalRows / pagination.pageSize));
    }, [pagination]);

    const requestData = (rowsPerPage = 10, currentPage = 1) => {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            // params: { row: rowsPerPage, page: currentPage, status: 'Completed' },
            params:{pending_withdraw:true}
        })
            .then((response) =>{
                setData(response.data || [])
            } )
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
        // {
        //     header: __('Amount', 'multivendorx'),
        //     cell: ({ row }) => (
        //         <TableCell>
        //             {`${appLocalizer.currency_symbol}${Number(row.original.amount).toFixed(2)}`}
        //         </TableCell>
        //     ),
        // },
        {
            header: __('Requested Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {`${appLocalizer.currency_symbol}${Number(row.original.withdraw_amount).toFixed(2)}`}
                </TableCell>
            ),
        },
        // {
        //     header: __('Payment Method', 'multivendorx'),
        //     cell: ({ row }) => <TableCell>{row.original.payment_method || '-'}</TableCell>,
        // },
        // {
        //     header: __('Status', 'multivendorx'),
        //     cell: ({ row }) => (
        //         <TableCell>
        //             <span className={`admin-badge ${row.original.status === 'pending' ? 'red' : 'green'}`}>
        //                 {row.original.status}
        //             </span>
        //         </TableCell>
        //     ),
        // },
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
                                    handleTransactionAction(rowData);
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
        </>
    );
};

export default Transactions;
