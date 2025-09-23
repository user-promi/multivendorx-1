/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type CouponRow = {
    id?: number;
    code?: string;
    amount?: string;
    description?: string;
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

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    // Approve coupon (publish it)
    const handleSingleAction = (action: string, couponId: number) => {
        if (action === 'approve_coupon') {
            axios.put(
                `${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`,
                { status: 'publish' },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            )
                .then(() => {
                    requestData(pagination.pageSize, pagination.pageIndex + 1);
                })
                .catch((err) => {
                    console.error('Failed to approve coupon', err);
                });
        }
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
                status: 'pending', //only pending coupons
            },
        })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setTotalRows(totalCount);
                setPageCount(Math.ceil(totalCount / pagination.pageSize));

                //keep only coupons that have multivendorx_store_id in meta
                const filtered = (response.data || []).filter((coupon: any) =>
                    coupon.meta_data?.some(
                        (meta: any) => meta.key === 'multivendorx_store_id'
                    )
                );
                setData(filtered);
            })
            .catch(() => {
                setData([]);
            });
    }

    const requestApiForData = (rowsPerPage: number, currentPage: number) => {
        setData(null);
        requestData(rowsPerPage, currentPage);
    };

    //Columns
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
            header: __('Code', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original?.code ?? '-'}>
                    {row.original?.code ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original?.amount ?? '-'}>
                    {row.original?.amount ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Description', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original?.description ?? '-'}>
                    {row.original?.description ?? '-'}
                </TableCell>
            ),
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
                        ],
                    }}
                />
            ),
        },
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
