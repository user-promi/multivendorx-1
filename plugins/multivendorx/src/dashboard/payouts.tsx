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

const History: React.FC = () => {
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [totalRows, setTotalRows] = useState<number>(0);


    useEffect(() => {
        const demoData: ProductRow[] = [
            {
                id: 201,
                amount: "£250.00",
                method: "PayPal",
                date: "2022/04/01",
                notes: "March 2023 Vendor Payment",
            },
            {
                id: 202,
                amount: "£120.50",
                method: "Bank Transfer",
                date: "2022/05/05",
                notes: "April 2023 Vendor Payment",
            },
            {
                id: 203,
                amount: "£500.00",
                method: "Stripe",
                date: "2022/06/10",
                notes: "May 2023 Vendor Payment",
            },
            {
                id: 204,
                amount: "£75.25",
                method: "PayPal",
                date: "2022/07/02",
                notes: "June 2023 Vendor Payment",
            },
            {
                id: 205,
                amount: "£310.99",
                method: "Bank Transfer",
                date: "2022/08/15",
                notes: "July 2023 Vendor Payment",
            },
            {
                id: 206,
                amount: "£90.00",
                method: "Stripe",
                date: "2022/09/05",
                notes: "August 2023 Vendor Payment",
            },
            {
                id: 207,
                amount: "£420.00",
                method: "PayPal",
                date: "2022/10/01",
                notes: "September 2023 Vendor Payment",
            },
            {
                id: 208,
                amount: "£199.50",
                method: "Bank Transfer",
                date: "2022/11/03",
                notes: "October 2023 Vendor Payment",
            },
            {
                id: 209,
                amount: "£650.00",
                method: "Stripe",
                date: "2022/12/20",
                notes: "November 2023 Vendor Payment",
            },
            {
                id: 210,
                amount: "£330.75",
                method: "PayPal",
                date: "2023/01/08",
                notes: "December 2023 Vendor Payment",
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
            header: __('Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.amount || ''}>
                    {row.original.amount || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Payment Method', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.method || ''}>
                    {row.original.method || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Date Processed', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.date || ''}>
                    {row.original.date || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Notes', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.notes || ''}>
                    {row.original.notes || '-'}
                </TableCell>
            ),
        },
    ];
    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Payouts</div>
                    <div className="des">View and keep track of your payouts.</div>
                </div>
            </div>
            <div className="settings-metabox-note notice">
                <div className="title">
                    <i className="adminlib-info"></i><h3>Commission Details</h3>
                </div>
                <p>A commission of 10% + £5 has been applied to your earnings. Any product- or category-wise commission will be applied dynamically during the commission calculation at runtime</p>
            </div>
            <div className="container-wrapper">

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
                    />
                </div>
            </div>
        </>
    );
};

export default History;