import React from "react";
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

type Stat = {
  id: string | number;
  count: number | string;
  icon: string;
  label: string;
};
type Product = {
  id: number;
  title: string;
  sold: number;
  price: string;
  image: string;
};
type OverviewProps = {
  overview: Stat[];
  data: { month: string; revenue: number; net_sale: number; admin_amount: number }[];
  overviewData: { name: string; orders: number; sold_out: number }[];
  pieData: { name: string; value: number }[];
  COLORS?: string[];
};
const products: Product[] = [
  {
    id: 1,
    title: "Citrus Bloom",
    sold: 3,
    price: "$380",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/headphones.png",
  },
  {
    id: 2,
    title: "Leather Backpack",
    sold: 5,
    price: "$120",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/apple-watch.png",
  },
  {
    id: 3,
    title: "Smart Watch",
    sold: 2,
    price: "$220",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/play-station.png",
  },
];
const Overview: React.FC<OverviewProps> = ({
  overview,
  data,
  overviewData,
  pieData,
  COLORS = ["#5007aa", "#00c49f", "#ff7300"],
}) => {
  return (
    <div className="dashboard-overview">
      {/* Top Stats */}
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

      {/* Line & Bar Charts */}
      <div className="row">
        <div className="column w-65">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Sales Trend
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} name="Revenue" />
              <Line type="monotone" dataKey="net_sale" stroke="#ff7300" strokeWidth={3} name="Net Sale" />
              <Line type="monotone" dataKey="admin_amount" stroke="#00c49f" strokeWidth={3} name="Admin Amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="column w-35">
          <div className="card-header">
            <div className="left">
              <div className="title">
               Orders & Items
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#5007aa" barSize={40} name="Orders" />
              <Bar dataKey="sold_out" fill="#00c49f" barSize={40} name="Sold Out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
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
                Top Vendors
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
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Products
              </div>
            </div>
          </div>
          <div className="top-items">
            {products.map((product) => (
              <div className="items" key={product.id}>
                <div className="left-side">
                  <div className="image">
                    <img src={product.image} alt={product.title} />
                  </div>
                  <div className="details">
                    <div className="item-title">{product.title}</div>
                    <div className="sub-text">{product.sold} sold</div>
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
        
      </div>
    </div>
  );
};

export default Overview;
