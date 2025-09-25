/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import { Table, getApiLink, TableCell } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import EditQna from './editQna';

// QnA Row Type
type QnaRow = {
    id: number;
    product_id: number;
    product_name: string;
    product_link: string;
    question_text: string;
    answer_text: string | null;
    question_by: number;
    author_name: string;
    question_date: string;
    time_ago: string;
    total_votes: number;
    question_visibility: string;
};

const Qna: React.FC = () => {
    const dateRef = useRef<HTMLDivElement | null>(null);
    const [error, setError] = useState<string>();
    const [data, setData] = useState<QnaRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [viewQna, setViewQna] = useState(false);
    const [selectedQnaId, setSelectedQnaId] = useState<number | null>(null);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);

    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'qna'),
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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // if click is not on dropdown toggle or inside dropdown → close it
            if (!(e.target as HTMLElement).closest(".action-dropdown") &&
                !(e.target as HTMLElement).closest(".adminlib-more-vertical")) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'qna'),
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
                setError(__('Failed to load Q&A', 'multivendorx'));
                setData([]);
            });
    }

    // Refresh table when child updates
    const handleUpdated = () => {
        requestData(pagination.pageSize, pagination.pageIndex + 1);
    };

    const columns: ColumnDef<QnaRow>[] = [
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
            header: __('Product Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.product_name || ''}>
                    {row.original.product_name ? (
                        <a href={row.original.product_link} target="_blank" rel="noreferrer">
                            {row.original.product_name}
                        </a>
                    ) : (
                        '-'
                    )}
                </TableCell>
            ),
        },
        {
            header: __('Question', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.question_text || ''}>
                    {row.original.question_text ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Answer', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.answer_text || ''}>
                    {row.original.answer_text ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Asked By', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.author_name || ''}>
                    {row.original.author_name ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.question_date;
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
            header: __('Time Ago', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.time_ago || ''}>
                    {row.original.time_ago ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Votes', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={String(row.original.total_votes) || ''}>
                    {row.original.total_votes ?? 0}
                </TableCell>
            ),
        },
        {
            header: __('Visibility', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.question_visibility || ''}>
                    {row.original.question_visibility ?? '-'}
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
                                    setShowDropdown(showDropdown === row.original.id ? false : row.original.id)
                                }
                            ></i>
                            <div
                                className={`action-dropdown ${showDropdown === row.original.id
                                    ? 'show'
                                    : ''
                                    }`}
                            >
                                <ul>
                                    <li
                                        onClick={() => {
                                            setSelectedQnaId(row.original.id ?? null);
                                            setViewQna(true);
                                        }}
                                    >
                                        <i className="adminlib-eye"></i>
                                        {__('Edit', 'multivendorx')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TableCell>
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
                    handlePagination={requestData}
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                />
            </div>

            {viewQna && selectedQnaId !== null && (
                <EditQna
                    open={viewQna}
                    onClose={() => setViewQna(false)}
                    qnaId={selectedQnaId}
                    onUpdated={handleUpdated}  
                />
            )}
        </>
    );
};

export default Qna;
