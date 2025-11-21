/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, useModules, CalendarInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { useLocation } from 'react-router-dom';
import ViewCommission from './viewCommission';
import { formatCurrency } from '../../services/commonFunction';

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}

// Type declarations
type CommissionStatus = {
    key: string;
    name: string;
    count: number;
};

type CommissionRow = {
    createdAt: string;
    id?: number;
    orderId?: number;
    storeId?: number;
    storeName?: string;
    commissionAmount?: string;
    shipping?: string;
    tax?: string;
    commissionTotal?: string;
    commissionRefunded?: string;
    paidStatus?: 'paid' | 'unpaid' | string;
    commissionNote?: string | null;
    createTime?: string;
    // Add other fields that might be needed for CSV
    totalOrderAmount?: string;
    facilitatorFee?: string;
    marketplaceFee?: string;
    gatewayFee?: string;
    shippingAmount?: string;
    taxAmount?: string;
    status?: string;
};

type FilterData = {
    searchAction?: string;
    searchField?: string;
    typeCount?: any;
    store?: string;
    order?: any;
    orderBy?: any;
    date?: {
        start_date: Date;
        end_date: Date;
    };
};

// CSV Download Button Component
const DownloadCSVButton: React.FC<{
    selectedRows: RowSelectionState;
    data: CommissionRow[] | null;
    filterData: FilterData;
    isLoading?: boolean;
}> = ({ selectedRows, data, filterData, isLoading = false }) => {
    const [isDownloading, setIsDownloading] = useState(false);


    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Get selected row IDs
            const selectedIds = Object.keys(selectedRows)
                .filter(key => selectedRows[key])
                .map(key => {
                    const rowIndex = parseInt(key);
                    return data?.[rowIndex]?.id;
                })
                .filter(id => id !== undefined);

            // Prepare parameters for CSV download
            const params: any = {
                format: 'csv',
                startDate: filterData?.date?.start_date ? filterData.date.start_date.toISOString().split('T')[0] : '',
                endDate: filterData?.date?.end_date ? filterData.date.end_date.toISOString().split('T')[0] : '',
            };

            // Add filters if present
            if (filterData?.store) {
                params.store_id = filterData.store;
            }
            if (filterData?.typeCount && filterData.typeCount !== 'all') {
                params.status = filterData.typeCount;
            }

            // If specific rows are selected, send their IDs
            if (selectedIds.length > 0) {
                params.ids = selectedIds.join(',');
            }

            // Make API request for CSV
            const response = await axios({
                method: 'GET',
                url: getApiLink(appLocalizer, 'commission'),
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Accept': 'text/csv'
                },
                params: params,
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `commissions_${timestamp}.csv`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert(__('Failed to download CSV. Please try again.', 'multivendorx'));
        } finally {
            setIsDownloading(false);
        }
    };

    const hasSelectedRows = Object.keys(selectedRows).some(key => selectedRows[key]);

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading || isLoading || (!hasSelectedRows && !data)}
            className="button"
        >
            Download CSV
        </button>
    );
};

// Bulk Actions Component
const BulkActions: React.FC<{
    selectedRows: RowSelectionState;
    data: CommissionRow[] | null;
    filterData: FilterData;
    onActionComplete?: () => void;
}> = ({ selectedRows, data, filterData, onActionComplete }) => {
    return (
        <div>
            <DownloadCSVButton
                selectedRows={selectedRows}
                data={data}
                filterData={filterData}
            />
            {/* Add other bulk actions here if needed */}
        </div>
    );
};

const Commission: React.FC = () => {
    const [error, setError] = useState<String>();
    const [data, setData] = useState<CommissionRow[] | null>(null);
    const [store, setStore] = useState<any[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [viewCommission, setViewCommission] = useState(false);
    const [selectedCommissionId, setSelectedCommissionId] = useState<number | null>(null);
    const [currentFilterData, setCurrentFilterData] = useState<FilterData>({});
    const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
    const { modules } = useModules();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [commissionStatus, setCommissionStatus] = useState<CommissionStatus[] | null>(null);
    const [pageCount, setPageCount] = useState(0);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setStore(response.data.stores);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setStore([]);
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
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

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        typeCount = '',
        store = '',
        orderBy = '',
        order = '',
        startDate = new Date(0),
        endDate = new Date(),
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === 'all' ? '' : typeCount,
                store_id: store,
                orderBy,
                order,
                startDate,
                endDate
            },
        })
            .then((response) => {
                setData(response.data.commissions || []);

                const statuses = [
                    { key: 'all', name: 'All', count: response.data.all || 0 },
                    { key: 'paid', name: 'Paid', count: response.data.paid || 0 },
                    { key: 'unpaid', name: 'Unpaid', count: response.data.unpaid || 0 },
                    { key: 'refunded', name: 'Refunded', count: response.data.refunded || 0 },
                    { key: 'partially_refunded', name: 'Partially Refunded', count: response.data.partially_refunded || 0 },
                    { key: 'cancelled', name: 'Cancelled', count: response.data.cancelled || 0 },
                ];

                // Remove items where count === 0
                setCommissionStatus(statuses.filter(status => status.count > 0));
            }).catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setData([]);
            });
    }

    const actionButton: RealtimeFilter[] = [
        {
            name: 'actionButton',
            render: () => (
                <>
                    <ExportAllCSVButton
                        filterData={currentFilterData}
                    />
                </>
            ),
        },
        // {
        //     name: 'exportAll',
        //     render: () => (
        //         <div className="action-icons">
        //             <i className="adminlib-more-vertical"></i>
        //         </div>
        //     ),
        // },
    ];

    // Export All CSV Button Component - Downloads ALL filtered data
    const ExportAllCSVButton: React.FC<{
        filterData: FilterData;
    }> = ({ filterData }) => {
        const [isDownloading, setIsDownloading] = useState(false);

        const handleExportAll = async () => {
            setIsDownloading(true);
            try {
                // Prepare parameters for CSV download - NO pagination params
                const params: any = {
                    format: 'csv',
                    startDate: filterData?.date?.start_date ? filterData.date.start_date.toISOString().split('T')[0] : '',
                    endDate: filterData?.date?.end_date ? filterData.date.end_date.toISOString().split('T')[0] : '',
                };

                // Add filters if present
                if (filterData?.store) {
                    params.store_id = filterData.store;
                }
                if (filterData?.typeCount && filterData.typeCount !== 'all') {
                    params.status = filterData.typeCount;
                }

                // Make API request for CSV
                const response = await axios({
                    method: 'GET',
                    url: getApiLink(appLocalizer, 'commission'),
                    headers: {
                        'X-WP-Nonce': appLocalizer.nonce,
                        'Accept': 'text/csv'
                    },
                    params: params,
                    responseType: 'blob'
                });

                // Create download link
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;

                // Generate filename with timestamp
                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `commissions_all_${timestamp}.csv`;
                link.setAttribute('download', filename);

                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

            } catch (error) {
                console.error('Error downloading CSV:', error);
                alert(__('Failed to download CSV. Please try again.', 'multivendorx'));
            } finally {
                setIsDownloading(false);
            }
        };

        return (
            <button
                onClick={handleExportAll}
                disabled={isDownloading}
                className="admin-btn btn-purple-bg"
            >
                <span className="adminlib-import"></span>
                Export Commissions
            </button>
        );
    };

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        setCurrentFilterData(filterData);
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.store,
            filterData?.orderBy,
            filterData?.order,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };
    // Column definitions (your existing columns remain the same)
    const columns: ColumnDef<CommissionRow>[] = [
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
            id: 'id',
            accessorKey: 'ID',
            enableSorting: true,
            header: __('ID', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    <span
                        className="link-item"
                        onClick={() => {
                            setSelectedCommissionId(row.original.id ?? null);
                            setViewCommission(true);
                        }}
                    >
                        #{row.original.id}
                    </span>
                </TableCell>
            )
        },
        {
            id: 'order_id',
            accessorKey: 'order_id',
            enableSorting: true,
            header: __('Order', 'multivendorx'),
            cell: ({ row }) => {
                const orderId = row.original.orderId;
                const url = orderId
                    ? `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${orderId}&action=edit`
                    : '#';

                return (
                    <TableCell title={orderId ? `#${orderId}` : '-'}>
                        {orderId ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="link-item">
                                #{orderId} - {row.original.storeName || '-'}
                            </a>
                        ) : (
                            '-'
                        )}
                    </TableCell>
                );
            },
        },
        {
            id: 'total_order_amount',
            accessorKey: 'total_order_amount',
            enableSorting: true,
            header: __('Order Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.totalOrderAmount ? `${row.original.totalOrderAmount}` : '-'}>{formatCurrency(row.original.totalOrderAmount)}</TableCell>,
        },
        // {
        //     id: 'commission-summary',
        //     enableSorting: true,
        //     header: __('Commission Summary', 'multivendorx'),
        //     cell: ({ row }) => {
        //         const isExpanded = expandedRows[row.original.id!];

        //         return (
        //             <TableCell>
        //                 <ul className={`details ${isExpanded ? '' : 'overflow'}`}>
        //                     <li>
        //                         <div className="item">
        //                             <div className="des">Commission Earned</div>
        //                             <div className="title">{formatCurrency(row.original.commissionAmount)}</div>
        //                         </div>
        //                     </li>

        //                     <li>
        //                         <div className="item">
        //                             <div className="des">Shipping</div>
        //                             <div className="title">+ {formatCurrency(row.original.shippingAmount)}</div>
        //                         </div>
        //                         <div className="item">
        //                             <div className="des">Tax</div>
        //                             <div className="title">+ {formatCurrency(row.original.taxAmount)}</div>
        //                         </div>
        //                     </li>

        //                     <li>
        //                         {modules.includes('marketplace-gateway') && (
        //                             <div className="item">
        //                                 <div className="des">Gateway Fee</div>
        //                                 <div className="title">- {formatCurrency(row.original.gatewayFee)}</div>
        //                             </div>
        //                         )}
        //                         {modules.includes('facilitator') && (
        //                             <div className="item">
        //                                 <div className="des">Facilitator Fee</div>
        //                                 <div className="title">- {formatCurrency(row.original.facilitatorFee)}</div>
        //                             </div>
        //                         )}
        //                         {modules.includes('marketplace-fee') && (
        //                             <div className="item">
        //                                 <div className="des">Marketplace Fee</div>
        //                                 <div className="title">- {formatCurrency(row.original.marketplaceFee)}</div>
        //                             </div>
        //                         )}
        //                     </li>

        //                     <span
        //                         className="more-btn"
        //                         onClick={() =>
        //                             setExpandedRows(prev => ({
        //                                 ...prev,
        //                                 [row.original.id!]: !prev[row.original.id!]
        //                             }))
        //                         }
        //                     >
        //                         {isExpanded ? (
        //                             <>Less <i className="adminlib-arrow-up"></i></>
        //                         ) : (
        //                             <>More <i className="adminlib-arrow-down"></i></>
        //                         )}
        //                     </span>
        //                 </ul>
        //             </TableCell>
        //         );
        //     },
        // },
        // {
        //     id: 'commission_total',
        //     accessorKey: 'commission_total',
        //     enableSorting: true,
        //     header: __('Total Earned', 'multivendorx'),
        //     cell: ({ row }) => <TableCell title={''}>{formatCurrency(row.original.commissionTotal)}</TableCell>,
        // },
        {
            id: 'commission-summary',
            enableSorting: true,
            header: __('Commission Summary', 'multivendorx'),
            cell: ({ row }) => {
                const isExpanded = expandedRows[row.original.id!];

                return (
                    <TableCell>
                        <ul className={`details ${isExpanded ? '' : 'overflow'}`}>

                            <li>
                                <div className="item">
                                    <div className="des">Commission Earned</div>
                                    <div className="title">
                                        {formatCurrency(row.original.storeEarning)}
                                    </div>
                                </div>
                            </li>

                            <li>
                                {modules.includes('store-shipping') && (
                                    <div className="item">
                                        <div className="des">Shipping</div>
                                        <div className="title">
                                            + {formatCurrency(row.original.shippingAmount)}
                                        </div>
                                    </div>
                                )}
                                {appLocalizer.tax && (
                                    <div className="item">
                                        <div className="des">Tax</div>
                                        <div className="title">
                                            + {formatCurrency(row.original.taxAmount)}
                                        </div>
                                    </div>
                                )}

                            </li>

                            <li>
                                {modules.includes('marketplace-gateway') && (
                                    <div className="item">
                                        <div className="des">Gateway Fee</div>
                                        <div className="title">
                                            - {formatCurrency(row.original.gatewayFee)}
                                        </div>
                                    </div>
                                )}

                                {modules.includes('facilitator') && (
                                    <div className="item">
                                        <div className="des">Facilitator Fee</div>
                                        <div className="title">
                                            - {formatCurrency(row.original.facilitatorFee)}
                                        </div>
                                    </div>
                                )}

                                {modules.includes('marketplace-fee') && (
                                    <div className="item">
                                        <div className="des">Marketplace Fee</div>
                                        <div className="title">
                                            - {formatCurrency(row.original.marketplaceFee)}
                                        </div>
                                    </div>
                                )}
                            </li>

                            <span
                                className="more-btn"
                                onClick={() =>
                                    setExpandedRows(prev => ({
                                        ...prev,
                                        [row.original.id!]: !prev[row.original.id!]
                                    }))
                                }
                            >
                                {isExpanded ? (
                                    <>Less <i className="adminlib-arrow-up"></i></>
                                ) : (
                                    <>More <i className="adminlib-arrow-down"></i></>
                                )}
                            </span>
                        </ul>
                    </TableCell>
                );
            },
        },
        {
            id: 'store_payable',
            accessorKey: 'store_payable',
            enableSorting: true,
            header: __('Total Earned', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={''}>
                    {formatCurrency(row.original.storePayable)}
                </TableCell>
            ),
        },
        {
            header: __('Paid Status', 'multivendorx'),
            cell: ({ row }) => {
                const status = row.original.status || '';
                const formattedStatus = status
                    ?.replace(/[-_]/g, " ")
                    .toLowerCase()
                    .replace(/^\w/, c => c.toUpperCase());

                const getStatusBadge = (status: string) => {
                    switch (status) {
                        case 'paid':
                            return <span className="admin-badge green">Paid</span>;
                        case 'unpaid':
                            return <span className="admin-badge red">Unpaid</span>;
                        case 'Refunded':
                            return <span className="admin-badge red">Unpaid</span>;
                        // default:
                        //     return <span className="admin-badge yellow">{formattedStatus}</span>;
                    }
                };

                return (
                    <TableCell title={`${status}`}>
                        {getStatusBadge(status)}
                    </TableCell>
                );
            },
        },
        {
            id: 'created_at',
            accessorKey: 'created_at',
            enableSorting: true,
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => {
                const date = row.original.createdAt;
                if (!date) return <TableCell>-</TableCell>;

                // Format the date for display
                const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                return (
                    <TableCell title={`${formattedDate}`}>
                        {formattedDate}

                    </TableCell>
                );
            },
        },
        // {
        //     id: 'action',
        //     header: __('Action', 'multivendorx'),
        //     cell: ({ row }) => (
        //         <TableCell>
        //             <div
        //                 className="admin-badge yellow hover"
        //                 role="button"
        //                 tabIndex={0}
        //                 onClick={() => {
        //                     const rowData: any = row.original;
        //                     setSelectedCommissionId(rowData.id ?? null);
        //                     setViewCommission(true);
        //                 }}
        //             >
        //                 <i className="adminlib-eye"></i>
        //             </div>
        //         </TableCell>
        //     ),
        // }
        {
            id: 'action',
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('View Commission', 'multivendorx'),
                                icon: 'adminlib-preview',
                                onClick: (rowData: any) => {
                                    setSelectedCommissionId(rowData.id ?? null);
                                    setViewCommission(true);
                                },
                                hover: true,
                            },
                            {
                                label: __('Regenerate Commission', 'multivendorx'),
                                icon: 'adminlib-refresh',
                                onClick: (rowData: any) => {
                                    if (rowData?.orderId) {
                                        const url = `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/admin.php?page=wc-orders&action=edit&id=${rowData.orderId}`;
                                        window.open(url, '_blank');
                                    } else {
                                        alert(__('Order ID missing for this commission.', 'multivendorx'));
                                    }
                                },

                                hover: true,
                            },
                        ],
                    }}
                />
            ),
        }
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'store',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="store"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">All Store</option>
                        {store?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.store_name.charAt(0).toUpperCase() + s.store_name.slice(1)}
                            </option>
                        ))}
                    </select>

                </div>
            ),
        },
        {
            name: 'date',
            render: (updateFilter) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range: any) => {
                            updateFilter('date', {
                                start_date: range.startDate,
                                end_date: range.endDate,
                            });
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-commission"
                tabTitle="Commissions"
                description={'Details of commissions earned by each store for every order, including order amount, commission rate, and payout status.'}
            />
            <div className="general-wrapper">
                <div className="admin-table-wrapper">
                    <Table
                        data={data}
                        columns={columns as ColumnDef<Record<string, any>, any>[]}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        defaultRowsPerPage={10}
                        realtimeFilter={realtimeFilter}
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        handlePagination={requestApiForData}
                        perPageOption={[10, 25, 50]}
                        typeCounts={commissionStatus as CommissionStatus}
                        bulkActionComp={() => (
                            <BulkActions
                                selectedRows={rowSelection}
                                data={data}
                                filterData={currentFilterData}
                            />
                        )}
                        totalCounts={totalRows}
                        actionButton={actionButton}
                    />
                </div>
            </div>
            {viewCommission && selectedCommissionId !== null && (
                <ViewCommission
                    open={viewCommission}
                    onClose={() => setViewCommission(false)}
                    commissionId={selectedCommissionId}
                />
            )}
        </>
    );
};

export default Commission;