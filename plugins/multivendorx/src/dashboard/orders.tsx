import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { CalendarInput, Table, TableCell } from "zyra";
import { ColumnDef, RowSelectionState, PaginationState } from "@tanstack/react-table";
import OrderDetails from "./order-details";

// Type declarations
type OrderStatus = {
    key: string;
    name: string;
    count: number;
};
type FilterData = {
    searchAction?: string;
    searchField?: string;
    category?: any;
    typeCount?: any;
    stock_status?: string;
    productType?: string;
};
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}

const Orders: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState(0);
    const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const bulkSelectRef = React.useRef<HTMLSelectElement>(null);

    // const hash = window.location.hash || '';
    // const isViewOrder = hash.includes('view');

    const path = window.location.pathname;
    const isViewOrder = path.includes('/view/');

    const selectedOrderIds = Object.keys(rowSelection)
        .map((key) => {
            const index = Number(key);
            return data && data[index] ? data[index].id : null;
        })
        .filter((id): id is number => id !== null);

    // Fetch orders
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
    }, [pagination]);

    const fetchOrderStatusCounts = async () => {
        try {
            const statuses = ["all", "pending", "processing", "on-hold", "completed", "cancelled", "refunded", "failed", "trash"];

            const counts: OrderStatus[] = await Promise.all(
                statuses.map(async (status) => {
                    const params: any = {
                        per_page: 1,
                        meta_key: "multivendorx_store_id",
                        value: appLocalizer.store_id,
                    };
                    if (status !== "all") params.status = status;

                    const res = await axios.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
                        headers: { "X-WP-Nonce": appLocalizer.nonce },
                        params,
                    });

                    const total = parseInt(res.headers["x-wp-total"] || "0");

                    return {
                        key: status,
                        name: status === "all" ? __("All", "multivendorx") : status.charAt(0).toUpperCase() + status.slice(1),
                        count: total,
                    };
                })
            );

            // Filter out zero-count statuses except "all"
            const filteredCounts = counts.filter(status => status.key === "all" || status.count > 0);

            setOrderStatus(filteredCounts);

        } catch (error) {
            console.error("Failed to fetch order status counts:", error);
        }
    };

    // Fetch dynamic order status counts for typeCounts filter
    useEffect(() => {
        fetchOrderStatusCounts();
    }, []);

    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        startDate = new Date(0),
        endDate = new Date(),
        extraParams: any = {}
    ) {
        setData([]);

        const params: any = {
            page: currentPage,
            row: rowsPerPage,
            after: startDate.toISOString(),
            before: endDate.toISOString(),
            meta_key: 'multivendorx_store_id',
            value: appLocalizer.store_id,
            ...extraParams,
        };

        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/orders`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params,
        })
            .then((response) => {
                setData(response.data);
                const total = parseInt(response.headers['x-wp-total'] || "0");
                setTotalRows(total);
                setPageCount(Math.ceil(total / rowsPerPage));
            })
            .catch(() => {
                setData([]);
                setTotalRows(0);
                setPageCount(0);
            });
    }

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        setData([]);

        let startDate = filterData?.date?.start_date || new Date(0);
        let endDate = filterData?.date?.end_date || new Date();

        const params: any = {
            page: currentPage,
            row: rowsPerPage,
            after: startDate.toISOString(),
            before: endDate.toISOString(),
            meta_key: 'multivendorx_store_id',
            value: appLocalizer.store_id,
        };

        // Search field
        if (filterData.searchField) {
            const searchValue = filterData.searchField.trim();
            if (filterData.searchAction) params.search = searchValue;
            else params.search = searchValue;
        }

        // Add typeCount filter
        if (filterData.typeCount && filterData.typeCount !== 'all') {
            params.status = filterData.typeCount;
        }

        requestData(rowsPerPage, currentPage, startDate, endDate, params);
    };

    const handleBulkAction = async () => {
        const action = bulkSelectRef.current?.value;

        if (!action || selectedOrderIds.length === 0) {
            return;
        }

        try {
            await Promise.all(
                selectedOrderIds.map((orderId) =>
                    axios.put(
                        `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
                        { status: action },
                        { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                    )
                )
            );

            setRowSelection({});
            fetchOrderStatusCounts();
            requestData(pagination.pageSize, pagination.pageIndex + 1);
        } catch (err) {
            console.error(err);
        } finally {
            if (bulkSelectRef.current) bulkSelectRef.current.value = "";
        }
    };

    const BulkAction: React.FC = () => (
        <div className="bulk-action">
            <select
                name="action"
                className="basic-select"
                ref={bulkSelectRef}
                onChange={handleBulkAction}
            >
                <option value="">{__('Change order status')}</option>
                <option value="completed">{__('Completed', 'multivendorx')}</option>
                <option value="processing">{__('Processing', 'multivendorx')}</option>
                <option value="pending">{__('Pending', 'multivendorx')}</option>
                <option value="on-hold">{__('On Hold', 'multivendorx')}</option>
                <option value="cancelled">{__('Cancelled', 'multivendorx')}</option>
                <option value="refunded">{__('Refunded', 'multivendorx')}</option>
                <option value="failed">{__('Failed', 'multivendorx')}</option>
            </select>
        </div>
    );


    const columns: ColumnDef<any>[] = [
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
            id: 'number',
            accessorKey: 'number',
            accessorFn: row => parseFloat(row.number || '0'),
            enableSorting: true,
            header: __("Order ID", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                        <span className="link" onClick={() => setSelectedOrder(row.original)}>
                            #{row.original.number}
                        </span>
                </TableCell>
            ),
        },
        {
            header: __("Customer", "multivendorx"),
            cell: ({ row }) => {
                const { billing } = row.original;
                const name =
                    billing?.first_name || billing?.last_name
                        ? `${billing.first_name || ''} ${billing.last_name || ''}`
                        : billing?.email || __("Guest", "multivendorx");
                return <TableCell>{name}</TableCell>;
            },
        },
        {
            id: 'date_created',
            accessorKey: 'date_created',
            enableSorting: true,
            header: __("Date", "multivendorx"),
            cell: ({ row }) => {
                const date = new Date(row.original.date_created);
                const now = new Date();
                const diff = now.getTime() - date.getTime();

                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                const months = Math.floor(days / 30);
                const years = Math.floor(days / 365);

                let timeAgo = "";
                if (years > 0) timeAgo = `${years} year${years > 1 ? "s" : ""} ago`;
                else if (months > 0) timeAgo = `${months} month${months > 1 ? "s" : ""} ago`;
                else if (days > 0) timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
                else if (hours > 0) timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
                else if (minutes > 0) timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
                else timeAgo = `${seconds} second${seconds !== 1 ? "s" : ""} ago`;

                return <TableCell>{timeAgo}</TableCell>;
            },
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => {
                const status = row.original.status || "pending";
                const colorClass =
                    status === 'completed' ? 'green' :
                        status === 'pending' ? 'blue' : 'yellow';
                return (
                    <TableCell title={status}>
                        <span className={`admin-badge ${colorClass}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </TableCell>
                );
            },
        },
        {
            id: 'total',
            accessorKey: 'total',
            accessorFn: row => parseFloat(row.total || '0'),
            enableSorting: true,
            header: __("Total", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    {appLocalizer.currency_symbol}{row.original.total}
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
                            // Conditionally include the "View" button
                            ...(appLocalizer.edit_order_capability
                                ? [
                                    {
                                    label: __('View', 'multivendorx'),
                                    icon: 'adminlib-eye',
                                    onClick: (rowData) => {
                                        setSelectedOrder(rowData);
                                        const currentPath = window.location.pathname.replace(/\/$/, '');
                                        const newPath = `${currentPath}/view/${rowData.id}`;
                                        window.history.pushState({}, '', newPath);
                                    },
                                    hover: true,
                                    },
                                ]
                            : []),
                            {
                                label: __('Download', 'multivendorx'),
                                icon: 'adminlib-import',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                                },
                            },
                            {
                                label: __('Copy URL', 'multivendorx'),
                                icon: 'adminlib-vendor-form-copy',
                                onClick: (rowData) => {
                                    navigator.clipboard.writeText(window.location.href);
                                },
                            },
                            {
                                label: __('Shipping', 'multivendorx'),
                                icon: 'adminlib-vendor-form-copy',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                                },
                            },
                            {
                                label: __('PDF', 'multivendorx'),
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
        {console.log(appLocalizer.edit_order_capability)}
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Orders</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>
            </div>
            <div className="admin-table-wrapper">
                {!isViewOrder && !selectedOrder && (
                    <Table
                        data={data}
                        columns={columns as ColumnDef<Record<string, any>, any>[]}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        defaultRowsPerPage={10}
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        perPageOption={[10, 25, 50]}
                        handlePagination={requestApiForData}
                        totalCounts={totalRows}
                        searchFilter={searchFilter}
                        realtimeFilter={realtimeFilter}
                        typeCounts={orderStatus}
                        bulkActionComp={() => <BulkAction />}
                    />
                )}
                
                {isViewOrder && <OrderDetails
                    order={selectedOrder}
                    onBack={() => {
                        setSelectedOrder(null);
                        const currentPath = window.location.pathname;
                        const newPath = currentPath.replace(/\/view\/\d+$/, '');
                        window.history.pushState({}, '', newPath);
                    }}
                />}

            </div>
        </>
    );
};

export default Orders;
