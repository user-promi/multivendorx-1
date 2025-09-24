/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
};

const Products: React.FC = ({ onUpdated }) => {

    const [data, setData] = useState<StoreRow[] | null>(null);

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
    const handleSingleAction = (action: string, productId: number) => {
        if (!productId) return;

        let statusUpdate: string | null = null;

        switch (action) {
            case 'approve_product':
                statusUpdate = 'publish';
                break;
            case 'reject_product':
                statusUpdate = 'trash';
                break;
            default:
                statusUpdate = null;
                break;
        }

        // Only call API if statusUpdate is set
        if (statusUpdate) {
            axios.post(
                `${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
                { status: statusUpdate },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            )
                .then(() => {
                    console.log(`Product ${productId} status updated to ${statusUpdate}`);
                    onUpdated?.();
                    requestData(pagination.pageSize, pagination.pageIndex + 1);
                })
                .catch((err) => {
                    console.error('Failed to update product', err);
                });
        }
    };


    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/products`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,      // WooCommerce page param
                per_page: rowsPerPage,  // WC uses per_page instead of row
                meta_key: 'multivendorx_store_id',
                status: 'pending'
            },
        })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setTotalRows(totalCount);
                setPageCount(Math.ceil(totalCount / pagination.pageSize));
                setData(response.data || []);
            })
            .catch(() => {
                setData([]);
            });
    }

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
        );
    };

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
            header: __('Product', 'multivendorx'),
            cell: ({ row }) => {
                const product = row.original;
                const image =
                    product.images && product.images.length > 0
                        ? product.images[0].src
                        : 'https://via.placeholder.com/50'; // fallback image

                return (
                    <TableCell title={product.name || ''}>
                        <a
                            href={`${appLocalizer.site_url}/wp-admin/post.php?post=${product.id}&action=edit`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2"
                        >
                            <img
                                src={image}
                                alt={product.name}
                                style={{ width: 40, height: 40, objectFit: 'cover' }}
                            />
                            <span>{product.name || '-'}</span>
                        </a>
                    </TableCell>

                );
            },
        },
        {
            header: __('Category', 'multivendorx'),
            cell: ({ row }) => {
                const categories = row.original.categories || [];
                return (
                    <TableCell
                        title={categories.map((c) => c.name).join(', ') || '-'}
                    >
                        {categories.length > 0
                            ? categories.map((c) => c.name).join(', ')
                            : '-'}
                    </TableCell>
                );
            },
        },
        {
            header: __('SKU', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.sku || ''}>
                    {row.original.sku || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Price', 'multivendorx'),
            cell: ({ row }) => {
                const priceHtml = row.original.price_html || '';
                return (
                    <TableCell title={row.original.price || ''}>
                        {priceHtml ? (
                            <span
                                dangerouslySetInnerHTML={{ __html: priceHtml }}
                            />
                        ) : (
                            '-'
                        )}
                    </TableCell>
                );
            },
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
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('Approve Product', 'multivendorx'),
                                icon: 'adminlib-check',
                                onClick: (rowData) => handleSingleAction('approve_product', rowData.id!),
                                hover: true,
                            },
                            {
                                label: __('Reject Product', 'multivendorx'),
                                icon: 'adminlib-close',
                                onClick: (rowData) => handleSingleAction('reject_product', rowData.id!),
                                hover: true,
                            },
                        ],
                    }}
                />
            ),
        }
    ];

    return (
        <>
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
        </>
    );
};

export default Products;
