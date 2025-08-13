import { Link } from 'react-router-dom';

const ViewStore = () => {
  return (
    <>
    <Link
        to="?page=multivendorx#&tab=stores"
        className="button"
        >
        Back
    </Link>
    <div>View Store...</div>
    </>
  );
};

export default ViewStore;
