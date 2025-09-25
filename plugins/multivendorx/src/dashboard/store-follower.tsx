import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { getApiLink, Table, TableCell } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";

type FollowerRow = {
    id: number;
    name: string;
    email: string;
};

const StoreFollower: React.FC = () => {
    const [data, setData] = useState<FollowerRow[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState(0);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, follower: 'follower', store_id: appLocalizer.store_id },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => {
                console.log(__('Failed to load total rows', 'multivendorx'));
            });
    }, []);
    const requestFollowers = (rowsPerPage = 10, currentPage = 1) => {
        axios({
            method: "GET",
            url: getApiLink(appLocalizer, 'store'),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                store_id: appLocalizer.store_id,
                page: currentPage,
                row: rowsPerPage,
                follower: 'follower'
            },
        }).then(response => {
            setData(response.data || []);
        });
    };

    useEffect(() => {
        requestFollowers(pagination.pageSize, pagination.pageIndex + 1);
    }, [pagination]);

    const columns: ColumnDef<FollowerRow>[] = [
        {
            header: __("ID", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.id}</TableCell>,
        },
        {
            header: __("Name", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.name}</TableCell>,
        },
        {
            header: __("Email", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.email}</TableCell>,
        },
    ];

    return (
        <div className="admin-table-wrapper">
            <Table
                data={data}
                columns={columns as ColumnDef<Record<string, any>, any>[]}
                rowSelection={{}}
                onRowSelectionChange={() => { }}
                defaultRowsPerPage={10}
                pageCount={Math.ceil(data.length / pagination.pageSize)}
                pagination={pagination}
                onPaginationChange={setPagination}
                handlePagination={requestFollowers}
                perPageOption={[10, 25, 50]}
                totalCounts={totalRows}
            />
        </div>
    );
};

export default StoreFollower;
