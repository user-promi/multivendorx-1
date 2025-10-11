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
    const [requestWithdrawal, setRequestWithdrawal] = useState(false);

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
    const analyticsData = [
        { icon: "adminlib-tools red", number: "$10.00", text: "Minimum Threshold" },
        { icon: "adminlib-book green", number: "2 Day", text: "Lock Period" },
        { icon: "adminlib-global-community yellow", number: "$5", text: "Wallet Reserve" },
    ];
    const balanceBreakdown = [
        { icon: "adminlib-tools green", number: "$525.00", text: "Pending" },
        { icon: "adminlib-book red", number: "$8524.00", text: "Available" },
        { icon: "adminlib-global-community yellow", number: "$5.00", text: "Reserved" },
    ];
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
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.notes || ''}>
                    <span className="admin-badge green">Completed</span>
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


            <div className="row">
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Payout Settings
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="analytics-container">

                                {analyticsData.map((item, idx) => (
                                    <div key={idx} className="analytics-item">
                                        <div className="analytics-icon">
                                            <i className={item.icon}></i>
                                        </div>
                                        <div className="details">
                                            <div className="number">{item.number}</div>
                                            <div className="text">{item.text}</div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Balance Breakdown
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="analytics-container">

                                {balanceBreakdown.map((item, idx) => (
                                    <div key={idx} className="analytics-item">
                                        <div className="analytics-icon">
                                            <i className={item.icon}></i>
                                        </div>
                                        <div className="details">
                                            <div className="number">{item.number}</div>
                                            <div className="text">{item.text}</div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Available for Payout
                                </div>
                            </div>
                        </div>
                        <div className="payout-wrapper">
                            <div className="price">
                                $635.16
                            </div>
                            <div className="des">Current available balance ready for withdrawal</div>
                            <div className="admin-btn btn-purple" onClick={() => setRequestWithdrawal(true)}>
                                Request Withdrawal
                            </div>
                        </div>

                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Payout Account
                                </div>
                            </div>
                        </div>
                        <div className="notification-wrapper">
                            <ul>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email blue"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">PayPal</div>
                                        <div className="des">Withdrawal request pending</div>
                                        <span><a href="">Change</a></span>
                                    </div>

                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-mail orange"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">PayPal</div>
                                        <div className="des">Withdrawal request pending</div>
                                        <span><a href="">Change</a></span>
                                    </div>
                                </li>
                            </ul>
                        </div>
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
                    />
                </div>
            </div>
        </>
    );
};

export default History;