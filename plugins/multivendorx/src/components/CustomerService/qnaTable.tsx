/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import { Table, getApiLink, TableCell, CalendarInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import EditQna from './editQna';
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}
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
    const [error, setError] = useState<string>();
    const [data, setData] = useState<QnaRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);

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
        startDate =new Date(0),
        endDate = new Date(),
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'qna'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                startDate ,
                endDate
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
    
    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };

    // Refresh table when child updates
    const handleUpdated = () => {
        requestData(pagination.pageSize, pagination.pageIndex + 1);
    };

    const columns: ColumnDef<QnaRow>[] = [
        { 
            id: 'select', 
            header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />, 
            cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} /> 
        },
        { 
            header: __('Product Name', 'multivendorx'), 
            cell: ({ row }) => (
                <TableCell title={row.original.product_name || ''}>
                    {row.original.product_name ? (
                        <a href={row.original.product_link} target="_blank" rel="noreferrer">{row.original.product_name}</a>
                    ) : '-'}
                </TableCell>
            )
        },
        { 
            header: __('Question', 'multivendorx'), 
            cell: ({ row }) => {
                const text = row.original.question_text ?? '-';
                const displayText = text.length > 50 ? text.slice(0, 50) + '…' : text;
                return <TableCell title={text}>{displayText}</TableCell>;
            } 
        },
        { 
            header: __('Answer', 'multivendorx'), 
            cell: ({ row }) => {
                const text = row.original.answer_text ?? '-';
                const displayText = text.length > 50 ? text.slice(0, 50) + '…' : text;
                return <TableCell title={text}>{displayText}</TableCell>;
            } 
        },
        { 
            header: __('Asked By', 'multivendorx'), 
            cell: ({ row }) => <TableCell title={row.original.author_name || ''}>{row.original.author_name ?? '-'}</TableCell> 
        },
        { 
            header: __('Date', 'multivendorx'), 
            accessorFn: row => row.question_date ? new Date(row.question_date).getTime() : 0, // numeric timestamp for sorting
            enableSorting: true,
            cell: ({ row }) => {
                const rawDate = row.original.question_date;
                const formattedDate = rawDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(rawDate)) : '-';
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            } 
        },
        { 
            header: __('Time Ago', 'multivendorx'),
            accessorFn: row => {
                // Parse "2 weeks ago", "3 days ago", etc., to approximate days
                const str = row.time_ago || '';
                const parts = str.split(' ');
                if(parts.length < 2) return 0;
                const value = parseInt(parts[0]) || 0;
                const unit = parts[1].toLowerCase();
                switch(unit) {
                    case 'minute':
                    case 'minutes': return value / 60; // fraction of hour
                    case 'hour':
                    case 'hours': return value; // in hours
                    case 'day':
                    case 'days': return value * 24; // in hours
                    case 'week':
                    case 'weeks': return value * 24 * 7;
                    case 'month':
                    case 'months': return value * 24 * 30;
                    case 'year':
                    case 'years': return value * 24 * 365;
                    default: return 0;
                }
            },
            enableSorting: true,
            cell: ({ row }) => <TableCell title={row.original.time_ago || ''}>{row.original.time_ago ?? '-'}</TableCell>
        },
        { 
            header: __('Votes', 'multivendorx'), 
            cell: ({ row }) => <TableCell title={String(row.original.total_votes) || ''}>{row.original.total_votes ?? 0}</TableCell> 
        },
        { 
            header: __('Visibility', 'multivendorx'), 
            cell: ({ row }) => <TableCell title={row.original.question_visibility || ''}>{row.original.question_visibility ?? '-'}</TableCell> 
        },
        { 
            header: __('Action', 'multivendorx'), 
            cell: ({ row }) => (
                <TableCell type="action-dropdown" rowData={row.original} header={{ actions: [
                    { label: __('Edit', 'multivendorx'), icon: 'adminlib-eye', onClick: (rowData) => { setSelectedQnaId(rowData.id ?? null); setViewQna(true); }, hover: true },
                    { label: __('Delete', 'multivendorx'), icon: 'adminlib-delete', onClick: (rowData) => {
                        if(confirm(__('Are you sure you want to delete this question?', 'multivendorx'))) {
                            axios.delete(getApiLink(appLocalizer, `qna/${rowData.id}`), { headers: { 'X-WP-Nonce': appLocalizer.nonce } })
                                .then(() => requestData(pagination.pageSize, pagination.pageIndex + 1))
                                .catch(() => alert(__('Failed to delete question', 'multivendorx')));
                        }
                    }, hover: true }
                ]}} />
            ) 
        }
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'date',
            render: (updateFilter) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range: any) => updateFilter('date', { start_date: range.startDate, end_date: range.endDate })}
                    />
                </div>
            ),
        },
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
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                    realtimeFilter={realtimeFilter}
                    handlePagination={requestApiForData}
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
