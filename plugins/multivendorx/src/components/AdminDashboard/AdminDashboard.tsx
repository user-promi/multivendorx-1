import { Link, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const location = useLocation();
  const hash = location.hash;

  const isTabActive = hash.includes('tab=dashboard');


  return (
    <>
      <div>
        header
      </div>
      <div>
        cards
      </div>
      <div>
        <div>
          System Overview
        </div>
        <div>
          Quick Actions
        </div>
      </div>
      <div>
        Recent Activity
      </div>
      <div>
      Top Performing Vendors
      </div>
      <div>
      Revenue Analytics
      </div>
    </>
  );
};

export default AdminDashboard;
