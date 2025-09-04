/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

import { Table, getApiLink, TableCell, AdminBreadcrumbs, BasicInput, TextArea, CommonPopup, SelectInput } from 'zyra';

import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import "./announcements.scss";

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: 'publish' | 'pending' | string;
};
type AnnouncementStatus = {
    key: string;
    name: string;
    count: number;
};

type AnnouncementForm = {
    title: string;
    url: string;
    content: string;
    stores: string; // ✅ renamed vendors → stores
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}

const Announcements: React.FC = () => {
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [addAnnouncements, setAddAnnouncements] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const dateRef = useRef<HTMLDivElement | null>(null);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [pageCount, setPageCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [openModal, setOpenModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<string>('');
    const [selectedRange, setSelectedRange] = useState([
        {
            startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const [editId, setEditId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<AnnouncementForm>({
        title: '',
        url: '',
        content: '',
        stores: '',
    });
    const [announcementStatus, setAnnouncementStatus] = useState<AnnouncementStatus[] | null>(null);
    const [storeOptions, setStoreOptions] = useState<{ value: string; label: string }[]>([]);

    // Handle form input change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
    const handleEdit = async (id: number) => {
        try {
            const response = await axios.get(
                getApiLink(appLocalizer, `announcement/${id}`),
                {
                    headers: { 'X-WP-Nonce': appLocalizer.nonce },
                }
            );

            if (response.data) {
                setFormData({
                    title: response.data.title || '',
                    url: response.data.url || '',
                    content: response.data.content || '',
                    stores: response.data.stores
                        ? response.data.stores.map((s: any) => s.id).join(',') // ✅ store IDs in CSV
                        : '',
                });
                setEditId(id);
                setAddAnnouncements(true);
            }

        } catch (err) {
            setError(__('Failed to load announcement', 'multivendorx'));
        }
    };

    const handleSubmit = async () => {
        try {
            const endpoint = editId ? getApiLink(appLocalizer, `announcement/${editId}`) : getApiLink(appLocalizer, 'announcement');
            const method = editId ? 'PUT' : 'POST';

            // Convert CSV to array for stores
            const payload = {
                ...formData,
                stores: formData.stores ? formData.stores.split(',') : [],
            };

            const response = await axios({
                method,
                url: endpoint,
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: payload,
            });

            if (response.data.success) {
                console.log(editId ? 'Announcement updated' : 'Announcement created');
                setAddAnnouncements(false);
                setFormData({ title: '', url: '', content: '', stores: '' });
                setEditId(null);
                requestData(pagination.pageSize, pagination.pageIndex + 1);
            } else {
                setError(__('Failed to save announcement', 'multivendorx'));
            }

        } catch (err) {
            setError(__('Failed to save announcement', 'multivendorx'));
        }
    };




    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                if (response.data && Array.isArray(response.data)) {
                    const options = response.data.map((store: any) => ({
                        value: store.id.toString(),
                        label: store.store_name,
                    }));
                    setStoreOptions(options);
                }

            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'announcement'),
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

    const handleDateOpen = () => {
        setOpenDatePicker(!openDatePicker);
    };

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };

    // Fetch data from backend
    function requestData(rowsPerPage = 10, currentPage = 1, typeCount = '') {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'announcement'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === 'all' ? '' : typeCount,
            },
        })
            .then((response) => {
                setData(response.data || []);
                setAnnouncementStatus([
                    { key: 'all', name: 'All', count: response.data.all || 0 },
                    { key: 'publish', name: 'Published', count: response.data.publish || 0 },
                    { key: 'pending', name: 'Pending', count: response.data.pending || 0 },
                ]);
            })
            .catch(() => {
                setError(__('Failed to load announcements', 'multivendorx'));
                setData([]);
            });
    }

    const requestApiForData = (rowsPerPage: number, currentPage: number, filterData?: any) => {
        setData(null);
        requestData(rowsPerPage, currentPage, filterData?.typeCount || '');
    };

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
            header: __('URL', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.url || ''}>
                    {row.original.url || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Stores', 'multivendorx'), // ✅ vendors → stores
            cell: ({ row }) => (
                <TableCell title={Array.isArray(row.original.stores) ? row.original.stores.join(', ') : row.original.stores || ''}>
                    {Array.isArray(row.original.stores) ? row.original.stores.join(', ') : row.original.stores || '-'}
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
                                        {__('View Announcement', 'multivendorx')}
                                    </li>
                                    <li
                                        onClick={() => handleEdit(row.original.id)} // ✅ opens edit popup
                                    >
                                        <i className="adminlib-create"></i>
                                        {__('Edit Announcement', 'multivendorx')}
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

    const [open, setOpen] = useState(false);

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Announcements"
                buttons={[
                    <div
                        className="admin-btn btn-purple"
                        onClick={() => setAddAnnouncements(true)}
                    >
                        <i className="adminlib-plus-circle-o"></i>
                        Add New
                    </div>,
                ]}
            />

            {addAnnouncements && (
                <CommonPopup
                    open={addAnnouncements}
                    onClose={() => setAddAnnouncements(false)}
                    title="Add Announcement"
                    header={'Lorem ipsum dolor sit amet consectetur adipisicing elit.'}
                >
                    <div className="right-popup">
                        <div className={`content-wrapper ${addAnnouncements ? "open" : ""}`}>
                            <div className="title-wrapper">
                                <div className="title">
                                    <i className="adminlib-cart"></i>
                                    Add Announcements
                                </div>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                <i
                                    onClick={() => setAddAnnouncements(false)}
                                    className="icon adminlib-close"
                                ></i>
                            </div>

                            <div className="content">
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="title">Title</label>
                                        <BasicInput
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="url">Enter Url</label>
                                        <BasicInput
                                            type="text"
                                            name="url"
                                            value={formData.url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="content">Enter Content</label>
                                        <TextArea
                                            name="content"
                                            inputClass="textarea-input"
                                            value={formData.content}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="stores">Stores</label> {/* ✅ vendors → stores */}
                                        <SelectInput
                                            name="stores"
                                            type="multi-select"
                                            options={storeOptions}
                                            value={formData.stores ? formData.stores.split(',') : []} // ✅ CSV → array
                                            onChange={(newValue: any) => {
                                                const selectedValues = Array.isArray(newValue)
                                                    ? newValue.map((opt) => opt.value)
                                                    : [];
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    stores: selectedValues.join(','),
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && <p className="error-text">{error}</p>}

                            <div className="popup-footer">
                                <div
                                    onClick={() => setAddAnnouncements(false)}
                                    className="admin-btn btn-red"
                                >
                                    Cancel
                                </div>
                                <div
                                    onClick={handleSubmit}
                                    className="admin-btn btn-purple"
                                >
                                    Submit
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
                    pageCount={pageCount}
                    pagination={pagination}
                    realtimeFilter={realtimeFilter}
                    onPaginationChange={setPagination}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={announcementStatus as AnnouncementStatus[]}
                />
            </div>
        </>
    );
};

export default Announcements;
