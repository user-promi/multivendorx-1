/* global appLocalizer */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { Table, getApiLink, TableCell } from "zyra";
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from "@tanstack/react-table";

type OrderRow = {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    currency: string;
    payment_method_title: string;
    customer_id: number;
    billing: {
        first_name: string;
        last_name: string;
        email: string;
    };
};

const Orders: React.FC = () => {
    const [error, setError] = useState<string>();
    const [data, setData] = useState<OrderRow[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState(0);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    console.log(appLocalizer)
    // Fetch orders from WooCommerce
    function requestOrders(rowsPerPage = 10, currentPage = 1) {
        setData(null);
    
        axios({
            method: "GET",
            url: `${appLocalizer.apiUrl}/wc/v3/orders`,
            headers: {
                "X-WP-Nonce": appLocalizer.wp_nonce,
            },
            params: {
                page: currentPage,
                per_page: rowsPerPage,
            },
        })
            .then((response) => {
                setData(response.data || []);
    
                // WooCommerce sends totals in headers
                const total = parseInt(response.headers["x-wp-total"] || "0", 10);
                setTotalRows(total);
                setPageCount(Math.ceil(total / rowsPerPage));
            })
            .catch(() => {
                setError(__("Failed to load WooCommerce orders", "multivendorx"));
                setData([]);
            });
    }
    
    

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestOrders(pagination.pageSize, currentPage);
    }, [pagination]);

    const columns: ColumnDef<OrderRow>[] = [
        {
            header: __("Order ID", "multivendorx"),
            cell: ({ row }) => (
                <TableCell title={String(row.original.id)}>
                    #{row.original.number}
                </TableCell>
            ),
        },
        {
            header: __("Customer", "multivendorx"),
            cell: ({ row }) => (
                <TableCell
                    title={`${row.original.billing.first_name} ${row.original.billing.last_name}`}
                >
                    {row.original.billing.first_name}{" "}
                    {row.original.billing.last_name}
                </TableCell>
            ),
        },
        {
            header: __("Email", "multivendorx"),
            cell: ({ row }) => (
                <TableCell title={row.original.billing.email}>
                    {row.original.billing.email}
                </TableCell>
            ),
        },
        {
            header: __("Status", "multivendorx"),
            cell: ({ row }) => (
                <TableCell title={row.original.status}>
                    {row.original.status}
                </TableCell>
            ),
        },
        {
            header: __("Total", "multivendorx"),
            cell: ({ row }) => (
                <TableCell title={`${row.original.total} ${row.original.currency}`}>
                    {row.original.total} {row.original.currency}
                </TableCell>
            ),
        },
        {
            header: __("Date", "multivendorx"),
            cell: ({ row }) => {
                const rawDate = row.original.date_created;
                const formattedDate = rawDate
                    ? new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                      }).format(new Date(rawDate))
                    : "-";
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            },
        },
        {
            header: __("Payment", "multivendorx"),
            cell: ({ row }) => (
                <TableCell title={row.original.payment_method_title}>
                    {row.original.payment_method_title}
                </TableCell>
            ),
        },
    ];

    return (
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
                handlePagination={requestOrders}
                perPageOption={[10, 25, 50]}
            />
        </div>
    );
};

export default Orders;
