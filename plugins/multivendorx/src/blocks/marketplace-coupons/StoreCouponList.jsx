import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const StoreCouponList = ({
	store_id = '',
	store_slug = '',
	perPage = 10,
	orderby = 'date',
	order = 'DESC',
}) => {
	const [coupons, setCoupons] = useState([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	// Always keep minimum page count = 1
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [store_id, store_slug, perPage, orderby, order]);

	const fetchCoupons = useCallback(async () => {
		try {
			const response = await axios.get(
				`${couponList.apiUrl}/wc/v3/coupons`,
				{
					headers: {
						'X-WP-Nonce': couponList.nonce,
					},
					params: {
						per_page: perPage,
						page,
						orderby,
						order: order?.toLowerCase() === 'asc' ? 'asc' : 'desc',

						// Filter meta query style (WooCommerce REST doesn't always support direct meta filters)
						meta_key: 'multivendorx_store_id',
						meta_value: store_id,
						store_slug,
					},
				}
			);

			setCoupons(response.data || []);
			setTotal(Number(response.headers['x-wp-total']) || 0);
		} catch (error) {
			console.error('Failed to load coupons:', error);
		}
	}, [page, perPage, store_id, store_slug, orderby, order]);

	useEffect(() => {
		fetchCoupons();
	}, [fetchCoupons]);

	return (
		<div className="store-coupon-list">
			{coupons.map((coupon) => (
				<div key={coupon.id} className="coupon-card">
					<h4>{coupon.code}</h4>

					<p>
						<strong>{__('Usage Count', 'multivendorx')}:</strong>{' '}
						{coupon.usage_count ?? 0}
					</p>
				</div>
			))}

			{/* Show pagination only when needed */}
			{total > perPage && (
				<div className="pagination">
					<button
						disabled={page === 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						{__('Previous', 'multivendorx')}
					</button>

					<span>
						{__('Page', 'multivendorx')} {page}{' '}
						{__('of', 'multivendorx')} {totalPages}
					</span>

					<button
						disabled={page >= totalPages}
						onClick={() =>
							setPage((p) => Math.min(totalPages, p + 1))
						}
					>
						{__('Next', 'multivendorx')}
					</button>
				</div>
			)}
		</div>
	);
};

export default StoreCouponList;