import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import React, { useState, useEffect } from "react";
import "../components/dashboard.scss";
import '../dashboard/dashboard1.scss';
import { getApiLink, Table, TableCell, useModules } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { formatCurrency } from '@/services/commonFunction';

const activities = [
  { icon: 'adminlib-cart', text: 'New order #10023 by Alex Doe.' },
  { icon: 'adminlib-star', text: 'Inventory updated: "Coffee Beans"' },
  { icon: 'adminlib-global-community', text: 'Customer "davidchen" updated account.' },
  { icon: 'adminlib-cart', text: 'New product "Wireless Headset"' },
];

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const themeColors = [
  getCSSVar("--colorPrimary"),
  getCSSVar("--colorSecondary"),
  getCSSVar("--colorAccent"),
  getCSSVar("--colorSupport"),
];

const BarChartData = [
  { name: "Sales", dataKey: "orders", color: themeColors[0] },
  { name: "Earnings", dataKey: "earnings", color: themeColors[1] },
  { name: "Orders", dataKey: "refunds", color: themeColors[2] },
];

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
      method: "GET",
      url: `${appLocalizer.apiUrl}/wc/v3/orders`,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
      params: {
        meta_key: "multivendorx_store_id",
        value: appLocalizer.store_id,
        // refund_status: "refund_request",
        status: 'refund-requested',
        page: 1,
        per_page: 4,
        orderby: "date",
        order: "desc",
      },
    })
      .then((response) => {
        const items = response.data || [];

        const formatData = items.map((order) => {
          // extract refund reason
          const reasonMeta = order.meta_data.find(
            (m) => m.key === "_customer_refund_reason"
          );
          const refundReason = reasonMeta ? reasonMeta.value : "No reason";

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
      method: "GET",
      url: getApiLink(appLocalizer, "announcement"),
      headers: { "X-WP-Nonce": appLocalizer.nonce },
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
        value: appLocalizer.store_id
      },
    })
      .then(response => {
        const products = response.data;

        // Find max sales to calculate popularity %
        const maxSales = Math.max(...products.map(p => parseInt(p.total_sales) || 0));

        const processed = products.map(p => {
          const sales = parseInt(p.total_sales) || 0;
          const popularity = maxSales > 0 ? Math.round((sales / maxSales) * 100) : 0;
          return {
            id: p.id,
            name: p.name,
            sales,
            popularity,
          };
        });
        console.log("pro", processed);
        setTopProducts(processed);
      })
      .catch(error => {
        console.error("Error fetching top selling products:", error);
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
        value: appLocalizer.store_id,   // THIS FIXES YOUR ISSUE
      },
    })
      .then(response => {
        const orders = response.data.map(order => {
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
    })
      .then((res: any) => {
        const data = res.data || {};
        setStore(data);
      })
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
      .then(response => {
        // WooCommerce returns total order count in headers
        const totalOrders = parseInt(response.headers['x-wp-total']) || 0;
        setTotalOrder(totalOrders)

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
    }).then((response) => {
      setLastWithdraws(response.data.transaction || []);
    })
      .catch(() => setLastWithdraws([]));

  }, []);

  // const analyticsData = [
  //   { icon: "adminlib-dollar theme-color1", number: formatCurrency(store?.commission?.total_order_amount || 0), text: "Total Revenue" },
  //   { icon: "adminlib-order theme-color2", number: totalOrder, text: "Total Orders" },
  //   { icon: "adminlib-paid theme-color3", number: formatCurrency(store?.commission?.commission_total || 0), text: "Total Commission" },
  //   { icon: "adminlib-user-circle theme-color4", number: formatCurrency(store?.commission?.commission_refunded || 0), text: "Total Commission Refund" },
  // ];

  const analyticsData = [
    { icon: "adminlib-dollar theme-color1", number: formatCurrency(store?.commission?.total_order_amount || 0), text: "Store Views" },
    { icon: "adminlib-order theme-color2", number: totalOrder, text: "Total Orders" },
    { icon: "adminlib-paid theme-color3", number: formatCurrency(store?.commission?.commission_total || 0), text: "Total Revenue" },
    { icon: "adminlib-user-circle theme-color4", number: formatCurrency(store?.commission?.commission_total || 0), text: "Commission Earned" },
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
            <a href={orderUrl} target="_blank" rel="noopener noreferrer">
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
      cell: ({ row }) => <TableCell>{row.original.commission_amount}</TableCell>,
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

        // Define color mapping for known statuses
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

        // Format status for display (refund-requested → Refund Requested)
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
    }

  ];

  const formatWcShortDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function formatTimeAgo(dateString: any) {
    const date = new Date(dateString.replace(" ", "T"));
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }
  // Helper function to get dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };
  const revenueData = [
    { month: "Jan", sales: 1200, refund: 200, conversion: 2.4 },
    { month: "Feb", sales: 1500, refund: 180, conversion: 2.9 },
    { month: "Mar", sales: 1700, refund: 220, conversion: 3.2 },
    { month: "Apr", sales: 1400, refund: 160, conversion: 2.7 },
    { month: "May", sales: 1900, refund: 250, conversion: 3.8 },
    { month: "Jun", sales: 2100, refund: 240, conversion: 4.1 },
    { month: "Jul", sales: 2300, refund: 260, conversion: 4.4 },
    { month: "Aug", sales: 2000, refund: 210, conversion: 3.6 },
    { month: "Sep", sales: 1800, refund: 190, conversion: 3.1 },
    { month: "Oct", sales: 2200, refund: 270, conversion: 4.0 },
    { month: "Nov", sales: 2500, refund: 300, conversion: 4.7 },
    { month: "Dec", sales: 2800, refund: 320, conversion: 5.2 },
  ];
  
  return (
    <>
      <div className="page-title-wrapper">
        <div className="page-title">
          <div className="title">{getGreeting()}, {store?.primary_owner_info?.data?.display_name}!</div>
          <div className="view-des">You’re viewing: <b>{store?.primary_owner_info?.data?.display_name}’s {store?.name || '-'}</b></div>
        </div>
      </div>

      <div className="row">
        <div className="column transparent">
          <div className="card">
            <div className="card-body">
              <div className="analytics-container">

                {analyticsData.map((item, idx) => (
                  <div key={idx} className="analytics-item">
                    <div className="details">
                      <div className="text">{item.text}</div>
                      <div className="number">{item.number}</div>
                      <div className="report"><span>10%</span> | This month  <span>10%</span> | This month</div>
                    </div>
                    <div className="analytics-icon">
                      <i className={item.icon}></i>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>
      </div>



      <div className="row">
        <div className="column w-65">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Sales Overview (extra)
                </div>
              </div>
              <div className="right">
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={revenueData}
                  barSize={12}
                  barCategoryGap="20%"
                >
                  <CartesianGrid stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend />
                  {BarChartData.map((entry, index) => (
                    <Bar dataKey={entry.dataKey} fill={entry.color} radius={[6, 6, 0, 0]} name={entry.name} />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="conversion"
                    stroke="#ffa726"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Conversion %"
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

        </div>

        <div className="column w-65">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">Commission Overview</div>
              </div>
              <div className="right"
                onClick={() => {
                  window.location.href = "/dashboard/reports/overview/";
                }}
              >
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Commission Earned", value: (store?.commission?.commission_total || 0) },
                      { name: "Commission Refunded", value: (store?.commission?.commission_refunded || 0) },
                      { name: "Total Revenue", value: (store?.commission?.total_order_amount || 0) }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    <Cell fill="#4caf50" />
                    <Cell fill="#f44336" />
                    <Cell fill="#2196f3" />
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>


        {/* <div className="column w-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Transaction Details
                </div>
              </div>
              <div className="right"
                onClick={() => {
                  window.location.href = "/dashboard/wallet/transactions/";
                }}
              >
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="top-customer-wrapper">
                {transaction.map((item) => (
                  <div key={item.id} className="customer">

                    <div className="left-section">
                      <div className="details">

                        <div className="name">
                          #{item.order_details}
                        </div>

                        <div className="order-number">
                          {formatWcShortDate(item.date)}
                        </div>
                      </div>
                    </div>

                    <div className="price-section">
                      {item.credit > 0 ? `${formatCurrency(item.credit)}` : `-${formatCurrency(item.debit)}`}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div> */}

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">Last Withdrawal</div>
            </div>
          </div>

          {lastWithdraws && lastWithdraws.length > 0 ? (
            lastWithdraws.map((item: any) => (
              <div className="last-withdradal-wrapper" key={item.id}>
                <div className="left">
                  <div className="price">{formatCurrency(item.amount)}</div>
                  <div className="des">
                    {item.payment_method === "stripe-connect" && "Stripe"}
                    {item.payment_method === "bank-transfer" && "Direct to Local Bank (INR)"}
                    {item.payment_method === "paypal-payout" && "PayPal"}
                    {item.payment_method === "bank-transfer" ? `Bank Transfer` : ""}
                  </div>
                </div>
                <div className="right">
                  <div className="date">{formatWcShortDate(item.date)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No withdrawals found.</div>
          )}

          <div className="buttons-wrapper">
            <div
              className="admin-btn btn-purple"
              onClick={() => (window.location.href = `${appLocalizer.site_url}/dashboard/wallet/transactions/`)}
            >
              <i className="adminlib-preview"></i>
              View transaction history
            </div>
          </div>
        </div>

      </div>

      <div className="row">
        <div className="column">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Recent Orders
                </div>
              </div>
              <div className="right"
                onClick={() => {
                  window.location.href = "/dashboard/sales/orders/";
                }}
              >
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="table-wrapper">
                <Table
                  data={recentOrder}
                  columns={columns as ColumnDef<Record<string, any>, any>[]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Best-Selling Products */}
        <div className="column">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">Best-Selling Products</div>
              </div>
              <div className="right">
                <i className="adminlib-external"></i>
              </div>
            </div>

            <div className="card-body">
              <div className="table-wrapper top-products">
                {topProducts && topProducts.length > 0 ? (
                  <table>
                    <tr className="header">
                      <td>#</td>
                      <td>Name</td>
                      <td>Popularity</td>
                      <td>Sales</td>
                    </tr>

                    {topProducts.map((item: any, index) => {
                      const color = `theme-color${(index % 4) + 1}`;
                      return (
                        <tr key={item.id}>
                          <td>{String(index + 1).padStart(2, '0')}</td>
                          <td>{item.name}</td>
                          <td className={`progress-bar ${color}`}>
                            <div style={{ width: `${item.popularity}%` }}></div>
                          </td>
                          <td>
                            <div className={`admin-badge ${color}`}>
                              {item.popularity}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </table>
                ) : (
                  <div className="no-data">No products found.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Announcements */}
        {modules.includes("announcement") && (
          <div className="column">
            <div className="card">
              <div className="card-header">
                <div className="left">
                  <div className="title">Admin Announcements</div>
                </div>
                <div className="right">
                  <i className="adminlib-external"></i>
                </div>
              </div>

              <div className="card-body">
                <div className="notification-wrapper">
                  {announcement && announcement.length > 0 ? (
                    <ul>
                      {announcement.map((item) => (
                        <li key={item.id}>
                          <div className="icon-wrapper">
                            <i className="adminlib-form-paypal-email admin-badge theme-color1"></i>
                          </div>
                          <div className="details">
                            <div className="notification-title">{item.title}</div>
                            <div className="des">{item.content}</div>
                            <span>{formatTimeAgo(item.date)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="no-data">No announcements found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


      </div>

      <div className="row">
        <div className="column w-60">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Store Activity
                </div>
                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
              </div>
              {/* <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div> */}
            </div>
            <div className="card-body">
              <div className="activity-log">
                {activities.map((a, i) => (
                  <div key={i} className="activity">
                    <div className="title">
                      {a.text}
                    </div>
                    <div className="des">Your order has been placed successfully</div>
                    <span>2 minutes ago</span>

                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {modules.includes("marketplace-refund") && (
          <div className="column w-40">
            <div className="card">
              <div className="card-header">
                <div className="left">
                  <div className="title">Pending Refunds</div>
                </div>
                <div
                  className="right"
                  onClick={() => window.location.href = "/dashboard/sales/orders/#refund-requested"}
                  style={{ cursor: "pointer" }}
                >
                  <i className="adminlib-external"></i>
                </div>
              </div>

              <div className="card-body">
                <div className="top-customer-wrapper">
                  {pendingRefund && pendingRefund.length > 0 ? (
                    pendingRefund.map((customer) => (
                      <div key={customer.id} className="customer">
                        <div className="left-section">
                          <div className="details">
                            <div className="name">{customer.name}</div>
                            <div className="order-number">
                              {customer.reason} | {formatWcShortDate(customer.time)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No pending refunds found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



      </div>

      {modules.includes("store-review") && (
        <div className="row">
          <div className="column">
            <div className="card">
              <div className="card-header">
                <div className="left">
                  <div className="title">Latest Reviews</div>
                </div>
                <div
                  className="right"
                  onClick={() => {
                    window.location.href = "/dashboard/store-support/store-review/";
                  }}
                >
                  <i className="adminlib-external"></i>
                </div>
              </div>

              <div className="card-body">
                <div className="review-wrapper">
                  {review && review.length > 0 ? (
                    review.map((reviewItem) => (
                      <div className="review" key={reviewItem.review_id}>
                        <div className="details">
                          <div className="title">{reviewItem.review_title}</div>

                          <div className="star-wrapper">
                            {[...Array(5)].map((_, index) => (
                              <i
                                key={index}
                                className={`adminlib-star ${index < Math.round(reviewItem.overall_rating) ? "active" : ""
                                  }`}
                              ></i>
                            ))}
                            <span>{formatWcShortDate(reviewItem.date_created)}</span>
                          </div>

                          <div className="des">{reviewItem.review_content}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No reviews found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



    </>
  );
};

export default Dashboard;
