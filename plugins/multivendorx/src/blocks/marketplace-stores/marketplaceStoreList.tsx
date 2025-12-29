import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';

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

	const totalPages = Math.ceil(total / perPage);

	const [filters, setFilters] = useState({
		address: '',
		distance: '',
		miles: '',
		sort: orderby,
		order: order,
		category: category,
		product: '',
	});

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
						search: inputValue || undefined,
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
		handleSubmit();
	}, [filters, page, perPage]);

	useEffect(() => {
		setPage(1);
	}, [filters.product]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = () => {
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
				setData(response.data.stores || []);
				setTotal(response.data.all || 0);
			})
			.catch((error) =>
				console.error('Error fetching filtered stores:', error)
			);
	};

	return (
		<>
			<div className="">
				{/* Filter Bar */}
				<input
					type="text"
					name="address"
					value={filters.address}
					onChange={handleInputChange}
					placeholder="Enter Address"
					className=""
				/>
				<select
					name="distance"
					value={filters.distance}
					onChange={handleInputChange}
					className=""
				>
					<option value="">Within</option>
					<option value="5">5</option>
					<option value="10">10</option>
					<option value="25">25</option>
				</select>
				<select
					name="miles"
					value={filters.miles}
					onChange={handleInputChange}
					className=""
				>
					<option value="miles">Miles</option>
					<option value="km">Kilometers</option>
					<option value="nm">Nautical miles</option>
				</select>

				<select
					name="sort"
					value={filters.sort}
					onChange={handleInputChange}
					className=""
				>
					<option value="name">Select</option>
					<option value="category">By Category</option>
					<option value="shipping">By Shipping</option>
				</select>

				{filters.sort == 'category' && (
					<select
						name="category"
						value={filters.category || ''}
						onChange={handleInputChange}
						className=""
					>
						<option value="">Select Category</option>
						{categoryList.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				)}
				<Select
					options={product.map((p) => ({
						label: String(p.name),
						value: p.id,
					}))}
					onInputChange={(value) => {
						loadProducts(value);
						return value;
					}}
					onChange={(selected) =>
						setFilters((prev) => ({
							...prev,
							product: selected?.value ?? '',
						}))
					}
					isClearable
				/>
				<div className="">Viewing all {data.length} stores</div>

				{/* Store Cards */}
				<div className="">
					{data &&
						data.map((store) => (
							<div key={store.id} className="">
								<div className="">
									<div className="">
										<img src={store.image} />
									</div>

									<div className="flex gap-2">
										<button className="">
											📞{store.phone}
										</button>
										<button className="">
											📍{store.address_1}
										</button>
									</div>
								</div>

								<h2 className="">{store.store_name}</h2>

								<div className="">
									<p className="">Top Products</p>
									{/* <div className="">
                {vendor.topProducts && vendor.topProducts.length > 0 ? (
                  vendor.topProducts.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Product"
                      className=""
                    />
                  ))
                ) : (
                  <p className="">No products</p>
                )}
              </div> */}
								</div>
							</div>
						))}
				</div>


				<div className="pagination">
					<button
						disabled={page === 1}
						onClick={() => setPage((p) => p - 1)}
					>
						Previous
					</button>

					<span>
						Page {page} of {totalPages}
					</span>

					<button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
					>
						Next
					</button>
				</div>
			</div>
		</>

	);
};

export default MarketplaceStoreList;
