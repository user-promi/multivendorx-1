import { Link } from 'react-router-dom';
import "./ViewStore.scss"

const ViewStore = () => {
  return (
    <>
    <Link
        to="?page=multivendorx#&tab=stores"
        className="button"
        >
        Back
    </Link>
    <div className="store-view-wrapper">
      <div className="header">
        <div className="profile-section">
            <span className="avater"><img src="https://randomuser.me/api/portraits/men/75.jpg"/></span>
            <div className="name">Avi Roy</div>
            <div className="details">
              <i className="adminlib-wholesale"></i>
              Lorem ipsum dolor sit amet.
            </div>
            <div className="details">
              <i className="adminlib-form-phone"></i>
              + 9874563210
            </div>
        </div>

        <div className="store-image">
            <img src="https://res.cloudinary.com/walden-global-services/image/upload/v1544584558/dandelion/29.jpg" alt="" />
        </div>

      </div>

    </div>
    </>
  );
};

export default ViewStore;
