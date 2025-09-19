import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { BasicInput, CommonPopup, getApiLink, Table, TableCell, TextArea } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import axios from 'axios';

type QuestionRow = {
    id: number;
    question?: string;
    answer?: string;
    category?: string;
    tags?: string[];
    status?: string;
    created_at?: string;
};

const AllQna: React.FC = () => {
    const [data, setData] = useState<QuestionRow[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedQna, setSelectedQna] = useState<QuestionRow | null>(null);
    const [answer, setAnswer] = useState("");

    // Fetch Q&A list
    useEffect(() => {
        axios
            .get(getApiLink(appLocalizer, "qna"))
            .then(res => {
                setData(res.data || []);
                setPageCount(Math.ceil((res.data || []).length / pagination.pageSize));
            })
            .catch(err => console.error(err));
    }, []);

    const toggleDropdown = (id: any) => {
        setShowDropdown(showDropdown === id ? false : id);
    };

    const handleSaveAnswer = async () => {
        if (!selectedQna) return;
        try {
            await axios.post(
                getApiLink(appLocalizer, `qna/${selectedQna.id}/answer`),
                { answer },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            );
            // Update locally
            setData(prev => prev.map(q => q.id === selectedQna.id ? { ...q, answer } : q));
            setSelectedQna(null);
            setAnswer("");
        } catch (err) {
            console.error("Error saving answer:", err);
            alert("Failed to save answer");
        }
    };

    const columns: ColumnDef<QuestionRow>[] = [
        { header: __('Question', 'multivendorx'), cell: ({ row }) => <TableCell>{row.original.question}</TableCell> },
        { header: __('Answer', 'multivendorx'), cell: ({ row }) => <TableCell>{row.original.answer || '-'}</TableCell> },
        { header: __('Category', 'multivendorx'), cell: ({ row }) => <TableCell>{row.original.category || '-'}</TableCell> },
        { header: __('Status', 'multivendorx'), cell: ({ row }) => (
            <TableCell>
                {row.original.status === "published" ? <span className="admin-badge green">Published</span> : <span className="admin-badge">Draft</span>}
            </TableCell>
        )},
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    <div className="action-icons">
                        <i className="adminlib-more-vertical" onClick={() => toggleDropdown(row.original.id)}></i>
                        <div className={`action-dropdown ${showDropdown === row.original.id ? 'show' : ''}`}>
                            <ul>
                                <li onClick={() => {
                                    setSelectedQna(row.original);
                                    setAnswer(row.original.answer || "");
                                    setShowDropdown(false);
                                }}>Answer</li>
                            </ul>
                        </div>
                    </div>
                </TableCell>
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
                    typeCounts={[]}
                    realtimeFilter={[]}
                />
            </div>

            {selectedQna && (
                <CommonPopup
                    open={!!selectedQna}
                    width="500px"
                    height="100%"
                    header={
                        <>
                            <div className="title">Answer Question</div>
                            <i className="icon adminlib-close" onClick={() => setSelectedQna(null)}></i>
                        </>
                    }
                    footer={
                        <>
                            <div className="admin-btn btn-purple" onClick={handleSaveAnswer}>Save Answer</div>
                        </>
                    }
                >
                    <div className="content">
                        <div className="form-group">
                            <label>Question</label>
                            <BasicInput type="text" value={selectedQna.question} disabled />
                        </div>
                        <div className="form-group">
                            <label>Answer</label>
                            <TextArea rowNumber={6} value={answer} onChange={e => setAnswer(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <BasicInput type="text" value={selectedQna.category} disabled />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <BasicInput type="text" value={selectedQna.status} disabled />
                        </div>
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default AllQna;
