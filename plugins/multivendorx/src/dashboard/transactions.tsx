import React, { useState, useEffect } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { getApiLink, Table, TableCell } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import TransactionDetailsModal from "./TransactionDetailsModal";

type TransactionRow = {
    id: number;
    date: string;
    order_details: string;
    transaction_type: string;
    payment_mode: string;
    credit: number;
    debit: number;
    balance: number;
    status: string;
};

const Transactions: React.FC = () => {
    const [data, setData] = useState<TransactionRow[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [modalTransaction, setModalTransaction] = useState<TransactionRow | null>(null);

    function requestTransactions(rowsPerPage = 10, currentPage = 1) {
        axios({
            method: "GET",
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                row: rowsPerPage,
                page: currentPage,
                store_id: appLocalizer.store_id,
            },
        }).then(response => {
            setData(response.data || []);
        });
    }

    useEffect(() => {
        requestTransactions(pagination.pageSize, pagination.pageIndex + 1);
    }, [pagination]);

    const columns: ColumnDef<TransactionRow>[] = [
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.date;
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
            header: __("Order Details", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.order_details}</TableCell>,
        },
        {
            header: __("Transaction Type", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.transaction_type}</TableCell>,
        },
        {
            header: __("Payment Mode", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.payment_mode}</TableCell>,
        },
        {
            header: __("Credit", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>{Number(row.original.credit || 0).toFixed(2)}</TableCell>
            ),
        },
        {
            header: __("Debit", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>{Number(row.original.debit || 0).toFixed(2)}</TableCell>
            ),
        },
        {
            header: __("Balance", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>{Number(row.original.balance || 0).toFixed(2)}</TableCell>
            ),
        },
        {
            header: __("Status", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.status}</TableCell>,
        },
        {
            header: __("Action", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    <button
                        className="button button-primary"
                        onClick={() => setModalTransaction(row.original)}
                    >
                        {__("View", "multivendorx")}
                    </button>
                </TableCell>
            ),
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
                handlePagination={requestTransactions}
                perPageOption={[10, 25, 50]}
            />

            {modalTransaction && (
                <TransactionDetailsModal
                    transaction={modalTransaction}
                    onClose={() => setModalTransaction(null)}
                />
            )}
        </div>
    );
};

export default Transactions;
