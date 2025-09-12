import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { BasicInput, CommonPopup, MultiCheckBox, Table, TableCell, TextArea } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type StoreRow = {
    id: number;
    store_name?: string;   // Coupon Name
    store_slug?: string;   // Reused but we'll map different fields into it
    type?: string;         // Coupon Type
    amount?: string;       // Coupon Amount
    usage?: string;        // Usage / Limit
    expiry?: string;       // Expiry Date
    status?: string;
};

const AllCoupon: React.FC = () => {
    const [data, setData] = useState<StoreRow[]>([]);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [showDropdown, setShowDropdown] = useState(false);
    const [AddCoupon, setAddCoupon] = useState(false);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
    const [pageCount, setPageCount] = useState(0);
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        {
            id: "general",
            label: "General",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Discount type</label>
                            <BasicInput type="text" name="discount_type" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Coupon amount</label>
                            <BasicInput type="number" name="coupon_amount" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Allow free shipping</label>
                            <BasicInput type="text" name="free_shipping" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Coupon expiry date</label>
                            <BasicInput type="date" name="expiry_date" />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "limits",
            label: "Usage Limits",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Usage limit per coupon</label>
                            <BasicInput type="number" name="limit_per_coupon" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Limit usage to X items</label>
                            <BasicInput type="number" name="limit_per_items" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Usage limit per user</label>
                            <BasicInput type="number" name="limit_per_user" />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "restriction",
            label: "Usage Restriction",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Minimum spend</label>
                            <BasicInput type="number" name="min_spend" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Maximum spend</label>
                            <BasicInput type="number" name="max_spend" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Individual use only</label>
                            <BasicInput type="checkbox" name="individual_use" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude sale items</label>
                            <BasicInput type="checkbox" name="exclude_sale_items" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Products</label>
                            <BasicInput type="text" name="products" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude products</label>
                            <BasicInput type="text" name="exclude_products" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Product categories</label>
                            <BasicInput type="text" name="product_categories" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude categories</label>
                            <BasicInput type="text" name="exclude_categories" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Allowed emails</label>
                            <BasicInput type="text" name="allowed_emails" />
                        </div>
                    </div>
                </>
            ),
        },
    ];


    // 🔹 Add demo data on mount
    useEffect(() => {
        const demoData: StoreRow[] = [
            {
                id: 25831,
                store_name: "EAA2US8Z",
                type: "Fixed Cart Discount",
                amount: "10.6",
                usage: "0 / 200",
                expiry: "2025-12-31",
                status: "Active",
            },
            {
                id: 25832,
                store_name: "WELCOME10",
                type: "Percentage",
                amount: "10%",
                usage: "12 / 100",
                expiry: "2026-01-15",
                status: "Active",
            },
            {
                id: 25833,
                store_name: "FREESHIP",
                type: "Free Shipping",
                amount: "—",
                usage: "5 / ∞",
                expiry: "2025-10-01",
                status: "Expired",
            },
        ];
        setData(demoData);
        setTotalRows(demoData.length);
    }, []);

    // 🔹 Update page count when pagination or totalRows changes
    useEffect(() => {
        const rowsPerPage = pagination.pageSize;
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination, totalRows]);

    // Column definitions
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
            header: __('Coupon Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Coupon type', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.type || ''}>
                    {row.original.type || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Coupon Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.amount || ''}>
                    {row.original.amount || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Usage / Limit', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.usage || ''}>
                    {row.original.usage || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Expiry Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.expiry || ''}>
                    {row.original.expiry || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ""}>
                    {row.original.status === "Active" && (
                        <span className="admin-badge green">Active</span>
                    )}
                    {row.original.status === "Inactive" && (
                        <span className="admin-badge ">Inactive</span>
                    )}
                    {row.original.status === "Expired" && (
                        <span className="admin-badge red">Expired</span>
                    )}
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
                                className={`action-dropdown ${showDropdown === row.original.order_id
                                    ? 'show'
                                    : ''
                                    }`}
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

    return (
        <>
            <div className="header-wrapper">
                <div
                className="admin-btn btn-purple"
                onClick={() => setAddCoupon(true)}
            >
                <i className="adminlib-plus-circle-o"></i>
                Add New
            </div>
            </div>
            
            {AddCoupon && (
                <CommonPopup
                    open={AddCoupon}
                    // onClose= setAddCoupon(true)
                    width="500px"
                    height="100%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                Add Coupon
                            </div>
                            <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setAddCoupon(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <div
                                className="admin-btn btn-red"
                                onClick={() => setAddCoupon(false)}
                            >
                                Draft
                                <i className="adminlib-contact-form"></i>
                            </div>
                            <div
                                className="admin-btn btn-purple"
                                onClick={() => setAddCoupon(false)}
                            >
                                Publish
                                <i className="adminlib-check"></i>
                            </div>

                        </>
                    }
                >

                    <div className="content">
                        {/* start left section */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Coupon code</label>
                                <BasicInput
                                    type="text"
                                    name="title"
                                />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Description (optional)</label>
                                <TextArea
                                    name="content"
                                    inputClass="textarea-input"
                                    rowNumber={6}
                                />
                            </div>
                        </div>

                        <div className="tab-titles">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className={`title ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <h2>{tab.label}</h2>
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

                    {/* {error && <p className="error-text">{error}</p>} */}
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
                    onPaginationChange={setPagination}
                    perPageOption={[10, 25, 50]}
                    typeCounts={[]}
                    realtimeFilter={[]}
                />
            </div>
        </>
    );
};

export default AllCoupon;
