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

const Overview: React.FC<OverviewProps> = ({
  data,
  COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff", "#004ec4ff"],
}) => {
  const [commissionDetails, setCommissionDeatils] = useState<any[]>([]);
  const [earningSummary, setEarningSummary] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any>([]);

  const salesByLocations = [
    { name: "USA", coordinates: [40, -100], sales: 12000 },
    { name: "India", coordinates: [22, 78], sales: 8500 },
    { name: "UK", coordinates: [54, -2], sales: 6700 },
    { name: "Germany", coordinates: [51, 10], sales: 5400 },
    { name: "Australia", coordinates: [-25, 133], sales: 4300 },
  ];
  const salesIcon = new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 0.625rem;font-size:0.75rem;">$</div>`,
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const response = await axios({
        method: "GET",
        url: `${appLocalizer.apiUrl}/wc-analytics/leaderboards`,
        headers: { "X-WP-Nonce": appLocalizer.nonce },
      });
      setLeaderboard(response.data || []);
    } catch (err: any) {
      setError("Failed to fetch leaderboard data");
    } finally {
      setLoading(false);
    }
  };

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
            icon: 'adminlib-wallet blue',
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
            icon: 'adminlib-vendor-shipping green',
          },
          {
            id: 'tax_amount',
            label: 'Tax Amount',
            count: formatCurrency(data.tax_amount),
            icon: 'adminlib-commission blue',
          },
          {
            id: 'shipping_tax_amount',
            label: 'Shipping Tax Amount',
            count: formatCurrency(data.shipping_tax_amount),
            icon: 'adminlib-calendar purple',
          },
          {
            id: 'commission_total',
            label: 'Commission Total',
            count: formatCurrency(data.commission_total),
            icon: 'adminlib-earning yellow',
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
            id: 'total',
            title: 'Total',
            price: formatCurrency(data.total_order_amount),
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
  };

  useEffect(() => {
    fetchCommissionDetails();
    fetchLeaderboards();
  }, []);

  return (
    <>
      <div className="row">
        <div className="column w-65">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Account Overview
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="analytics-container">
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
        <div className="column w-35">
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
      </div>
      <div className="row">
        <div className="column w-100">
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


      <div className="row">
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
      </div>
    </>
  );
};

export default Overview;
