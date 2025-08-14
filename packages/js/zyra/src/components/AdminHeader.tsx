import React from "react";

type AdminHeaderProps = {
  brandImg: string;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
  brandImg,
}) => {
  return (
    <>
      <div className="top-header">
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Necessitatibus, eos?
        </div>
        <i className="adminlib-close"></i>
      </div>

      <div className="admin-header">
        <div className="left-section">
          <img
            className="brand-logo"
            src={ brandImg}
            alt="Logo"
          />

          <div className="version-tag">
            <span className="admin-badge blue">5.10.15</span>
            <span className="admin-badge green"><i className="adminlib-pro-tag"></i>4.2.6</span>
          </div>
        </div>

        <div className="right-section">
          <div className="search-field">
            <i className="adminlib-search"></i>
            <input
              type="text"
              placeholder="Search Here"
            />
            <select>
              <option value="catagory">Catagory</option>
              <option value="documents">Documents</option>
            </select>
          </div>

          {/* start notification */}
          <div className="icon-wrapper" title="Notifications">
            <i className="admin-icon adminlib-storefront">
              {/* <span className="badge">3</span> */}
            </i>

            {/* <div className="icon-dropdown">
              <p className="dropdown-header">Notifications</p>
              <ul>
                <li>New order placed</li>
                <li>Stock running low</li>
                <li>Message from vendor</li>
              </ul>
            </div> */}
          </div>
          {/* end notification */}

          <i
            className="admin-icon adminlib-plus-circle-o"
            title="Chat maneger"
          ></i>
          <i
            className="admin-icon adminlib-user-circle"
            title="Category by store"
          ></i>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
