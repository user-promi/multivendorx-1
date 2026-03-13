import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiLink, MapProviderUI } from 'zyra';
import { __ } from '@wordpress/i18n';

interface StoreRow {
	id: number;
	name: string;
	store_slug: string,
	topProducts?: string[];
}

type Category = {
	id: number;
	name: string;
};

interface StoresListProps {
	orderby?: string;
	order?: string;
	category?: string;
	perPage?: number;
}

const MarketplaceStoreList: React.FC<StoresListProps> = ({
	orderby = '',
	order = '',
	category = '',
	perPage = 12,
}) => {
	const [data, setData] = useState<StoreRow[] | []>([]);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [product, setProduct] = useState<[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [apiKey, setApiKey] = useState('');
	const [viewMode, setViewMode] = useState<'list' | 'split' | 'map'>('list');
	const [storeTopProducts, setStoreTopProducts] = useState<{ [storeId: number]: any[] }>({});

	const [addressData, setAddressData] = useState({
		location_lat: '',
		location_lng: '',
		address: '',
		city: '',
		state: '',
		country: '',
		zip: '',
		timezone: '',
	});
	const [filters, setFilters] = useState({
		address: '',
		distance: '',
		miles: '',
		sort: orderby,
		order: order,
		category: category,
		product: '',
		location_lat: '',
		location_lng: '',
	});
	const [mapConfig, setMapConfig] = useState<{
		provider: string | null;
		apiKey: string;
	}>({ provider: 'null', apiKey: '' });

	const settings = storesList.settings_databases_value;

	const [isUserLocation, setIsUserLocation] = useState(false);

	useEffect(() => {
		if (!settings?.geolocation) {
			return;
		}

		const provider = settings.geolocation.choose_map_api;
		setApiKey(settings.geolocation[`${provider}_api_key`] || '');

		setMapConfig({
			provider: provider || null,
			apiKey: apiKey
		});
	}, [settings]);

	const totalPages = Math.ceil(total / perPage);

	useEffect(() => {
		axios
			.get(`${storesList.apiUrl}/wc/v3/products/categories`, {
				headers: { 'X-WP-Nonce': storesList.nonce },
			})
			.then((response) => {
				setCategoryList(response.data);
			});
	}, []);

	useEffect(() => {
		axios
			.get(`${storesList.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': storesList.nonce },
				params: {
					per_page: 10,
					meta_key: 'multivendorx_store_id',
				},
			})
			.then((response) => {
				setProduct(response.data);
			});
	}, []);

	const loadProducts = async (inputValue: string) => {
		try {
			const response = await axios.get(
				`${storesList.apiUrl}/wc/v3/products`,
				{
					headers: { 'X-WP-Nonce': storesList.nonce },
					params: {
						per_page: 10,
						search: inputValue,
						meta_key: 'multivendorx_store_id',
					},
				}
			);

			return response.data.map((product: any) => ({
				label: product.name,
				value: product.id,
			}));
		} catch (error) {
			console.error('Product search error:', error);
			return [];
		}
	};

	const fetchTopProducts = (storeId: number) => {
		axios
			.get(`${storesList.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': storesList.nonce },
				params: {
					per_page: 3,
					meta_key: 'multivendorx_store_id',
					value: storeId,
					orderby: 'date',
					order: 'desc',
				},
			})
			.then((response) => {
				// Store the products in state keyed by storeId
				setStoreTopProducts((prev) => ({
					...prev,
					[storeId]: response.data,
				}));
			})
			.catch((error) => {
				console.error(`Failed to fetch top products for store ${storeId}:`, error);
				setStoreTopProducts((prev) => ({
					...prev,
					[storeId]: [],
				}));
			});
	};

	useEffect(() => {
		if (data.length) {
			data.forEach((store) => {
				fetchTopProducts(store.id);
			});
		}
	}, [data]);
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(storesList, 'store'),
			headers: { 'X-WP-Nonce': storesList.nonce },
			params: {
				filters: {
					...filters,
					limit: perPage,
					offset: (page - 1) * perPage,
				},
			},
		})
			.then((response) => {
				setData(response.data || []);
				setTotal(Number(response?.headers?.['x-wp-total']) || 0);
			})
			.catch((error) =>
				console.error('Error fetching filtered stores:', error)
			);
	}, [filters, page, perPage]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const handleLocationUpdate = (locationData: any) => {
		if (!locationData) {
			return;
		}

		const updatedAddress = {
			location_lat: locationData.location_lat || '',
			location_lng: locationData.location_lng || '',
			address: locationData.address || '',
			city: locationData.city || '',
			state: locationData.state || '',
			country: locationData.country || '',
			zip: locationData.zip || '',
		};

		// Update map UI
		setAddressData((prev) => ({
			...prev,
			...updatedAddress,
		}));

		// Update filters so API call works
		setFilters((prev) => ({
			...prev,
			location_lat: updatedAddress.location_lat,
			location_lng: updatedAddress.location_lng,
		}));
	};

	const requestUserLocation = () => {
		if (!navigator.geolocation) {
			return;
		}

		navigator.geolocation.getCurrentPosition((position) => {
			const lat = position.coords.latitude.toString();
			const lng = position.coords.longitude.toString();

			setIsUserLocation(true);

			setFilters((prev) => ({
				...prev,
				location_lat: lat,
				location_lng: lng,
			}));

			setAddressData((prev) => ({
				...prev,
				location_lat: lat,
				location_lng: lng,
				address: 'My Current Location',
			}));
		});
	};

	const renderMapComponent = () => {
		if (!mapConfig.apiKey || !mapConfig.provider) {
			return null;
		}

		return (
			<MapProviderUI
				apiKey={mapConfig.apiKey}
				locationAddress={addressData.address}
				locationLat={addressData.location_lat}
				locationLng={addressData.location_lng}
				isUserLocation={false}
				onLocationUpdate={handleLocationUpdate}
				placeholderSearch={__('Search for a location...', 'multivendorx')}
				stores={null}
				mapProvider={mapConfig.provider}
			/>
		);
	};
	return (
		<>
			<div className="woocommerce multivendorx-store">
				<div className="view-tabs-wrapper">
					<ul className="view-tabs">
						<li
							className={viewMode === 'list' ? 'active' : ''}
							onClick={() => setViewMode('list')}
						>
							<a>{__('List', 'multivendorx')}</a>
						</li>

						<li
							className={viewMode === 'split' ? 'active' : ''}
							onClick={() => setViewMode('split')}
						>
							<a>{__('Split', 'multivendorx')} </a>
						</li>

						<li
							className={viewMode === 'map' ? 'active' : ''}
							onClick={() => setViewMode('map')}
						>
							<a>	{__('Map', 'multivendorx')} </a>
						</li>
					</ul>
				</div>

				<div className="store-filter-wrapper">
					{apiKey != '' && (
						<>
							<div className="woocommerce-widget-layered-nav-list">
								<div className="woocommerce-product-search">
									<input
										type="text"
										className="search-field"
										value={filters.address}
										onChange={handleInputChange}
										placeholder={__('Enter Address', 'multivendorx')}
									/>
									<button
										type="button"
										className="button location-button"
										onClick={requestUserLocation}
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d7a3e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
											<circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
										</svg>
									</button>
								</div>
							</div>
							<select
								name="distance"
								value={filters.distance}
								onChange={handleInputChange}
							>
								<option value="">{__('Within', 'multivendorx')}</option>
								<option value="5">5</option>
								<option value="10">10</option>
								<option value="25">25</option>
							</select>

							<select
								name="miles"
								value={filters.miles}
								onChange={handleInputChange}
							>
								<option value="miles">
									{__('Miles', 'multivendorx')}
								</option>
								<option value="km">
									{__('Kilometers', 'multivendorx')}
								</option>
								<option value="nm">
									{__('Nautical miles', 'multivendorx')}
								</option>
							</select>
						</>
					)}
					<select
						name="sort"
						value={filters.sort}
						onChange={handleInputChange}
					>
						<option value="name">
							{__('Select', 'multivendorx')}
						</option>
						<option value="category">
							{__('By Category', 'multivendorx')}
						</option>
						<option value="shipping">
							{__('By Shipping', 'multivendorx')}
						</option>
					</select>

					{filters.sort == 'category' && (
						<select
							name="category"
							value={filters.category || ''}
							onChange={handleInputChange}
						>
							<option value="">
								{__('Select Category', 'multivendorx')}
							</option>

							{categoryList.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
					)}
					<select
						name="product"
						value={filters.product || ''}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								product: e.target.value ? Number(e.target.value) : '',
							}))
						}
					>
						<option value="">
							{__('Select Product', 'multivendorx')}
						</option>

						{product.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>
				<p>
					{__('Showing', 'multivendorx')} {data.length}{' '}
					{__('stores', 'multivendorx')}
				</p>
				<div
					className={`store-list-wrapper is-${viewMode}`}
				>
					<div className="store-list">
						{data &&
							data.map((store) => (
								<div key={store.id} className="store">
									<div className="store-body">
										<div className="store-header">
											{store.image ? (
												<div className="store-image">
													<img src={store.image} alt={store.store_name} />
												</div>
											) : (
												<div className="avatar">
													{store.store_name?.charAt(0).toUpperCase()}
												</div>
											)}

											<div className="store-details">
												<h4>{store.store_name}</h4>
												<div className="review-rating"><div className="star-rating"><span>Rated <strong className="rating">4.00</strong> out of 5</span></div></div>
												{store.phone && store.address && (
													<div className="contact-wrapper">
														{store.phone && (
															<span>
																<i className="dashicons dashicons-phone" />{' '}
																{store.phone}
															</span>
														)}

														{store.address && (
															<span>
																<i className="dashicons dashicons-location" />
																{store.address}
															</span>
														)}
													</div>
												)}
											</div>
										</div>

										<div className="store-products">
											<h4> {__('Top Products', 'multivendorx')} </h4>
											{/* amit optimize site url  */}
											{storeTopProducts[store.id]?.length > 0 ? (
												<ul className="products columns-3">
													{storeTopProducts[store.id]?.map((p) => {
														const siteDomain = storesList?.site_url || '';
														const getProductImage = (imageUrl) => {
															if (!imageUrl) {
																return siteDomain
																	? `${siteDomain}/wp-content/uploads/woocommerce-placeholder.webp`
																	: '/wp-content/uploads/woocommerce-placeholder.webp';
															}
															if (imageUrl.includes('placeholder')) return imageUrl;
															return imageUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-420x420.$1');
														};

														const getSrcSet = (imageUrl) => {
															if (!imageUrl || imageUrl.includes('placeholder')) {
																const basePlaceholder = siteDomain
																	? `${siteDomain}/wp-content/uploads/woocommerce-placeholder`
																	: '/wp-content/uploads/woocommerce-placeholder';

																// Return placeholder srcset with site domain
																return `${basePlaceholder}.webp 1200w, ${basePlaceholder}-300x300.webp 300w, ${basePlaceholder}-1024x1024.webp 1024w, ${basePlaceholder}-150x150.webp 150w, ${basePlaceholder}-768x768.webp 768w`;
															}

															return `${getProductImage(imageUrl)} 420w, ${imageUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-150x150.$1')} 150w, ${imageUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-100x100.$1')} 100w, ${imageUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-300x300.$1')} 300w`;
														};

														return (
															<li key={p.id} className={`product type-product post-${p.id} status-publish first instock product_cat-${p.categories?.[0]?.slug || 'uncategorized'} has-post-thumbnail shipping-taxable purchasable product-type-simple`}>
																<a href={p.permalink || '#'} className="woocommerce-LoopProduct-link woocommerce-loop-product__link">
																	<img
																		width="324"
																		height="324"
																		src={getProductImage(p.images?.[0]?.src)}
																		srcSet={getSrcSet(p.images?.[0]?.src)}
																		sizes="(max-width: 324px) 100vw, 324px"
																		className={p.images?.[0]?.src
																			? 'attachment-woocommerce_thumbnail size-woocommerce_thumbnail'
																			: 'woocommerce-placeholder wp-post-image'
																		}
																		alt={p.name}
																		decoding="async"
																		loading="lazy"
																	/>
																	<h2 className="woocommerce-loop-product__title">{p.name}</h2>

																	{/* Add star rating if available */}
																	{p.average_rating > 0 && (
																		<div className="star-rating" role="img" aria-label={`Rated ${p.average_rating} out of 5`}>
																			<span style={{ width: `${(p.average_rating / 5) * 100}%` }}>
																				Rated <strong className="rating">{p.average_rating}</strong> out of 5
																			</span>
																		</div>
																	)}

																	{/* Price HTML */}
																	{p.price_html && (
																		<span
																			className="price"
																			dangerouslySetInnerHTML={{ __html: p.price_html }}
																		/>
																	)}
																</a>
															</li>
														);
													})}
												</ul>
											) : (
												<div className="no-products-found">
													<p>No products found</p>
												</div>
											)}
										</div>
									</div>
									<div className="store-footer">
										<a href={`${storesList.store_page_url}/${store.store_slug || ''}/`} className="button">
											{__('View Store', 'multivendorx')}
										</a>
									</div>
								</div>
							))}
						<nav className="woocommerce-pagination">
							<ul className="page-numbers">
								<li>
									<button
										disabled={page === 1}
										onClick={() => setPage((p) => p - 1)}
										className="page-numbers"
									>
										{__('Previous', 'multivendorx')}
									</button>
								</li>

								<li>
									<span className="page-numbers current">
										{page}
									</span>
								</li>

								<li>
									<button
										disabled={page >= totalPages}
										onClick={() => setPage((p) => p + 1)}
										className="page-numbers"
									>
										{__('Next', 'multivendorx')}
									</button>
								</li>
							</ul>
						</nav>
					</div>
					<div className="store-map">
						{renderMapComponent()}
					</div>
				</div>

			</div >
		</>
	);
};

export default MarketplaceStoreList;