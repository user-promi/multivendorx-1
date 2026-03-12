import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiLink, MapProviderUI } from 'zyra';
import { __ } from '@wordpress/i18n';

interface StoreRow {
	id: number;
	name: string;
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
				// Optional Mapbox-specific props if needed
				mapboxStyle={settings.geolocation.mapbox_style || 'mapbox://styles/mapbox/standard'}
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
								<div className="woocommerce-product-search" style={{ position: 'relative', marginBottom: '15px' }}>
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
										style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)' }}
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
										</div>
									</div>

									<div className="store-products">
										<h6 className="woocommerce-products-header__title">
											{__('Top Products', 'multivendorx')}
										</h6>

										{/* (pkoro start) */}
										<ul className="products">
											<li className="product type-product">
												<a href="#" className="woocommerce-LoopProduct-link woocommerce-loop-product__link">
													<div className="woocommerce-loop-product__thumbnail">
														<div className="woocommerce-placeholder">
															<img
																src="https://via.placeholder.com/300x300"
																alt="Placeholder"
																className="wp-post-image"
																width="30"
																height="30"
															/>
														</div>
													</div>
													<h6 className="woocommerce-loop-product__title">
														Product Name 1 (pkoro)
													</h6>
												</a>
											</li>
											<li className="product type-product">
												<a href="#" className="woocommerce-LoopProduct-link woocommerce-loop-product__link">
													<div className="woocommerce-loop-product__thumbnail">
														<div className="woocommerce-placeholder">
															<img
																src="https://via.placeholder.com/300x300"
																alt="Placeholder"
																className="wp-post-image"
																width="30"
																height="30"
															/>
														</div>
													</div>
													<h6 className="woocommerce-loop-product__title">
														Product Name 1 (pkoro)
													</h6>
												</a>
											</li>
											<li className="product type-product">
												<a href="#" className="woocommerce-LoopProduct-link woocommerce-loop-product__link">
													<div className="woocommerce-loop-product__thumbnail">
														<div className="woocommerce-placeholder">
															<img
																src="https://via.placeholder.com/300x300"
																alt="Placeholder"
																className="wp-post-image"
																width="30"
																height="30"
															/>
														</div>
													</div>
													<h6 className="woocommerce-loop-product__title">
														Product Name 1 (pkoro)
													</h6>
												</a>
											</li>
										</ul> {/* (pkoro end) */}
									</div>

									<div className="store-footer">
										<p> 7 products</p>
										<button>View Store</button>
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
