/* global appLocalizer */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { getApiLink, Table, TableCell } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import ViewCommission from "./viewCommission";

type CommissionRow = {
    id: number;
    orderId: number;
    totalOrderAmount: string;
    commissionAmount: string;
    shippingAmount: string;
    taxAmount: string;
    commissionTotal: string;
    status: "paid" | "unpaid" | string;
};

const StoreCommission: React.FC = () => {
    const [data, setData] = useState<CommissionRow[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [modalCommission, setModalCommission] = useState<CommissionRow | null>(null);

    const requestCommissions = (rowsPerPage = 10, currentPage = 1) => {
        axios({
            method: "GET",
            url: getApiLink(appLocalizer, "commission"),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                row: rowsPerPage,
                page: currentPage,
                store_id: appLocalizer.store_id,
            },
        }).then(response => {
            setData(response.data || []);
        });
    };

    useEffect(() => {
        requestCommissions(pagination.pageSize, pagination.pageIndex + 1);
    }, [pagination]);

    const columns: ColumnDef<CommissionRow>[] = [
        {
            header: __("Order ID", "multivendorx"),
            cell: ({ row }) => <TableCell>#{row.original.orderId}</TableCell>,
        },
        {
            header: __("Order Amount", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.totalOrderAmount}</TableCell>,
        },
        {
            header: __("Commission", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.commissionAmount}</TableCell>,
        },
        {
            header: __("Shipping", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.shippingAmount}</TableCell>,
        },
        {
            header: __("Tax", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.taxAmount}</TableCell>,
        },
        {
            header: __("Total", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.commissionTotal}</TableCell>,
        },
        {
            header: __("Status", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    <span className={`admin-badge ${row.original.status === "paid" ? "green" : "red"}`}>
                        {row.original.status}
                    </span>
                </TableCell>
            ),
        },
        {
            header: __("Action", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    <button
                        className="button button-primary"
                        onClick={() => setModalCommission(row.original)}
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
                pagination={pagination}
                onPaginationChange={setPagination}
                handlePagination={requestCommissions}
                defaultRowsPerPage={10}
                perPageOption={[10, 25, 50]}
            />

            {modalCommission && (
                <ViewCommission
                    open={!!modalCommission}
                    onClose={() => setModalCommission(null)}
                    commissionId={modalCommission.id}
                />
            )}
        </div>
    );
};

export default StoreCommission;
