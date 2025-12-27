import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';
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
}

const MarketplaceStoreList: React.FC<StoresListProps> = ({
	orderby = '',
	order = '',
	category = '',
}) => {
	const [data, setData] = useState<StoreRow[] | []>([]);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [product, setProduct] = useState<[]>([]);

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
					per_page: 100,
					meta_key: 'multivendorx_store_id',
				},
			})
			.then((response) => {
				setProduct(response.data);
			});
	}, []);

	useEffect(() => {
		handleSubmit();
	}, [filters]);

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
				filters: { ...filters },
			},
		})
			.then((response) => {
				setData(response.data.stores || []);
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

				<select
					name="product"
					value={filters.product || ''}
					onChange={handleInputChange}
					className=""
				>
					<option value="">Select Products</option>
					{product.map((pro) => (
						<option key={pro.id} value={pro.id}>
							{pro.name}
						</option>
					))}
				</select>

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
			</div>
		</>

	);
};

export default MarketplaceStoreList;
