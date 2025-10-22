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
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
const Refund: React.FC = () => {
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [totalRows, setTotalRows] = useState<number>(0);


    useEffect(() => {
        const demoData: OrderRow[] = [
            {
                orderNumber: "ORD-2024-1547",
                customer: "Sarah Johnson",
                email: "sarah.j@email.com",
                amount: "$149.99",
                reason: "Product defective",
                date: "2024-10-14",
                status: "Pending",
            },
            {
                orderNumber: "ORD-2024-1523",
                customer: "Michael Chen",
                email: "mchen@email.com",
                amount: "$89.50",
                reason: "Wrong item received",
                date: "2024-10-13",
                status: "Pending",
            },
            {
                orderNumber: "ORD-2024-1498",
                customer: "Emily Rodriguez",
                email: "emily.r@email.com",
                amount: "$299.00",
                reason: "Changed mind",
                date: "2024-10-12",
                status: "Approved",
            },
            {
                orderNumber: "ORD-2024-1445",
                customer: "David Thompson",
                email: "dthompson@email.com",
                amount: "$64.99",
                reason: "Product damaged in shipping",
                date: "2024-10-10",
                status: "Rejected",
            },
            {
                orderNumber: "ORD-2024-1389",
                customer: "Lisa Anderson",
                email: "l.anderson@email.com",
                amount: "$179.99",
                reason: "Product not as described",
                date: "2024-10-09",
                status: "Pending",
            },
        ];
        setData(demoData);
        setTotalRows(demoData.length);
    }, []);

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
            header: __('Order Number', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.orderNumber || ''}>
                    {row.original.orderNumber || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Customer', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.customer || ''}>
                    {row.original.customer || '-'}
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
            header: __('Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.amount || ''}>
                    {row.original.amount || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Reason', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.reason || ''}>
                    {row.original.reason || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.date || ''}>
                    {row.original.date || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status === "Approved" && (
                        <span className="admin-badge green">Approved</span>
                    )}
                    {row.original.status === "Pending" && (
                        <span className="admin-badge yellow">Pending</span>
                    )}
                    {row.original.status === "Rejected" && (
                        <span className="admin-badge red">Rejected</span>
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
                                label: __('View Details', 'multivendorx'),
                                icon: 'adminlib-import',
                                hover: true,
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                                },
                            },
                        ],
                    }}
                />
            ),
        },
    ];
    const searchFilter: RealtimeFilter[] = [
        {
            name: 'searchAction',
            render: (updateFilter, filterValue) => (
                <div className="search-action">
                    <select
                        className="basic-select"
                        value={filterValue || ''}
                        onChange={(e) => {
                            updateFilter('searchAction', e.target.value || '');
                        }}
                    >
                        <option value="all">
                            {__('All', 'moowoodle')}
                        </option>
                        <option value="order_id">
                            {__('Order Id', 'moowoodle')}
                        </option>
                        <option value="products">
                            {__('Products', 'moowoodle')}
                        </option>
                        <option value="customer_email">
                            {__('Customer Email', 'moowoodle')}
                        </option>
                        <option value="customer">
                            {__('Customer', 'moowoodle')}
                        </option>
                    </select>
                </div>
            ),
        },
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
                            className='basic-select'
                        />
                        <i className="adminlib-search"></i>
                    </div>
                </>
            ),
        },
    ];
    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Refund</div>
                    <div className="des">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Debitis, perferendis.</div>
                </div>
                <div className="buttons-wrapper">
                    <div
                        className="admin-btn btn-purple"
                    // onClick={() => setAddProduct(true)}
                    >
                        <i className="adminlib-export"></i>
                        Export
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <Table
                        data={data}
                        columns={columns as ColumnDef<Record<string, any>, any>[]}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        defaultRowsPerPage={10}
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        // handlePagination={requestApiForData}
                        perPageOption={[10, 25, 50]}
                        typeCounts={[]}
                        totalCounts={totalRows}
                        searchFilter={searchFilter}
                    />
                </div>
            </div>
        </>
    );
};

export default Refund;