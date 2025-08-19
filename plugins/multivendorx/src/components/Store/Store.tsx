import { Link, useLocation } from 'react-router-dom';
import AddStore from './AddStore';
import StoreTable from './StoreTable';
import ViewStore from './ViewStore';
import EditStore from './Edit/EditStore';
import { AdminBreadcrumbs } from 'zyra';

const Store = () => {
  const location = useLocation();
  const hash = location.hash;

  const isTabActive = hash.includes('tab=stores');
  const isAddStore = hash.includes('create');
  const isViewStore = hash.includes('view');
  const isEditStore = hash.includes('edit');

  const breadcrumbButtons = [
    {
      label: 'Add Store',
      onClick: () => window.location.assign('?page=multivendorx#&tab=stores&create'),
      className: isAddStore ? 'active' : ''
    },
    {
      label: 'View Store',
      onClick: () => window.location.assign('?page=multivendorx#&tab=stores&view'),
      className: isViewStore ? 'active' : ''
    }
  ];

  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon="icon"
        parentTabName="Stores"
        buttons={breadcrumbButtons}
      />

      {isTabActive && isAddStore && <AddStore />}
      {isTabActive && isViewStore && !isAddStore && <ViewStore />}
      {isTabActive && isEditStore && !isViewStore && !isAddStore && <EditStore />}

      {!isAddStore && !isViewStore && !isEditStore && <StoreTable />}
    </>
  );
};

export default Store;
