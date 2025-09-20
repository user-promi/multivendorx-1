/* global appLocalizer */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { DateRangePicker, RangeKeyDict, Range } from "react-date-range";
import {
    Table,
    getApiLink,
    TableCell,
    AdminBreadcrumbs,
} from "zyra";
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from "@tanstack/react-table";
import ViewCommission from "./viewCommission";

type CommissionStatus = {
    key: string;
    name: string;
    count: number;
};

type CommissionRow = {
    id?: number;
    orderId?: number;
    storeId?: number;
    storeName?: string;
    totalOrderAmount?: string;
    commissionAmount?: string;
    facilitatorFee?: string;
    gatewayFee?: string;
    shippingAmount?: string;
    taxAmount?: string;
    discountAmount?: string;
    commissionTotal?: string;
    commissionRefunded?: string;
    status?: "paid" | "unpaid" | string;
    commissionNote?: string | null;
    createdAt?: string;
};

const StoreCommission: React.FC = () => {
    const dateRef = useRef<HTMLDivElement | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);

    const [data, setData] = useState<CommissionRow[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [commissionStatus, setCommissionStatus] = useState<CommissionStatus[] | null>(null);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [error, setError] = useState<string>();
    const [showDropdown, setShowDropdown] = useState<number | false>(false);

    const [selectedRange, setSelectedRange] = useState([
        {
            startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [viewCommission, setViewCommission] = useState(false);
    const [selectedCommissionId, setSelectedCommissionId] = useState<number | null>(null);

    // fetch total count for this store
    useEffect(() => {
        axios({
            method: "GET",
            url: getApiLink(appLocalizer, "commission"),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: { count: true, store_id: appLocalizer.store_id },
        })
            .then((res) => {
                setTotalRows(res.data || 0);
                setPageCount(Math.ceil((res.data || 0) / pagination.pageSize));
            })
            .catch(() => setError(__("Failed to load total rows", "multivendorx")));
    }, []);

    // fetch paginated commissions for store
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
    }, [pagination]);

    const requestData = (
        rowsPerPage = 10,
        currentPage = 1,
        typeCount = ""
    ) => {
        setData([]);
        axios({
            method: "GET",
            url: getApiLink(appLocalizer, "commission"),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === "all" ? "" : typeCount,
                store_id: appLocalizer.store_id,
            },
        })
            .then((res) => {
                setData(res.data || []);
                setCommissionStatus([
                    { key: "all", name: "All", count: res.data.all || 0 },
                    { key: "paid", name: "Paid", count: res.data.paid || 0 },
                    { key: "unpaid", name: "Unpaid", count: res.data.unpaid || 0 },
                    { key: "refund", name: "Refund", count: res.data.refund || 0 },
                ]);
            })
            .catch(() => {
                setError(__("Failed to load commissions", "multivendorx"));
                setData([]);
            });
    };

    const toggleDropdown = (id: number | undefined) => {
        if (!id) return;
        setShowDropdown(showDropdown === id ? false : id);
    };

    const columns: ColumnDef<CommissionRow>[] = [
        {
            header: __("Order ID", "multivendorx"),
            cell: ({ row }) => <TableCell>#{row.original.orderId}</TableCell>,
        },
        {
            header: __("Order Amount", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.totalOrderAmount ?? "-"}</TableCell>,
        },
        {
            header: __("Commission", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.commissionAmount ?? "-"}</TableCell>,
        },
        {
            header: __("Shipping", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.shippingAmount ?? "-"}</TableCell>,
        },
        {
            header: __("Tax", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.taxAmount ?? "-"}</TableCell>,
        },
        {
            header: __("Total", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.commissionTotal ?? "-"}</TableCell>,
        },
        {
            header: __("Status", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    <span
                        className={`admin-badge ${
                            row.original.status === "paid" ? "green" : "red"
                        }`}
                    >
                        {row.original.status}
                    </span>
                </TableCell>
            ),
        },
        {
            header: __("Action", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    <div className="action-section">
                        <i
                            className="adminlib-more-vertical"
                            onClick={() => toggleDropdown(row.original.id)}
                        ></i>
                        <div
                            className={`action-dropdown ${
                                showDropdown === row.original.id ? "show" : ""
                            }`}
                        >
                            <ul>
                                <li
                                    onClick={() => {
                                        setSelectedCommissionId(row.original.id ?? null);
                                        setViewCommission(true);
                                    }}
                                >
                                    <i className="adminlib-eye"></i>{" "}
                                    {__("View", "multivendorx")}
                                </li>
                            </ul>
                        </div>
                    </div>
                </TableCell>
            ),
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-commission"
                tabTitle="My Store Commissions"
                description={__(
                    "Commissions for your store orders, including order amount, earnings, and payout status.",
                    "multivendorx"
                )}
            />

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
                    handlePagination={requestData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={commissionStatus as CommissionStatus[]}
                />
            </div>

            {viewCommission && selectedCommissionId !== null && (
                <ViewCommission
                    open={viewCommission}
                    onClose={() => setViewCommission(false)}
                    commissionId={selectedCommissionId}
                />
            )}
        </>
    );
};

export default StoreCommission;
