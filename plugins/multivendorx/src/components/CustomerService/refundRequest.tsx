/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput, CommonPopup, TextArea } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { formatCurrency } from '../../services/commonFunction';

type RefundRow = {
    id: number;
    orderNumber: string;
    customer: string;
    email: string;
    products: string;
    product_images: string[]; // Add product images array
    amount: string;
    reason: string;
    date: string;
    status: string;
    store_name: string;
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}

const RefundRequest: React.FC = () => {
    const [data, setData] = useState<RefundRow[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [error, setError] = useState<string>();
    const [selectedRefund, setSelectedRefund] = useState<RefundRow | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejecting, setRejecting] = useState(false);
    const [store, setStore] = useState<any[] | null>(null);

    // Fetch store list and total refunds on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setStore(response.data.stores || []);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setStore([]);
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'refund'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                const total = response.data || 0;
                setTotalRows(total);
                setPageCount(Math.ceil(total / pagination.pageSize));
            })
            .catch(() => {
                setError(__('Failed to load total rows', 'multivendorx'));
            });
    }, [pagination.pageSize]);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination, totalRows]);

    // Handle View Details - Redirect to order page
    const handleViewDetails = (rowData: RefundRow) => {
        setSelectedRefund(rowData);
        setRejectReason("");
    };

    // Handle Approve Refund
    const handleApproveRefund = async (rowData: RefundRow) => {
        try {
            await updateRefundStatus(rowData.id, 'approved');
            // Refresh data after approval
            const currentPage = pagination.pageIndex + 1;
            const rowsPerPage = pagination.pageSize;
            requestData(rowsPerPage, currentPage);
        } catch (err) {
            console.error('Error approving refund:', err);
        }
    };

    // Handle Reject Refund - Open popup instead of immediate rejection
    const handleRejectRefund = (rowData: RefundRow) => {
        setSelectedRefund(rowData);
        setRejectReason("");
    };

    // Handle reject with reason
    const handleRejectWithReason = async () => {
        if (!selectedRefund || !rejectReason.trim()) {
            alert(__('Please provide a rejection reason', 'multivendorx'));
            return;
        }

        setRejecting(true);
        try {
            await updateRefundStatus(selectedRefund.id, 'rejected', rejectReason);
            setSelectedRefund(null);
            setRejectReason("");
            // Refresh data after rejection
            const currentPage = pagination.pageIndex + 1;
            const rowsPerPage = pagination.pageSize;
            requestData(rowsPerPage, currentPage);
        } catch (err) {
            console.error('Error rejecting refund:', err);
        } finally {
            setRejecting(false);
        }
    };

    const updateRefundStatus = (orderId: number, status: string, rejectReason = '') => {
        return axios({
            method: 'POST',
            url: getApiLink(appLocalizer, 'refund'),
            headers: {
                'X-WP-Nonce': appLocalizer.nonce,
                'Content-Type': 'application/json'
            },
            data: {
                order_id: orderId,
                status: status,
                reject_reason: rejectReason
            }
        })
            .then((response) => {
                console.log('Refund status updated successfully:', response.data);
                setError(undefined);
                return response;
            })
            .catch((err) => {
                const errorMessage = err.response?.data?.message || __('Failed to update refund status', 'multivendorx');
                setError(errorMessage);
                console.error('Error updating refund status:', err);
                throw err;
            });
    };

    // Column definitions
    const columns: ColumnDef<RefundRow>[] = [
        {
            id: 'select',
            header: ({ table }: any) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }: any) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
        },
        {
            id: 'order_id',
            accessorKey: 'order_id',
            enableSorting: true,
            header: __('Order', 'multivendorx'),
            cell: ({ row }: any) => {
                const orderId = row.original.order_id;
                const url = orderId
                    ? `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${orderId}&action=edit`
                    : '#';

                return (
                    <TableCell title={orderId ? `#${orderId}` : '-'}>
                        {orderId ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="order-link">
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
            header: __('Customer', 'multivendorx'),
            cell: ({ row }: any) => (
                <TableCell title={row.original.customer_name || ''}>
                    {row.original.customer_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Store', 'multivendorx'),
            cell: ({ row }: any) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Refund Amount', 'multivendorx'),
            cell: ({ row }: any) => (
                <TableCell title={row.original.amount || ''}>
                    {formatCurrency(row.original.amount)}
                </TableCell>
            ),
        },
        {
            header: __('Refund Reason', 'multivendorx'),
            cell: ({ row }: any) => (
                <TableCell title={row.original.reason || ''}>
                    {row.original.reason || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }: any) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status
                        ? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)
                        : '-'}
                </TableCell>
            ),
        },
        {
            id: 'date',
            accessorKey: 'date',
            enableSorting: true,
            header: __('Date', 'multivendorx'),
            cell: ({ row }: any) => {
                const date = row.original.date;
                if (!date) return <TableCell>-</TableCell>;

                const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });

                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
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
                                label: __('View', 'multivendorx'),
                                icon: 'adminlib-eye',
                                hover: true,
                                onClick: (rowData) => handleViewDetails(rowData),
                            },
                            {
                                label: __('Approve', 'multivendorx'),
                                icon: 'adminlib-check',
                                hover: true,
                                onClick: (rowData) => handleApproveRefund(rowData),
                            },
                            {
                                label: __('Reject', 'multivendorx'),
                                icon: 'adminlib-close',
                                hover: true,
                                onClick: (rowData) => handleRejectRefund(rowData),
                            },
                        ],
                    }}
                />
            ),
        },
    ];

    // Fetch data from backend
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        searchAction = 'order_id',
        searchField = '',
        store_id = '',
        orderBy = '',
        order = '',
        startDate = new Date(0),
        endDate = new Date()
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'refund'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                searchField,
                searchAction,
                store_id,
                orderBy,
                order,
                startDate,
                endDate,
            },
        })
            .then((response) => {
                setData(response.data || []);
            })
            .catch(() => {
                setError(__('Failed to load refund data', 'multivendorx'));
                setData([]);
            });
    }

    // Handle pagination & filter
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.searchAction,
            filterData?.searchField,
            filterData?.store_id,
            filterData?.orderBy,
            filterData?.order,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };

    const searchFilter: RealtimeFilter[] = [
        {
            name: 'searchAction',
            render: (updateFilter, filterValue) => (
                <div className="search-action">
                    <select
                        className="basic-select"
                        value={filterValue || ''}
                        onChange={(e) => updateFilter('searchAction', e.target.value || '')}
                    >
                        <option value="order_id">{__('Order Id', 'multivendorx')}</option>
                        <option value="customer">{__('Customer', 'multivendorx')}</option>
                    </select>
                </div>
            ),
        },
        {
            name: 'searchField',
            render: (updateFilter, filterValue) => (
                <div className="search-section">
                    <input
                        name="searchField"
                        type="text"
                        placeholder={__('Search', 'multivendorx')}
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    />
                    <i className="adminlib-search"></i>
                </div>
            ),
        },
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'store_id',
            render: (updateFilter, filterValue) => (
                <div className="group-field">
                    <select
                        name="store_id"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">{__('All Store', 'multivendorx')}</option>
                        {store?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.store_name.charAt(0).toUpperCase() + s.store_name.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            ),
        },
        {
            name: 'date',
            render: (updateFilter) => (
                <div className="right">
                    <CalendarInput
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
            <div className="card-header">
                <div className="left">
                    <div className="title">Refund Requests</div>
                    <div className="des">Need your decision</div>
                </div>
                <div className="right">
                    <i className="adminlib-more-vertical"></i>
                </div>
            </div>
            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as any}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    searchFilter={searchFilter}
                    onPaginationChange={setPagination}
                    realtimeFilter={realtimeFilter}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                />
                {error && <div className="error-message">{error}</div>}
            </div>

            {/* Reject Refund Popup */}
            {selectedRefund && (
                <CommonPopup
                    open={!!selectedRefund}
                    onClose={() => setSelectedRefund(null)}
                    width="500px"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-close"></i>
                                Reject Refund Request
                            </div>
                            <p>Provide a reason for rejecting this refund request. The customer will be notified with this reason.</p>
                        </>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectedRefund(null)}
                                className="admin-btn btn-red"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectWithReason}
                                disabled={rejecting || !rejectReason.trim()}
                                className="admin-btn btn-purple"
                            >
                                {rejecting ? "Rejecting..." : "Reject Refund"}
                            </button>
                        </>
                    }
                >
                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="rejectReason">
                                    Rejection Reason
                                </label>
                                <TextArea
                                    name="rejectReason"
                                    inputClass="textarea-input"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Enter reason for rejecting this refund request..."
                                />
                            </div>
                            <div className="form-group">
                                <div className="refund-details">
                                    <strong>Store:</strong> {selectedRefund.store_name}<br />
                                    <strong>Order ID:</strong> {selectedRefund.orderNumber}<br />
                                    <strong>Customer:</strong> {selectedRefund.customer}<br />
                                    <strong>Amount:</strong> <span dangerouslySetInnerHTML={{ __html: selectedRefund.amount }} /><br />
                                    <strong>Original Reason:</strong> {selectedRefund.reason}
                                </div>
                            </div>
                        </div>
                    </div>
                </CommonPopup>
            )}

        </>
    );
};

export default RefundRequest;