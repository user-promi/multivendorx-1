import { formatDate } from '@/services/commonFunction';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getApiLink } from 'zyra';

interface Review {
	id: number;
	customer_name: string;
	review_title: string;
	review_content: string;
	overall_rating: number;
	reply?: string;
	date_created: string;
	images?: string[];
	avatar_url?: string;
}
type SubmitStatus = 'idle' | 'submitting' | 'submitted';

const fetchReviews = (params: object, nonce: string) =>
	axios.get(getApiLink(StoreInfo, 'review'), {
		headers: { 'X-WP-Nonce': nonce },
		params,
	});

const StarSelector = ({ ratingKey, value, onChange }: { ratingKey: string; value: number; onChange: (k: string, v: number) => void }) => (
	<div className="star-rating-selector">
		{[1, 2, 3, 4, 5].map((num) => (
			<span
				key={num}
				className={`star ${value >= num ? 'selected' : ''}`}
				onClick={() => onChange(ratingKey, num)}
				role="button"
				tabIndex={0}
			>★</span>
		))}
	</div>
);

const StoreReview: React.FC = () => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [overview, setOverview] = useState<any>(null);
	const [showForm, setShowForm] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
	const [reviewTitle, setReviewTitle] = useState('');
	const [reviewContent, setReviewContent] = useState('');
	const [ratings, setRatings] = useState<{ [key: string]: number }>({});
	const [images, setImages] = useState<File[]>([]);

	const { nonce, storeDetails: { storeId }, currentUserId, reviewStatus, loginUrl, isVerifiedBuyerOnly, isVerifiedBuyer, settings_databases_value } = StoreInfo;

	useEffect(() => {
		fetchReviews({ page: 1, row: 10, store_id: storeId, status: 'approved' }, nonce)
			.then((res) => setReviews(Array.isArray(res.data) ? res.data : []));

		fetchReviews({ store_id: storeId, overview: true }, nonce)
			.then((res) => setOverview(res.data))
			.catch((err) => console.error('Overview fetch error:', err));
	}, []);

	const handleSubmit = async () => {
		if (!reviewTitle.trim() || !reviewContent.trim()) return alert(__('Title and review content are required.', 'multivendorx'));
		if (!Object.keys(ratings).length) return alert(__('Please provide ratings.', 'multivendorx'));

		setSubmitStatus('submitting');
		const formData = new FormData();
		formData.append('store_id', storeId);
		formData.append('review_title', reviewTitle);
		formData.append('review_content', reviewContent);
		Object.entries(ratings).forEach(([k, v]) => formData.append(`rating[${k}]`, v.toString()));
		images.forEach((file) => formData.append('review_images[]', file));

		try {
			await axios.post(getApiLink(StoreInfo, 'review'), formData, { headers: { 'X-WP-Nonce': nonce } });
			setSubmitStatus('submitted');
			setReviewTitle(''); setReviewContent(''); setRatings({}); setImages([]); setShowForm(false);
		} catch (err) {
			console.error(err);
			setSubmitStatus('idle');
		}
	};

	const ratingParams = settings_databases_value?.['store-reviews']?.ratings_parameters || {};

	const canReview = currentUserId !== '0'
		&& !reviewStatus
		&& !(isVerifiedBuyerOnly && !isVerifiedBuyer);

	return (
		<>
			{overview && (
				<div className="woocommerce-Reviews">
					<div className="review-overview">
						<h3 className="woocommerce-Reviews-title">{__('Overall Rating', 'multivendorx')} : {overview.overall}</h3>
						<p className="woocommerce-review-count">{overview.total_reviews} {__('reviews', 'multivendorx')}</p>
						<div className="rating-breakdown">
							{[5, 4, 3, 2, 1].map((star) => (
								<div key={star} className="rating-breakdown-row">
									<span className="rating-star">{star} :</span>
									<span className="rating-count">{overview.breakdown?.[star] || 0}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			<div className="multivendorx-review-form-wrapper">
				{submitStatus === 'submitted' && <p className="woocommerce-message">{__('Review submitted successfully and awaiting approval.', 'multivendorx')}</p>}

				{currentUserId === '0' ? (
					<p className="woocommerce-info">
						{__('Please login to submit a review.', 'multivendorx')} <a href={loginUrl}>{__('Login', 'multivendorx')}</a>
					</p>
				) : (reviewStatus === 'pending' || reviewStatus === 'rejected') ? (
					<p className="woocommerce-info">{__('You have already submitted a review for this store.', 'multivendorx')}</p>
				) : isVerifiedBuyerOnly && !isVerifiedBuyer ? (
					<p className="woocommerce-info">{__('Only verified buyers can leave a review for this store.', 'multivendorx')}</p>
				) : canReview && (
					<>
						{!showForm && submitStatus !== 'submitted' && (
							<button onClick={() => setShowForm(true)} className="button">{__('Write a review', 'multivendorx')}</button>
						)}

						{showForm && (
							<div className="review-form woocommerce-Reviews">
								<div className="comment-form">
									<p className="comment-form-title">
										<input type="text" placeholder={__('Review Title', 'multivendorx')} value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="input-text" />
									</p>
									<p className="comment-form-comment">
										<textarea placeholder={__('Your Review', 'multivendorx')} value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} className="input-text" rows={5} />
									</p>

									{Object.entries(ratingParams).map(([key, param]: any) =>
										param?.label ? (
											<div key={key} className="comment-form-rating">
												<label>{param.label}</label>
												<div className="stars-rating-form">
													<StarSelector ratingKey={key} value={ratings[key] || 0} onChange={(k, v) => setRatings((prev) => ({ ...prev, [k]: v }))} />
												</div>
											</div>
										) : null
									)}

									<p className="comment-form-images">
										<label htmlFor="review-images">{__('Upload Images (optional)', 'multivendorx')}</label>
										<input type="file" id="review-images" multiple accept="image/*" onChange={(e) => e.target.files && setImages(Array.from(e.target.files))} className="input-text" />
									</p>

									<p className="form-submit">
										<button onClick={handleSubmit} disabled={submitStatus === 'submitting'} className="button alt">
											{submitStatus === 'submitting' ? __('Submitting...', 'multivendorx') : __('Submit Review', 'multivendorx')}
										</button>
									</p>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			<div id="reviews" className="woocommerce-Reviews">
				<div id="comments">
					<ol className="commentlist">
						{reviews.map((review) => (
							<li key={review.id} className="review">
								<div className="comment_container">
									{review.avatar_url ? (
										<img alt={`Avatar of ${review.customer_name}`} src={review.avatar_url} className="avatar avatar-60 photo" height="60" width="60" loading="lazy" />
									) : (
										<div className="avatar avatar-60 photo avatar-placeholder">{review.customer_name.charAt(0)}</div>
									)}
									<div className="comment-text">
										<div className="star-rating">
											<span style={{ width: `${(review.overall_rating / 5) * 100}%` }}>
												<strong className="rating">{review.overall_rating.toFixed(1)}</strong>
												{__(' out of 5', 'multivendorx')}
											</span>
										</div>
										<p className="meta">
											<strong className="woocommerce-review__author">{review.customer_name}</strong>
											<span className="woocommerce-review__dash">–</span>
											<time className="woocommerce-review__published-date">{formatDate(review.date_created)}</time>
										</p>
										<div className="description">
											<h4 className="woocommerce-review__title">{review.review_title}</h4>
											<p>{review.review_content}</p>
										</div>
									</div>
								</div>

								{review.images?.length ? (
									<div className="review-images">
										{review.images.map((img, i) => (
											<a key={i} href={img} target="_blank" rel="noopener noreferrer" className="review-image-link">
												<img src={img} alt={__('Review Image', 'multivendorx')} />
											</a>
										))}
									</div>
								) : null}

								{review.reply && (
									<div className="multivendorx-review-reply">
										<strong>{__('Admin reply:', 'multivendorx')}</strong>
										<p>{review.reply}</p>
									</div>
								)}
							</li>
						))}
					</ol>
				</div>
			</div>
		</>
	);
};

export default StoreReview;