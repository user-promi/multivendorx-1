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

type StoreStatus = {
    key: string;
    name: string;
    count: number;
};
type FilterData = {
    typeCount?: any;
};

const StoreTable: React.FC = () => {

    const [data, setData] = useState<StoreRow[] | null>(null);
    const [ storeStatus, setStoreStatus ] = useState< StoreStatus[] | null >( null );
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
        typeCount = '',
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                filter_status: typeCount === 'all' ? '' : typeCount,
            },
        })
            .then((response) => {
                setData(response.data.stores || []);
                setStoreStatus( [
                    {
                        key: 'all',
                        name: 'All',
                        count: response.data.all || 0,
                    },
                    {
                        key: 'active',
                        name: 'Active',
                        count: response.data.active || 0,
                    },
                    {
                        key: 'pending',
                        name: 'Pending',
                        count: response.data.pending || 0,
                    },
                ] );
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
        filterData: FilterData
        
    ) => {
        console.log(filterData)
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
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
            id: 'store_name',
            accessorKey: 'store_name',
            enableSorting: true,
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Email', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.email || ''}>
                    {row.original.email || '-'}
                </TableCell>
            ),
        },
        {
            id: 'applied_on',
            accessorKey: 'applied_on',
            enableSorting: true,
            header: __('Applied On', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.applied_on;
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
            id: 'action',
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
                                hover: true,
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
                    typeCounts={ storeStatus as StoreStatus[] }
                    totalCounts={totalRows}
                />
            </div>
        </>
    );
};

export default StoreTable;
