import React, { useState, useRef, useEffect } from "react";
import CommonPopup from "./CommonPopup";

// Accepts searchIndex-style items directly
type SearchItem = {
  icon?: any;
  name?: string;
  desc?: string;
  link: string;
};
interface Notification {
  heading: string;
  message: string;
  time: string;
  icon?: string;
  color?: string;
}
type AdminHeaderProps = {
  brandImg: string;
  query: string;
  results?: any[];
  onSearchChange: (value: string) => void;
  onResultClick: (res: SearchItem) => void;
  onSelectChange: (value: string) => void;
  selectValue: string;
  free?: string;
  pro?: string;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
  brandImg,
  query,
  results = [],
  onSearchChange,
  onResultClick,
  onSelectChange,
  selectValue,
  free,
  pro = "4.1.23",
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [contactSupportPopup, setContactSupportPopup] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Open dropdown automatically when there are results
  useEffect(() => {
    setDropdownOpen(results.length > 0);
  }, [results]);

  const [messages] = useState<Notification[]>([
    {
      heading: "Congratulation Lettie",
      message: "Won the monthly best seller gold badge",
      time: "2 days ago",
      icon: "adminlib-user-network-icon red",
      color: "green",
    },
    {
      heading: "New Order Received",
      message: "Order #1024 has been placed",
      time: "1 hour ago",
      icon: "adminlib-cart-icon",
      color: "blue",
    },
    {
      heading: "New Review",
      message: "John left a 5-star review",
      time: "30 mins ago",
      icon: "adminlib-star-icon",
      color: "yellow",
    },
  ]);
  return (
    <>
      <div className="admin-header">
        <div className="left-section">
          <img className="brand-logo" src={brandImg} alt="Logo" />

          <div className="version-tag">
            <span className="admin-badge blue">
              <i className="adminlib-adminlib-info"></i> <b>Free:</b> {free}
            </span>
            <span className="admin-badge red">
              <i className="adminlib-pro-tag"></i> Pro: {pro}
            </span>
          </div>
        </div>

        <div className="right-section">
          <div className="search-field" style={{ position: "relative" }} ref={wrapperRef}>
            <i className="adminlib-search"></i>
            <input
              type="text"
              placeholder="Search Here"
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <select
              value={selectValue}
              onChange={(e) => onSelectChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="modules">Modules</option>
              <option value="settings">Settings</option>
            </select>

            {/* dropdown render */}
            {dropdownOpen && results.length > 0 && (
              <ul
                className="search-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "260px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  marginTop: "4px",
                  padding: 0,
                  listStyle: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  zIndex: 1000,
                }}
              >
                {results.map((r, i) => {
                  const name = r.name || "(No name)";
                  const desc = r.desc || "";

                  return (
                    <li
                      key={i}
                      onClick={() => {
                        onResultClick(r);
                        setDropdownOpen(false); // close dropdown on click
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#333",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f7fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {r.icon && <i className={r.icon}></i>}
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {name.length > 60 ? name.substring(0, 60) + "..." : name}
                        </div>
                        {desc && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "2px",
                            }}
                          >
                            {desc.length > 80 ? desc.substring(0, 80) + "..." : desc}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* start notification */}
          <div className="icon-wrapper">
            <i
              className="admin-icon adminlib-notification"
              title="Notifications"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
                setMessageOpen(false);
              }}
            ></i>
            <span className="count">2</span>
            {notifOpen && (
              <div className="dropdown-menu notification">
                <div className="title">Notification <span className="admin-badge green">8 New</span></div>
                <div className="notification">
                  <ul>
                    <li>
                      <a href="#">
                        <div className="icon admin-badge green">
                          <i className="adminlib-user-network-icon red"></i>
                        </div>
                        <div className="details">
                          <span className="heading">Congratulation Lettie</span>
                          <span className="message">Won the monthly best seller gold badge</span>
                          <span className="time">2 days ago</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <div className="icon admin-badge red">
                          <i className="adminlib-user-network-icon red"></i>
                        </div>
                        <div className="details">
                          <span className="heading">Congratulation Lettie</span>
                          <span className="message">Won the monthly best seller gold badge</span>
                          <span className="time">2 days ago</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <div className="icon admin-badge blue">
                          <i className="adminlib-user-network-icon red"></i>
                        </div>
                        <div className="details">
                          <span className="heading">Congratulation Lettie</span>
                          <span className="message">Won the monthly best seller gold badge</span>
                          <span className="time">2 days ago</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <div className="icon admin-badge yellow">
                          <i className="adminlib-user-network-icon red"></i>
                        </div>
                        <div className="details">
                          <span className="heading">Congratulation Lettie</span>
                          <span className="message">Won the monthly best seller gold badge</span>
                          <span className="time">2 days ago</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <div className="icon admin-badge blue">
                          <i className="adminlib-user-network-icon red"></i>
                        </div>
                        <div className="details">
                          <span className="heading">Congratulation Lettie</span>
                          <span className="message">Won the monthly best seller gold badge</span>
                          <span className="time">2 days ago</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <div className="icon admin-badge yellow">
                          <i className="adminlib-user-network-icon red"></i>
                        </div>
                        <div className="details">
                          <span className="heading">Congratulation Lettie</span>
                          <span className="message">Won the monthly best seller gold badge</span>
                          <span className="time">2 days ago</span>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="footer">
                  <div className="admin-btn btn-purple">
                    <i className="adminlib-eye"></i>
                    View all notification
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* end notification */}

          <div className="icon-wrapper">
            <i
              className="admin-icon adminlib-enquiry"
              title="Admin support"
              onClick={() => {
                setMessageOpen(!messageOpen);
                setProfileOpen(false);
                setNotifOpen(false);
              }}
            ></i>
            <span className="count">10</span>
            {messageOpen && (
              <div className="dropdown-menu notification">
                <div className="title">Message <span className="admin-badge green">8 New</span></div>
                <div className="notification">
                  <ul>
                    {messages.map((msg, index) => (
                      <li key={index}>
                        <a href="#">
                          <div className={`icon admin-badge ${msg.color || "green"}`}>
                            <i className={msg.icon || "adminlib-user-network-icon"}></i>
                          </div>
                          <div className="details">
                            <span className="heading">{msg.heading}</span>
                            <span className="message">{msg.message}</span>
                            <span className="time">{msg.time}</span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="footer">
                  <div className="admin-btn btn-purple">
                    <i className="adminlib-eye"></i>
                    View all message
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="icon-wrapper">
            <i
              className="admin-icon adminlib-user-circle"
              title="Admin support"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
            ></i>
            {profileOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-body">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="adminlib-person"></i>
                        Manage Plan
                      </a>
                    </li>
                    <li>
                      <a onClick={(e) => {
                        setContactSupportPopup(true);
                      }}>
                        <i className="adminlib-user-network-icon"></i>
                        Contact Support
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {contactSupportPopup && (
        <CommonPopup
          open={contactSupportPopup}
          onClose={() => setContactSupportPopup(false)}
          width="500px"
          height="100%"
          header={
            <>
              <div className="title">
                <i className="adminlib-cart"></i>
                Welcome to Urban Trends, your one-stop shop
              </div>
              <p>Publish important news, updates, or alerts that appear directly in store dashboards,</p>
              <i
                className="icon adminlib-close"
                onClick={(e) => {
                  setContactSupportPopup(false);
                }}
              ></i>
            </>
          }
          footer={
            <>

              <div className="admin-btn btn-red" onClick={(e) => {
                setContactSupportPopup(false);
              }}>Close</div>
            </>
          }
        >
          <div className="content">
            
          </div>
        </CommonPopup>
      )
      }
    </>
  );
};

export default AdminHeader;
