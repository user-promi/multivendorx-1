import { Link, useLocation } from 'react-router-dom';
import AddStore from './AddStore';
import ViewStore from './ViewStore';

const Store = () => {
  const location = useLocation();
  const hash = location.hash;

  const isTabActive = hash.includes('tab=store-management');
  const isAddStore = hash.includes('create=true');
  const isViewStore = hash.includes('view');

  return (
    <>
      {isTabActive && isAddStore && <AddStore />}
      {isTabActive && isViewStore && !isAddStore && <ViewStore />}
      
      {!isAddStore && !isViewStore && (
        <>
          <Link
            to="?page=multivendorx#&tab=store-management&create=true"
            className="button"
          >
            Add Store
          </Link>
          <Link
            to="?page=multivendorx#&tab=store-management&view"
            className="button"
          >
            View Store
          </Link>
          <div>Loading Store...</div>
        </>
      )}
    </>
  );
};

export default Store;
