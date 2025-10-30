import { Link, useLocation } from 'react-router-dom';
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
import { Table, TableCell } from 'zyra';
import { ColumnDef } from '@tanstack/react-table';
import React, { useState, useEffect } from "react";
import "../components/dashboard.scss";
import '../dashboard/dashboard1.scss';
import Mascot from "../assets/images/multivendorx-mascot-scaled.png";

type StoreRow = {
  id?: number;
  store_name?: string;
  store_slug?: string;
  status?: 'publish' | 'pending' | string;
};

const salesIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 10px;font-size:12px;">$</div>`,
});
const analyticsData = [
  { icon: "adminlib-tools red", number: "230k", text: "Visitors" },
  { icon: "adminlib-book green", number: "45k", text: "Add to Cart" },
  { icon: "adminlib-global-community yellow", number: "1.2M", text: "Purchases" },
  { icon: "adminlib-wholesale blue", number: "500k", text: "Conv. Rate" },
];
const revenueData = [
  { month: "Jan", orders: 4000, earnings: 2400, refunds: 200, conversion: 2.4 },
  { month: "Feb", orders: 3000, earnings: 1398, refunds: 40, conversion: 2.1 },
  { month: "Mar", orders: 5000, earnings: 2800, refunds: 280, conversion: 3.2 },
  { month: "Apr", orders: 4780, earnings: 3908, refunds: 1000, conversion: 2.6 },
  { month: "May", orders: 5890, earnings: 4800, refunds: 300, conversion: 3.4 },
  { month: "Jun", orders: 4390, earnings: 3800, refunds: 210, conversion: 2.9 },
  { month: "Jul", orders: 6490, earnings: 5200, refunds: 600, conversion: 3.6 },
];
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
const ordersByCountry = [
  { country: "USA", orders: 4200, lat: 37.0902, lng: -95.7129 },
  { country: "UK", orders: 2800, lat: 55.3781, lng: -3.4360 },
  { country: "India", orders: 5200, lat: 20.5937, lng: 78.9629 },
  { country: "Germany", orders: 3100, lat: 51.1657, lng: 10.4515 },
  { country: "Australia", orders: 1900, lat: -25.2744, lng: 133.7751 },
];
const activities = [
  { icon: 'adminlib-cart', text: 'New order #10023 by Alex Doe.' },
  { icon: 'adminlib-star', text: 'Inventory updated: "Coffee Beans"' },
  { icon: 'adminlib-global-community', text: 'Customer "davidchen" updated account.' },
  { icon: 'adminlib-cart', text: 'New product "Wireless Headset"' },
];
const tabs = [
  { id: "transaction", label: "All transaction", content: "ffff" },
  { id: "success", label: "Success", content: "ff " },
  { id: "pending", label: "Pending", content: "" },
];
const tabData = {
  transaction: [
    { id: 1, name: "Lather & Loom", orders: 3, amount: 380, color: "red" },
    { id: 2, name: "Urban Threads", orders: 5, amount: 560, color: "green" },
  ],
  success: [
    { id: 3, name: "Crafty Corner", orders: 2, amount: 210, color: "blue" },
  ],
  pending: [
    { id: 4, name: "Glow & Co", orders: 4, amount: 420, color: "red" },
  ],
};


const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("transaction");
  const items = tabData[activeTab];
  return (
    <>
      <div className="page-title-wrapper">
        <div className="page-title">
          <div className="title">Dashboard</div>
          <div className="des">Manage your store information and preferences</div>
        </div>
      </div>

      <div className="row">
        <div className="column w-35 theme-bg">
          <div className="dashboard-view-section">
            <div className="title">
              Good Morning, Anna!
            </div>
            <div className="des">
              Here's what's happening with your store today <b>$84521 <i className="adminlib-arrow"></i></b>
            </div>

            <div className="price-wrapper">
              <div className="price">
                $165K
              </div>
              <div className="details">58% of sales target</div>
            </div>
            <div className="admin-btn btn-purple">
              View Details
            </div>

            <div className="image">
              <img src={Mascot} alt="" />
            </div>
          </div>
        </div>
        <div className="column w-65">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Conversion Snapshot
                </div>
              </div>
              <div className="right">
                <span>Updated 1 month ago</span>
              </div>
            </div>
            <div className="card-body">
              <div className="analytics-container">

                {analyticsData.map((item, idx) => (
                  <div key={idx} className="analytics-item">
                    <div className="analytics-icon">
                      <i className={item.icon}></i>
                    </div>
                    <div className="details">
                      <div className="number">{item.number}</div>
                      <div className="text">{item.text}</div>
                    </div>
                  </div>
                ))}

              </div>
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
                  Store Activity Log
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="top-items">
                <div className="items">
                  <div className="left-side">
                    <div className="icon">
                      <i className="admin-icon red">1</i>
                    </div>
                    <div className="details">
                      <div className="item-title">David Chen</div>
                      <div className="sub-text">180 units sold</div>
                    </div>
                  </div>
                  <div className="right-side">
                    <div className="price">$9230</div>
                  </div>
                </div>
                <div className="items">
                  <div className="left-side">
                    <div className="icon">
                      <i className="admin-icon green">2</i>
                    </div>
                    <div className="details">
                      <div className="item-title">Emily White</div>
                      <div className="sub-text">320 units sold</div>
                    </div>
                  </div>
                  <div className="right-side">
                    <div className="price">$380</div>
                  </div>
                </div>
                <div className="items">
                  <div className="left-side">
                    <div className="icon">
                      <i className="admin-icon blue">3</i>
                    </div>
                    <div className="details">
                      <div className="item-title">Mark Johnson</div>
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

        </div>
        <div className="column">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Store Activity Log
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="activity-wrapper">
                {activities.map((a, i) => (
                  <div key={i} className="activity">
                    <span className="icon">
                      <i className={a.icon}></i>
                    </span>
                    <div className="details">
                      {a.text}
                      <span>2 minutes ago</span>
                    </div>
                  </div>
                ))}
              </div>

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
                  Sales Overview (7 Days)
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} name="Top Category" />
                  <Line type="monotone" dataKey="net_sale" stroke="#250250ff" strokeWidth={3} name="Top Brand" />
                  <Line type="monotone" dataKey="admin_amount" stroke="#9b69d8ff" strokeWidth={3} name="Top Store" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
        <div className="column">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Monthly Performance
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={revenueData}
                  barSize={12}
                  barCategoryGap="20%"
                // margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
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
                  <Bar dataKey="orders" fill="#5007aa98" radius={[6, 6, 0, 0]} name="Sales" />
                  <Bar dataKey="earnings" fill="#5007aa" radius={[6, 6, 0, 0]} name="Earnings" />
                  <Bar dataKey="refunds" fill="#5007aaa1" radius={[6, 6, 0, 0]} name="Orders" />
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
      </div>

      <div className="row">
        <div className="column w-65">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Admin Announcements
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="notification-wrapper">
                <ul>
                  <li>
                    <div className="icon-wrapper">
                      <i className="adminlib-form-paypal-email blue"></i>
                    </div>
                    <div className="details">
                      <div className="notification-title">Holiday campaign materials uploaded.</div>
                      <div className="des">Holiday campaign materials uploaded.</div>
                      <span>1d ago</span>
                    </div>

                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <i className="adminlib-mail orange"></i>
                    </div>
                    <div className="details">
                      <div className="notification-title">System maintenance Nov 5 (2–4 AM PST).</div>
                      <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit</div>
                      <span>34min ago</span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <i className="adminlib-form-paypal-email green"></i>
                    </div>
                    <div className="details">
                      <div className="notification-title">New shipping carrier integration live.</div>
                      <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                      <span>34min ago</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="column w-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Best-Selling Products
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="top-items">
                <div className="items">
                  <div className="left-side">
                    <div className="icon">
                      <i className="adminlib-pro-tag admin-icon red"></i>
                    </div>
                    <div className="details">
                      <div className="item-title">Wireless Headset</div>
                      <div className="sub-text">180 units sold</div>
                    </div>
                  </div>
                  <div className="right-side">
                    <div className="price">$9230</div>
                  </div>
                </div>
                <div className="items">
                  <div className="left-side">
                    <div className="icon">
                      <i className="adminlib-pro-tag admin-icon green"></i>
                    </div>
                    <div className="details">
                      <div className="item-title">Coffee Beans</div>
                      <div className="sub-text">320 units sold</div>
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
                      <div className="item-title">Yoga Mat</div>
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
        </div>

        {/* <div className="column w-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Trans
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="cart-body">
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
              <div className="top-items">
                {items.map((item) => (
                  <div className="items" key={item.id}>
                    <div className="left-side">
                      <div className="icon">
                        <i
                          className={`adminlib-pro-tag admin-icon ${item.color}`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="details">
                        <div className="item-title">{item.name}</div>
                        <div className="sub-text">{item.orders} orders</div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div className="price">${item.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}
      </div>

    </>
  );
};

export default Dashboard;
