import { useLocation } from 'react-router-dom';
import { AdminBreadcrumbs, SelectInput } from 'zyra';
import { useState } from 'react';

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

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const salesByLocations = [
  { name: "USA", coordinates: [40, -100], sales: 12000 },
  { name: "India", coordinates: [22, 78], sales: 8500 },
  { name: "UK", coordinates: [54, -2], sales: 6700 },
  { name: "Germany", coordinates: [51, 10], sales: 5400 },
  { name: "Australia", coordinates: [-25, 133], sales: 4300 },
];

// Custom marker icon (optional)
const salesIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 10px;font-size:12px;">$</div>`,
});

// import "./adminDashboard.scss";
import "../../dashboard/dashboardCommon.scss";
import Overview from './Overview';
import Transactions from './Payout';
import Revenue from './Revenue';
import RefundedOrders from './RefundedOrders';
import StoreOrders from './StoreOrders';

const Analytics = () => {
  const location = useLocation();
  const hash = location.hash;
  const isTabActive = hash.includes('tab=dashboard');

  // Dummy chart data
  const data = [
    { month: "Jan", revenue: 4000, net_sale: 2400, admin_amount: 1200 },
    { month: "Feb", revenue: 3000, net_sale: 2000, admin_amount: 1000 },
    { month: "Mar", revenue: 4500, net_sale: 2800, admin_amount: 1300 },
    { month: "Apr", revenue: 5000, net_sale: 3200, admin_amount: 1500 },
    { month: "May", revenue: 4200, net_sale: 2500, admin_amount: 1400 },
    { month: "Jun", revenue: 4800, net_sale: 3000, admin_amount: 1600 },
    { month: "Jul", revenue: 5200, net_sale: 3400, admin_amount: 1700 },
    { month: "Aug", revenue: 4700, net_sale: 2900, admin_amount: 1500 },
  ];

  const overviewData = [
    { name: "Jan", orders: 120, sold_out: 30 },
    { name: "Feb", orders: 90, sold_out: 20 },
    { name: "Mar", orders: 150, sold_out: 40 },
    { name: "Apr", orders: 170, sold_out: 35 },
    { name: "May", orders: 140, sold_out: 25 },
    { name: "Jun", orders: 180, sold_out: 50 },
    { name: "Jul", orders: 200, sold_out: 45 },
    { name: "Aug", orders: 160, sold_out: 30 },
  ];
  const overview = [
    {
      id: 'sales',
      label: 'Gross Sales',
      count: 475,
      icon: 'adminlib-star',
    },
    {
      id: 'earnings',
      label: 'Net Sales',
      count: "7896",
      icon: 'adminlib-support',
    },
    {
      id: 'Vendors',
      label: 'Admin Commission',
      count: "85669",
      icon: 'adminlib-global-community',
    },
    {
      id: 'Pending Withdrawals',
      label: 'Vendor Payout Pending',
      count: "88200",
      icon: 'adminlib-calendar',
    },
    {
      id: 'Pending Withdrawals',
      label: 'Refunds',
      count: "600",
      icon: 'adminlib-calendar',
    },
    {
      id: 'Pending Withdrawals',
      label: 'Discounts Applied',
      count: "102",
      icon: 'adminlib-calendar',
    },
  ];
  const pieData = [
    { name: "Admin", value: 1200 },
    { name: "Vendor", value: 2400 },
    { name: "Shipping", value: 800 },
    { name: "Free", value: 200 },
  ];
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Marketplace Report", content: <Overview overview={overview} data={data} overviewData={overviewData} pieData={pieData} /> },
    { id: "revenue", label: "Product-wise Report", content: <Revenue/> },
    { id: "payout", label: "Store-wise Report", content: <Transactions/> },
    { id: "refundedOrders", label: "Traffic & Conversion", content: <RefundedOrders/> },
  ];
  
  const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff"];
  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-cart"
        tabTitle="Analytics"
        description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}

      />
      <div className="admin-dashboard tab">

        <div className="row">
              {/* Tab Titles */}
              <div className="tab-titles">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`title ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <p>{tab.label}</p>
                  </div>
                ))}
              </div>
        </div>

        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <div key={tab.id} className="tab-panel">
                {tab.content}
              </div>
            )
        )}

      </div>
    </>
  );
};

export default Analytics;
