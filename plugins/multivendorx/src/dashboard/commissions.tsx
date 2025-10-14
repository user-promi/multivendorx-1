/* global appLocalizer */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { CalendarInput, getApiLink, Table, TableCell } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import ViewCommission from "./viewCommission";
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
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
type CommissionStatus = {
    key: string;
    name: string;
    count: number;
};
const StoreCommission: React.FC = () => {
    const [data, setData] = useState<CommissionRow[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [modalCommission, setModalCommission] = useState<CommissionRow | null>(null);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState(0);
    const [commissionStatus, setCommissionStatus] = useState<CommissionStatus[] | null>(null);

    // Fetch total rows on mount
    useEffect(() => {

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, store_id: appLocalizer.store_id },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => {
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
        store = '',
        startDate = new Date(0),
        endDate = new Date(),
    ) {
        setData([]);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                store_id: appLocalizer.store_id,
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === 'all' ? '' : typeCount,
                startDate,
                endDate
            },
        })
            .then((response) => {
                setData(response.data.commissions || []);
                setCommissionStatus([
                    {
                        key: 'all',
                        name: 'All',
                        count: response.data.all || 0,
                    },
                    {
                        key: 'paid',
                        name: 'Paid',
                        count: response.data.paid || 0,
                    },
                    {
                        key: 'cancelled',
                        name: 'Cancelled',
                        count: response.data.cancelled || 0,
                    },
                    {
                        key: 'refund',
                        name: 'Refund',
                        count: response.data.refund || 0,
                    },
                    {
                        key: 'trash',
                        name: 'Trash',
                        count: response.data.trash || 0,
                    },
                ]);
            })
            .catch(() => {
                setData([]);
            });
    }

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        setData([]);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.store,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };
    const columns: ColumnDef<CommissionRow>[] = [
        {
            id: 'id',
            accessorKey: 'id',
            accessorFn: row => parseFloat(row.id || '0'),
            enableSorting: true,
            header: __('Comm ID', 'multivendorx'),
            cell: ({ row }) => <TableCell >#{row.original.id}</TableCell>,
        },
        {
            id: 'orderId',
            accessorKey: 'orderId',
            enableSorting: true,
            header: __('Order ID', 'multivendorx'),
            cell: ({ row }) => {
                const orderId = row.original.orderId;
                // const url = orderId
                //     ? `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${orderId}&action=edit`
                //     : '#';

                return (
                    <TableCell title={orderId ? `#${orderId}` : '-'}>
                        {orderId ? (
                            <a href={'#'} target="_blank" rel="noopener noreferrer" className="order-link">
                                #{orderId}
                            </a>
                        ) : (
                            '-'
                        )}
                    </TableCell>
                );
            },
        },
        {
            id: 'totalOrderAmount',
            accessorKey: 'totalOrderAmount',
            accessorFn: row => parseFloat(row.totalOrderAmount || '0'),
            enableSorting: true,
            header: __('Order Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.totalOrderAmount ? `${appLocalizer.currency_symbol}${row.original.totalOrderAmount}` : '-'}>{row.original.totalOrderAmount ? `${appLocalizer.currency_symbol}${row.original.totalOrderAmount}` : '-'}</TableCell>,
        },
        {
            id: 'commissionAmount',
            accessorKey: 'commissionAmount',
            accessorFn: row => parseFloat(row.commissionAmount || '0'),
            enableSorting: true,
            header: __('Commission Earned', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.commissionAmount ? `${appLocalizer.currency_symbol}${row.original.commissionAmount}` : '-'}>{row.original.commissionAmount ? `${appLocalizer.currency_symbol}${row.original.commissionAmount}` : '-'}</TableCell>,
        },
        {
            id: 'shippingAmount',
            accessorKey: 'shippingAmount',
            accessorFn: row => parseFloat(row.shippingAmount || '0'),
            enableSorting: true,
            header: __('Shipping Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.shippingAmount ? `${appLocalizer.currency_symbol}${row.original.shippingAmount}` : '-'}>{row.original.shippingAmount ? `${appLocalizer.currency_symbol}${row.original.shippingAmount}` : '-'}</TableCell>,
        },
        {
            id: 'taxAmount',
            accessorKey: 'taxAmount',
            accessorFn: row => parseFloat(row.taxAmount || '0'),
            enableSorting: true,
            header: __('Tax Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.taxAmount ? `${appLocalizer.currency_symbol}${row.original.taxAmount}` : '-'}>{row.original.taxAmount ? `${appLocalizer.currency_symbol}${row.original.taxAmount}` : '-'}</TableCell>,
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
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __("View Commission", "multivendorx"),
                                icon: "adminlib-eye",
                                onClick: (rowData) => {
                                    setModalCommission(rowData);
                                },
                                hover: true,
                            },
                        ],
                    }}
                />
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
        <div className="admin-table-wrapper">
            <Table
                data={data}
                columns={columns as ColumnDef<Record<string, any>, any>[]}
                pagination={pagination}
                onPaginationChange={setPagination}
                handlePagination={requestApiForData}
                defaultRowsPerPage={10}
                perPageOption={[10, 25, 50]}
                typeCounts={commissionStatus as CommissionStatus}
                totalCounts={totalRows}
                pageCount={pageCount}
                realtimeFilter={realtimeFilter}
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
