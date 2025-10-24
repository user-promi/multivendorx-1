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

type RefundRow = {
    id: number;
    orderNumber: string;
    customer: string;
    email: string;
    products: string;
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [selectedRefund, setSelectedRefund] = useState<RefundRow | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejecting, setRejecting] = useState(false);

    // Fetch total rows on mount
    useEffect(() => {
        fetchTotalRows();
    }, []);

    // Fetch data when pagination changes
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
    }, [pagination]);

    const fetchTotalRows = () => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'refund'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch((err) => {
                setError(__('Failed to load total rows', 'multivendorx'));
                console.error('Error fetching total rows:', err);
            });
    };

    // Fetch data from backend
    const requestData = (
        rowsPerPage = 10,
        currentPage = 1,
        filters = {}
    ) => {
        setLoading(true);
        setError(undefined);

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'refund'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                ...filters
            },
        })
            .then((response) => {
                console.log('Refund data received:', response.data);
                setData(response.data || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(__('Failed to load refund data', 'multivendorx'));
                setData([]);
                setLoading(false);
                console.error('Error fetching refund data:', err);
            });
    };

    // Handle pagination and filter changes
    const handlePagination = (
        rowsPerPage: number,
        currentPage: number,
        filterData: any
    ) => {
        requestData(rowsPerPage, currentPage, filterData);
    };

    // Function to safely render HTML content
    const renderAmount = (amount: string) => {
        if (!amount) return '-';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = amount;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        return textContent || '-';
    };

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
            header: __('Product(s)', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.products || ''}>
                    {row.original.products || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Order ID', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.orderNumber || ''}>
                    {row.original.orderNumber || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Customer Name', 'multivendorx'),
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
                <TableCell title={renderAmount(row.original.amount)}>
                    <span dangerouslySetInnerHTML={{ __html: row.original.amount || '-' }} />
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
            enableSorting: true,
            cell: ({ row }) => {
                const rawDate = row.original.date;
                const formattedDate = rawDate ? new Intl.DateTimeFormat('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }).format(new Date(rawDate)) : '-';
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            }
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
                    {!['Approved', 'Pending', 'Rejected'].includes(row.original.status) && (
                        <span className="admin-badge gray">{row.original.status}</span>
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
                            {__('All', 'multivendorx')}
                        </option>
                        <option value="order_number">
                            {__('Order ID', 'multivendorx')}
                        </option>
                        <option value="products">
                            {__('Products', 'multivendorx')}
                        </option>
                        <option value="customer_email">
                            {__('Customer Email', 'multivendorx')}
                        </option>
                        <option value="customer">
                            {__('Customer Name', 'multivendorx')}
                        </option>
                        <option value="store">
                            {__('Store', 'multivendorx')}
                        </option>
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
                        onChange={(e) => {
                            updateFilter(e.target.name, e.target.value);
                        }}
                        value={filterValue || ''}
                        className='basic-select'
                    />
                    <i className="adminlib-search"></i>
                </div>
            ),
        },
        {
            name: 'status',
            render: (updateFilter, filterValue) => (
                <div className="search-action">
                    <select
                        className="basic-select"
                        value={filterValue || ''}
                        onChange={(e) => {
                            updateFilter('status', e.target.value || '');
                        }}
                    >
                        <option value="all">
                            {__('All Status', 'multivendorx')}
                        </option>
                        <option value="pending">
                            {__('Pending', 'multivendorx')}
                        </option>
                        <option value="approved">
                            {__('Approved', 'multivendorx')}
                        </option>
                        <option value="rejected">
                            {__('Rejected', 'multivendorx')}
                        </option>
                    </select>
                </div>
            ),
        },
        {
            name: 'date',
            render: (updateFilter) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range: any) => updateFilter('date', { 
                            start_date: range.startDate, 
                            end_date: range.endDate 
                        })}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="column">
                {error && (
                    <div className="admin-notice admin-notice-error">
                        {error}
                    </div>
                )}

                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={handlePagination}
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                    searchFilter={searchFilter}
                    isLoading={loading}
                />

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
                                        <strong>Store:</strong> {selectedRefund.store_name}<br/>
                                        <strong>Order ID:</strong> {selectedRefund.orderNumber}<br/>
                                        <strong>Customer:</strong> {selectedRefund.customer}<br/>
                                        <strong>Amount:</strong> <span dangerouslySetInnerHTML={{ __html: selectedRefund.amount }} /><br/>
                                        <strong>Original Reason:</strong> {selectedRefund.reason}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CommonPopup>
                )}
            </div>
        </>
    );
};

export default RefundRequest;