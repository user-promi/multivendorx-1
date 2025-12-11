import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	ResponsiveContainer,
	Tooltip,
	Legend,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import axios from 'axios';
import { getApiLink } from 'zyra';
import { formatCurrency } from '@/services/commonFunction';

type Stat = {
	id: string | number;
	count: number | string;
	icon: string;
	label: string;
};

type MarketplaceReportProps = {
	overview: Stat[];
	data: {
		month: string;
		revenue: number;
		net_sale: number;
		admin_amount: number;
	}[];
	overviewData: { name: string; orders: number; sold_out: number }[];
	pieData: { name: string; value: number }[];
	COLORS?: string[];
};

const MarketplaceReport: React.FC< MarketplaceReportProps > = ( {} ) => {
	const [ commissionDetails, setCommissionDeatils ] = useState< any[] >( [] );
	const [ earningSummary, setEarningSummary ] = useState< any[] >( [] );
	const [ pieData, setPieData ] = useState< any >( [] );
	const [ topCoupons, setTopCoupons ] = useState< any[] >( [] );
	const [ topCustomers, setTopCustomers ] = useState< any[] >( [] );
	const [ topStores, setTopStores ] = useState< any[] >( [] );

	const Counter = ( { value, duration = 1200, format } ) => {
		const [ count, setCount ] = React.useState( 0 );

		React.useEffect( () => {
			let start = 0;
			const end = Number( value );
			if ( isNaN( end ) ) return;

			const step = end / ( duration / 16 );

			const timer = setInterval( () => {
				start += step;
				if ( start >= end ) {
					start = end;
					clearInterval( timer );
				}
				setCount( start );
			}, 16 );

			return () => clearInterval( timer );
		}, [ value ] );

		return <>{ format ? format( count ) : Math.floor( count ) }</>;
	};

	const fetchCommissionDetails = async () => {
		axios( {
			method: 'GET',
			url: getApiLink( appLocalizer, 'commission' ),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { format: 'reports' },
		} )
			.then( ( response ) => {
				const data = response.data;

				// Basic calculations
				const adminEarning =
					data.total_order_amount - data.commission_total;
				const storeEarning = data.commission_total;

				// Overview data (optional if you use it elsewhere)
				const overviewData = [
					{
						id: 'total_order_amount',
						label: 'Total Order Amount',
						count: Number( data.total_order_amount ),
						formatted: formatCurrency( data.total_order_amount ),
						icon: 'adminlib-order green',
					},
					{
						id: 'facilitator_fee',
						label: 'Facilitator Fee',
						count: Number( data.facilitator_fee ),
						formatted: formatCurrency( data.facilitator_fee ),
						icon: 'adminlib-facilitator blue',
					},
					{
						id: 'gateway_fee',
						label: 'Gateway Fee',
						count: Number( data.gateway_fee ),
						formatted: formatCurrency( data.gateway_fee ),
						icon: 'adminlib-credit-card red',
					},
					{
						id: 'shipping_amount',
						label: 'Shipping Amount',
						count: Number( data.shipping_amount ),
						formatted: formatCurrency( data.shipping_amount ),
						icon: 'adminlib-shipping green',
					},
					{
						id: 'tax_amount',
						label: 'Tax Amount',
						count: Number( data.tax_amount ),
						formatted: formatCurrency( data.tax_amount ),
						icon: 'adminlib-tax-compliance blue',
					},
					{
						id: 'shipping_tax_amount',
						label: 'Shipping Tax Amount',
						count: Number( data.shipping_tax_amount ),
						formatted: formatCurrency( data.shipping_tax_amount ),
						icon: 'adminlib-per-product-shipping purple',
					},
					{
						id: 'commission_total',
						label: 'Commission Total',
						count: Number( data.commission_total ),
						formatted: formatCurrency( data.commission_total ),
						icon: 'adminlib-commission yellow',
					},
					{
						id: 'commission_refunded',
						label: 'Commission Refunded',
						count: Number( data.commission_refunded ),
						formatted: formatCurrency( data.commission_refunded ),
						icon: 'adminlib-marketplace-refund red',
					},
				];

				// Just Admin + Store + Total for Revenue Breakdown
				const earningSummary = [
					{
						id: 'total_order_amount',
						title: 'Total Order Amount',
						price: formatCurrency( data.total_order_amount ),
					},
					{
						id: 'admin_earning',
						title: 'Admin Net Earning',
						price: formatCurrency( adminEarning ),
					},
					{
						id: 'store_earning',
						title: 'Store Net Earning',
						price: formatCurrency( storeEarning ),
					},
					{
						id: 'facilitator_fee',
						title: 'Facilitator Fee',
						price: formatCurrency( data.facilitator_fee ),
					},
					{
						id: 'gateway_fee',
						title: 'Gateway Fee',
						price: formatCurrency( data.gateway_fee ),
					},
					{
						id: 'shipping_amount',
						title: 'Shipping Amount',
						price: formatCurrency( data.shipping_amount ),
					},
					{
						id: 'tax_amount',
						title: 'Tax Amount',
						price: formatCurrency( data.tax_amount ),
					},
					{
						id: 'shipping_tax_amount',
						title: 'Shipping Tax Amount',
						price: formatCurrency( data.shipping_tax_amount ),
					},
					{
						id: 'commission_total',
						title: 'Commission Total',
						price: formatCurrency( data.commission_total ),
					},
					{
						id: 'commission_refunded',
						title: 'Commission Refunded',
						price: formatCurrency( data.commission_refunded ),
					},
					{
						id: 'grand_total',
						title: 'Grand Total',
						price: formatCurrency( adminEarning + storeEarning ),
					},
				];

				const pieChartData = [
					{ name: 'Admin Net Earning', value: adminEarning },
					{ name: 'Store Net Earning', value: storeEarning },
					{
						name: 'Commission Refunded',
						value: data.commission_refunded,
					},
				];

				setCommissionDeatils( overviewData );
				setEarningSummary( earningSummary );
				setPieData( pieChartData );
			} )
			.catch( () => {
				// Handle error gracefully
			} );

		axios( {
			method: 'GET',
			url: getApiLink( appLocalizer, 'commission' ),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { format: 'reports', top_stores: 3 },
		} )
			.then( ( response ) => {
				setTopStores( response.data );
			} )
			.catch( () => {
				// Handle error gracefully
			} );
	};

	useEffect( () => {
		// Top selling coupons
		axios( {
			method: 'GET',
			url: `${ appLocalizer.apiUrl }/wc/v3/coupons`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				meta_key: 'multivendorx_store_id',
				per_page: 50, // get more so we can sort later
				orderby: 'date', // valid param, required by API
				order: 'desc',
			},
		} )
			.then( ( response ) => {
				// Sort coupons manually by usage_count (descending)
				const sortedCoupons = response.data
					.sort( ( a, b ) => b.usage_count - a.usage_count )
					.slice( 0, 5 ); // take top 5 only

				setTopCoupons( sortedCoupons );
			} )
			.catch( ( error ) => {
				console.error( 'Error fetching top coupons:', error );
			} );

		axios( {
			method: 'GET',
			url: `${ appLocalizer.apiUrl }/wc-analytics/customers`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				per_page: 50, // fetch more customers so we can sort manually
				orderby: 'total_spend',
				order: 'desc',
			},
		} )
			.then( ( response ) => {
				// Sort by total_spend manually in case API doesn't enforce order
				const sortedCustomers = response.data
					.sort( ( a, b ) => b.total_spend - a.total_spend )
					.slice( 0, 5 ); // Top 5 customers only

				setTopCustomers( sortedCustomers );
			} )
			.catch( ( error ) => {
				console.error( 'Error fetching top customers:', error );
			} );

		fetchCommissionDetails();
	}, [] );

	return (
		<>
			<div className="container-wrapper column">
				<div className="card-wrapper">
					<div className="card-content transparent">
						<div className="analytics-container report column-3">
							{ commissionDetails.map( ( item, idx ) => (
								<div key={ idx } className="analytics-item">
									<div className="analytics-icon">
										<i className={ item.icon }></i>
									</div>
									<div className="details">
										<div className="number">
											<Counter
												value={ item.count }
												format={ formatCurrency }
											/>
										</div>
										<div className="text">
											{ __( item.label, 'multivendorx' ) }
										</div>
									</div>
								</div>
							) ) }
						</div>
					</div>
				</div>

				<div className="card-wrapper">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __(
										'Revenue breakdown',
										'multivendorx'
									) }
								</div>
							</div>
						</div>
						<div className="card-body">
							<div className="top-items">
								{ earningSummary.map( ( product ) => (
									<div className="items" key={ product.id }>
										<div className="left-side">
											<div className="details">
												<div className="item-title">
													{ product.title }
												</div>
											</div>
										</div>
										<div className="right-side">
											<div className="price">
												{ product.price }
											</div>
										</div>
									</div>
								) ) }
							</div>
						</div>
					</div>

					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __(
										'Revenue breakdown',
										'multivendorx'
									) }
								</div>
							</div>
						</div>
						<div className="card-body">
							<div style={ { width: '100%', height: 400 } }>
								<ResponsiveContainer>
									<PieChart>
										<Pie
											data={ pieData }
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius={ 140 }
											innerRadius={ 80 }
											label={ ( { name, percent } ) =>
												`${ name } ${ (
													percent * 100
												).toFixed( 1 ) }%`
											}
											labelLine={ false }
											isAnimationActive={ true }
										>
											{ pieData.map( ( _, index ) => (
												<Cell
													key={ `cell-${ index }` }
													fill={
														[
															'#0088FE',
															'#00C49F',
															'#FF8042',
														][ index % 3 ]
													}
												/>
											) ) }
										</Pie>
										<Tooltip
											formatter={ ( value ) =>
												formatCurrency( value )
											}
											contentStyle={ {
												backgroundColor: '#fff',
												borderRadius: '8px',
												border: '1px solid #ddd',
											} }
										/>
										<Legend
											verticalAlign="bottom"
											height={ 36 }
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				</div>
				{ /* Keep categories and brands */ }
				<div className="card-wrapper">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __(
										'Top Selling Coupons',
										'multivendorx'
									) }
								</div>
							</div>
						</div>
						<div className="card-body">
							{ topCoupons.length > 0 ? (
								topCoupons.map( ( coupon: any ) => (
									<div
										className="info-item"
										key={ `coupon-${ coupon.id }` }
									>
										<div className="details-wrapper">
											<div className="avatar">
												<a
													href={ `${ appLocalizer.site_url }/wp-admin/post.php?post=${ coupon.id }&action=edit` }
													target="_blank"
													rel="noopener noreferrer"
												>
													<i className="adminlib-coupon"></i>
												</a>
											</div>

											<div className="details">
												<div className="name">
													<a
														href={ `${ appLocalizer.site_url }/wp-admin/post.php?post=${ coupon.id }&action=edit` }
														target="_blank"
														rel="noopener noreferrer"
													>
														{ coupon.code }
													</a>
												</div>
												<div className="des">
													{ __(
														'Used',
														'multivendorx'
													) }{ ' ' }
													{ coupon.usage_count || 0 }{ ' ' }
													{ __(
														'times',
														'multivendorx'
													) }
												</div>
												{ coupon.description && (
													<div className="des">
														{ coupon.description }
													</div>
												) }
												{ coupon.store_name && (
													<div className="des">
														<b>
															{ __(
																'Store:',
																'multivendorx'
															) }
														</b>{ ' ' }
														{ coupon.store_name }
													</div>
												) }
											</div>
										</div>

										<div className="right-details">
											<div className="price">
												<span>
													{ coupon.amount
														? coupon.discount_type ===
														  'percent'
															? `${ coupon.amount }%`
															: formatCurrency(
																	coupon.amount
															  )
														: '—' }
												</span>
											</div>
										</div>
									</div>
								) )
							) : (
								<p>
									{ __(
										'No top coupons found.',
										'multivendorx'
									) }
								</p>
							) }
						</div>
					</div>
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __( 'Top Customers', 'multivendorx' ) }
								</div>
							</div>
						</div>
						<div className="card-body">
							{ topCustomers.length > 0 ? (
								topCustomers.map( ( customer: any ) => (
									<div
										className="info-item"
										key={ `customer-${ customer.user_id }` }
									>
										<div className="details-wrapper">
											<div className="avater">
												<a
													href={ `${ appLocalizer.site_url }/wp-admin/user-edit.php?user_id=${ customer.user_id }&wp_http_referer=%2Fwp-admin%2Fusers.php` }
													target="_blank"
													rel="noopener noreferrer"
												>
													<div className="avatar">
														<span>
															{ (
																(
																	customer.name?.trim() ||
																	customer.username
																)?.charAt(
																	0
																) || ''
															).toUpperCase() }
														</span>
													</div>
												</a>
											</div>

											<div className="details">
												<div className="name">
													<a
														href={ `${ appLocalizer.site_url }/wp-admin/user-edit.php?user_id=${ customer.user_id }&wp_http_referer=%2Fwp-admin%2Fusers.php` }
														target="_blank"
														rel="noopener noreferrer"
													>
														{ customer.name?.trim() ||
															customer.username }
													</a>
												</div>
												<div className="des">
													{ __(
														'Orders',
														'multivendorx'
													) }
													:{ ' ' }
													{ customer.orders_count ||
														0 }
												</div>
												<div className="des">
													{ customer.email ||
														__(
															'No email',
															'multivendorx'
														) }
												</div>
											</div>
										</div>

										<div className="right-details">
											<div className="price">
												<span>
													{ formatCurrency(
														customer.total_spend ||
															0
													) }
												</span>
											</div>
										</div>
									</div>
								) )
							) : (
								<p>
									{ __(
										'No top customers found.',
										'multivendorx'
									) }
								</p>
							) }
						</div>
					</div>
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __( 'Top Stores', 'multivendorx' ) }
								</div>
							</div>
						</div>
						<div className="card-body">
							{ topStores.length > 0 ? (
								topStores.map( ( store: any ) => (
									<div
										className="info-item"
										key={ `store-${ store.store_id }` }
									>
										<div className="details-wrapper">
											<div className="avater">
												<a
													href={ `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${ store.store_id }/&subtab=store-overview` }
													target="_blank"
													rel="noopener noreferrer"
												>
													<div></div>
													<div className="avatar">
														<span>
															{ (
																store.store_name
																	?.trim()
																	?.charAt(
																		0
																	) || ''
															).toUpperCase() }
														</span>
													</div>
												</a>
											</div>

											<div className="details">
												<div className="name">
													<a
														href={ `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${ store.store_id }/&subtab=store-overview` }
														target="_blank"
														rel="noopener noreferrer"
													>
														{ store.store_name }
													</a>
												</div>
												<div className="des">
													{ __(
														'Commission',
														'multivendorx'
													) }
													:{ ' ' }
													{ formatCurrency(
														store.commission_total ||
															0
													) }
												</div>
												<div className="des">
													{ __(
														'Refunded',
														'multivendorx'
													) }
													:{ ' ' }
													{ formatCurrency(
														store.commission_refunded ||
															0
													) }
												</div>
											</div>
										</div>

										<div className="right-details">
											<div className="price">
												<span>
													{ formatCurrency(
														store.total_order_amount ||
															0
													) }
												</span>
											</div>
										</div>
									</div>
								) )
							) : (
								<p>
									{ __(
										'No top stores found.',
										'multivendorx'
									) }
								</p>
							) }
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default MarketplaceReport;
