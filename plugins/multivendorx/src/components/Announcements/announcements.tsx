/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

import { Table, getApiLink, TableCell, AdminBreadcrumbs, BasicInput, TextArea, CommonPopup } from 'zyra';

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
    status?: string;
};

type AnnouncementForm = {
    title: string;
    url: string;
    content: string;
    vendors: string;
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
    const [ openDatePicker, setOpenDatePicker ] = useState( false );

    const [pageCount, setPageCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [openModal, setOpenModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<string>('');
    const [ selectedRange, setSelectedRange ] = useState( [
        {
            startDate: new Date( new Date().getTime() - 30 * 24 * 60 * 60 * 1000 ),
            endDate: new Date(),
            key: 'selection',
        },
    ] );
    // Form state
    const [formData, setFormData] = useState<AnnouncementForm>({
        title: '',
        url: '',
        content: '',
        vendors: '',
    });

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
            // axios( {
            //     method: 'POST',
            //     url: getApiLink( appLocalizer, `cohorts` ),
            //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
            //     data: {
            //         selected_action: bulkSelectRef.current.value,
            //         cohort_ids: Object.keys( rowSelection ).map( ( index ) => {
            //             const row = data?.[ parseInt( index ) ];
            //             return {
            //                 cohort_id: row?.id,
            //             };
            //         } ),
            //     },
            // } ).then( () => {
            //     setModalDetails( '' );
            //     setOpenModal( false );
            //     requestData();
            //     setRowSelection( {} );
            // } );
        }
    };

    // Handle form submit
    const handleSubmit = async () => {
        try {
            await axios({
                method: 'POST',
                url: getApiLink(appLocalizer, 'announcement'),
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: { formData },
            }).then((response) => {
                if (response.data.success) {
                    console.log('Store created successfully');
                }
            })

            setAddAnnouncements(false);
            setFormData({ title: '', url: '', content: '', vendors: '' });
            requestData(pagination.pageSize, pagination.pageIndex + 1); // refresh table
        } catch (err) {
            setError(__('Failed to add announcement', 'multivendorx'));
        }
    };


    // Fetch total rows on mount
    useEffect(() => {
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
        setOpenDatePicker( ! openDatePicker );
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
    function requestData(rowsPerPage = 10, currentPage = 1) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'announcement'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
            },
        })
            .then((response) => {
                setData(response.data || []);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setData([]);
            });
    }

    const requestApiForData = (rowsPerPage: number, currentPage: number) => {
        setData(null);
        requestData(rowsPerPage, currentPage);
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
            header: __('Vendors', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={Array.isArray(row.original.vendors) ? row.original.vendors.join(', ') : row.original.vendors || ''}>
                    {Array.isArray(row.original.vendors) ? row.original.vendors.join(', ') : row.original.vendors || '-'}
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
                                    toggleDropdown(row.original.order_id)
                                }
                            ></i>
                            <div
                                className={`action-dropdown ${showDropdown === row.original.order_id ? 'show' : ''}`}
                            >
                                <ul>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&view&id=${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-eye"></i>
                                        {__('View Store', 'multivendorx')}
                                    </li>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-create"></i>
                                        {__('Edit Store', 'multivendorx')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TableCell>
            ),
        },
    ];
    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'bulk-action',
            render: () => (
                <div className="course-bulk-action bulk-action">
                    <select name="action" className="basic-select" ref={bulkSelectRef}>
                        <option value="">{__('Bulk actions')}</option>
                        <option value="publish">{__('Publish', 'multivendorx')}</option>
                        <option value="delete">{__('Delete', 'multivendorx')}</option>
                    </select>
                    <button name="bulk-action-apply" className="admin-btn btn-purple" onClick={handleBulkAction}>
                        {__('Apply')}
                    </button>
                </div>
            ),
        },
        {
            name: 'date',
            render: (updateFilter) => (
                <div ref={dateRef}>
                    <div className="admin-header-search-section">
                        <input
                            value={`${selectedRange[0].startDate.toLocaleDateString()} - ${selectedRange[0].endDate.toLocaleDateString()}`}
                            onClick={() => handleDateOpen()}
                            className="basic-input"
                            type="text"
                            placeholder={'DD/MM/YYYY'}
                        />
                    </div>
                    {openDatePicker && (
                        <div className="date-picker-section-wrapper" id="date-picker-wrapper">
                            <DateRangePicker
                                ranges={selectedRange}
                                months={1}
                                direction="vertical"
                                scroll={{ enabled: true }}
                                maxDate={new Date()}
                                onChange={(ranges: RangeKeyDict) => {
                                    const selection: Range = ranges.selection;

                                    if (selection?.endDate instanceof Date) {
                                        // Set end of day to endDate
                                        selection.endDate.setHours(23, 59, 59, 999);
                                    }

                                    // Update local range state
                                    setSelectedRange([
                                        {
                                            startDate: selection.startDate || new Date(),
                                            endDate: selection.endDate || new Date(),
                                            key: selection.key || 'selection',
                                        },
                                    ]);

                                    // Update external filters (could be used by table or search logic)
                                    updateFilter('date', {
                                        start_date: selection.startDate,
                                        end_date: selection.endDate,
                                    });
                                }}
                            />
                        </div>
                    )}
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
                <CommonPopup open={addAnnouncements} onClose={() => setAddAnnouncements(false)} title="Parent One Popup">
                    <div>
                    <h2>Hello from Parent One 🎉</h2>
                    <p>This is static info passed from Parent One.</p>
                    
                    </div>
                </CommonPopup>
            )}


            {/* {addAnnouncements && (
                <div className="right-popup">
                    <div className={`content-wrapper ${addAnnouncements ? "open" : ""}`}>
                        <div className="title-wrapper">
                                <div className="title">
                                    <i className="adminlib-cart"></i>
                                    Add Announcements
                                </div>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                <i onClick={() => setAddAnnouncements(false)} className="icon adminlib-close"></i>
                            </div>
                            
                            <div className="content">
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Title</label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            // value={formData.name}
                                            // onChange={handleChange}

                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Enter Url</label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            // value={formData.name}
                                            // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Enter Content</label>
                                        <TextArea
                                        name="description"
                                        inputClass="textarea-input"
                                        // value={formData.description}
                                        // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Vendors</label>
                                        <TextArea
                                        name="description"
                                        inputClass="textarea-input"
                                        // value={formData.description}
                                        // onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        <div className="popup-footer">
                            <div onClick={() => setAddAnnouncements(false)} className="admin-btn btn-red">Cancel</div>
                            <a href="" className="admin-btn btn-purple">Submit</a>
                        </div>
                    </div>
                </div>
            )} */}
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
                    typeCounts={[]}
                />
            </div>
        </>
    );
};

export default Announcements;
