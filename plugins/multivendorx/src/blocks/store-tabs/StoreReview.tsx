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
	const [showForm, setShowForm] = useState(false);
	const [reviewTitle, setReviewTitle] = useState('');
	const [reviewContent, setReviewContent] = useState('');
	const [ratings, setRatings] = useState<{ [key: string]: number }>({});
	const [images, setImages] = useState<File[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [overview, setOverview] = useState<any>(null);

	useEffect(() => {
		setLoading(true);

		axios
			.get(getApiLink(StoreInfo, 'review'), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					page: 1,
					row: 10,
					store_id: StoreInfo.storeDetails.storeId,
					status: 'approved',
				},
			})
			.then((response) => {
				setReviews(Array.isArray(response.data) ? response.data : []);
			})
			.finally(() => setLoading(false));
	}, [reviewsToShow, sortOrder]);
	useEffect(() => {
		axios
			.get(getApiLink(StoreInfo, 'review'), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					store_id: StoreInfo.storeDetails.storeId,
					overview: true,
				},
			})
			.then((response) => {
				setOverview(response.data);
			})
			.catch((error) => {
				console.error('Overview fetch error:', error);
			});
	}, []);

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }).map((_, i) => (
			<i
				key={i}
				className={`dashicons ${i < rating
					? 'dashicons-star-filled'
					: 'dashicons-star-empty'
					}`}
			/>
		));
	};

	const handleSubmit = async () => {
		if (!reviewTitle.trim() || !reviewContent.trim()) {
			alert(__('Title and review content are required.', 'multivendorx'));
			return;
		}

		if (Object.keys(ratings).length === 0) {
			alert(__('Please provide ratings.', 'multivendorx'));
			return;
		}

		setSubmitting(true);

		const formData = new FormData();

		formData.append('store_id', StoreInfo.storeDetails.storeId);
		formData.append('review_title', reviewTitle);
		formData.append('review_content', reviewContent);

		Object.keys(ratings).forEach((key) => {
			formData.append(`rating[${key}]`, ratings[key].toString());
		});

		images.forEach((file) => {
			formData.append('review_images[]', file);
		});

		try {
			const response = await axios.post(
				getApiLink(StoreInfo, 'review'),
				formData,
				{
					headers: {
						'X-WP-Nonce': StoreInfo.nonce,
					},
				}
			);

			const newReview = response.data;

			// Add new review to top of list
			setReviews((prev) => [newReview, ...prev]);

			// Reset form
			setReviewTitle('');
			setReviewContent('');
			setRatings({});
			setImages([]);
			setShowForm(false);

		} catch (error: any) {
			console.log(error)
		} finally {
			setSubmitting(false);
		}
	};
	const handleRatingClick = (key: string, value: number) => {
		setRatings((prev) => ({ ...prev, [key]: value }));
	};
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};
	return (
		<>
			{overview && (
				<div className="review-overview">
					<h3>
						{__('Overall Rating', 'multivendorx')} : {overview.overall} ⭐
					</h3>

					<p>
						{overview.total_reviews}{' '}
						{__('reviews', 'multivendorx')}
					</p>

					<div className="rating-breakdown">
						{[5, 4, 3, 2, 1].map((star) => (
							<div key={star}>
								{star} ⭐ : {overview.breakdown?.[star] || 0}
							</div>
						))}
					</div>
				</div>
			)}
			<div className="multivendorx-review-form-wrapper">
				{StoreInfo.currentUserId === "0" ? (
					<p>
						{__('Please login to submit a review.', 'multivendorx')}{' '}
						<a href={StoreInfo.loginUrl}>{__('Login', 'multivendorx')}</a>
					</p>
				) : StoreInfo.reviewStatus === 'pending' ||
					StoreInfo.reviewStatus === 'rejected' ? (
					<p>
						{__('You have already submitted a review for this store.', 'multivendorx')}
					</p>
				) : StoreInfo.reviewStatus ? null : StoreInfo.isVerifiedBuyerOnly &&
					!StoreInfo.isVerifiedBuyer ? (
					<p>
						{__('Only verified buyers can leave a review for this store.', 'multivendorx')}
					</p>
				) : (
					<>
						{!showForm && (
							<button onClick={() => setShowForm(true)}>
								{__('Write a review', 'multivendorx')}
							</button>
						)}

						{showForm && (
							<div className="review-form">
								<input
									type="text"
									placeholder={__('Review Title', 'multivendorx')}
									value={reviewTitle}
									onChange={(e) => setReviewTitle(e.target.value)}
								/>

								<textarea
									placeholder={__('Your Review', 'multivendorx')}
									value={reviewContent}
									onChange={(e) => setReviewContent(e.target.value)}
								/>

								{/* Dynamic Rating Parameters */}
								{Object.entries(
									StoreInfo?.settings_databases_value?.['store-reviews']?.ratings_parameters || {}
								).map(([key, param]: any, index: number) => {

									const label = param?.label;
									if (!label) return null;

									return (
										<div key={key} className="rating-row">
											<span>{label}</span>

											{[1, 2, 3, 4, 5].map((num) => (
												<i
													key={num}
													className={`dashicons ${(ratings[key] || 0) >= num
														? 'dashicons-star-filled'
														: 'dashicons-star-empty'
														}`}
													onClick={() => handleRatingClick(key, num)}
												/>
											))}
										</div>
									);
								})}

								<input
									type="file"
									multiple
									accept="image/*"
									onChange={handleImageChange}
								/>

								<button onClick={handleSubmit} disabled={submitting}>
									{submitting
										? __('Submitting...', 'multivendorx')
										: __('Submit Review', 'multivendorx')}
								</button>
							</div>
						)}
					</>
				)}
			</div>
			<ul className="multivendorx-review-list">
				{reviews.map((review) => (
					<li key={review.review_id} className="multivendorx-review-item">
						<div className="header">
							<div className="details-wrapper">
								<div className="avatar">
									{review.customer_name.charAt(0)}
								</div>
								<div className="name">{review.customer_name}</div>
								<span className="time">{review.date_created}</span>
							</div>
						</div>

						<div className="body">
							<div className="rating">
								<span className="stars">
									{renderStars(review.overall_rating)}
								</span>
								<span className="title">{review.review_title}</span>
							</div>

							<div className="content">{review.review_content}</div>
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
			</ul>
		</>

	);
};

export default StoreReview;
