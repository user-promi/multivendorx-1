/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, TableCell, CommonPopup } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

type ReviewRow = {
    comment_ID: number;
    comment_post_ID: number;
    comment_author: string;
    comment_content: string;
    comment_date: string;
    comment_parent: number;
    user_id: number;
    store_rating?: number; // rating given by customer
    store_rating_id?: number; // store ID
    replies?: ReviewRow[];
};

const StoreReviews: React.FC = () => {
    const [data, setData] = useState<ReviewRow[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);
    const [totalRows, setTotalRows] = useState(0);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null);
    const [editContent, setEditContent] = useState('');
    const [newReply, setNewReply] = useState('');

    // Fetch total reviews count
    useEffect(() => {
        axios.get(`${appLocalizer.apiUrl}/wp/v2/comments`, {
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { type: 'multivendorx_review', per_page: 1 },
        }).then(res => {
            const total = parseInt(res.headers['x-wp-total'] || '0', 10);
            setTotalRows(total);
            setPageCount(Math.ceil(total / pagination.pageSize));
        }).catch(() => setTotalRows(0));
    }, [pagination.pageSize]);

    // Fetch reviews with replies
    const fetchReviews = async (page = 1, perPage = 10) => {
        try {
            setData([]);
            const reviewRes = await axios.get(`${appLocalizer.apiUrl}/wp/v2/comments`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { type: 'multivendorx_review', per_page: perPage, page },
            });
            const rawReviews = Array.isArray(reviewRes.data) ? reviewRes.data : [];

            const reviewsWithReplies: ReviewRow[] = await Promise.all(
                rawReviews.map(async (rev: any) => {
                    const review: ReviewRow = {
                        comment_ID: rev.id,
                        comment_post_ID: rev.post,
                        comment_author: rev.author_name || '',
                        comment_content: rev.content?.rendered?.replace(/<\/?p>/g, '') || '',
                        comment_date: rev.date || '',
                        comment_parent: rev.parent || 0,
                        user_id: rev.user || 0,
                        store_rating: rev.meta?.store_rating ? parseInt(rev.meta.store_rating, 10) : undefined,
                        store_rating_id: rev.meta?.store_rating_id ? parseInt(rev.meta.store_rating_id, 10) : undefined,
                        replies: [],
                    };

                    // fetch replies for this review
                    try {
                        const replyRes = await axios.get(`${appLocalizer.apiUrl}/wp/v2/comments`, {
                            headers: { 'X-WP-Nonce': appLocalizer.nonce },
                            params: { type: 'comment', parent: rev.id },
                        });
                        const replies = Array.isArray(replyRes.data) ? replyRes.data.map((r: any) => ({
                            comment_ID: r.id,
                            comment_post_ID: r.post,
                            comment_author: r.author_name || '',
                            comment_content: r.content?.rendered?.replace(/<\/?p>/g, '') || '',
                            comment_date: r.date || '',
                            comment_parent: r.parent || 0,
                            user_id: r.user || 0,
                        })) : [];
                        review.replies = replies;
                    } catch (err) {
                        console.error('Failed to fetch replies', err);
                        review.replies = [];
                    }

                    return review;
                })
            );

            setData(reviewsWithReplies);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
            setData([]);
        }
    };

    useEffect(() => {
        fetchReviews(pagination.pageIndex + 1, pagination.pageSize);
    }, [pagination]);

    const openEditModal = (review: ReviewRow) => {
        setSelectedReview(review);
        setEditContent(review.comment_content);
        setNewReply('');
        setEditModalOpen(true);
    };

    const saveEdit = async () => {
        if (!selectedReview) return;
        try {
            // update review content
            await axios.post(`${appLocalizer.apiUrl}/wp/v2/comments/${selectedReview.comment_ID}`, {
                content: editContent,
            }, { headers: { 'X-WP-Nonce': appLocalizer.nonce } });

            // add reply if provided
            if (newReply.trim()) {
                await axios.post(`${appLocalizer.apiUrl}/wp/v2/comments`, {
                    post: selectedReview.comment_post_ID,
                    content: newReply,
                    type: 'comment',
                    parent: selectedReview.comment_ID,
                }, { headers: { 'X-WP-Nonce': appLocalizer.nonce } });
            }

            setEditModalOpen(false);
            setSelectedReview(null);
            fetchReviews(pagination.pageIndex + 1, pagination.pageSize);
        } catch {
            alert(__('Failed to update review/reply', 'multivendorx'));
        }
    };

    const columns: ColumnDef<ReviewRow>[] = [
        {
            id: 'author',
            header: __('Author', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.comment_author}>{row.original.comment_author}</TableCell>
        },
        {
            id: 'content',
            header: __('Content', 'multivendorx'),
            cell: ({ row }) => <TableCell title={row.original.comment_content}>{row.original.comment_content}</TableCell>
        },
        {
            id: 'rating',
            header: __('Rating', 'multivendorx'),
            cell: ({ row }) => {
                const rating = row.original.store_rating ?? 0;
                return (
                    <TableCell title={rating}>
                        {rating > 0
                            ? '★'.repeat(rating) + '☆'.repeat(5 - rating)
                            : '-'}
                    </TableCell>
                );
            }
        },
        {
            id: 'date',
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.comment_date;
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
            id: 'action',
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('Edit / Reply', 'multivendorx'),
                                icon: 'adminlib-eye',
                                onClick: openEditModal,
                                hover: true,
                            },
                            {
                                label: __('Delete', 'multivendorx'),
                                icon: 'adminlib-delete',
                                onClick: async (review) => {
                                    if (confirm(__('Are you sure you want to delete this review?', 'multivendorx'))) {
                                        try {
                                            await axios.delete(`${appLocalizer.apiUrl}/wp/v2/comments/${review.comment_ID}`, {
                                                headers: { 'X-WP-Nonce': appLocalizer.nonce }
                                            });
                                            fetchReviews(pagination.pageIndex + 1, pagination.pageSize);
                                        } catch {
                                            alert(__('Failed to delete review', 'multivendorx'));
                                        }
                                    }
                                },
                                hover: true,
                            }
                        ]
                    }}
                />
            )
        }
    ];

    return (
        <>
                <Table
                    data={data || []}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={fetchReviews}
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                />

            {editModalOpen && selectedReview && (
                <CommonPopup
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    width="600px"
                    header={<div>Edit / Reply Review</div>}
                    footer={
                        <>
                            <div className="admin-btn btn-red" onClick={() => setEditModalOpen(false)}>
                                {__('Cancel', 'multivendorx')}
                            </div>
                            <div className="admin-btn btn-green" onClick={saveEdit}>
                                {__('Save', 'multivendorx')}
                            </div>
                        </>
                    }
                >
                    <div className="content">
                        <div className="form-group">
                            <label>{__('Review Content', 'multivendorx')}</label>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={5}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>{__('Add Reply', 'multivendorx')}</label>
                            <textarea
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                rows={3}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {selectedReview.replies && selectedReview.replies.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <strong>{__('Existing Replies:', 'multivendorx')}</strong>
                                {selectedReview.replies.map((rep) => (
                                    <div key={rep.comment_ID} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                        <strong>{rep.comment_author}:</strong> {rep.comment_content}
                                        <br />
                                        <small>{new Date(rep.comment_date).toLocaleString()}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default StoreReviews;
