/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput, CommonPopup, TextArea, ToggleSetting, BasicInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
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
    store_id?: string;
    store_name?: string;
};

type Status = {
    key: string;
    name: string;
    count: number;
};

type StoreQnaRow = {
    id: number;
    product_name: string;
    product_link: string;
    question_text: string;
    answer_text?: string | null;
    author_name?: string;
    question_date?: string;
    time_ago?: string;
    question_visibility?: string;
};

type FilterData = {
    searchField: string;
    typeCount?: any;
    store?: string;
    orderBy?: any;
    order?: any;
};

const Qna: React.FC = () => {
    const [error, setError] = useState<string>();
    const [selectedQna, setSelectedQna] = useState<StoreQnaRow | null>(null);
    const [answer, setAnswer] = useState("");
    const [qna, setQna] = useState("");
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<QnaRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [status, setStatus] = useState<Status[] | null>(null);
    const [store, setStore] = useState<any[] | null>(null);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
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


    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        typeCount = '',
        store = '',
        searchField = '',
        orderBy = '',
        order = '',
        startDate = new Date(0),
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
                status: typeCount === 'all' ? '' : typeCount,
                store_id: store,
                searchField,
                orderBy,
                order,
                startDate,
                endDate
            },
        })
            .then((response) => {
                setData(response.data.items || []);
                setStatus([
                    {
                        key: 'all',
                        name: 'All',
                        count: response.data.all || 0,
                    },
                    {
                        key: 'has_answer',
                        name: 'Answered',
                        count: response.data.answered || 0,
                    },
                    {
                        key: 'no_answer',
                        name: 'Unanswered',
                        count: response.data.unanswered || 0,
                    },
                ]);
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
            filterData?.typeCount,
            filterData?.store,
            filterData?.searchField,
            filterData?.orderBy,
            filterData?.order,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };

    // Save answer
    const handleSaveAnswer = async () => {
        if (!selectedQna) return;
        setSaving(true);
        try {
            await axios.put(
                getApiLink(appLocalizer, `qna/${selectedQna.id}`),
                {
                    question_text: qna,
                    answer_text: answer,
                    question_visibility: selectedQna.question_visibility || 'public',
                },
                { headers: { "X-WP-Nonce": appLocalizer.nonce } }
            );

            // Update table data after save
            setData((prev) =>
                prev.map((q) =>
                    q.id === selectedQna.id
                        ? {
                            ...q,
                            answer_text: answer,
                            question_visibility: selectedQna.question_visibility || 'public',
                        }
                        : q
                )
            );
            requestData(pagination.pageSize, pagination.pageIndex + 1);
            setSelectedQna(null);
            setAnswer("");
        } catch (err) {
            console.error("Failed to save answer:", err);
            alert("Failed to save answer");
        } finally {
            setSaving(false);
        }
    };


    const columns: ColumnDef<QnaRow>[] = [
        {
            id: 'select',
            header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
            cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        },
        {
            id: 'product',
            header: __('Product', 'multivendorx'),
            cell: ({ row }) => {
                const product = row.original;
                const image = product.product_image;

                const { store_id, store_name } = row.original;
                const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
                const storeLink = store_id
                    ? `${baseUrl}&edit/${store_id}/&subtab=store-overview`
                    : '#';
                return (
                    <TableCell title={product.product_name || ''}>
                        <a
                            href={product.product_link || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="product-wrapper"
                        >
                            {image ? (
                                <img
                                    src={image}
                                    alt={row.original.store_name}
                                />
                            ) : (
                                <i className="item-icon adminlib-multi-product"></i>
                            )}
                            <div className="details">
                                <span className="title">{product.product_name || '-'}</span>
                                {product.sku && <span><b>SKU:</b> {product.sku}</span>}

                                {store_id ? (
                                    <>
                                        <span
                                            // href={storeLink}
                                            // target="_blank"
                                            className="des"
                                        >
                                            By  {store_name || '-'}
                                        </span>
                                    </>
                                ) : (
                                    store_name || '-'
                                )}
                            </div>
                        </a>
                    </TableCell>
                );
            },
        },

        {
            header: __('Question', 'multivendorx'),
            id: 'question',
            cell: ({ row }) => {
                const text = row.original.question_text ?? '-';
                const displayText = text.length > 50 ? text.slice(0, 50) + '…' : text;

                const textAnswer = row.original.answer_text ?? '-';
                const displayAnswer = textAnswer.length > 50 ? textAnswer.slice(0, 50) + '…' : textAnswer;
                return <TableCell title={text}>
                    <div className="question-wrapper">
                        <div className="question">Q: {displayText}</div>
                        {displayAnswer && (
                            <div className="answer">A: {displayAnswer}</div>
                        )}
                        <div className="des">By: {row.original.author_name ?? '-'}</div>
                    </div>

                </TableCell>;
            }
        },
        // {
        //     header: __('Answer', 'multivendorx'),
        //     cell: ({ row }) => {
        //         const text = row.original.answer_text ?? '-';
        //         const displayText = text.length > 50 ? text.slice(0, 50) + '…' : text;
        //         return <TableCell title={text}>{displayText}</TableCell>;
        //     }
        // },
        {
            id: 'question_date',
            header: __('Date', 'multivendorx'),
            accessorFn: row => row.question_date ? new Date(row.question_date).getTime() : 0, // numeric timestamp for sorting
            enableSorting: true,
            cell: ({ row }) => {
                const rawDate = row.original.question_date;
                const formattedDate = rawDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(rawDate)) : '-';
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            }
        },
        // {
        //     header: __('Store', 'multivendorx'),
        //     cell: ({ row }) => {
        //         const { store_id, store_name } = row.original;
        //         const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
        //         const storeLink = store_id
        //             ? `${baseUrl}&edit/${store_id}/&subtab=store-overview`
        //             : '#';

        //         return (
        //             <TableCell title={store_name || ''}>
        //                 {store_id ? (
        //                     <a
        //                         href={storeLink}
        //                         target="_blank"
        //                         rel="noopener noreferrer"
        //                         className="text-purple-600 hover:underline"
        //                     >
        //                         {store_name || '-'}
        //                     </a>
        //                 ) : (
        //                     store_name || '-'
        //                 )}
        //             </TableCell>
        //         );
        //     },
        // },
        {
            header: __('Votes', 'multivendorx'),
            cell: ({ row }) => <TableCell title={String(row.original.total_votes) || ''}>{row.original.total_votes ?? 0}</TableCell>
        },
        {
            header: __('Visibility', 'multivendorx'),
            enableSorting: true,
            cell: ({ row }) => {
                const visibility = row.original.question_visibility || '';
                const formattedvisibility = visibility
                    ?.replace(/[-_]/g, " ")
                    .toLowerCase()
                    .replace(/^\w/, c => c.toUpperCase());

                const getStatusBadge = (status: string) => {
                    switch (status) {
                        case 'public':
                            return <span className="admin-badge green">Public</span>;
                        case 'private':
                            return <span className="admin-badge yellow">Private</span>;
                        default:
                            return <span className="admin-badge gray">{formattedvisibility}</span>;
                    }
                };

                return (
                    <TableCell title={`${visibility}`}>
                        {getStatusBadge(visibility)}
                    </TableCell>
                );
            },
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
                                label: __('Answer', 'multivendorx'),
                                icon: 'adminlib-preview', // you can change the icon
                                onClick: (rowData: any) => {
                                    setSelectedQna(rowData);
                                    setQna(rowData.question_text);
                                    setAnswer(rowData.answer_text || '');
                                },
                                hover: true,
                            },
                            {
                                label: __('Delete', 'multivendorx'), icon: 'adminlib-delete', onClick: (rowData) => {
                                    if (confirm(__('Are you sure you want to delete this question?', 'multivendorx'))) {
                                        axios.delete(getApiLink(appLocalizer, `qna/${rowData.id}`), { headers: { 'X-WP-Nonce': appLocalizer.nonce } })
                                            .then(() => requestData(pagination.pageSize, pagination.pageIndex + 1))
                                            .catch(() => alert(__('Failed to delete question', 'multivendorx')));
                                    }
                                },
                                hover: true,
                            },
                        ],
                    }}
                />
            )
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
            name: 'visibility',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="group-field">
                    <select
                        name="store"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">Public</option>
                        <option value="">Private</option>
                        {/* {store?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.store_name.charAt(0).toUpperCase() + s.store_name.slice(1)}
                            </option>
                        ))} */}
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
                        onChange={(range: any) => updateFilter('date', { start_date: range.startDate, end_date: range.endDate })}
                    />
                </div>
            ),
        },
    ];

    const searchFilter: RealtimeFilter[] = [
        {
            name: 'searchField',
            render: (updateFilter, filterValue) => (
                <div className="search-section">
                    <input
                        name="searchField"
                        type="text"
                        placeholder={__('Search', 'multivendorx')}
                        onChange={(e) => {
                            updateFilter(e.target.name, e.target.value);
                        }}
                        value={filterValue || ''}
                    />
                    <i className="adminlib-search"></i>
                </div>
            ),
        },
    ];

    return (
        <>
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
                typeCounts={status as Status[]}
                searchFilter={searchFilter}
            />
            {/* </div> */}

            {selectedQna && (
                <CommonPopup
                    open={selectedQna}
                    onClose={() => setSelectedQna(null)}
                    width="600px"
                    height="70%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-question"></i>
                                Answer Question
                            </div>
                            <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                            <i
                                onClick={() => setSelectedQna(null)}
                                className="icon adminlib-close"
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectedQna(null)}
                                className="admin-btn btn-red"
                            >
                                Cancel
                            </button>
                            <button onClick={handleSaveAnswer} disabled={saving} className="admin-btn btn-purple">
                                {saving ? "Saving..." : "Save Answer"}
                            </button>
                        </>
                    }
                >
                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="question">{__("Question", "multivendorx")}</label>
                                <BasicInput name="phone" value={qna} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={(e) => setQna(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="ans">{__("Answer", "multivendorx")}</label>
                                <TextArea
                                    name="answer"
                                    inputClass="textarea-input"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="visibility">{__("Decide whether this Q&A is visible to everyone or only to the store team.", "multivendorx")}</label>
                                <ToggleSetting
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    //description="Select whether this question is visible to the public or private."
                                    options={[
                                        { key: 'public', value: 'public', label: __('Public', 'multivendorx') },
                                        { key: 'private', value: 'private', label: __('Private', 'multivendorx') },
                                    ]}
                                    value={selectedQna.question_visibility || 'public'}
                                    onChange={(value) =>
                                        setSelectedQna((prev) => prev ? { ...prev, question_visibility: value } : prev)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="error-text">{error}</p>}
                </CommonPopup>
            )}

        </>
    );
};

export default Qna;
