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

const WithdrawalRequests: React.FC = () => {

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
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, pending_withdraw: true },
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
        setData([]);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                pending_withdraw: true,
                page: currentPage,
                row: rowsPerPage,
            },
        })
            .then((response) => {
                console.log(response.data);
                setData(Array.isArray(response.data) ? response.data : []);
            })

            .catch(() => {
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
    const handleSingleAction = (action: string, row: any) => {
        let storeId = row.id;
        if (!storeId) return;

        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `transaction/${storeId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { withdraw: true, action, amount: row.withdraw_amount, store_id: row.id },
        })
            .then(() => requestData(pagination.pageSize, pagination.pageIndex + 1))
            .catch(console.error);
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
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Slug', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_slug || ''}>
                    {row.original.store_slug || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Withdraw Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.withdraw_amount || ''}>
                    {row.original.withdraw_amount || '-'}
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
                            { label: __('Approve', 'multivendorx'), icon: 'adminlib-check', onClick: (row: any) => handleSingleAction('approve', row), hover: true },
                            { label: __('Reject', 'multivendorx'), icon: 'adminlib-close', onClick: (row: any) => handleSingleAction('reject', row), hover: true },
                        ],
                    }}
                />
            ),
        },
    ];


    return (
        <>
            {/* <div className="card-header">
                <div className="left">
                    <div className="title">
                        Withdrawals
                    </div>
                    <div className="des">Waiting for your response</div>
                </div>
                <div className="right">
                    <i className="adminlib-more-vertical"></i>
                </div>
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
                    typeCounts={[]}
                />
            </div>
        </>
    );
};

export default WithdrawalRequests;
