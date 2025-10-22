/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput } from 'zyra';
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
    searchField?: any;
    orderBy?:any;
    order?:any;
};
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
const StoreTable: React.FC = () => {

    const [data, setData] = useState<StoreRow[] | null>(null);
    const [storeStatus, setStoreStatus] = useState<StoreStatus[] | null>(null);
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
        searchField = '',
        orderBy='',
        order='',
        startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        endDate = new Date()
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
                searchField,
                orderBy,
                order,
                startDate,
                endDate
            },
        })
            .then((response) => {
                setData(response.data.stores || []);
                setStoreStatus([
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
                ]);
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
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.searchField,
            filterData?.orderBy,
            filterData?.order,
            filterData?.date?.start_date,
            filterData?.date?.end_date,
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
            id: 'name',
            accessorKey: 'name',
            enableSorting: true,
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => {
                const status = row.original.status || '';
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

                const getStatusBadge = (status: string) => {
                    switch (status) {
                        case 'active':
                            return <span className="admin-badge green">Active</span>;
                        case 'pending':
                            return <span className="admin-badge yellow">Pending</span>;
                        case 'rejected':
                            return <span className="admin-badge red">Rejected</span>;
                        case 'locked':
                            return <span className="admin-badge blue">Locked</span>;
                        default:
                            return <span className="admin-badge gray">{status}</span>;
                    }
                };

                return (
                    <TableCell title={row.original.store_name || ''}>
                        <a
                            onClick={() => {
                                window.location.href = `?page=multivendorx#&tab=stores&view&id=${row.original.id}`;
                            }}
                            className="product-wrapper"
                        >
                            <img src="https://via.placeholder.com/50" style={{ width: 40, height: 40, objectFit: 'cover' }} />

                            <div className="details">
                                <span className="title">{row.original.store_name || '-'}</span>
                                <span>Since {formattedDate}</span>
                            </div>
                        </a>
                    </TableCell>
                );
            },
        },
        {
            header: __('Contact', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.email || ''}>
                    <>
                        <div className="table-content">
                            {row.original.email && (
                                <div>
                                    <b><i className="adminlib-mail"></i></b> {row.original.email}
                                </div>
                            )}
                            <div> <b><i className="adminlib-form-phone"></i></b> 98745632103 </div>
                        </div>
                    </>
                </TableCell >
            ),
        },
        {
            header: __('Primary Owner', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.email || ''}>
                    <>
                        <a href="#">Owner 1 </a>
                    </>
                </TableCell >
            ),
        },
        {
            id: 'status_applied_on',
            header: __('Status', 'multivendorx'),
            enableSorting: true,
            cell: ({ row }) => {
                const status = row.original.status || '';
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

                const getStatusBadge = (status: string) => {
                    switch (status) {
                        case 'active':
                            return <span className="admin-badge green">Active</span>;
                        case 'pending':
                            return <span className="admin-badge yellow">Pending</span>;
                        case 'rejected':
                            return <span className="admin-badge red">Rejected</span>;
                        case 'locked':
                            return <span className="admin-badge blue">Locked</span>;
                        default:
                            return <span className="admin-badge gray">{status}</span>;
                    }
                };

                return (
                    <TableCell title={`${status} - ${formattedDate}`}>
                        <>
                            {getStatusBadge(status)}
                        </>
                    </TableCell>
                );
            },
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

    const searchFilter: RealtimeFilter[] = [
        {
            name: 'searchField',
            render: (updateFilter, filterValue) => (
                <>
                    <div className="search-section">
                        <input
                            name="searchField"
                            type="text"
                            placeholder={__('Search', 'multivendorx')}
                            onChange={(e) => {
                                updateFilter(e.target.name, e.target.value);
                            }}
                            value={filterValue || ''}
                        />
                        <i className="adminlib-search"></i>
                    </div>
                </>
            ),
        },
    ];

    const realtimeFilter: RealtimeFilter[] = [
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
                    typeCounts={storeStatus as StoreStatus[]}
                    totalCounts={totalRows}
                    searchFilter={searchFilter}
                    realtimeFilter={realtimeFilter}
                />
            </div>
        </>
    );
};

export default StoreTable;
