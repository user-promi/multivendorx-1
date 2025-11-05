/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, Table, TableCell, CommonPopup, TextArea, CalendarInput } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import { formatCurrency } from '../../services/commonFunction';

type CouponRow = {
    id?: number;
    code?: string;
    amount?: string;
    discount_type?: string;
    status?: string;
    date_created?: string;
    meta_data?: Array<{ key: string; value: any }>;
};

interface FilterData {
    date?: { start_date?: Date; end_date?: Date };
}

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}

const Coupons: React.FC = () => {
    const [data, setData] = useState<CouponRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);
    const [storeDataMap, setStoreDataMap] = useState<{ [key: number]: any }>({});
    const [filterData, setFilterData] = useState<FilterData>({});

    // Reject popup state
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectCouponId, setRejectCouponId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestApiForData(pagination.pageSize, currentPage, filterData);
    }, [pagination, filterData]);

    const handleSingleAction = (action: string, couponId: number) => {
        if (!couponId) return;

        if (action === 'reject_coupon') {
            setRejectCouponId(couponId);
            setRejectPopupOpen(true);
            return;
        }

        const statusUpdate = action === 'approve_coupon' ? 'publish' : null;
        if (!statusUpdate) return;

        axios.put(`${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`, { status: statusUpdate }, { headers: { 'X-WP-Nonce': appLocalizer.nonce } })
            .then(() => requestApiForData(pagination.pageSize, pagination.pageIndex + 1, filterData))
            .catch(console.error);
    };

    const submitReject = () => {
        if (!rejectCouponId || isSubmitting) return;

        setIsSubmitting(true);

        axios.put(`${appLocalizer.apiUrl}/wc/v3/coupons/${rejectCouponId}`, {
            status: 'draft',
            meta_data: [{ key: '_reject_note', value: rejectReason || '' }],
        }, { headers: { 'X-WP-Nonce': appLocalizer.nonce } })
            .then(() => {
                setRejectPopupOpen(false);
                setRejectReason('');
                setRejectCouponId(null);
                requestApiForData(pagination.pageSize, pagination.pageIndex + 1, filterData);
            })
            .catch(console.error)
            .finally(() => setIsSubmitting(false));
    };

    function requestData(rowsPerPage = 10, currentPage = 1, filter: FilterData = {}) {
        setData(null);

        const params: any = { page: currentPage, per_page: rowsPerPage, meta_key: 'multivendorx_store_id', status: 'pending' };

        // Apply date filter
        if (filter.date?.start_date) params.after = filter.date.start_date.toISOString();
        if (filter.date?.end_date) params.before = filter.date.end_date.toISOString();

        axios.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, { headers: { 'X-WP-Nonce': appLocalizer.nonce }, params })
            .then(async (response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setTotalRows(totalCount);
                setPageCount(Math.ceil(totalCount / pagination.pageSize));

                const filtered = (response.data || []).filter(coupon =>
                    coupon.meta_data?.some(meta => meta.key === 'multivendorx_store_id')
                );
                setData(filtered);

                const storeIds = Array.from(new Set(filtered.map(c => c.meta_data.find(m => m.key === 'multivendorx_store_id')?.value).filter(Boolean)));
                const storeMap: { [key: number]: any } = {};
                await Promise.all(storeIds.map(async id => {
                    try {
                        const res = await axios.get(getApiLink(appLocalizer, `store/${id}`), { headers: { 'X-WP-Nonce': appLocalizer.nonce } });
                        storeMap[id] = res.data;
                    } catch { storeMap[id] = null; }
                }));
                setStoreDataMap(storeMap);
            })
            .catch(() => setData([]));
    }

    const getStoreData = (metaData: any[]) => {
        const storeId = metaData?.find(m => m.key === 'multivendorx_store_id')?.value;
        return storeId ? storeDataMap[storeId] : null;
    };

    const requestApiForData = (rowsPerPage: number, currentPage: number, filter: FilterData = {}) => {
        requestData(rowsPerPage, currentPage, filter);
    };

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'date',
            render: (updateFilter, filterValue) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range: any) => updateFilter('date', { start_date: range.startDate, end_date: range.endDate })}
                        value={filterValue}
                    />
                </div>
            ),
        },
    ];

    const columns: ColumnDef<CouponRow>[] = [
        {
            id: 'select',
            header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
            cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        },
        {
            header: __('Name', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original?.code ?? '-'}>{row.original?.id ? <a href={`${appLocalizer.site_url}/wp-admin/post.php?post=${row.original.id}&action=edit`} target="_blank" rel="noreferrer">{row.original.code}</a> : row.original?.code ?? '-'}</TableCell>
        },
        {
            header: __('Coupon Type', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original?.discount_type ?? '-'}>{row.original?.discount_type ?? '-'}</TableCell>
        },
        {
            header: __('Coupon Amount', 'multivendorx'),
            accessorFn: (row) => parseFloat(row.amount || '0'), // sorting numeric
            enableSorting: true,
            cell: ({ row }) => <TableCell title={row.original?.amount ?? '-'}>{formatCurrency(row.original?.amount)}</TableCell>
        },
        {
            header: __('Duration', 'multivendorx'),
            accessorFn: (row) => row.date_created ? new Date(row.date_created).getTime() : 0, // sorting date
            enableSorting: true,
            cell: ({ row }) => {
                const rawDate = row.original.date_created;
                const formattedDate = rawDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(rawDate)) : '-';
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            }
        },
        {
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => {
                const store = getStoreData(row.original?.meta_data ?? []);
                return <TableCell title={store?.name ?? '-'}>{store?.name ?? '-'}</TableCell>;
            }
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original?.status ?? '-'}>
                {row.original.status === "active" && (
                    <span className="admin-badge green">Active</span>
                )}
                {row.original.status === "pending" && (
                    <span className="admin-badge yellow">Pending</span>
                )}
            </TableCell>
        },
        {
            id: 'action',
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell type="action-dropdown" rowData={row.original} header={{
                    actions: [
                        { label: __('Approve Coupon', 'multivendorx'), icon: 'adminlib-check', onClick: (rowData) => handleSingleAction('approve_coupon', rowData.id!), hover: true },
                        { label: __('Reject Coupon', 'multivendorx'), icon: 'adminlib-close', onClick: (rowData) => handleSingleAction('reject_coupon', rowData.id!), hover: true },
                    ]
                }} />
            )
        }
    ];


    return (
        <>
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

                {/* Reject Coupon Popup */}
                {rejectPopupOpen && (
                    <CommonPopup
                        open={rejectPopupOpen}
                        onClose={() => { setRejectPopupOpen(false); setRejectReason(''); setIsSubmitting(false); }}
                        width="500px"
                        header={
                            <>
                                <div className="title"><i className="adminlib-cart"></i>{__('Reason', 'multivendorx')}</div>
                                <i onClick={() => { setRejectPopupOpen(false); setRejectReason(''); setIsSubmitting(false); }} className="icon adminlib-close"></i>
                            </>
                        }
                        footer={
                            <>
                                <div className="admin-btn btn-red" onClick={() => { setRejectPopupOpen(false); setRejectReason(''); setIsSubmitting(false); }}>{__('Cancel', 'multivendorx')}</div>
                                <button className="admin-btn btn-purple" onClick={submitReject} disabled={isSubmitting}>
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
                                    placeholder="Enter reason for rejecting this coupon..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </CommonPopup>
                )}
            </div>
        </>

    );
};

export default Coupons;
