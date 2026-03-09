import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { formatDate } from '@/services/commonFunction';

const StoreCouponList = ({
	perPage = 10,
	orderby = 'date',
	order = 'DESC',
}) => {
	const [coupons, setCoupons] = useState([]);
	const [page, setPage] = useState(1);
	const [copiedCode, setCopiedCode] = useState(null);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [perPage, orderby, order]);

	useEffect(() => {
		if (copiedCode) {
			const timer = setTimeout(() => setCopiedCode(null), 2000);
			return () => clearTimeout(timer);
		}
	}, [copiedCode]);

	const copyToClipboard = (code) => {
		navigator.clipboard.writeText(code).then(() => {
			setCopiedCode(code);
		});
	};

	const fetchCoupons = useCallback(() => {
		const params = {
			per_page: perPage,
			page,
			orderby,
			order: order?.toLowerCase() === 'asc' ? 'asc' : 'desc',
			meta_key: 'multivendorx_store_id',
		};

		if (couponList?.storeDetails?.storeId) {
			params.value = couponList.storeDetails.storeId;
		}

		axios
			.get(`${couponList.apiUrl}/wc/v3/coupons`, {
				headers: {
					'X-WP-Nonce': couponList.nonce,
				},
				params,
			})
			.then((response) => {
				setCoupons(response.data || []);
			})
			.catch(() => {
				setCoupons([]);
			});
	}, [page, perPage, orderby, order]);

	useEffect(() => {
		fetchCoupons();
	}, [fetchCoupons]);

	//If no coupons → render nothing
	if (!coupons.length) {
		return null;
	}

	return (
		<div className="store-coupon-list">
			<h3>{__('Coupons', 'multivendorx')}</h3>

			{coupons.map((coupon) => {
				const discountLabel =
					coupon.discount_type === 'percent'
						? `${coupon.amount}%`
						: `${coupon.amount}`;

				return (
					<div key={coupon.id} className="coupon-card">
						<p>
							{discountLabel} {__('off on all orders', 'multivendorx')}
						</p>

						<h4>
							{coupon.code}

							{copiedCode === coupon.code ? (
								<span>✔</span>
							) : (
								<span
									role="button"
									onClick={() => copyToClipboard(coupon.code)}
								>
									📋
								</span>
							)}
						</h4>

						<p>
							<strong>{__('Expires', 'multivendorx')}:</strong>{' '}
							{formatDate(coupon.date_expires)}
						</p>
					</div>
				);
			})}
		</div>
	);
};

export default StoreCouponList;