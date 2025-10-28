/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, CommonPopup, CalendarInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { useLocation } from 'react-router-dom';
import ViewCommission from './viewCommission';

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
                startDate,
                endDate
            },
        })
            .then((response) => {
                setData(response.data.commissions || []);
                setCommissionStatus([
                    {
                        key: 'all',
                        name: 'All',
                        count: response.data.all || 0,
                    },
                    {
                        key: 'paid',
                        name: 'Paid',
                        count: response.data.paid || 0,
                    },
                    {
                        key: 'refunded',
                        name: 'Refunded',
                        count: response.data.refunded || 0,
                    },
                    {
                        key: 'partially_refunded',
                        name: 'Partially Refunded',
                        count: response.data.partially_refunded || 0,
                    },
                    {
                        key: 'cancelled',
                        name: 'Cancelled',
                        count: response.data.cancelled || 0,
                    },
                ]);
            })
            .catch(() => {
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
        {
        name: 'exportAll',
        render: () => (
            <i className="adminlib-more-vertical"></i>
        ),
    },
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

                // Note: We don't send page/row params to get ALL data
                // Note: We don't send IDs since this is for all filtered data

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
                className="admin-btn btn-purple"
            >
                <i className="adminlib-export"></i>
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
        console.log(filterData);
        setCurrentFilterData(filterData);
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.store,
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
            accessorKey: 'id',
            accessorFn: row => parseFloat(row.id || '0'),
            enableSorting: true,
            header: __('ID', 'multivendorx'),
            cell: ({ row }) => <TableCell >#{row.original.id}</TableCell>,
        },
        {
            id: 'orderId',
            accessorKey: 'orderId',
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
                            <a href={url} target="_blank" rel="noopener noreferrer" className="order-link">
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
            id: 'totalOrderAmount',
            accessorKey: 'totalOrderAmount',
            accessorFn: row => parseFloat(row.totalOrderAmount || '0'),
            enableSorting: true,
            header: __('Order Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.totalOrderAmount ? `${appLocalizer.currency_symbol}${row.original.totalOrderAmount}` : '-'}>{row.original.totalOrderAmount ? `${appLocalizer.currency_symbol}${row.original.totalOrderAmount}` : '-'}</TableCell>,
        },
        {
            id: 'commissionAmount',
            accessorKey: 'commissionAmount',
            accessorFn: row => parseFloat(row.commissionAmount || '0'),
            enableSorting: true,
            header: __('Commi.. Earned', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.commissionAmount ? `${appLocalizer.currency_symbol}${row.original.commissionAmount}` : '-'}>{row.original.commissionAmount ? `${appLocalizer.currency_symbol}${row.original.commissionAmount}` : '-'}</TableCell>,
        },
        {
            id: 'facilitatorFee',
            accessorKey: 'facilitatorFee',
            accessorFn: row => parseFloat(row.facilitatorFee || '0'),
            enableSorting: true,
            header: __('Facilitator Fee', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.facilitatorFee ? `${appLocalizer.currency_symbol}${row.original.facilitatorFee}` : '-'}>{row.original.facilitatorFee ? `${appLocalizer.currency_symbol}${row.original.facilitatorFee}` : '-'}</TableCell>,
        },
        {
            id: 'gatewayFee',
            accessorKey: 'gatewayFee',
            accessorFn: row => parseFloat(row.gatewayFee || '0'),
            enableSorting: true,
            header: __('Gateway Fee', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.gatewayFee ? `${appLocalizer.currency_symbol}${row.original.gatewayFee}` : '-'}>{row.original.gatewayFee ? `${appLocalizer.currency_symbol}${row.original.gatewayFee}` : '-'}</TableCell>,
        },
        {
            id: 'shippingAmount',
            accessorKey: 'shippingAmount',
            accessorFn: row => parseFloat(row.shippingAmount || '0'),
            enableSorting: true,
            header: __('Shipping Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.shippingAmount ? `${appLocalizer.currency_symbol}${row.original.shippingAmount}` : '-'}>{row.original.shippingAmount ? `${appLocalizer.currency_symbol}${row.original.shippingAmount}` : '-'}</TableCell>,
        },
        {
            id: 'taxAmount',
            accessorKey: 'taxAmount',
            accessorFn: row => parseFloat(row.taxAmount || '0'),
            enableSorting: true,
            header: __('Tax Amount', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.taxAmount ? `${appLocalizer.currency_symbol}${row.original.taxAmount}` : '-'}>{row.original.taxAmount ? `${appLocalizer.currency_symbol}${row.original.taxAmount}` : '-'}</TableCell>,
        },
        {
            id: 'commissionTotal',
            accessorKey: 'commissionTotal',
            accessorFn: row => parseFloat(row.commissionTotal || '0'),
            enableSorting: true,
            header: __('Commi.. Total', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.commissionTotal ? `${appLocalizer.currency_symbol}${row.original.commissionTotal}` : '-'}>{row.original.commissionTotal ? `${appLocalizer.currency_symbol}${row.original.commissionTotal}` : '-'}</TableCell>,
        },
        {
            header: __('Paid Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || '-'}>
                    <span className={`admin-badge ${row.original.status === 'paid' ? 'green' : 'red'}`}>
                        {row.original.status
                            ? row.original.status.charAt(0).toLocaleUpperCase() + row.original.status.slice(1)
                            : '-'}

                    </span>
                </TableCell>
            ),
        },
        {
            id: 'createdAt',

            accessorKey: 'createdAt',
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
                    <TableCell title={`${formattedDate}` }>
                        {formattedDate}
                        
                    </TableCell>
                );
            },
        },
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
                                icon: 'adminlib-eye',
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