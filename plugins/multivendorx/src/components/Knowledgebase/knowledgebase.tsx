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

    const [formData, setFormData] = useState<KBForm>({
        title: '',
        content: '',
        status: 'pending',
    });

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Open edit modal
    const handleEdit = async (id: number) => {
        try {
            const response = await axios.get(getApiLink(appLocalizer, `knowledgebase/${id}`), {
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
                ? getApiLink(appLocalizer, `knowledgebase/${editId}`)
                : getApiLink(appLocalizer, 'knowledgebase');

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
            url: getApiLink(appLocalizer, 'knowledgebase'),
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
    const columns: ColumnDef<KBRow>[] = [
        {
            header: __('Title', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.title || ''}>{row.original.title || '-'}</TableCell>,
        },
        {
            header: __('Content', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.content || ''}>{row.original.content || '-'}</TableCell>,
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.status || ''}>{row.original.status || '-'}</TableCell>,
        },
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title="Action">
                    <div className="action-section">
                        <i className="adminlib-create" onClick={() => handleEdit(row.original.id!)}></i>
                    </div>
                </TableCell>
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
                <CommonPopup open={addEntry} onClose={() => setAddEntry(false)} title="Add Knowledge Base Entry">
                    <div className="right-popup">
                        <div className={`content-wrapper ${addEntry ? 'open' : ''}`}>
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

                            {error && <p className="error-text">{error}</p>}

                            <div className="popup-footer">
                                <div className="admin-btn btn-red" onClick={() => setAddEntry(false)}>
                                    Cancel
                                </div>
                                <div className="admin-btn btn-purple" onClick={() => handleSubmit('publish')}>
                                    Publish
                                </div>
                                <div className="admin-btn btn-yellow" onClick={() => handleSubmit('pending')}>
                                    Pending
                                </div>
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
                    onPaginationChange={setPagination}
                    handlePagination={requestData}
                    perPageOption={[10, 25, 50]}
                />
            </div>
        </>
    );
};

export default KnowledgeBase;
