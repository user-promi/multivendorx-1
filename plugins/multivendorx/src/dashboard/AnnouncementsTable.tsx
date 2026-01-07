import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type AnnouncementForm = {
	title: string;
	url: string;
	content: string;
	stores: number[];
	status: 'draft' | 'pending' | 'publish';
};

const AnnouncementsTable = (React.FC = () => {
    const [data, setData] = useState<AnnouncementForm[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
			url: getApiLink(appLocalizer, 'announcement'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				store_id: appLocalizer.store_id,
				count: true
			},
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
    function requestData(rowsPerPage = 10, currentPage = 1, typeCount = '') {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'announcement'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                store_id: appLocalizer?.store_id,
            },
        })
            .then((response) => {
                setData(response.data.items || []);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setData([]);
            });
    }
    console.log('data', data)

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number
        // filterData: FilterData
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage
            // filterData?.typeCount,
        );
    };

    // Column definitions with sorting enabled
    const columns: ColumnDef<AnnouncementForm>[] = [
        {
            header: __('Title', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title}
                </TableCell>
            ),
        },
        {
            header: __('Content', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.content || ''}>
                    {row.original.content}
                </TableCell>
            ),
        },
        {
            id: 'status',
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => {
                return (
                    <TableCell
                        title={'status'}
                        type="status"
                        status={row.original.status}
                        children={undefined}
                    />
                );
            },
        },
        {
            header: __('Recipients', 'multivendorx'),
            cell: ({ row }) => {
                const storeString = row.original.store_name;

                // 🔹 If store_name is empty, null, or undefined → show All Stores
                if (!storeString) {
                    return (
                        <TableCell title={'stores'}>
                            {__('All Stores', 'multivendorx')}
                        </TableCell>
                    );
                }

                // 🔹 Otherwise, split and format store names
                const stores = storeString.split(',').map((s) => s.trim());
                let displayStores = stores;

                if (stores.length > 2) {
                    displayStores = [...stores.slice(0, 2), '...'];
                }

                return (
                    <TableCell title={stores.join(', ')}>
                        {displayStores.join(', ')}
                    </TableCell>
                );
            },
        },
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.date || ''}>
                    {row.original.date || ''}
                </TableCell>
            ),
        },
    ];

    return (
        <>
            {error && <div className="error-notice">{error}</div>}
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
        </>
    );
});

export default AnnouncementsTable;
