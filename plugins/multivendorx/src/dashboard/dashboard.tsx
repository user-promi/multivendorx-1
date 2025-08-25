import './dashboardCommon.scss';

const Dashboard = () => {
  return (
    <div className="">

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
              </div><span className="icon">
                <i className="adminlib-dynamic-pricing"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="cards">
            <div className="title-wrapper">
              <div>ACTIVE VENDORS</div><span className="text-green">+16.24%</span>
            </div>
            <div className="card-body">
              <div className="value"><span>184</span><a href="#">View all vendor</a></div><span
                className="icon"><i className="adminlib-dynamic-pricing"></i></span>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="cards">
            <div className="title-wrapper">
              <div>TOTAL PRODUCTS</div><span className="text-red">-8.54%</span>
            </div>
            <div className="card-body">
              <div className="value"><span>7,892</span><a href="#">View all products</a></div><span
                className="icon"><i className="adminlib-dynamic-pricing"></i></span>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="cards">
            <div className="title-wrapper">
              <div>ORDERS THIS MONTH</div><span className="">+0.00%</span>
            </div>
            <div className="card-body">
              <div className="value"><span>3892</span><a href="#">View all order</a></div><span
                className="icon"><i className="adminlib-dynamic-pricing"></i></span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="column">
          <h3>Recent Activity</h3>
          <div className="activity-wrapper">
            <div className="activity"><span className="icon"><i className="adminlib-cart"></i></span>
              <div className="details">New product "Wireless Gaming Headset" added by TechWorld<span>2 minutes ago</span>
              </div>
            </div>
            <div className="activity"><span className="icon"><i className="adminlib-star"></i></span>
              <div className="details">5-star review received for "Smartphone Case" by MobileGear<span>2 minutes
                ago</span></div>
            </div>
            <div className="activity"><span className="icon"><i className="adminlib-global-community"></i></span>
              <div className="details">New vendor "Fashion Forward" completed registration<span>2 minutes ago</span></div>
            </div>
            <div className="activity"><span className="icon"><i className="adminlib-cart"></i></span>
              <div className="details">Commission payment of $2,847 processed for ElectroHub<span>2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
        <div className="column">
          <h3>Top products</h3>
          <div className="activity-wrapper">
            <div className="activity"><span className="icon"><i className="adminlib-cart"></i></span>
              <div className="details">New product "Wireless Gaming Headset" added by TechWorld<span>2 minutes ago</span>
              </div>
            </div>
            <div className="activity"><span className="icon"><i className="adminlib-star"></i></span>
              <div className="details">5-star review received for "Smartphone Case" by MobileGear<span>2 minutes
                ago</span></div>
            </div>
            <div className="activity"><span className="icon"><i className="adminlib-global-community"></i></span>
              <div className="details">New vendor "Fashion Forward" completed registration<span>2 minutes ago</span></div>
            </div>
            <div className="activity"><span className="icon"><i className="adminlib-cart"></i></span>
              <div className="details">Commission payment of $2,847 processed for ElectroHub<span>2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
