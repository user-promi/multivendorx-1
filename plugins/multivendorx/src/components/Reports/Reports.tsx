import { AdminBreadcrumbs, SelectInput } from 'zyra';
import { useEffect, useRef, useState } from 'react';

import "../../dashboard/dashboardCommon.scss";
import Overview from './Overview';
import Transactions from './Payout';
import Revenue from './Revenue';
import StoreOrders from './StoreOrders';
import RefundedOrderOld from './RefundedOrderOld';
import axios from 'axios';

const Reports = () => {

  function requestOrders() {
    axios({
      method: "GET",
      url: `${appLocalizer.apiUrl}/wc-analytics/`,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
    })
      .then(response => console.log("analytics", response.data))
      .catch(error => console.error(error));

    axios({
      method: "GET",
      url: `${appLocalizer.apiUrl}/wc-analytics/reports/stock/stats`,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
    })
      .then(response => console.log("stock stats", response.data))
      .catch(error => console.error(error));

    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        per_page: 100,                  // Number of orders to fetch
        meta_key: 'multivendorx_store_id', // The meta key you want to check
      },
    })
      .then(response => {
        const ordersWithMeta = response.data;
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });

  }

  useEffect(() => {
    requestOrders();
  });

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
      id: 'earnings',
      label: 'No. of orders',
      count: "7896",
      icon: 'adminlib-order green',
    },
    {
      id: 'Vendors',
      label: 'Admin Commission',
      count: "85669",
      icon: 'adminlib-commission blue',
    },
    {
      id: 'Pending Withdrawals',
      label: 'Vendor Payout Pending',
      count: "88200",
      icon: 'adminlib-vendor-shipping red',
    },
    {
      id: 'Pending Withdrawals',
      label: 'Amount Refunds',
      count: "600",
      icon: 'adminlib-marketplace-refund green',
    },
    {
      id: 'Pending Withdrawals',
      label: 'No. of refunds',
      count: "600",
      icon: 'adminlib-calendar blue',
    },

  ];
  const pieData = [
    { name: "Admin Net Earning", value: 1200 },
    { name: "Vendor Commission", value: 2400 },
    { name: "Vendor Net Commission", value: 800 },
    { name: "Sub Total", value: 200 },
    { name: "Shipping", value: 200 },
  ];
  const [activeTab, setActiveTab] = useState("payout");
  const tabs = [
    { id: "overview", label: "Marketplace", icon: "adminlib-marketplace-membership", content: <Overview overview={overview} data={data} overviewData={overviewData} pieData={pieData} /> },
    { id: "revenue", label: "Products", icon: "adminlib-multi-product", content: <Revenue /> },
    { id: "payout", label: "Stores", icon: "adminlib-store-inventory", content: <Transactions /> },
    { id: "StoreOrders", icon: "adminlib-order", label: "Store Orders", content: <StoreOrders /> },
    { id: "RefundedOrderOld", icon: "adminlib-marketplace-refund", label: "Refunded Orders", content: <RefundedOrderOld /> },
  ];

  const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff", "#004ec4ff"];
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (

    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-report"
        tabTitle="Reports"
        description={'Track sales, earnings, and store performance with real-time marketplace insights.'}

      />
      <div className="general-wrapper tab">

        <div className="tab-titles">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`title ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`icon ${tab.icon}`}></i><p>{tab.label}</p>
            </div>
          ))}
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

export default Reports;
