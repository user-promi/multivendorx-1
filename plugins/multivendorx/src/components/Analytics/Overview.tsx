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

type OverviewProps = {
  overview: Stat[];
  data: { month: string; revenue: number; net_sale: number; admin_amount: number }[];
  overviewData: { name: string; orders: number; sold_out: number }[];
  pieData: { name: string; value: number }[];
  COLORS?: string[];
};

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
          <h3>Sales Trend</h3>
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
          <h3>Orders & Items</h3>
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
        <div className="column w-35">
          <h3>Revenue Distribution</h3>
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
      </div>
    </div>
  );
};

export default Overview;
