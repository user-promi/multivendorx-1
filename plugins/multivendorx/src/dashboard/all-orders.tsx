import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { Table, TableCell } from "zyra";
import { ColumnDef, RowSelectionState, PaginationState } from "@tanstack/react-table";
import OrderDetailsModal from "./OrderDetailsModal";

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
    line_items?: any[];
};

const Orders: React.FC = () => {
    const [data, setData] = useState<OrderRow[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [modalOrder, setModalOrder] = useState<OrderRow | null>(null); // Track selected order

    function requestOrders(rowsPerPage = 10, currentPage = 1) {
        axios({
            method: "GET",
            url: `${appLocalizer.apiUrl}/wc/v3/orders`,
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: { per_page: rowsPerPage, page: currentPage, store_id: appLocalizer.store_id },
        }).then(response => {
            setData(response.data || []);
        });
    }

    useEffect(() => {
        requestOrders(pagination.pageSize, pagination.pageIndex + 1);
    }, [pagination]);

    const columns: ColumnDef<OrderRow>[] = [
        {
            header: __("Order ID", "multivendorx"),
            cell: ({ row }) => <TableCell>#{row.original.number}</TableCell>,
        },
        {
            header: __("Customer", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    {row.original.billing.first_name} {row.original.billing.last_name}
                </TableCell>
            ),
        },
        {
            header: __("Total", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.total} {row.original.currency}</TableCell>,
        },
        {
            header: __("Earning", "multivendorx"),
            cell: ({ row }) => {
                let earning = 0;
                row.original.line_items?.forEach(item => {
                    const commission = item.meta_data?.find(m => m.key === 'multivendorx_item_earning');
                    if (commission) earning += parseFloat(commission.value);
                });
                return <TableCell>{earning.toFixed(2)} {row.original.currency}</TableCell>;
            },
        },
        {
            header: __("Action", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    <button
                        className="button button-primary"
                        onClick={() => setModalOrder(row.original)} // Open your custom component
                    >
                        {__("View", "multivendorx")}
                    </button>
                </TableCell>
            ),
        },
    ];

    return (
        <div className="admin-table-wrapper">
            <Table
                data={data}
                columns={columns as ColumnDef<Record<string, any>, any>[]}
                rowSelection={{}}
                onRowSelectionChange={() => {}}
                defaultRowsPerPage={10}
                pageCount={Math.ceil(data.length / pagination.pageSize)}
                pagination={pagination}
                onPaginationChange={setPagination}
                handlePagination={requestOrders}
                perPageOption={[10, 25, 50]}
            />

            {/* Render your custom modal component */}
            {modalOrder && (
                <OrderDetailsModal
                    order={modalOrder}
                    onClose={() => setModalOrder(null)}
                />
            )}
        </div>
    );
};

export default Orders;
