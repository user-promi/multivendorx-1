/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { CalendarInput, Table, TableCell, CommonPopup, TextArea } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
    name?: string;
    images?: { src: string }[];
    categories?: { name: string }[];
    sku?: string;
    price?: string;
    price_html?: string;
};

type FilterData = {
    searchAction?: string;
    searchField?: string;
    typeCount?: any;
    store?: string;
    date?: { start_date?: Date; end_date?: Date };
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}

const Products: React.FC<{ onUpdated?: () => void }> = ({ onUpdated }) => {
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    // Reject popup state
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectProductId, setRejectProductId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // prevent multiple clicks

    const formatDateToISO8601 = (date: Date) => date.toISOString().slice(0, 19);

    const requestData = (
        rowsPerPage = 10,
        currentPage = 1,
        startDate?: Date,
        endDate?: Date
    ) => {
        const now = new Date();
        const formattedStartDate = formatDateToISO8601(startDate || new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()));
        const formattedEndDate = formatDateToISO8601(endDate || now);
    
        setData(null);
    
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                    meta_key: 'multivendorx_store_id',
                    status: 'pending',
                    after: formattedStartDate,
                    before: formattedEndDate,
                    // Ensure all fields are included
                    _fields: 'id,name,sku,price,price_html,status,images,categories,meta_data,store_name,store_slug'
                },
            })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setTotalRows(totalCount);
                setPageCount(Math.ceil(totalCount / pagination.pageSize));
                setData(response.data || []);
            })
            .catch(() => setData([]));
    };
console.log(data)
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
    }, [pagination]);

    const handleSingleAction = (action: string, productId: number) => {
        if (!productId) return;

        if (action === 'reject_product') {
            setRejectProductId(productId);
            setRejectPopupOpen(true);
            return;
        }

        const statusUpdate = action === 'approve_product' ? 'publish' : null;
        if (!statusUpdate) return;

        axios.post(
            `${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
            { status: statusUpdate },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        )
            .then(() => {
                onUpdated?.();
                requestData(pagination.pageSize, pagination.pageIndex + 1);
            })
            .catch(console.error);
    };

    const submitReject = () => {
        if (!rejectProductId || isSubmitting) return;

        setIsSubmitting(true);

        axios.post(
            `${appLocalizer.apiUrl}/wc/v3/products/${rejectProductId}`,
            {
                status: 'draft',
                meta_data: [
                    { key: '_reject_note', value: rejectReason || '' } // allow empty string
                ]
            },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        )
            .then(() => {
                setRejectPopupOpen(false);
                setRejectReason('');
                setRejectProductId(null);
                requestData(pagination.pageSize, pagination.pageIndex + 1);
                onUpdated?.();
            })
            .catch(console.error)
            .finally(() => setIsSubmitting(false)); // enable button again
    };

    const requestApiForData = (rowsPerPage: number, currentPage: number, filterData: FilterData) => {
        setData(null);
        requestData(rowsPerPage, currentPage, filterData?.date?.start_date, filterData?.date?.end_date);
    };

    // Columns
    const columns: ColumnDef<StoreRow>[] = [
        {
            id: 'select',
            header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
            cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
        },
        {
            id: 'product',
            header: __('Product', 'multivendorx'),
            cell: ({ row }) => {
                const product = row.original;
                const image = product.images?.[0]?.src || 'https://via.placeholder.com/50';
                return (
                    <TableCell title={product.name || ''}>
                        <a
                            href={`${appLocalizer.site_url}/wp-admin/post.php?post=${product.id}&action=edit`}
                            target="_blank"
                            rel="noreferrer"
                            className="product-wrapper"
                        >
                            <img src={image} alt={product.name} style={{ width: 40, height: 40, objectFit: 'cover' }} />
                            <span>{product.name || '-'}</span>
                        </a>
                    </TableCell>
                );
            },
        },
        {
            header: __('Category', 'multivendorx'),
            cell: ({ row }) => {
                const categories = row.original.categories || [];
                const categoryNames = categories.map((c) => c.name).join(', ') || '-';
                return <TableCell title={categoryNames}>{categoryNames}</TableCell>;
            },
        },
        {
            header: __('Sold By', 'multivendorx'),
            cell: ({ row }) => {
                const storeName = row.original.store_name || [];
                return <TableCell title={storeName}>{storeName}</TableCell>;
            },
        },
        {
            header: __('SKU', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.sku || ''}>{row.original.sku || '-'}</TableCell>,
        },
        {
            id: 'price',
            accessorKey: 'price',
            accessorFn: (row) => parseFloat(row.price || '0'),
            enableSorting: true,
            header: __('Price', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.price || ''}>
                    {row.original.price_html ? <span dangerouslySetInnerHTML={{ __html: row.original.price_html }} /> : '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.status || ''}>
                {row.original.status === "active" && (
                    <span className="admin-badge green">Active</span>
                )}
                {row.original.status === "pending" && (
                    <span className="admin-badge yellow">Pending</span>
                )}
            </TableCell>,
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
                            { label: __('Approve', 'multivendorx'), icon: 'adminlib-check', onClick: (rowData) => handleSingleAction('approve_product', rowData.id!), hover: true },
                            { label: __('Reject', 'multivendorx'), icon: 'adminlib-close', onClick: (rowData) => handleSingleAction('reject_product', rowData.id!), hover: true },
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
                        onChange={(range: any) => updateFilter('date', { start_date: range.startDate, end_date: range.endDate })}
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
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                defaultRowsPerPage={10}
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={setPagination}
                handlePagination={requestApiForData}
                perPageOption={[10, 25, 50]}
                typeCounts={[]}
                totalCounts={totalRows}
                realtimeFilter={realtimeFilter}
            />
            {/* Reject Product Popup */}
            {rejectPopupOpen && (
                <CommonPopup
                    open={rejectPopupOpen}
                    onClose={() => { setRejectPopupOpen(false); setRejectReason(''); setIsSubmitting(false); }}
                    width="500px"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                {__('Reason', 'multivendorx')}
                            </div>
                            <i
                                onClick={() => { setRejectPopupOpen(false); setRejectReason(''); setIsSubmitting(false); }}
                                className="icon adminlib-close"
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <div className="admin-btn btn-red" onClick={() => { setRejectPopupOpen(false); setRejectReason(''); setIsSubmitting(false); }}>Cancel</div>
                            <button
                                className="admin-btn btn-purple"
                                onClick={submitReject}
                                disabled={isSubmitting} // prevent multiple clicks
                            >
                                {isSubmitting ? __('Submitting...', 'multivendorx') : __('Reject', 'multivendorx')}
                            </button>
                        </>
                    }
                >
                    <div className="content">
                        <div className="form-group">
                            <TextArea
                                name="reject_reason"
                                wrapperClass="setting-from-textarea"
                                inputClass="textarea-input"
                                descClass="settings-metabox-description"
                                value={rejectReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                                placeholder="Enter reason for rejecting this product..."
                                rows={4}
                            />
                        </div>
                    </div>
                </CommonPopup>
            )}
        </div>
    );
};

export default Products;
