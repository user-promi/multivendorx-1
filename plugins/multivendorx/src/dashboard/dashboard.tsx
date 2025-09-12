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
import '../dashboard/dashboard1.scss';
import { Table, TableCell } from 'zyra';
import { ColumnDef } from '@tanstack/react-table';
import React, { useState, useEffect } from "react";
import '../components/dashboard.scss'

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
  { icon: "adminlib-tools red", number: "230k", text: "Sales" },
  { icon: "adminlib-book green", number: "45k", text: "Customers" },
  { icon: "adminlib-global-community yellow", number: "1.2M", text: "Orders" },
  { icon: "adminlib-wholesale blue", number: "500k", text: "Products" },
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
const ordersByCountry = [
  { country: "USA", orders: 4200, lat: 37.0902, lng: -95.7129 },
  { country: "UK", orders: 2800, lat: 55.3781, lng: -3.4360 },
  { country: "India", orders: 5200, lat: 20.5937, lng: 78.9629 },
  { country: "Germany", orders: 3100, lat: 51.1657, lng: 10.4515 },
  { country: "Australia", orders: 1900, lat: -25.2744, lng: 133.7751 },
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
      <div className="row">
        <div className="column width-65">

          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Statistics
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
        <div className="column width-65">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Revenue
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
                  <Bar dataKey="orders" fill="#5007aa98" radius={[6, 6, 0, 0]} name="Orders" />
                  <Bar dataKey="earnings" fill="#5007aa" radius={[6, 6, 0, 0]} name="Earnings" />
                  <Bar dataKey="refunds" fill="#5007aaa1" radius={[6, 6, 0, 0]} name="Refunds" />
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
        <div className="column width-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Sales by Locations
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">
              <MapContainer
                center={[20, 0]}          // Center of the map (lat, lng)
                zoom={2}                  // Zoom level
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                />
              </MapContainer>
            </div>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="column width-65">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Sales by Locations
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="card-body">

            </div>
          </div>
        </div>

        <div className="column width-35">
          <div className="card">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Top products
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
        </div>

        <div className="column width-35">
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
        </div>
      </div>

    </>
  );
};

export default Dashboard;
