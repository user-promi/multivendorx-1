import { __ } from '@wordpress/i18n';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getApiLink } from 'zyra';

interface StoreReviewProps {
	reviewsToShow: number;
	showImages: boolean;
	showAdminReply: boolean;
	sortOrder: string;
}

interface Review {
	review_id: number;
	customer_name: string;
	review_title: string;
	review_content: string;
	overall_rating: number;
	reply?: string;
	date_created: string;
	images?: string[];
}

const StoreReview: React.FC<StoreReviewProps> = ({
	reviewsToShow,
	showImages,
	showAdminReply,
	sortOrder,
}) => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		setLoading(true);

		axios
			.get(getApiLink(StoreInfo, 'review'), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					page: 1,
					row: reviewsToShow,
					storeId: StoreInfo.storeDetails.storeId,
					status: 'approved',
				},
			})
			.then((response) => {
				setReviews(Array.isArray(response.data) ? response.data : []);
			})
			.finally(() => setLoading(false));
	}, [reviewsToShow, sortOrder]);

	if (loading) {
		return <p>{__('Loading reviews…', 'multivendorx')}</p>;
	}

	if (!reviews.length) {
		return <p>{__('No reviews found.', 'multivendorx')}</p>;
	}

	return (
		<div className="multivendorx-review-list-wrapper woocommerce">
			<h3>{__('Product Review', 'multivendorx')}</h3>
			<div id="reviews" className="woocommerce-Reviews">
				<div id="comments">
					{reviews.length > 0 ? (
						<ol className="commentlist">
							{reviews.map((review) => (
								<li key={review.review_id} className="review byuser comment-author-admin bypostauthor">
									<div className="comment_container">
										{review.avatar_url ? (
											<img
												alt={`Avatar of ${review.customer_name}`}
												src={review.avatar_url}
												srcSet={`${review.avatar_url} 2x`}
												className="avatar avatar-60 photo"
												height="60"
												width="60"
												loading="lazy"
												decoding="async"
											/>
										) : (
											<div className="avatar avatar-60 photo avatar-placeholder">
												{review.customer_name?.charAt(0)}
											</div>
										)}
										<div className="comment-text">

											<div className="star-rating" role="img" aria-label={`Rated ${review.overall_rating.toFixed(1)} out of 5`}>
												<span style={{ width: `${(review.overall_rating / 5) * 100}%` }}>
													<strong className="rating">{review.overall_rating.toFixed(1)}</strong>
													{__(' out of 5', 'multivendorx')}
												</span>
											</div>

											<p className="meta">
												<strong className="woocommerce-review__author">{review.customer_name}</strong>
												<span className="woocommerce-review__dash">–</span>
												<time className="woocommerce-review__published-date">{review.date_created}</time>
											</p>

											<div className="description">
												<h4 className="woocommerce-review__title">{review.review_title}</h4>
												<p>{review.review_content}</p>
											</div>
										</div>
									</div>

									{showImages && review.images?.length ? (
										<div className="review-images">
											{review.images.map((img, i) => (
												<a
													key={i}
													href={img}
													target="_blank"
													rel="noopener noreferrer"
												>
													<img
														src={img}
														alt={__('Review Image', 'multivendorx')}
													/>
												</a>
											))}
										</div>
									) : null}

									{showAdminReply && review.reply && (
										<div className="multivendorx-review-reply">
											<strong>
												{__('Admin reply:', 'multivendorx')}
											</strong>
											<p>{review.reply}</p>
										</div>
									)}
								</li>
							))}
						</ol>
					) : (
						<p> {__('No reviews found.', 'multivendorx')}</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default StoreReview;
