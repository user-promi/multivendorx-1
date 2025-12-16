import {
	BarChart,
	Bar,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	PieLabelRenderProps,
} from 'recharts';
import { scaleLinear } from 'd3-scale';
import React, { useState, useEffect } from 'react';
import '../components/dashboard.scss';
import '../dashboard/dashboard1.scss';
import { getApiLink, MultiCalendarInput, TableCell, useModules } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { formatCurrency } from '@/services/commonFunction';

const activities = [
	{ icon: 'adminlib-cart', text: 'New order #10023 by Alex Doe.' },
	{ icon: 'adminlib-star', text: 'Inventory updated: "Coffee Beans"' },
	{
		icon: 'adminlib-global-community',
		text: 'Customer "davidchen" updated account.',
	},
	{ icon: 'adminlib-cart', text: 'New product "Wireless Headset"' },
];

const getCSSVar = (name) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const themeColors = [
	getCSSVar('--colorPrimary'),
	getCSSVar('--colorSecondary'),
	getCSSVar('--colorAccent'),
	getCSSVar('--colorSupport'),
];

const BarChartData = [
	{ name: 'Sales', dataKey: 'orders', color: themeColors[0] },
	{ name: 'Earnings', dataKey: 'earnings', color: themeColors[1] },
	{ name: 'Orders', dataKey: 'refunds', color: themeColors[2] },
];

const customers = [
	{
		id: 1,
		name: 'David Chen',
		orders: 7,
		total: '$1250',
		icon: 'adminlib-person',
	},
	{
		id: 2,
		name: 'Sophia Martinez',
		orders: 12,
		total: '$2320',
		icon: 'adminlib-person',
	},
	{
		id: 3,
		name: 'Ethan Johnson',
		orders: 4,
		total: '$890',
		icon: 'adminlib-person',
	},
	{
		id: 4,
		name: 'Liam Patel',
		orders: 9,
		total: '$1560',
		icon: 'adminlib-person',
	},
];

const RADIAN = Math.PI / 180;
const COLORS = [themeColors[0], themeColors[1], themeColors[2], themeColors[3]];

const renderCustomizedLabel = ({
	cx,
	cy,
	midAngle,
	innerRadius,
	outerRadius,
	percent,
}: PieLabelRenderProps) => {
	if (
		cx == null ||
		cy == null ||
		innerRadius == null ||
		outerRadius == null
	) {
		return null;
	}

	const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
	const x = cx + radius * Math.cos(-midAngle! * RADIAN);
	const y = cy + radius * Math.sin(-midAngle! * RADIAN);

	return (
		<text
			x={x}
			y={y}
			fill="#fff"
			textAnchor={x > cx ? 'start' : 'end'}
			dominantBaseline="central"
			fontSize={12}
			fontWeight={600}
		>
			{`${((percent ?? 0) * 100).toFixed(0)}%`}
		</text>
	);
};
const Dashboard: React.FC = () => {
	const [review, setReview] = useState<any[]>([]);
	const [pendingRefund, setPendingRefund] = useState<any[]>([]);
	const [announcement, setAnnouncement] = useState<any[]>([]);
	const [topProducts, setTopProducts] = useState([]);
	const [recentOrder, setRecentOrders] = useState<any[]>([]);
	const [transaction, setTransaction] = useState<any[]>([]);
	const [store, setStore] = useState<any[]>([]);
	const [totalOrder, setTotalOrder] = useState<any>([]);
	const [lastWithdraws, setLastWithdraws] = useState<any>([]);
	const { modules } = useModules();

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'review'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 4,
				store_id: appLocalizer.store_id,
				orderBy: 'date_created',
				order: 'desc',
			},
		})
			.then((response) => {
				const items = response.data.items || [];
				setReview(items);
			})
			.catch(() => {
				setReview([]);
			});

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				meta_key: 'multivendorx_store_id',
				value: appLocalizer.store_id,
				// refund_status: "refund_request",
				status: 'refund-requested',
				page: 1,
				per_page: 4,
				orderby: 'date',
				order: 'desc',
			},
		})
			.then((response) => {
				const items = response.data || [];

				const formatData = items.map((order) => {
					// extract refund reason
					const reasonMeta = order.meta_data.find(
						(m) => m.key === '_customer_refund_reason'
					);
					const refundReason = reasonMeta
						? reasonMeta.value
						: 'No reason';

					return {
						id: order.id,
						name: `${order.billing.first_name} ${order.billing.last_name}`,
						reason: refundReason,
						time: order.date_created, // or format with moment()
						amount: order.total,
					};
				});

				setPendingRefund(formatData);
			})
			.catch(() => {
				setPendingRefund([]);
			});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'announcement'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 4,
				store_id: appLocalizer.store_id,
			},
		})
			.then((response) => {
				setAnnouncement(response.data.items || []);
			})
			.catch(() => { });

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/products`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				per_page: 5,
				meta_key: 'multivendorx_store_id',
				orderby: 'popularity',
				order: 'desc',
				value: appLocalizer.store_id,
			},
		})
			.then((response) => {
				const products = response.data;

				// Find max sales to calculate popularity %
				const maxSales = Math.max(
					...products.map((p) => parseInt(p.total_sales) || 0)
				);

				const processed = products.map((p) => {
					const sales = parseInt(p.total_sales) || 0;
					const popularity =
						maxSales > 0 ? Math.round((sales / maxSales) * 100) : 0;
					return {
						id: p.id,
						name: p.name,
						sales,
						popularity,
					};
				});
				console.log('pro', processed);
				setTopProducts(processed);
			})
			.catch((error) => {
				console.error('Error fetching top selling products:', error);
			});

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				per_page: 5,
				order: 'desc',
				orderby: 'date',
				meta_key: 'multivendorx_store_id',
				value: appLocalizer.store_id, // THIS FIXES YOUR ISSUE
			},
		})
			.then((response) => {
				const orders = response.data.map((order) => {
					return {
						id: order.id,
						store_name: order.store_name || '-',
						amount: formatCurrency(order.total),
						commission_amount: order.commission_amount
							? formatCurrency(order.commission_amount)
							: '-',
						date: formatWcShortDate(order.date_created),
						status: order.status,
						currency_symbol: order.currency_symbol,
					};
				});

				setRecentOrders(orders);
			})
			.catch(() => { });

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transaction'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 4,
				store_id: appLocalizer.store_id,
				orderBy: 'created_at',
				order: 'DESC',
			},
		})
			.then((response) => {
				setTransaction(response.data.transaction || []);
			})
			.catch((error) => {
				setTransaction([]);
			});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res: any) => {
			const data = res.data || {};
			setStore(data);
		});
		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				per_page: 1,
				meta_key: 'multivendorx_store_id',
				value: appLocalizer.store_id,
			},
		})
			.then((response) => {
				// WooCommerce returns total order count in headers
				const totalOrders =
					parseInt(response.headers['x-wp-total']) || 0;
				setTotalOrder(totalOrders);
			})
			.catch(() => { });

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transaction'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 5,
				store_id: appLocalizer.store_id,
				transaction_type: 'Withdrawal',
				transaction_status: 'Completed',
				orderBy: 'created_at',
				order: 'DESC',
			},
		})
			.then((response) => {
				setLastWithdraws(response.data.transaction || []);
			})
			.catch(() => setLastWithdraws([]));
	}, []);

	const analyticsData = [
		{
			icon: 'adminlib-dollar',
			number: formatCurrency(store?.commission?.total_order_amount || 0),
			text: 'Total Revenue',
			color: 'primary'
		},
		{
			icon: 'adminlib-order',
			number: totalOrder,
			text: 'Total Orders',
			color: 'secondary'
		},
		{
			icon: 'adminlib-store-seo',
			number: formatCurrency(store?.commission?.commission_total || 0),
			text: 'Store Views',
			color: 'accent'
		},
		{
			icon: 'adminlib-commission',
			number: formatCurrency(store?.commission?.commission_total || 0),
			text: 'Commission Earned',
			color: 'support'
		},
	];

	const columns: ColumnDef<StoreRow>[] = [
		{
			id: 'order_id',
			header: __('Order', 'multivendorx'),
			cell: ({ row }) => {
				const id = row.original.id;

				const orderUrl = `/dashboard/sales/orders/#view/${id}`;

				return (
					<TableCell>
						<a
							href={orderUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							#{id}
						</a>
					</TableCell>
				);
			},
		},
		{
			header: __('Amount', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.amount}</TableCell>,
		},
		{
			header: __('Commission', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>{row.original.commission_amount}</TableCell>
			),
		},
		{
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.date}</TableCell>,
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				const rawStatus = row.original.status || '';
				const status = rawStatus.toLowerCase();

				const statusColorMap: Record<string, string> = {
					completed: 'green',
					processing: 'blue',
					refunded: 'red',
					'on-hold': 'yellow',
					cancelled: 'gray',
					pending: 'orange',
					failed: 'dark-red',
					'refund-requested': 'purple',
				};

				const badgeClass = statusColorMap[status] || 'gray';

				const displayStatus =
					status
						?.replace(/-/g, ' ')
						?.replace(/\b\w/g, (c) => c.toUpperCase()) || '-';

				return (
					<TableCell title={displayStatus}>
						<span className={`admin-badge ${badgeClass}`}>
							{displayStatus}
						</span>
					</TableCell>
				);
			},
		},
	];

	const formatWcShortDate = (dateString: any) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});
	};

	function formatTimeAgo(dateString: any) {
		const date = new Date(dateString.replace(' ', 'T'));
		const diff = (Date.now() - date.getTime()) / 1000;

		if (diff < 60) {
			return 'just now';
		}
		if (diff < 3600) {
			return Math.floor(diff / 60) + 'm ago';
		}
		if (diff < 86400) {
			return Math.floor(diff / 3600) + 'h ago';
		}
		return Math.floor(diff / 86400) + 'd ago';
	}
	// Helper function to get dynamic greeting
	const getGreeting = () => {
		const hour = new Date().getHours();

		if (hour >= 5 && hour < 12) {
			return 'Good Morning';
		} else if (hour >= 12 && hour < 17) {
			return 'Good Afternoon';
		} else if (hour >= 17 && hour < 21) {
			return 'Good Evening';
		} else {
			return 'Good Night';
		}
	};
	const revenueData = [
		{
			month: 'Jan',
			orders: 4000,
			earnings: 2400,
			refunds: 200,
			conversion: 2.4,
		},
		{
			month: 'Feb',
			orders: 3000,
			earnings: 1398,
			refunds: 40,
			conversion: 2.1,
		},
		{
			month: 'Mar',
			orders: 5000,
			earnings: 2800,
			refunds: 280,
			conversion: 3.2,
		},
		{
			month: 'Apr',
			orders: 4780,
			earnings: 3908,
			refunds: 1000,
			conversion: 2.6,
		},
		{
			month: 'May',
			orders: 5890,
			earnings: 4800,
			refunds: 300,
			conversion: 3.4,
		},
		{
			month: 'Jun',
			orders: 4390,
			earnings: 3800,
			refunds: 210,
			conversion: 2.9,
		},
		{
			month: 'Jul',
			orders: 6490,
			earnings: 5200,
			refunds: 600,
			conversion: 3.6,
		},
	];

	// map data
	const visitorData = {
		IN: 20,
		DE: 20,
		GB: 20,
		CZ: 20,
		US: 20,
	};

	const colorScale = scaleLinear()
		.domain([0, 20])
		.range(['#E0ECF8', '#1565c0']);
	const chartData = [
		{
			name: 'Commission Earned',
			value: Number(store?.commission?.commission_total || 0),
			color: themeColors[0],
		},
		{
			name: 'Commission Refunded',
			value: Number(store?.commission?.commission_refunded || 0),
			color: themeColors[1],
		},
		{
			name: 'Total Revenue',
			value: Number(store?.commission?.total_order_amount || 0),
			color: themeColors[2],
		},
	];

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{getGreeting()},{' '}
						{store?.primary_owner_info?.data?.display_name}!
					</div>

					<div className="view-des">
						{__('You’re viewing:', 'multivendorx')}{' '}
						<b>
							{store?.primary_owner_info?.data?.display_name}’s{' '}
							{store?.name || '-'}
						</b>
					</div>
				</div>

				<div className="buttons-wrapper">
					<MultiCalendarInput wrapperClass="" inputClass="" />
				</div>
			</div>

			<div className="container-wrapper column">
				<div className="card-wrapper">
					<div className="card-content transparent">
						<div className="analytics-container dashboard">
							{analyticsData.map((item, idx) => (
								<div key={idx} className={`analytics-item ${item.color}`}>
									<div className="details">
										<div className="text">
											{__(item.text, 'multivendorx')}
										</div>
										<div className="number">
											{item.number}
										</div>

										<div className="report">
											<div>
												{__(
													'Last 30 days:',
													'multivendorx'
												)}{' '}
												<span className={`${item.color}-color`}>$189</span>
											</div>

											<div>
												{__(
													'Previous 30 days:',
													'multivendorx'
												)}{' '}
												<span className={`${item.color}-color`}>$690</span>
											</div>
										</div>
									</div>

									<div className="analytics-icon">
										<i className={`${item.icon} ${item.color}-bg`}></i>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="card-wrapper">
					<div className="card-content w-65">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__('Sales Overview (P)', 'multivendorx')}
								</div>
							</div>
							<div className="right">
								<i className="adminlib-external icon"></i>
							</div>
						</div>
						<div className="card-body">
							<ResponsiveContainer width="100%" height={250}>
								<BarChart
									data={revenueData}
									barSize={12}
									barCategoryGap="20%"
								>
									<CartesianGrid
										stroke="#f0f0f0"
										vertical={false}
									/>
									<XAxis
										dataKey="month"
										axisLine={false}
										tickLine={false}
									/>
									<YAxis axisLine={false} tickLine={false} />

									<Tooltip
										contentStyle={{
											background: '#fff',
											border: 'none',
											borderRadius: '3px',
											boxShadow:
												'0 2px 6px rgba(0,0,0,0.08)',
										}}
									/>

									<Legend />

									{BarChartData.map((entry) => (
										<Bar
											dataKey={entry.dataKey}
											fill={entry.color}
											radius={[6, 6, 0, 0]}
											name={__(
												entry.name,
												'multivendorx'
											)}
										/>
									))}

									<Line
										type="monotone"
										dataKey="conversion"
										stroke="#ffa726"
										strokeWidth={2}
										dot={{ r: 3 }}
										name={__(
											'Conversion %',
											'multivendorx'
										)}
										yAxisId={1}
									/>

									<YAxis
										yAxisId={1}
										orientation="right"
										axisLine={false}
										tickLine={false}
										tickFormatter={(v) => `${v}%`}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Right Column */}
					<div className="card-content w-35">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__('Last Withdrawal', 'multivendorx')}
								</div>
							</div>
						</div>

						<div className="top-customer-wrapper">
							{lastWithdraws && lastWithdraws.length > 0 ? (
								lastWithdraws.map((item) => (
									<div key={item.id} className="info-item">
										<div className="details-wrapper">
											<div className="details">
												<div className="name">
													{item.payment_method ===
														'stripe-connect' &&
														__(
															'Stripe',
															'multivendorx'
														)}
													{item.payment_method ===
														'bank-transfer' &&
														__(
															'Direct to Local Bank (INR)',
															'multivendorx'
														)}
													{item.payment_method ===
														'paypal-payout' &&
														__(
															'PayPal',
															'multivendorx'
														)}
													{item.payment_method ===
														'bank-transfer'
														? __(
															'Bank Transfer',
															'multivendorx'
														)
														: ''}
												</div>

												<div className="des">
													{formatWcShortDate(
														item.date
													)}
												</div>
											</div>
										</div>

										<div className="right-details">
											<div className="price">
												{formatCurrency(item.amount)}
											</div>
										</div>
									</div>
								))
							) : (
								<div className="no-data">
									{__(
										'No withdrawals found.',
										'multivendorx'
									)}
								</div>
							)}
						</div>

						{lastWithdraws && lastWithdraws.length > 0 && (
							<div className="buttons-wrapper">
								<div
									className="admin-btn btn-purple"
									onClick={() => {
										window.location.href =
											'/dashboard/wallet/transactions/';
									}}
								>
									<i className="adminlib-preview"></i>
									{__(
										'View transaction history',
										'multivendorx'
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="card-wrapper">
					<div className="card-content">
						<div className="card">
							<div className="card-header">
								<div className="left">
									<div className="title">
										{__('Recent Orders', 'multivendorx')}
									</div>
								</div>
								<div className="right">
									<i className="adminlib-external icon"></i>
								</div>
							</div>

							<div className="card-body">
								<div className="table-wrapper">
									{recentOrder && recentOrder.length > 0 ? (
										<table>
											<thead>
												<tr className="header">
													<td>
														{__(
															'Order Id',
															'multivendorx'
														)}
													</td>
													<td>
														{__(
															'Order Date',
															'multivendorx'
														)}
													</td>
													<td>
														{__(
															'Product Name(P)',
															'multivendorx'
														)}
													</td>
													<td>
														{__(
															'Total Amount',
															'multivendorx'
														)}
													</td>
													<td>
														{__(
															'Order Status',
															'multivendorx'
														)}
													</td>
													<td>
														{__(
															'Status (P)',
															'multivendorx'
														)}
													</td>
												</tr>
											</thead>
											{recentOrder.map((item, index) => {
												const id = item.id;
												const orderUrl = `/dashboard/sales/orders/#view/${id}`;
												return (
													<tbody>
														<tr key={item.id}>
															<td>
																<a
																	href={orderUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	#{id}
																	{__(
																		'Customer',
																		'multivendorx'
																	)}
																</a>
															</td>
															<td>{item.date}</td>
															<td>{item.name}</td>
															<td>{item.amount}</td>
															<td>
																<div
																	className={`admin-status`}
																>
																	{item.status}
																</div>
															</td>
															<td>
																<div
																	className={`admin-badge`}
																>
																	{item.status}
																</div>
															</td>
														</tr>
													</tbody>
												);
											})}
										</table>
									) : (
										<div className="no-data">
											{__(
												'No products found.',
												'multivendorx'
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="card-wrapper">
					{/* Best-Selling Products */}
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__(
										'Best-Selling Products',
										'multivendorx'
									)}
								</div>
							</div>
							<div className="right">
								<i className="adminlib-external icon"></i>
							</div>
						</div>

						<div className="card-body">
							<div className="table-wrapper top-products">
								{topProducts && topProducts.length > 0 ? (
									<table>
										<thead>
											<tr className="header">
												<td>#</td>
												<td>
													{__('Name', 'multivendorx')}
												</td>
												<td>
													{__(
														'Popularity',
														'multivendorx'
													)}
												</td>
												<td>
													{__('Sales', 'multivendorx')}
												</td>
											</tr>
										</thead>
										{topProducts.map((item, index) => {
											return (
												<tbody>
													<tr key={item.id}>
														<td>
															{String(
																index + 1
															).padStart(2, '0')}
														</td>
														<td>{item.name}</td>
														<td
															className={`progress-bar`}
														>
															<div className={`progress-bar admin-color${index + 1}`}>
																<span
																	className={`progress-bar admin-bg-color${index + 1}`}
																	style={{
																		width: `${item.popularity}%`,
																	}}
																></span>
															</div>
														</td>
														<td>
															<div
																className={`admin-badge admin-color${index + 1}`}
															>
																{item.popularity}%
															</div>
														</td>
													</tr>
												</tbody>
											);
										})}
									</table>
								) : (
									<div className="no-data">
										{__(
											'No products found.',
											'multivendorx'
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Commission Overview */}
					<div className="card-content">
						<div className="card">
							<div className="card-header">
								<div className="left">
									<div className="title">
										{__(
											'Commission Overview',
											'multivendorx'
										)}
									</div>
								</div>
								<div
									className="right"
									onClick={() => {
										window.location.href =
											'/dashboard/reports/overview/';
									}}
								>
									<i className="adminlib-external icon"></i>
								</div>
							</div>

							<div className="card-body">
								<div style={{ width: '100%', height: 400 }}>
									<ResponsiveContainer>
										<PieChart>
											<Pie
												data={chartData}
												dataKey="value"
												nameKey="name"
												cx="50%"
												cy="50%"
												outerRadius={140}
												innerRadius={80}
												label={({ name, percent }) =>
													`${name} ${(
														percent * 100
													).toFixed(1)}%`
												}
												labelLine={false}
												isAnimationActive={true}
											>
												{chartData.map(
													(item, index) => (
														<Cell
															key={`cell-${index}`}
															fill={item.color}
														/>
													)
												)}
											</Pie>

											<Tooltip
												formatter={(value) =>
													formatCurrency(value)
												}
												contentStyle={{
													backgroundColor: '#fff',
													borderRadius: '8px',
													border: '1px solid #ddd',
												}}
											/>
											<Legend
												verticalAlign="bottom"
												height={36}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="card-wrapper">
					{/* Admin Announcements */}
					{modules.includes('announcement') && (
						<div className="card-content">
							<div className="card">
								<div className="card-header">
									<div className="left">
										<div className="title">
											{__(
												'Admin Announcements',
												'multivendorx'
											)}
										</div>
									</div>
									<div className="right">
										<i className="adminlib-external icon"></i>
									</div>
								</div>

								<div className="card-body">
									<div className="notification-wrapper">
										{announcement &&
											announcement.length > 0 ? (
											<ul>
												{announcement.map((item, index) => (
													<li key={item.id}>
														<div className="icon-wrapper">
															<i className={`adminlib-form-paypal-email admin-badge admin-color${index + 2}`}></i>
														</div>
														<div className="details">
															<div className="notification-title">
																{item.title}
															</div>
															<div className="des">
																{item.content}
															</div>
															<span>
																{formatTimeAgo(
																	item.date
																)}
															</span>
														</div>
													</li>
												))}
											</ul>
										) : (
											<div className="no-data">
												{__(
													'No announcements found.',
													'multivendorx'
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{modules.includes('marketplace-refund') && (
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">
										{__(
											'Pending Refunds',
											'multivendorx'
										)}
									</div>
								</div>
								<div
									className="right"
									onClick={() =>
									(window.location.href =
										'/dashboard/sales/orders/#refund-requested')
									}
									style={{ cursor: 'pointer' }}
								>
									<i className="adminlib-external icon"></i>
								</div>
							</div>

							<div className="card-body">
								<div className="top-customer-wrapper">
									{pendingRefund &&
										pendingRefund.length > 0 ? (
										pendingRefund.map((customer) => (
											<div
												key={customer.id}
												className="customer"
											>
												<div className="left-section">
													<div className="details">
														<div className="name">
															{customer.name}
														</div>
														<div className="order-number">
															{
																customer.reason
															}{' '}
															|{' '}
															{formatWcShortDate(
																customer.time
															)}
														</div>
													</div>
												</div>
											</div>
										))
									) : (
										<div className="no-data">
											{__(
												'No pending refunds found.',
												'multivendorx'
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__('Top customer (P)', 'multivendorx')}
								</div>
							</div>
						</div>

						<div className="card-body">
							{customers.map((customer) => (
								<div
									key={customer.id}
									className="info-item"
								>
									<div className="details-wrapper">
										<div className="avatar">
											<i
												className={
													customer.icon
												}
											></i>
										</div>
										<div className="details">
											<div className="name">
												{customer.name}
											</div>
											<div className="des">
												{customer.orders}
												{__(
													'orders',
													'multivendorx'
												)}
											</div>
										</div>
									</div>

									<div className="right-details">
										<div className="price">{customer.total}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="card-wrapper">
					<div className="card-content w-65">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__(
										'Store Activity (P)',
										'multivendorx'
									)}
								</div>
							</div>
						</div>

						<div className="card-body">
							<div className="activity-log">
								{activities.map((a, i) => (
									<div key={i} className="activity">
										<div className="title">
											{a.text}
										</div>
										<div className="des">
											{__(
												'Your order has been placed successfully',
												'multivendorx'
											)}
										</div>
										<span>
											{__(
												'2 minutes ago',
												'multivendorx'
											)}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{modules.includes('store-review') && (
						<div className="card-content w-35">
							<div className="card-header">
								<div className="left">
									<div className="title">
										{__(
											'Latest Reviews',
											'multivendorx'
										)}
									</div>
								</div>

								<div
									className="right"
									onClick={() => {
										window.location.href =
											'/dashboard/store-support/store-review/';
									}}
								>
									<i className="adminlib-external icon"></i>
								</div>
							</div>

							<div className="card-body">
								<div className="review-wrapper">
									{review && review.length > 0 ? (
										review.map((reviewItem) => (
											<div
												className="review"
												key={reviewItem.review_id}
											>
												<div className="details">
													<div className="title">
														<div className="avatar">
															<i className="adminlib-person"></i>
														</div>
														{
															reviewItem.review_title
														}
													</div>

													<div className="star-wrapper">
														{[...Array(5)].map(
															(_, index) => (
																<i
																	key={
																		index
																	}
																	className={`star-icon adminlib-star ${index <
																		Math.round(
																			reviewItem.overall_rating
																		)
																		? 'active'
																		: ''
																		}`}
																></i>
															)
														)}
														<span>
															{formatWcShortDate(
																reviewItem.date_created
															)}
														</span>
													</div>

													<div className="des">
														{
															reviewItem.review_content
														}
													</div>
												</div>
											</div>
										))
									) : (
										<div className="no-data">
											{__(
												'No reviews found.',
												'multivendorx'
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Dashboard;
