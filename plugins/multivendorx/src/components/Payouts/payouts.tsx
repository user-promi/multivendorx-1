/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, BasicInput, TextArea, CommonPopup } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import "../Announcements/announcements.scss";

type KBRow = {
    id?: number;
    title?: string;
    content?: string;
    status?: 'publish' | 'pending' | string;
};

type KBForm = {
    title: string;
    content: string;
    status?: 'publish' | 'pending';
};
type AnnouncementStatus = {
    key: string;
    name: string;
    count: number;
};
export const Payouts: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<KBRow[] | null>(null);
    const [addEntry, setAddEntry] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [announcementStatus, setAnnouncementStatus] = useState<AnnouncementStatus[] | null>(null);

    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [formData, setFormData] = useState<KBForm>({
        title: '',
        content: '',
        status: 'pending',
    });
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [modalDetails, setModalDetails] = useState<string>('');

    const handleBulkAction = () => {
        if (appLocalizer.khali_dabba) {
            if (!Object.keys(rowSelection).length) {
                setModalDetails('Select rows.');
                setOpenModal(true);
                return;
            }
            if (!bulkSelectRef.current?.value) {
                setModalDetails('Please select a action.');
                setOpenModal(true);
                return;
            }
            setData(null);
        }
    };
    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
    // Open edit modal
    const handleEdit = async (id: number) => {
        try {
            const response = await axios.get(getApiLink(appLocalizer, `knowledge/${id}`), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            });
            if (response.data) {
                setFormData({
                    title: response.data.title || '',
                    content: response.data.content || '',
                    status: response.data.status || 'pending',
                });
                setEditId(id);
                setAddEntry(true);
            }
        } catch {
            setError(__('Failed to load entry', 'multivendorx'));
        }
    };

    // Submit form
    const handleSubmit = async (status: 'publish' | 'pending') => {
        if (submitting) return; // prevent multiple clicks
        setSubmitting(true);

        try {
            const endpoint = editId
                ? getApiLink(appLocalizer, `knowledge/${editId}`)
                : getApiLink(appLocalizer, 'knowledge');

            const method = editId ? 'PUT' : 'POST';
            const payload = { ...formData, status };

            const response = await axios({
                method,
                url: endpoint,
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: payload,
            });

            if (response.data.success) {
                setAddEntry(false);
                setFormData({ title: '', content: '', status: 'pending' });
                setEditId(null);
                requestData(pagination.pageSize, pagination.pageIndex + 1);
            } else {
                setError(__('Failed to save entry', 'multivendorx'));
            }
        } catch {
            setError(__('Failed to save entry', 'multivendorx'));
        } finally {
            setSubmitting(false); // re-enable buttons
        }
    };


    // Fetch data
    const requestData = (rowsPerPage = 10, currentPage = 1) => {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'knowledge'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { page: currentPage, row: rowsPerPage },
        })
            .then((response) => {
                setData(response.data || []);
                setAnnouncementStatus([
                    { key: 'all', name: 'All', count: response.data.all || 0 },
                    { key: 'publish', name: 'Published', count: response.data.publish || 0 },
                    { key: 'pending', name: 'Pending', count: response.data.pending || 0 },
                ]);
            })
            .catch(() => setError(__('Failed to load entries', 'multivendorx')));
    };

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
    }, [pagination]);

    // Columns
    // Columns
    const columns: ColumnDef<StoreRow>[] = [
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
            header: __('Title', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status || '-'}
                </TableCell>
            ),
        },

    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'bulk-action',
            render: () => (
                <div className="bulk-action">
                    <select name="action" className="basic-select" ref={bulkSelectRef}>
                        <option value="">{__('Bulk actions')}</option>
                        <option value="publish">{__('Publish', 'multivendorx')}</option>
                        <option value="pending">{__('Pending', 'multivendorx')}</option>
                        <option value="delete">{__('Delete', 'multivendorx')}</option>
                    </select>
                    {/* <button name="bulk-action-apply" className="admin-btn btn-purple" onClick={handleBulkAction}>
                        {__('Apply')}
                    </button> */}
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-book"
                tabTitle="Payouts"
                description={"Build your knowledge base: add new guides or manage existing ones in one place."}
            />
            <div className="admin-dashboard">
                <div className="row">
                    <div className="column"></div>
                    <div className="column"></div>
                    <div className="column"></div>
                    <div className="column"></div>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pagination={pagination}
                    realtimeFilter={realtimeFilter}
                    onPaginationChange={setPagination}
                    handlePagination={requestData}
                    perPageOption={[10, 25, 50]}
                    onRowClick={(row: any) => {
                        handleEdit(row.id);
                    }}
                    typeCounts={announcementStatus as AnnouncementStatus[]}
                />
            </div>
        </>
    );
};

export default Payouts;
