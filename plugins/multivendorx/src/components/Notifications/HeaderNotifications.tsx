import React, { useEffect, useState } from 'react';
import { CommonPopup, getApiLink } from 'zyra';
import axios from 'axios';

const HeaderNotifications = () => {

    const [notifications, setNotifications] = useState<[] | null>(null);
    
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'notifications'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                header: true
            }
        })
        .then((response) => {
            setNotifications(response.data || []);
        });
    }, []);

    const dismissNotification = (id: number) => {
        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, `notifications/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { id, is_dismissed: true },
        }).then(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        });
    };
// console.log(notifications)
    return(
        <>
        <div className="dropdown-menu notification">
            <h1>hello</h1>
                <div className="title">
                    Notifications 
                    {notifications && notifications.length > 0 && (
                        <span className="admin-badge green">
                            {notifications.length} New
                        </span>
                    )}
                </div>
                <div className="notification">
                    <ul>
                         {notifications && notifications.length > 0 ? (
                            notifications.map((item, idx) => (
                                <li key={idx}>
                                    {/* <a href={item.link || "#"}> */}
                                    <div 
                                    className={`icon admin-badge green`}
                                    >
                                        <i className={item.icon || "adminlib-user-network-icon"}></i>
                                    </div>
                                    <div className="details">
                                        <span className="heading">{item.title}</span>
                                        <span className="message">{item.message}</span>
                                        <span className="time">{item.time}</span>
                                    </div>

                                    <button
                                        className="dismiss-btn"
                                        onClick={() => dismissNotification(item.id)}
                                        title="Dismiss"
                                    >
                                        <i className="adminlib-close"></i>
                                    </button>
                                    {/* </a> */}
                                </li>
                        ))) : (
                            <li className="empty-state">
                                <div className="no-notifications">
                                    <i className="adminlib-info"></i>
                                    <span>No notifications</span>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            {/* {notificationsLink && (
            <div className="footer">
                <a href={notificationsLink} className="admin-btn btn-purple">
                <i className="adminlib-eye"></i> View all notifications
                </a>
            </div>
            )} */}
        </>
    );

}
export default HeaderNotifications;