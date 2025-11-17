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
import Mascot from "../assets/images/multivendorx-mascot-scale.png";

type StoreRow = {
  id?: number;
  store_name?: string;
  store_slug?: string;
  status?: 'publish' | 'pending' | string;
};

const salesIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 0.625rem;font-size:0.75rem;">$</div>`,
});
const analyticsData = [
  { icon: "adminlib-dollar theme-color1", number: "$45,230", text: "Total Revenue" },
  { icon: "adminlib-order theme-color2", number: "325", text: "Total Orders" },
  { icon: "adminlib-paid theme-color3", number: "$139.60", text: "Average Order Value" },
  { icon: "adminlib-user-circle theme-color4", number: "1,248", text: "Active Customers" },
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
const demoData = [
  {
    id: 1,
    orderId: "#ORD-001",
    date: "2025-11-01",
    product: "Wireless Headset",
    customer: "John Doe",
    total: "$120.00",
    status: "Processing",
    order: "Processing",
    progress: 45,
    theme: "theme-color1",
  },
  {
    id: 2,
    orderId: "#ORD-002",
    date: "2025-11-03",
    product: "Bluetooth Speaker",
    customer: "Jane Smith",
    total: "$89.00",
    status: "Shipped",
    order: "Shipped",
    progress: 75,
    theme: "theme-color2",
  },
  {
    id: 3,
    orderId: "#ORD-003",
    date: "2025-11-04",
    product: "Smartwatch",
    customer: "Robert Wilson",
    total: "$210.00",
    status: "Delivered",
    progress: 100,
    theme: "theme-color3",
  },
];
const reviews = [
  {
    id: 1,
    product: "Product A",
    rating: 5,
    date: "22 Dec 2024",
    description:
      "Good product overall, but shipping took longer than expected."
  },
  {
    id: 2,
    product: "Product B",
    rating: 4,
    date: "10 Jan 2025",
    description:
      "Amazing quality and packaging. Worth the price and fast delivery!",
  },
  {
    id: 3,
    product: "Product C",
    rating: 3,
    date: "5 Feb 2025",
    description:
      "Good product overall, but shipping took longer than expected.",
  },
  {
    id: 4,
    product: "Product D",
    rating: 5,
    date: "28 Mar 2025",
    description:
      "Exceeded expectations! The material feels premium and durable.",
  },
];
const customers = [
  {
    id: 1,
    name: "David Chen",
    orders: 7,
    total: "$1250",
    icon: "adminlib-person",
  },
  {
    id: 2,
    name: "Sophia Martinez",
    orders: 12,
    total: "$2320",
    icon: "adminlib-person",
  },
  {
    id: 3,
    name: "Ethan Johnson",
    orders: 4,
    total: "$890",
    icon: "adminlib-person",
  },
  {
    id: 4,
    name: "Liam Patel",
    orders: 9,
    total: "$1560",
    icon: "adminlib-person",
  },
];

const requests = [
  {
    id: "REQ-001",
    name: "Maria G.",
    reason: "Damaged",
    time: "Today",
    amount: "$55.99"
  },
  {
    id: "REQ-002",
    name: "John D.",
    reason: "Wrong size",
    time: "Yesterday",
    amount: "$29.50"
  },
  {
    id: "REQ-003",
    name: "Sarah L.",
    reason: "Changed mind",
    time: "2 days ago",
    amount: "$12.00"
  }
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
const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const themeColors = [
  getCSSVar("--colorPrimary"),
  getCSSVar("--colorSecondary"),
  getCSSVar("--colorAccent"),
  getCSSVar("--colorSupport"),
];
const data = [
  { name: "Top Category", value: 400, color: themeColors[0] },
  { name: "Top Brand", value: 300, color: themeColors[1] },
  { name: "Top Store", value: 300, color: themeColors[2] },
];
const BarChartData = [
  { name: "Sales", dataKey: "orders", color: themeColors[0] },
  { name: "Earnings", dataKey: "earnings", color: themeColors[1] },
  { name: "Orders", dataKey: "refunds", color: themeColors[2] },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("transaction");
  const items = tabData[activeTab];
  return (
    <>
      <div className="page-title-wrapper">
        <div className="page-title">
          <div className="title">Good Morning, Anna!</div>
          <div className="view-des">You’re viewing: <b>Anna’s Home Crafts</b></div>
          <div className="des up">Here's what's happening with your store today <b>$84521 <i className="adminlib-arrow-up"></i></b></div>
        </div>
      </div>

      <div className="row">
        {/* <div className="column w-35">
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
        </div> */}
        <div className="column transparent">
          <div className="card">
            {/* <div className="card-header">
              <div className="left">
                <div className="title">
                  Conversion Snapshot
                </div>
              </div>
              <div className="right">
                <span>Updated 1 month ago</span>
              </div>
            </div> */}
            <div className="card-body">
              <div className="analytics-container">

                {analyticsData.map((item, idx) => (
                  <div key={idx} className="analytics-item">
                    <div className="details">
                      <div className="text">{item.text}</div>
                      <div className="number">{item.number}</div>
                      <div className="report"><span>10%</span> | This month</div>
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
                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
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
                  {/* <Bar dataKey="orders" fill="#f1a60e" radius={[6, 6, 0, 0]} name="Sales" />
                  <Bar dataKey="earnings" fill="#fa7a38" radius={[6, 6, 0, 0]} name="Earnings" />
                  <Bar dataKey="refunds" fill="#73d860" radius={[6, 6, 0, 0]} name="Orders" /> */}
                  {BarChartData.map((entry, index) => (
                    // <Cell key={`cell-${index}`} fill={entry.color} />
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

        {/* <div className="column w-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Sales Overview (extra)
                </div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

            </div>
          </div>

        </div>
         */}


        <div className="column w-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Transaction Details
                </div>
                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
              </div>
              <div className="right">
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="top-customer-wrapper">
                {requests.map((customer) => (
                  <div key={customer.id} className="customer">
                    <div className="left-section">
                      {/* <div className="profile">
                        <i className={customer.icon}></i>
                      </div> */}
                      <div className="details">
                        <div className="name">#53643246</div>
                        <div className="order-number"> {customer.time}</div>
                      </div>
                    </div>

                    <div className="price-section">{customer.amount}</div>
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
                  Recent Orders
                </div>
              </div>
              <div className="right">
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="table-wrapper">
                <table className="order-table">
                  <thead>
                    <tr className="header">
                      <td>#</td>
                      <td>Order Id</td>
                      <td>Order Date</td>
                      <td>Product Name</td>
                      <td>Customer</td>
                      <td>Total Amount</td>
                      <td>Order Status</td>
                      <td>Status</td>
                    </tr>
                  </thead>
                  <tbody>
                    {demoData.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.orderId}</td>
                        <td>{item.date}</td>
                        <td>{item.product}</td>
                        <td>{item.customer}</td>
                        <td>{item.total}</td>
                        <td>
                          <div className={`admin-status ${item.theme}`}>
                            {item.status}
                          </div>
                        </td>
                        <td>
                          <div className={`admin-badge ${item.theme}`}>
                            {item.status}
                          </div>
                          {/* <div className={`progress-bar ${item.theme}`}>
                            <div style={{ width: `${item.progress}%` }}></div>
                          </div> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  Best-Selling Products (extra)
                </div>
              </div>
              <div className="right">
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="table-wrapper top-products">
                <table>
                  <tr className="header">
                    <td>#</td>
                    <td>Name</td>
                    <td>Popularity</td>
                    <td>Sales</td>
                  </tr>
                  <tr>
                    <td>01</td>
                    <td>Wireless Headset</td>
                    <td className="progress-bar theme-color1"><div></div></td>
                    <td><div className="admin-badge theme-color1">45%</div></td>
                  </tr>
                  <tr>
                    <td>02</td>
                    <td>Wireless Headset</td>
                    <td className="progress-bar theme-color2"><div></div></td>
                    <td><div className="admin-badge theme-color2">45%</div></td>
                  </tr>
                  <tr>
                    <td>03</td>
                    <td>Wireless Headset</td>
                    <td className="progress-bar theme-color3"><div></div></td>
                    <td><div className="admin-badge theme-color3">45%</div></td>
                  </tr>
                  <tr>
                    <td>04</td>
                    <td>Wireless Headset</td>
                    <td className="progress-bar theme-color4"><div></div></td>
                    <td><div className="admin-badge theme-color4">19%</div></td>
                  </tr>
                  <tr>
                    <td>05</td>
                    <td>Wireless Headset</td>
                    <td className="progress-bar theme-color1"><div></div></td>
                    <td><div className="admin-badge theme-color1">45%</div></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Admin Announcements
                </div>
                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
              </div>
              <div className="right">
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="notification-wrapper">
                <ul>
                  <li>
                    <div className="icon-wrapper">
                      <i className="adminlib-form-paypal-email admin-badge theme-color1"></i>
                    </div>
                    <div className="details">
                      <div className="notification-title">Holiday campaign materials uploaded.</div>
                      <div className="des">Holiday campaign materials uploaded.</div>
                      <span>1d ago</span>
                    </div>

                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <i className="adminlib-mail admin-badge theme-color2"></i>
                    </div>
                    <div className="details">
                      <div className="notification-title">System maintenance Nov 5 (2–4 AM PST).</div>
                      <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit</div>
                      <span>34min ago</span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <i className="adminlib-form-paypal-email admin-badge theme-color3"></i>
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
      </div>

      <div className="row">
        <div className="column w-65">
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
        <div className="column w-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Top customer
                </div>
                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
              </div>
              {/* <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div> */}
            </div>
            <div className="card-body">
              <div className="top-customer-wrapper">
                {customers.map((customer) => (
                  <div key={customer.id} className="customer">
                    <div className="left-section">
                      <div className="profile">
                        <i className={customer.icon}></i>
                      </div>
                      <div className="details">
                        <div className="name">{customer.name}</div>
                        <div className="order-number">{customer.orders} orders</div>
                      </div>
                    </div>

                    <div className="price-section">{customer.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        <div className="column w-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Pending Refunds
                </div>
                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
              </div>
              <div className="right">
                <i className="adminlib-external"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="top-customer-wrapper">
                {requests.map((customer) => (
                  <div key={customer.id} className="customer">
                    <div className="left-section">
                      {/* <div className="profile">
                        <i className={customer.icon}></i>
                      </div> */}
                      <div className="details">
                        <div className="name">{customer.name}</div>
                        <div className="order-number">{customer.reason} | {customer.time}</div>
                      </div>
                    </div>

                    <div className="price-section">{customer.amount}</div>
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
                  Latest Reviews
                </div>
                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <div className="review-wrapper">
                {reviews.map((review) => (
                  <div className="review" key={review.id}>
                    <div className="details">
                      <div className="title">{review.product}</div>
                      <div className="star-wrapper">
                        {[...Array(5)].map((_, index) => (
                          <i
                            key={index}
                            className={`adminlib-star ${index < review.rating ? "active" : ""
                              }`}
                          ></i>
                        ))}
                        <span>{review.date}</span>
                      </div>
                      <div className="des">{review.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  );
};

export default Dashboard;
