import React from "react";
import { Tooltip } from "react-leaflet";
import { Cell, Legend, PieChart, ResponsiveContainer, Pie } from "recharts";

type Product = {
  id: number;
  title: string;
  price: string;
};
const pieData = [
  { name: "Admin", value: 1200 },
  { name: "Vendor", value: 2400 },
  { name: "Shipping", value: 800 },
  { name: "Free", value: 200 },
];
const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff"];
const overview = [
  {
    id: 'sales',
    label: 'Gross Sales',
    count: 15,
    icon: 'adminlib-star green',
  },
  {
    id: 'earnings',
    label: 'Returns',
    count: 625,
    icon: 'adminlib-support red',
  },
  {
    id: 'Vendors',
    label: 'Coupons',
    count: 8,
    icon: 'adminlib-global-community blue',
  },
  {
    id: 'free',
    label: 'Net Sales',
    count: 8,
    icon: 'adminlib-global-community yellow',
  },
  {
    id: 'sales',
    label: 'Taxs',
    count: 15,
    icon: 'adminlib-star green',
  },
  {
    id: 'earnings',
    label: 'Shipping',
    count: 625,
    icon: 'adminlib-support red',
  },
  {
    id: 'Vendors',
    label: 'Total sales',
    count: 8,
    icon: 'adminlib-global-community blue',
  },
];
const products: Product[] = [
  {
    id: 1,
    title: "Total Admin Net Earning",
    price: "$5,072.31",
  },
  {
    id: 1,
    title: "Total Vendor Commission",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Total Vendor Net Commission",
    price: "$75",
  },
  {
    id: 1,
    title: "Total Sub Total",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Shipping",
    price: "$0",
  },
];
const Revenue: React.FC = () => {
  return (
    <div className="dashboard-overview">
      <div className="row">
        <div className="column width-65">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Account Overview
              </div>
            </div>
            <div className="right">
              <span>Updated 1 month ago</span>
            </div>
          </div>
          <div className="card-body">
            <div className="analytics-container">

              {overview.map((item, idx) => (
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
      </div>
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue Distribution
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Breakdown
              </div>
            </div>
          </div>
          <div className="top-items">
            {products.map((product) => (
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
        <div className="column w-35">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Vendor Leaderboard
              </div>
            </div>
          </div>

           <div className="card-body">
              
           </div> 
        </div>
      </div>
    </div>
  );
};

export default Revenue;
