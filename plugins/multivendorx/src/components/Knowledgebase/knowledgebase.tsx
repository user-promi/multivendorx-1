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

export const KnowledgeBase: React.FC = () => {
    const [data, setData] = useState<KBRow[] | null>(null);
    const [addEntry, setAddEntry] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
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
    const handleCloseForm = () => {
        setAddEntry(false);
        setFormData({ title: '', url: '', content: '', stores: '' }); // reset form
        setEditId(null); // reset edit mode
        setError(null); // clear any error
    };
    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
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
            .then(response => setData(response.data || []))
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
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title="Action">
                    <div className="action-section">
                        <div className="action-icons">
                            <i
                                className="adminlib-more-vertical"
                                onClick={() =>
                                    toggleDropdown(row.original.id)
                                }
                            ></i>
                            <div
                                className={`action-dropdown ${showDropdown === row.original.id ? 'show' : ''}`}
                            >
                                <ul>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=announcements&view&id=${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-eye"></i>
                                        {__('View knowledgebase', 'multivendorx')}
                                    </li>
                                    <li
                                        onClick={() => handleEdit(row.original.id)}
                                    >
                                        <i className="adminlib-create"></i>
                                        {__('Edit knowledgebase', 'multivendorx')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TableCell>
            ),
        }

    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'bulk-action',
            render: () => (
                <div className="course-bulk-action bulk-action">
                    <select name="action" className="basic-select" ref={bulkSelectRef}>
                        <option value="">{__('Bulk actions')}</option>
                        <option value="publish">{__('Publish', 'multivendorx')}</option>
                        <option value="pending">{__('Pending', 'multivendorx')}</option>
                    </select>
                    <button name="bulk-action-apply" className="admin-btn btn-purple" onClick={handleBulkAction}>
                        {__('Apply')}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-book"
                tabTitle="Knowledge Base"
                buttons={[
                    <div className="admin-btn btn-purple" onClick={() => setAddEntry(true)}>
                        <i className="adminlib-plus-circle-o"></i>
                        Add New
                    </div>,
                ]}
            />

            {addEntry && (
                <CommonPopup
                    open={addEntry}
                    onClose={handleCloseForm}
                    width="500px"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                {editId ? __('Edit Knowledgebase', 'multivendorx') : __('Add Knowledgebase', 'multivendorx')}
                            </div>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                            <i
                                onClick={handleCloseForm}
                                className="icon adminlib-close"
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <div
                                onClick={handleCloseForm}
                                className="admin-btn btn-red"
                            >
                                Cancel
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSubmit('publish')}
                                className="admin-btn btn-purple"
                            >
                                Publish
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit('pending')}
                                className="admin-btn btn-yellow"
                            >
                                Pending
                            </button>
                        </>
                    }
                >
                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <BasicInput type="text" name="title" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="content">Content</label>
                                <TextArea
                                    name="content"
                                    inputClass="textarea-input"
                                    value={formData.content}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </CommonPopup>
            )}

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
                />
            </div>
        </>
    );
};

export default KnowledgeBase;
