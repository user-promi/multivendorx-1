import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
	ToolbarGroup,
} from '@wordpress/components';
import StoreReview from './StoreReview';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';

registerBlockType('multivendorx/store-review', {
	attributes: {
		reviewsToShow: {
			type: 'number',
			default: 3,
		},
		showImages: {
			type: 'boolean',
			default: true,
		},
		showAdminReply: {
			type: 'boolean',
			default: true,
		},
		sortOrder: {
			type: 'string',
			default: 'DESC',
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const { reviewsToShow, showImages, showAdminReply, sortOrder } =
			attributes;

		const blockProps = useBlockProps();

		const StarFilled = () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				width="20"
				height="20"
			>
				<path
					d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
					fill="#f0b849"
				/>
			</svg>
		);

		const StarEmpty = () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				width="20"
				height="20"
			>
				<path
					d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
					fill="#ddd"
				/>
			</svg>
		);

		const reviewData = {
			avatar: 'B',
			name: 'Jone',
			time: '1 day ago',
			rating: 4,
			title: 'Great Store',
			content: 'The quality is excellent and delivery was fast.',
			images: ['#', '#'],
			adminReply: 'Thank you for your valuable feedback!',
		};

		const renderStars = (rating, isEditor = true) => {
			const stars = [];
			for (let i = 1; i <= 5; i++) {
				if (isEditor) {
					stars.push(
						i <= rating ? (
							<StarFilled key={i} />
						) : (
							<StarEmpty key={i} />
						)
					);
				}
			}
			return stars;
		};

		return (
			<>
				<BlockControls>
					<ToolbarGroup>
						<AlignmentToolbar />
					</ToolbarGroup>
				</BlockControls>

				<InspectorControls>
					<PanelBody title={__('Review Settings')} initialOpen={true}>
						<RangeControl
							label={__('Number of Reviews to Show')}
							value={reviewsToShow}
							onChange={(value) =>
								setAttributes({ reviewsToShow: value })
							}
							min={1}
							max={10}
						/>

						<SelectControl
							label={__('Sort Order')}
							value={sortOrder}
							options={[
								{
									label: __('Newest First', 'multivendorx'),
									value: 'DESC',
								},
								{
									label: __('Oldest First', 'multivendorx'),
									value: 'ASC',
								},
							]}
							onChange={(value) =>
								setAttributes({ sortOrder: value })
							}
						/>

						<ToggleControl
							label={__('Show Images')}
							checked={showImages}
							onChange={() =>
								setAttributes({ showImages: !showImages })
							}
						/>

						<ToggleControl
							label={__('Show Admin Replies')}
							checked={showAdminReply}
							onChange={() =>
								setAttributes({
									showAdminReply: !showAdminReply,
								})
							}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<ul className="wc-block-review-list wc-block-components-review-list">
						{/* Review 1 - New Product */}
						<li
							className="wc-block-review-list-item__item wc-block-components-review-list-item__item wc-block-components-review-list-item__item--has-image"
							aria-hidden="false"
						>
							<div className="wc-block-review-list-item__info wc-block-components-review-list-item__info">
								<div className="wc-block-review-list-item__image wc-block-components-review-list-item__image">
									<img
										aria-hidden="true"
										alt=""
										src="https://secure.gravatar.com/avatar/be3221a6fac131657111728b4d912a877ec158b123d5db3afef3bd8a59784ece?s=96&d=mm&r=g"
									/>
								</div>

								<div className="wc-block-review-list-item__meta wc-block-components-review-list-item__meta">
									<div
										id="review-1"
										aria-label="new product Rated 4 out of 5"
										className="wc-block-review-list-item__rating wc-block-components-review-list-item__rating"
									>
										<div
											aria-hidden="true"
											className="wc-block-review-list-item__rating__stars wc-block-components-review-list-item__rating__stars wc-block-review-list-item__rating__stars--4"
											role="img"
										>
											<span style={{ width: '80%' }}>
												Rated{' '}
												<strong className="rating">
													4
												</strong>{' '}
												out of 5
											</span>
										</div>
									</div>

									<div className="wc-block-review-list-item__product wc-block-components-review-list-item__product">
										<a
											href="http://localhost:8889/product/new-product/"
											aria-labelledby="review-1"
										>
											new product
										</a>
									</div>

									<div className="wc-block-review-list-item__author wc-block-components-review-list-item__author">
										admin
									</div>

									<time
										className="wc-block-review-list-item__published-date wc-block-components-review-list-item__published-date"
										dateTime="2026-03-05T13:47:31"
									>
										March 5, 2026
									</time>
								</div>
							</div>

							<div className="wc-block-review-list-item__text wc-block-components-review-list-item__text">
								<div>
									<div>
										<p>dd</p>
									</div>
								</div>
							</div>
						</li>

						{/* Review 2 - Hat */}
						<li
							className="wc-block-review-list-item__item wc-block-components-review-list-item__item wc-block-components-review-list-item__item--has-image"
							aria-hidden="false"
						>
							<div className="wc-block-review-list-item__info wc-block-components-review-list-item__info">
								<div className="wc-block-review-list-item__image wc-block-components-review-list-item__image">
									<img
										aria-hidden="true"
										alt=""
										src="https://secure.gravatar.com/avatar/be3221a6fac131657111728b4d912a877ec158b123d5db3afef3bd8a59784ece?s=96&d=mm&r=g"
									/>
								</div>

								<div className="wc-block-review-list-item__meta wc-block-components-review-list-item__meta">
									<div
										id="review-2"
										aria-label="Hat Rated 4 out of 5"
										className="wc-block-review-list-item__rating wc-block-components-review-list-item__rating"
									>
										<div
											aria-hidden="true"
											className="wc-block-review-list-item__rating__stars wc-block-components-review-list-item__rating__stars wc-block-review-list-item__rating__stars--4"
											role="img"
										>
											<span style={{ width: '80%' }}>
												Rated{' '}
												<strong className="rating">
													4
												</strong>{' '}
												out of 5
											</span>
										</div>
									</div>

									<div className="wc-block-review-list-item__product wc-block-components-review-list-item__product">
										<a
											href="http://localhost:8889/product/hat/"
											aria-labelledby="review-2"
										>
											Hat
										</a>
									</div>

									<div className="wc-block-review-list-item__author wc-block-components-review-list-item__author">
										admin
									</div>

									<time
										className="wc-block-review-list-item__published-date wc-block-components-review-list-item__published-date"
										dateTime="2026-03-02T13:52:43"
									>
										March 2, 2026
									</time>
								</div>
							</div>

							<div className="wc-block-review-list-item__text wc-block-components-review-list-item__text">
								<div>
									<div>
										<p>dgdggdd</p>
									</div>
								</div>
							</div>
						</li>

						{/* Review 3 - T-shirt (New Static Review) */}
						<li
							className="wc-block-review-list-item__item wc-block-components-review-list-item__item wc-block-components-review-list-item__item--has-image"
							aria-hidden="false"
						>
							<div className="wc-block-review-list-item__info wc-block-components-review-list-item__info">
								<div className="wc-block-review-list-item__image wc-block-components-review-list-item__image">
									<img
										aria-hidden="true"
										alt=""
										src="https://secure.gravatar.com/avatar/1b8d7f9e3a2c4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0?s=96&d=mm&r=g"
									/>
								</div>

								<div className="wc-block-review-list-item__meta wc-block-components-review-list-item__meta">
									<div
										id="review-3"
										aria-label="T-shirt Rated 5 out of 5"
										className="wc-block-review-list-item__rating wc-block-components-review-list-item__rating"
									>
										<div
											aria-hidden="true"
											className="wc-block-review-list-item__rating__stars wc-block-components-review-list-item__rating__stars wc-block-review-list-item__rating__stars--5"
											role="img"
										>
											<span style={{ width: '100%' }}>
												Rated{' '}
												<strong className="rating">
													5
												</strong>{' '}
												out of 5
											</span>
										</div>
									</div>

									<div className="wc-block-review-list-item__product wc-block-components-review-list-item__product">
										<a aria-labelledby="review-3">
											T-shirt
										</a>
									</div>

									<div className="wc-block-review-list-item__author wc-block-components-review-list-item__author">
										johndoe
									</div>

									<time
										className="wc-block-review-list-item__published-date wc-block-components-review-list-item__published-date"
										dateTime="2026-03-10T09:15:22"
									>
										March 10, 2026
									</time>
								</div>
							</div>

							<div className="wc-block-review-list-item__text wc-block-components-review-list-item__text">
								<div>
									<div>
										<p>
											Great quality t-shirt, fits
											perfectly and the material is super
											comfortable! Highly recommended.
										</p>
									</div>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { reviewsToShow, showImages, showAdminReply, sortOrder } =
			attributes;
		const blockProps = useBlockProps.save();

		return (
			<div
				{...blockProps}
				className="multivendorx-review-list"
				data-reviews-to-show={reviewsToShow}
				data-show-images={showImages}
				data-show-admin-reply={showAdminReply}
				data-sort-order={sortOrder}
			/>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const activeModules = StoreInfo.activeModules;

	if (!activeModules.includes('store-review')) {
		return;
	}

	document.querySelectorAll('.multivendorx-review-list').forEach((el) => {
		const { reviewsToShow, showImages, showAdminReply, sortOrder } =
			el.dataset;

		const props = {
			reviewsToShow: Number(reviewsToShow),
			showImages: showImages === 'true',
			showAdminReply: showAdminReply === 'true',
			sortOrder,
		};

		render(
			<BrowserRouter>
				<StoreReview {...props} />
			</BrowserRouter>,
			el
		);
	});
});
