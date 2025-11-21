import React, { useEffect, useState } from "react";
import { __ } from '@wordpress/i18n';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { getApiLink } from "zyra";
import { formatCurrency } from "@/services/commonFunction";

type Stat = {
  id: string | number;
  count: number | string;
  icon: string;
  label: string;
};
type Product = {
  id: number;
  title: string;
  price: string;
};
type OverviewProps = {
  overview: Stat[];
  data: { month: string; revenue: number; net_sale: number; admin_amount: number }[];
  overviewData: { name: string; orders: number; sold_out: number }[];
  pieData: { name: string; value: number }[];
  COLORS?: string[];
};

const Overview: React.FC<OverviewProps> = ({ }) => {
  const [commissionDetails, setCommissionDeatils] = useState<any[]>([]);
  const [earningSummary, setEarningSummary] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any>([]);
  const [topCoupons, setTopCoupons] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [topStores, setTopStores] = useState<any[]>([]);

  const fetchCommissionDetails = async () => {
    axios({
      method: 'GET',
      url: getApiLink(appLocalizer, 'commission'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: { format: 'reports' },
    })
      .then((response) => {
        const data = response.data;

        // Basic calculations
        const adminEarning = data.total_order_amount - data.commission_total;
        const storeEarning = data.commission_total;

        // Overview data (optional if you use it elsewhere)
        const overviewData = [
          {
            id: 'total_order_amount',
            label: 'Total Order Amount',
            count: formatCurrency(data.total_order_amount),
            icon: 'adminlib-order green',
          },
          {
            id: 'facilitator_fee',
            label: 'Facilitator Fee',
            count: formatCurrency(data.facilitator_fee),
            icon: 'adminlib-facilitator blue',
          },
          {
            id: 'gateway_fee',
            label: 'Gateway Fee',
            count: formatCurrency(data.gateway_fee),
            icon: 'adminlib-credit-card red',
          },
          {
            id: 'shipping_amount',
            label: 'Shipping Amount',
            count: formatCurrency(data.shipping_amount),
            icon: 'adminlib-shipping green',
          },
          {
            id: 'tax_amount',
            label: 'Tax Amount',
            count: formatCurrency(data.tax_amount),
            icon: 'adminlib-tax-compliance blue',
          },
          {
            id: 'shipping_tax_amount',
            label: 'Shipping Tax Amount',
            count: formatCurrency(data.shipping_tax_amount),
            icon: 'adminlib-per-product-shipping purple',
          },
          {
            id: 'commission_total',
            label: 'Commission Total',
            count: formatCurrency(data.commission_total),
            icon: 'adminlib-commission yellow',
          },
          {
            id: 'commission_refunded',
            label: 'Commission Refunded',
            count: formatCurrency(data.commission_refunded),
            icon: 'adminlib-marketplace-refund red',
          },
        ];

        // Just Admin + Store + Total for Revenue Breakdown
        const earningSummary = [
          {
            id: 'total_order_amount',
            title: 'Total Order Amount',
            price: formatCurrency(data.total_order_amount),
          },
          {
            id: 'admin_earning',
            title: 'Admin Net Earning',
            price: formatCurrency(adminEarning),
          },
          {
            id: 'store_earning',
            title: 'Store Net Earning',
            price: formatCurrency(storeEarning),
          },
          {
            id: 'facilitator_fee',
            title: 'Facilitator Fee',
            price: formatCurrency(data.facilitator_fee),
          },
          {
            id: 'gateway_fee',
            title: 'Gateway Fee',
            price: formatCurrency(data.gateway_fee),
          },
          {
            id: 'shipping_amount',
            title: 'Shipping Amount',
            price: formatCurrency(data.shipping_amount),
          },
          {
            id: 'tax_amount',
            title: 'Tax Amount',
            price: formatCurrency(data.tax_amount),
          },
          {
            id: 'shipping_tax_amount',
            title: 'Shipping Tax Amount',
            price: formatCurrency(data.shipping_tax_amount),
          },
          {
            id: 'commission_total',
            title: 'Commission Total',
            price: formatCurrency(data.commission_total),
          },
          {
            id: 'commission_refunded',
            title: 'Commission Refunded',
            price: formatCurrency(data.commission_refunded),
          },
          {
            id: 'grand_total',
            title: 'Grand Total',
            price: formatCurrency(
              adminEarning +
              storeEarning
            ),
          },
        ];

        const pieChartData = [
          { name: 'Admin Net Earning', value: adminEarning },
          { name: 'Store Net Earning', value: storeEarning },
          { name: 'Commission Refunded', value: data.commission_refunded },
        ];


        setCommissionDeatils(overviewData);
        setEarningSummary(earningSummary);
        setPieData(pieChartData);

      })
      .catch(() => {
        // Handle error gracefully
      });

    axios({
      method: 'GET',
      url: getApiLink(appLocalizer, 'commission'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: { format: 'reports', top_stores: 3 },
    })
      .then((response) => {
        setTopStores(response.data)
      })
      .catch(() => {
        // Handle error gracefully
      });
  };

  useEffect(() => {
    // Top selling coupons
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        meta_key: 'multivendorx_store_id',
        per_page: 50, // get more so we can sort later
        orderby: 'date', // valid param, required by API
        order: 'desc',
      },
    })
      .then(response => {
        // Sort coupons manually by usage_count (descending)
        const sortedCoupons = response.data
          .sort((a, b) => b.usage_count - a.usage_count)
          .slice(0, 5); // take top 5 only

        console.log("Top 5 Coupons:", sortedCoupons);
        setTopCoupons(sortedCoupons);
      })
      .catch(error => {
        console.error('Error fetching top coupons:', error);
      });

    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc-analytics/customers`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        per_page: 50,       // fetch more customers so we can sort manually
        orderby: 'total_spend',
        order: 'desc',
      },
    })
      .then((response) => {
        // Sort by total_spend manually in case API doesn't enforce order
        const sortedCustomers = response.data
          .sort((a, b) => b.total_spend - a.total_spend)
          .slice(0, 5); // Top 5 customers only

        console.log("Top 5 Customers:", sortedCustomers);
        setTopCustomers(sortedCustomers);
      })
      .catch((error) => {
        console.error('Error fetching top customers:', error);
      });


    fetchCommissionDetails();
  }, []);
  console.log('site_urlcus', topCustomers)
  return (
    <>
      <div className="row">
        <div className="column transparent">
          <div className="analytics-container report column-3">
            {commissionDetails.map((item, idx) => (
              <div key={idx} className="analytics-item">
                <div className="analytics-icon">
                  <i className={item.icon}></i>
                </div>
                <div className="details">
                  <div className="number">{item.count}</div>
                  <div className="text">{item.label}</div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue breakdown
              </div>
            </div>
          </div>
          <div className="top-items">
            {earningSummary.map((product) => (
              <div className="items" key={product.id}>
                <div className="left-side">
                  <div className="details">
                    <div className="item-title">{product.title}</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="column ">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue Breakdown
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  innerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                  isAnimationActive={true}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#0088FE', '#00C49F', '#FF8042'][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* <div className="row">
        {leaderboard.map((section: any, sectionIndex: number) => (
          <div className="column" key={sectionIndex}>
            <div className="card-header">
              <div className="left">
                <div className="title">{section.label}</div>
              </div>
            </div>

            <div className="top-items">
              {section.rows?.length ? (
                section.rows.map((row: any, rowIndex: number) => (
                  <div className="items" key={rowIndex}>
                    <div className="left-side">
                      <div className="icon">
                        <i
                          className={`adminlib-pro-tag admin-icon ${rowIndex % 2 === 0 ? "red" : "green"
                            }`}
                        ></i>
                      </div>
                      <div className="details">
                        <div
                          className="item-title"
                          dangerouslySetInnerHTML={{
                            __html: row[0].display.trim()
                              ? row[0].display
                              : `<a href="#">Customer</a>`, // fallback text
                          }}
                        />
                        <div className="sub-text">
                          {row[1].value} {row[1].label || "orders"}
                        </div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div
                        className="price"
                        dangerouslySetInnerHTML={{ __html: row[2].display }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="items">
                  <div className="left-side">
                    <div className="details">
                      <div className="item-title">No data</div>
                      <div className="sub-text">0 orders</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Store
              </div>
            </div>
          </div>
          <div className="top-items">
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon red"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon green"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Keep categories and brands */}
      <div className="row">

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">Top Selling Coupons</div>
            </div>
          </div>

          {topCoupons.length > 0 ? (
            topCoupons.map((coupon: any) => (
              <div className="info-item" key={`coupon-${coupon.id}`}>
                <div className="details-wrapper">
                  <div className="avatar">
                    <a
                      href={`${appLocalizer.site_url}/wp-admin/post.php?post=${coupon.id}&action=edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="adminlib-coupon"></i>
                    </a>
                  </div>

                  <div className="details">
                    <div className="name">
                      <a
                        href={`${appLocalizer.site_url}/wp-admin/post.php?post=${coupon.id}&action=edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {coupon.code}
                      </a>
                    </div>
                    <div className="des">Used {coupon.usage_count || 0} times</div>
                    {coupon.description && (
                      <div className="des">{coupon.description}</div>
                    )}
                    {coupon.store_name && (
                      <div className="des">
                        <b> Store: </b>{coupon.store_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="right-details">
                  <div className="price">
                    <span>
                      {coupon.amount
                        ? coupon.discount_type === 'percent'
                          ? `${coupon.amount}%`
                          : formatCurrency(coupon.amount)
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No top coupons found.</p>
          )}
        </div>

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">Top Customers</div>
            </div>
          </div>

          {topCustomers.length > 0 ? (
            topCustomers.map((customer: any) => (
              <div className="info-item" key={`customer-${customer.user_id}`}>
                <div className="details-wrapper">
                  <div className="avater">
                    <a
                      href={`${appLocalizer.site_url}/wp-admin/user-edit.php?user_id=${customer.user_id}&wp_http_referer=%2Fwp-admin%2Fusers.php`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="avatar">
                        <span>{((customer.name?.trim() || customer.username)?.charAt(0) || "").toUpperCase()}</span>
                      </div>
                    </a>

                  </div>

                  <div className="details">
                    <div className="name">
                      <a
                        href={`${appLocalizer.site_url}/wp-admin/user-edit.php?user_id=${customer.user_id}&wp_http_referer=%2Fwp-admin%2Fusers.php`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {customer.name?.trim() || customer.username}
                      </a>
                    </div>
                    <div className="des">Orders: {customer.orders_count || 0}</div>
                    <div className="des">{customer.email || 'No email'}</div>
                  </div>
                </div>

                <div className="right-details">
                  <div className="price">
                    <span>{formatCurrency(customer.total_spend || 0)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No top customers found.</p>
          )}
        </div>

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">Top Stores</div>
            </div>
          </div>

          {topStores.length > 0 ? (
            topStores.map((store: any) => (
              <div className="info-item" key={`store-${store.store_id}`}>
                <div className="details-wrapper">
                  <div className="avater">
                    <a
                      href={`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${store.store_id}/&subtab=store-overview`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div >
                        {(store.store_name?.trim())?.charAt(0)}
                      </div>
                    </a>
                  </div>

                  <div className="details">
                    <div className="name">
                      <a
                        href={`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${store.store_id}/&subtab=store-overview`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {store.store_name}
                      </a>
                    </div>
                    <div className="des">
                      Commission: {formatCurrency(store.commission_total || 0)}
                    </div>
                    <div className="des">
                      Refunded: {formatCurrency(store.commission_refunded || 0)}
                    </div>
                  </div>
                </div>

                <div className="right-details">
                  <div className="price">
                    <span>{formatCurrency(store.total_order_amount || 0)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No top stores found.</p>
          )}

        </div>
      </div>
    </>
  );
};

export default Overview;
