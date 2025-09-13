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
export const TransactionHistory: React.FC = () => {
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
            header: __('Store name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Total earnings', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Paid amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Pending payout', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Withdrawal requests', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Last request date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Payment status', 'multivendorx'),
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
    const overview = [
        {
            id: 'sales',
            label: 'Total Sales',
            count: 475,
            icon: 'adminlib-star',
        },
        {
            id: 'earnings',
            label: 'Admin Earnings',
            count: 625,
            icon: 'adminlib-support',
        },
        {
            id: 'Vendors',
            label: 'Vendors',
            count: 8,
            icon: 'adminlib-global-community',
        },
        {
            id: 'Pending',
            label: 'Pending',
            count: 3,
            icon: 'adminlib-catalog',
        },
        {
            id: 'Products',
            label: 'Products',
            count: 2,
            icon: 'adminlib-calendar',
        },
        {
            id: 'Withdrawals',
            label: 'Withdrawals',
            count: 10,
            icon: 'adminlib-calendar',
        },
    ];
    const [activeTab, setActiveTab] = useState("products");
    const tabs = [
        { id: "products", label: "Transaction History", content:  <Table
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
                        />},
        { id: "stores", label: "Transaction Data", content:  <Table
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
                        />},
    ];
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-book"
                tabTitle="Storewise Transaction History"
                description={"Build your knowledge base: add new guides or manage existing ones in one place."}
                buttons={[
                    {
                        label: 'Select Store',
                        onClick: () => window.location.assign('?page=multivendorx#&tab=stores'),
                        className: 'admin-btn btn-purple'
                    },
                ]}
                

            />

            <div className="admin-dashboard">
                <div className="header">
                    <div className="title-wrapper">
                        <div className="title">You are viewing Store 1</div>
                        <div className="des">Here's what's happening with your marketplace today</div>
                    </div>
                </div>
                <div className="row">
                    <div className="overview-card-wrapper">
                        {overview.map((stat) => (
                            <div className="action" key={stat.id}>
                                <div className="title">
                                    {stat.count}
                                    <i className={stat.icon}></i>
                                </div>
                                <div className="description">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    {/* Tab Titles */}
                    <div className="column">
                        
                    <div className="tab-titles">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className={`title ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <p><i className="adminlib-cart"></i>{tab.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {tabs.map(
                            (tab) =>
                                activeTab === tab.id && (
                                    <div key={tab.id} className="tab-panel">
                                        {tab.content}
                                    </div>
                                )
                        )}
                    </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionHistory;
