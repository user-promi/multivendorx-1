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

const StoreTable: React.FC = () => {

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
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
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
                    {row.original.status === "active" && (
                        <span className="admin-badge green">Active</span>
                    )}
                    {row.original.status === "pending" && (
                        <span className="admin-badge yellow">Pending</span>
                    )}
                    {row.original.status === "rejected" && (
                        <span className="admin-badge red">Rejected</span>
                    )}
                    {row.original.status === "locked" && (
                        <span className="admin-badge blue">Locked</span>
                    )}
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
                                label: __('Store Details', 'multivendorx'),
                                icon: 'adminlib-eye',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&view&id=${rowData.id}`;
                                },
                            },
                            {
                                label: __('View Public Store', 'multivendorx'),
                                icon: 'adminlib-eye',
                                onClick: (rowData) => {
                                    window.open(`${appLocalizer.site_url}/store/${rowData.store_slug}`, '_blank');
                                },
                            },
                            {
                                label: __('Edit Store', 'multivendorx'),
                                icon: 'adminlib-create',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                                },
                                hover: true
                            },
                            {
                                label: __('Delete', 'multivendorx'),
                                icon: 'adminlib-vendor-form-delete',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                                },
                                hover: true
                            },

                        ],
                    }}
                />
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
                />
            </div>
        </>
    );
};

export default StoreTable;
