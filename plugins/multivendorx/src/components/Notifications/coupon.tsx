/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, Table, TableCell } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type CouponRow = {
    id?: number;
    code?: string;
    amount?: string;
    discount_type?: string;
    status?: string;
    date_created?: string;
    meta_data?: Array<{ key: string; value: any }>;
};

const Coupons: React.FC = () => {
    const [data, setData] = useState<CouponRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [storeDataMap, setStoreDataMap] = useState<{ [key: number]: any }>({});

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    // Approve coupon (set status=publish)
    const handleSingleAction = (action: string, couponId: number) => {
        let newStatus = '';

        switch (action) {
            case 'approve_coupon':
                newStatus = 'publish'; // active coupon
                break;
            case 'reject_coupon':
                newStatus = 'trash'; // move to bin
                break;
            default:
                console.error('Unknown action:', action);
                return;
        }

        if (!couponId || !newStatus) {
            console.error('Invalid couponId or status for API call.');
            return;
        }

        axios.put(
            `${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`,
            { status: newStatus },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        )
            .then((response) => {
                console.log('Coupon status updated successfully:', response.data);
                requestData(pagination.pageSize, pagination.pageIndex + 1);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(`Failed to update status. Status: ${error.response.status}`, error.response.data);
                } else {
                    console.error('Failed to update status:', error.message);
                }
            });
    };



    // Fetch coupons with store_id filter and only "pending"
    function requestData(rowsPerPage = 10, currentPage = 1) {
        setData(null);

        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                per_page: rowsPerPage,
                meta_key: 'multivendorx_store_id',
                status: 'pending',
            },
        })
            .then(async (response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setTotalRows(totalCount);
                setPageCount(Math.ceil(totalCount / pagination.pageSize));

                const filtered = (response.data || []).filter((coupon: any) =>
                    coupon.meta_data?.some(meta => meta.key === 'multivendorx_store_id')
                );
                setData(filtered);

                // Extract unique store IDs
                const storeIds = filtered
                    .map(coupon => coupon.meta_data.find(m => m.key === 'multivendorx_store_id')?.value)
                    .filter(Boolean);
                const uniqueStoreIds = Array.from(new Set(storeIds));

                // Fetch store details using StoreSettings API (getApiLink)
                const storeMap: { [key: number]: any } = {};
                await Promise.all(uniqueStoreIds.map(async id => {
                    try {
                        const res = await axios.get(getApiLink(appLocalizer, `store/${id}`), {
                            headers: { 'X-WP-Nonce': appLocalizer.nonce },
                        });
                        storeMap[id] = res.data; // Save all store details
                    } catch {
                        storeMap[id] = null;
                    }
                }));

                setStoreDataMap(storeMap);
            })
            .catch(() => setData([]));
    }

    const getStoreData = (metaData: any[]) => {
        const storeMeta = metaData?.find(m => m.key === 'multivendorx_store_id');
        const storeId = storeMeta ? storeMeta.value : null;
        return storeId ? storeDataMap[storeId] : null;
    };


    const requestApiForData = (rowsPerPage: number, currentPage: number) => {
        setData(null);
        requestData(rowsPerPage, currentPage);
    };

    // Extract store_id from meta_data
    const getStoreId = (metaData: any[]) => {
        const storeMeta = metaData?.find((m) => m.key === 'multivendorx_store_id');
        return storeMeta ? storeMeta.value : '-';
    };

    // Columns
    const columns: ColumnDef<CouponRow>[] = [
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
            header: __('Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original?.code ?? '-'}>
                    {row.original?.id ? (
                        <a
                            href={`${appLocalizer.site_url}/wp-admin/post.php?post=${row.original.id}&action=edit`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {row.original.code}
                        </a>

                    ) : (
                        row.original?.code ?? '-'
                    )}
                </TableCell>
            ),
        },
        {
            header: __('Coupon Type', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original?.discount_type ?? '-'}>
                    {row.original?.discount_type ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Coupon Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original?.amount ?? '-'}>
                    {appLocalizer.currency_symbol}{row.original?.amount ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Duration', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.date_created;
                let formattedDate = '-';
                if (rawDate) {
                    const dateObj = new Date(rawDate);
                    formattedDate = new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }).format(dateObj);
                }
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            },
        },
        {
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => {
                const store = getStoreData(row.original?.meta_data ?? []);
                return (
                    <TableCell title={store?.name ?? '-'}>
                        {store?.name ?? '-'}
                    </TableCell>
                );
            },
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original?.status ?? '-'}>
                    {row.original?.status ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('Approve Coupon', 'multivendorx'),
                                icon: 'adminlib-check',
                                onClick: (rowData) => {
                                    handleSingleAction('approve_coupon', rowData.id!);
                                },
                                hover: true,
                            },
                            {
                                label: __('Reject Coupon', 'multivendorx'),
                                icon: 'adminlib-close',
                                onClick: (rowData) => {
                                    handleSingleAction('reject_coupon', rowData.id!);
                                },
                                hover: true,
                            },
                        ],
                    }}
                />
            ),
        }

    ];

    return (
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
            />
        </div>
    );
};

export default Coupons;
