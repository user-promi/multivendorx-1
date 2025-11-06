/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, TableCell, CalendarInput, CommonPopup, TextArea, getApiLink } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

type StoreRow = {
    id?: number;
    store_name?: string;
    email?: string;
    applied_on?: string;
    status?: string;
};

type FilterData = {
    date?: { start_date?: Date; end_date?: Date };
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}

const Stores: React.FC<{ onUpdated?: () => void }> = ({ onUpdated }) => {
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    // Reject popup state
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectStoreId, setRejectStoreId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // prevent multiple submissions

    const formatDateToISO8601 = (date: Date) => date.toISOString().slice(0, 19);

    // Fetch total rows
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'pending' },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => console.error(__('Failed to load total rows', 'multivendorx')));
    }, []);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
    }, [pagination]);

    const requestData = (
        rowsPerPage = 10,
        currentPage = 1,
        startDate?: Date,
        endDate?: Date
    ) => {
        setData(null);
        const params: any = {
            page: currentPage,
            row: rowsPerPage,
            status: 'pending',
        };
        if (startDate && endDate) {
            params.start_date = formatDateToISO8601(startDate);
            params.end_date = formatDateToISO8601(endDate);
        }

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params,
        })
            .then((response) => setData(response.data || []))
            .catch(() => setData([]));
    };

    const requestApiForData = (rowsPerPage: number, currentPage: number, filterData?: FilterData) => {
        setData(null);
        requestData(rowsPerPage, currentPage, filterData?.date?.start_date, filterData?.date?.end_date);
    };

    const handleSingleAction = (action: string, storeId: number) => {
        if (!storeId) return;

        if (action === 'declined') {
            setRejectStoreId(storeId);
            setRejectPopupOpen(true);
            return;
        }

        const statusValue = action === 'active' ? 'active' : '';
        if (!statusValue) return;

        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${storeId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { status: statusValue },
        })
            .then(() => {
                requestData(pagination.pageSize, pagination.pageIndex + 1);
                onUpdated?.();
            })
            .catch(console.error);
    };

    const submitReject = () => {
        if (!rejectStoreId || isSubmitting) return;

        setIsSubmitting(true);

        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${rejectStoreId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                status: 'declined',
                _reject_note: rejectReason || '' // allow empty reason
            }
        })
            .then(() => {
                setRejectPopupOpen(false);
                setRejectReason('');
                setRejectStoreId(null);
                requestData(pagination.pageSize, pagination.pageIndex + 1);
                onUpdated?.();
            })
            .catch(console.error)
            .finally(() => setIsSubmitting(false));
    };

    // Columns
    const columns: ColumnDef<StoreRow>[] = [
        {
            id: 'select',
            header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
            cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
        },
        {
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => {
                const { id, store_name } = row.original;
                const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
                const storeLink = id
                    ? `${baseUrl}&edit/${id}/&subtab=application-details`
                    : '#';

                return (
                    <TableCell title={store_name || ''}>
                        {id ? (
                            <a
                                href={storeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline"
                            >
                                {store_name || '-'}
                            </a>
                        ) : (
                            store_name || '-'
                        )}
                    </TableCell>
                );
            },
        },
        {
            header: __('Email', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.email || ''}>{row.original.email || '-'}</TableCell>,
        },
        {
            id: 'applied_on',
            accessorKey: 'applied_on',
            enableSorting: true,
            header: __('Applied On', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.applied_on;
                let formattedDate = '-';
                if (rawDate) {
                    const dateObj = new Date(rawDate);
                    formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dateObj);
                }
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            },
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) =>
                <TableCell title={row.original.status || ''}>
                    {row.original.status === "active" && (
                        <span className="admin-badge green">Active</span>
                    )}
                    {row.original.status === "pending" && (
                        <span className="admin-badge yellow">Pending</span>
                    )}
                </TableCell>,
        },
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) =>
                <TableCell title={row.original.status || ''}>
                    <span className="admin-btn btn-purple" onClick={() => { handleSingleAction('active', row.original.id!)}}><i className="adminlib-check"></i> Approve</span>

                    <span className="admin-btn btn-red" onClick={() => handleSingleAction('declined', row.original.id!)}><i className="adminlib-close"></i> Reject</span>
                </TableCell>,
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
        <>
            <div className="card-header">
                <div className="left">
                    <div className="title">
                        Stores
                    </div>
                    <div className="des">Waiting for your response</div>
                </div>
                <div className="right">
                    <i className="adminlib-more-vertical"></i>
                </div>
            </div>
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
            </div>

            {/* Reject Popup */}
            {rejectPopupOpen && (
                <CommonPopup
                    open={rejectPopupOpen}
                    onClose={() => { setRejectPopupOpen(false); setRejectReason(''); }}
                    width="500px"
                    header={
                        <>
                            <div className="title"><i className="adminlib-cart"></i>{__('Reason', 'multivendorx')}</div>
                            <i onClick={() => { setRejectPopupOpen(false); setRejectReason(''); }} className="icon adminlib-close"></i>
                        </>
                    }
                    footer={
                        <>
                            <div className="admin-btn btn-red" onClick={() => { setRejectPopupOpen(false); setRejectReason(''); }}>Cancel</div>
                            <button
                                className="admin-btn btn-purple"
                                onClick={submitReject}
                                disabled={isSubmitting} // disable while submitting
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
                                placeholder={__('Enter reason for rejecting this store...', 'multivendorx')}
                                rows={4}
                            />
                        </div>
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default Stores;
