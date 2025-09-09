import React from "react";
import { Tooltip } from "react-leaflet";
import { Cell, Legend, PieChart, ResponsiveContainer, Pie } from "recharts";

type Product = {
  id: number;
  title: string;
  sold: number;
  price: string;
  image: string;
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
    label: 'Commission Rate',
    count: 15,
    icon: 'adminlib-star',
  },
  {
    id: 'earnings',
    label: 'Avg Order',
    count: 625,
    icon: 'adminlib-support',
  },
  {
    id: 'Vendors',
    label: 'Shipping Rate',
    count: 8,
    icon: 'adminlib-global-community',
  },
  {
    id: 'free',
    label: 'Other Fees',
    count: 8,
    icon: 'adminlib-global-community',
  },
];
const products: Product[] = [
  {
    id: 1,
    title: "Admin",
    sold: 3,
    price: "$75",
    image: "",
  },
  {
    id: 2,
    title: "Vendor",
    sold: 5,
    price: "$120",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/apple-watch.png",
  },
  {
    id: 3,
    title: "Shipping",
    sold: 2,
    price: "$45",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/play-station.png",
  },
];
const Revenue: React.FC = () => {
  return (
    <div className="dashboard-overview">
      <div className="row">
        <div className="overview-card-wrapper">
          {overview.map((stat) => (
            <div className="action" key={stat.id}>
              <div className="title">
                {stat.count}
                <i className={stat.icon}></i>
              </div>
              <div className="description">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="row">
        <div className="column">
          <h3>Revenue DistributioRevenue Splitn</h3>
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
          <h3>Breakdown</h3>
          <div className="top-items">
            {products.map((product) => (
              <div className="items" key={product.id}>
                <div className="left-side">
                  <div className="details">
                    <div className="item-title">Admin</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$308</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
