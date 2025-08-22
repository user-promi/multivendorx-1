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
import "./AdminDashboard.scss";
import "../Dashboard.scss"

const AdminDashboard = () => {
  const location = useLocation();
  const hash = location.hash;
  const isTabActive = hash.includes('tab=dashboard');

  // Dummy chart data
  const data = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4780 },
    { month: 'May', revenue: 5890 },
    { month: 'Jun', revenue: 4390 },
    { month: 'Jul', revenue: 6490 },
  ];
  const overviewData = [
    { name: 'Pending Approvals', value: 18 },
    { name: 'Active Disputes', value: 5 },
    { name: 'Low Stock Items', value: 42 },
    { name: 'Pending Payouts', value: 9 },
  ];
  const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];
  return (
    <>
      <div className="admin-dashboard">

        {/* header */}
        <div className="header">
          <div className="title-wrapper">
            <div className="title">Welcome back, Admin!</div>
            <div className="des">Here's what's happening with your marketplace today</div>
          </div>
          {/* <button className="admin-btn btn-purple"><i className="adminlib-plus-circle-o"></i>Add Product</button> */}
        </div>

        {/* cards */}
        <div className="row">
          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>TOTAL REVENUE</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$47,892</span>
                  <a href="#">View net revenue</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>ACTIVE VENDORS</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>184</span>
                  <a href="#">View all vendor</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>TOTAL PRODUCTS</div>
                <span className="text-red">-8.54%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>7,892</span>
                  <a href="#">View all products</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>ORDERS THIS MONTH</div>
                <span className="">+0.00%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>3892</span>
                  <a href="#">View all order</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* chart */}
        <div className="row">
          <div className="column w-65">
            <h3>Revenue Trend (Last 7 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="column w-35">
            <h3>Quick Actions</h3>
            <div className="action-btn-wrapper">
              <button className="admin-btn btn-purple">Add Vendor</button>
              <button className="admin-btn btn-purple">Approve Products</button>
              <button className="admin-btn btn-purple">Process Payouts</button>
              <button className="admin-btn btn-purple">Send Notifications</button>
              <button className="admin-btn btn-purple">Generate Reports</button>
              <button className="admin-btn btn-purple">Manage Settings</button>
            </div>

          </div>
        </div>

        <div className="row">
          

          <div className="column">
            <h3>Recent Activity</h3>

            <div className="activity-wrapper">
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-cart"></i>
                </span>
                <div className="details">
                  New product "Wireless Gaming Headset" added by TechWorld
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-star"></i>
                </span>
                <div className="details">
                  5-star review received for "Smartphone Case" by MobileGear
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-global-community"></i>
                </span>
                <div className="details">

                  New vendor "Fashion Forward" completed registration
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-cart"></i>
                </span>
                <div className="details">
                Commission payment of $2,847 processed for ElectroHub
                  <span>2 minutes ago</span>
                </div>
              </div>
            </div>

          </div>
          <div className="column ">
            <div className="chart-wrapper">
              <h3>System Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5007aa" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* <div className="chart-box">
              <h3>System Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={overviewData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div> */}
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;
