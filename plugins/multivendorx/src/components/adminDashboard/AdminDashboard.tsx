import { Link, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const location = useLocation();
  const hash = location.hash;

  const isTabActive = hash.includes('tab=dashboard');
  const isAddStore = hash.includes('create');
  const isViewStore = hash.includes('view');
  const iseditStore = hash.includes('edit');

  return (
    <>
      hello
    </>
  );
};

export default AdminDashboard;
