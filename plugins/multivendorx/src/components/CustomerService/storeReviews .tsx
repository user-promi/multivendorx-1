/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, TableCell, CommonPopup, getApiLink, ToggleSetting } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

type Review = {
    review_id: number;
    store_id: number;
    customer_id: number;
    customer_name: string;
    order_id: number;
    overall_rating: number;
    review_title: string;
    review_content: string;
    status: string;
    reported: number;
    reply: string;
    reply_date: string;
    date_created: string;
    date_modified: string;
    review_images: string[];
    time_ago: string;
};

const StoreReviews: React.FC = () => {
    const [data, setData] = useState<Review[]>([]);
    const [error, setError] = useState<string>();
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [replyText, setReplyText] = useState<string>('');
    const [saving, setSaving] = useState<boolean>(false);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'review'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => {
                setError(__('Failed to load total rows', 'multivendorx'));
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
        startDate = new Date(0),
        endDate = new Date(),
    ) {
        setData([]);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'review'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                startDate,
                endDate
            },
        })
            .then((response) => {
                setData(response.data || []);
            })
            .catch(() => {
                setError(__('Failed to load Q&A', 'multivendorx'));
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
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };

    // 🔹 Handle reply saving
    const handleSaveReply = async () => {
        if (!selectedReview) return;
        setSaving(true);
        try {
            await axios.put(
                getApiLink(appLocalizer, `review/${selectedReview.review_id}`),
                {
                    reply: replyText,
                    status: selectedReview.status,
                },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            );
    
            setData((prev) =>
                prev.map((r) =>
                    r.review_id === selectedReview.review_id
                        ? { ...r, reply: replyText, status: selectedReview.status }
                        : r
                )
            );
    
            setSelectedReview(null);
            setReplyText('');
        } catch {
            alert(__('Failed to save reply', 'multivendorx'));
        } finally {
            setSaving(false);
        }
    };
    
    console.log(appLocalizer)
    // 🔹 Table Columns
    const columns: ColumnDef<Review>[] = [
        {
            id: 'select',
            header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
            cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        },
        {
            id: 'customer',
            header: __('Customer', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.customer_name}>
                    {row.original.customer_name} (#{row.original.customer_id})
                </TableCell>
            ),
        },
        {
            id: 'order',
            header: __('Order', 'multivendorx'),
            cell: ({ row }) => {
                const orderId = row.original.order_id;
                const orderLink = `${appLocalizer.site_url}admin.php?page=wc-orders&action=edit&id=${orderId}`;
                return (
                    <TableCell title={`Order #${orderId}`}>
                        {orderId ? (
                            <a
                                href={orderLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#0073aa', textDecoration: 'underline' }}
                            >
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
            id: 'rating',
            header: __('Rating', 'multivendorx'),
            cell: ({ row }) => {
                const rating = row.original.overall_rating ?? 0;
                return (
                    <TableCell title={rating.toString()}>
                        {rating > 0
                            ? '★'.repeat(Math.round(rating)) +
                            '☆'.repeat(5 - Math.round(rating))
                            : '-'}
                    </TableCell>
                );
            },
        },
        {
            id: 'title',
            header: __('Title', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.review_title}>
                    {row.original.review_title || '-'}
                </TableCell>
            ),
        },
        {
            id: 'content',
            header: __('Review', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.review_content}>
                    {row.original.review_content || '-'}
                </TableCell>
            ),
        },
        {
            id: 'status',
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status}>
                    {row.original.status}
                </TableCell>
            ),
        },
        {
            id: 'time_ago',
            header: __('Time ago', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.time_ago}>
                    {row.original.time_ago}
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
                                label: __('Reply / Edit', 'multivendorx'),
                                icon: 'adminlib-eye',
                                onClick: () => {
                                    setSelectedReview(row.original);
                                    setReplyText(row.original.reply || '');
                                },
                                hover: true,
                            },
                            {
                                label: __('Delete', 'multivendorx'),
                                icon: 'adminlib-delete',
                                onClick: async () => {
                                    if (
                                        confirm(
                                            __(
                                                'Are you sure you want to delete this review?',
                                                'multivendorx'
                                            )
                                        )
                                    ) {
                                        try {
                                            await axios.delete(
                                                getApiLink(
                                                    appLocalizer,
                                                    `review/${row.original.review_id}`
                                                ),
                                                {
                                                    headers: {
                                                        'X-WP-Nonce': appLocalizer.nonce,
                                                    },
                                                }
                                            );
                            
                                            // ✅ Refresh the table after delete
                                            requestData(
                                                pagination.pageSize,
                                                pagination.pageIndex + 1
                                            );
                                        } catch (error) {
                                            console.error(error);
                                            alert(__('Failed to delete review', 'multivendorx'));
                                        }
                                    }
                                },
                                hover: true,
                            }
                            
                        ],
                    }}
                />
            ),
        },
    ];

    return (
        <>
            <div className="admin-table-wrapper">
                {error && <div className="error">{error}</div>}
                <Table
                    data={data || []}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                />
            </div>

            {/* ✅ Reply/Edit Popup */}
            {selectedReview && (
                <CommonPopup
                    open={!!selectedReview}
                    onClose={() => setSelectedReview(null)}
                    width="600px"
                    header={
                        <div className="title">
                            <i className="adminlib-comment"></i>{' '}
                            {__('Reply to Review', 'multivendorx')} — {selectedReview.customer_name}
                        </div>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectedReview(null)}
                                className="admin-btn btn-red"
                            >
                                {__('Cancel', 'multivendorx')}
                            </button>
                            <button
                                onClick={handleSaveReply}
                                disabled={saving}
                                className="admin-btn btn-purple"
                            >
                                {saving
                                    ? __('Saving...', 'multivendorx')
                                    : __('Save Reply', 'multivendorx')}
                            </button>
                        </>
                    }
                >
                    <div className="content">
                        {/* Reply Text */}
                        <div className="form-group">
                            <label htmlFor="reply">{__('Your Reply', 'multivendorx')}</label>
                            <textarea
                                id="reply"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={5}
                                style={{
                                    width: '100%',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    padding: '8px',
                                }}
                            />
                        </div>

                        {/* Status Toggle */}
                        <div className="form-group">
                            <label htmlFor="status">{__('Review Status', 'multivendorx')}</label>
                            <ToggleSetting
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                description={__('Change review status', 'multivendorx')}
                                options={[
                                    { key: 'pending', value: 'Pending', label: __('Pending', 'multivendorx') },
                                    { key: 'approved', value: 'Approved', label: __('Approved', 'multivendorx') },
                                    { key: 'rejected', value: 'Rejected', label: __('Rejected', 'multivendorx') },
                                ]}
                                value={selectedReview.status}
                                onChange={(val) => {
                                    setSelectedReview((prev) =>
                                        prev ? { ...prev, status: val } : prev
                                    );
                                }}
                            />
                        </div>
                    </div>
                </CommonPopup>
            )}

        </>
    );
};

export default StoreReviews;
