import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface Product {
	id: number;
	name: string;
	images?: { src: string }[];
}

interface MarketplaceProductListProps {
	columns?: number;
	perPage?: number;
	orderby?: string;
	order?: 'asc' | 'desc';
	category?: string; // comma-separated slugs
	operator?: string;
	product_visibility?:string;
	value?:string;
	store_slug?:string,
}

const MarketplaceProductList: React.FC<MarketplaceProductListProps> = ({
	columns = 4,
	perPage = 12,
	orderby = 'title',
	order = 'asc',
	category = '',
	operator = 'IN',
	product_visibility = '',
	value ='',
	store_slug = '',
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	const totalPages = Math.ceil(total / perPage);

	const fetchProducts = useCallback(async () => {
		try {
			const response = await axios.get(
				`${productList.apiUrl}/wc/v3/products`,
				{
					headers: { 'X-WP-Nonce': productList.nonce },
					params: {
						per_page: perPage,
						page,
						orderby,
						order,
						cat:category,
						operator,
						product_visibility,
						meta_key: 'multivendorx_store_id',
						value,
						store_slug
					},
				}
			);

			setProducts(response.data || []);
			setTotal(Number(response.headers['x-wp-total']) || 0);
		} catch (error) {
			console.error('Error fetching products:', error);
		}
	}, [page, perPage, orderby, order, category]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	return (
		<>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
					gap: '20px',
				}}
			>
				{products.map((product) => (
					<div key={product.id} className="product-card">
						{product.images?.[0]?.src && (
							<img
								src={product.images[0].src}
								alt={product.name}
								style={{ width: '100%' }}
							/>
						)}
						<h3>{product.name}</h3>
					</div>
				))}
			</div>

			<div style={{ marginTop: '20px', textAlign: 'center' }}>
				<button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
					Previous
				</button>

				<span style={{ margin: '0 10px' }}>
					Page {page} of {totalPages}
				</span>

				<button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
					Next
				</button>
			</div>
		</>
	);
};

export default MarketplaceProductList;
