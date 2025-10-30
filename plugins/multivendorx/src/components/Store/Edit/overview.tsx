import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink, SuccessNotice } from 'zyra';

const Overview = ({ id }: { id: string | null }) => {
    const overviewData = [
        { icon: "adminlib-tools green", number: "$47,540.00", text: "Lifetime Earnings" },
        { icon: "adminlib-book red", number: "344", text: "Available Balance" },
        { icon: "adminlib-global-community yellow", number: "$42,786.00", text: "Pending Balance" },
        { icon: "adminlib-global-community blue", number: "$42,786.00", text: "Requested Payout" },
        { icon: "adminlib-global-community blue", number: "$42,786.00", text: "Requested Payout" },
    ];
    const activities = [
        { icon: 'adminlib-cart', text: 'New product "Wireless Gaming Headset" added by TechWorld' },
        { icon: 'adminlib-star', text: '5-star review received for "Smartphone Case" by MobileGear' },
        { icon: 'adminlib-global-community', text: 'New vendor "Fashion Forward" completed registration' },
        { icon: 'adminlib-cart', text: 'Commission payment of $2,847 processed for ElectroHub' },
    ];

    return (
        <>

            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="analytics-container">
                            {overviewData.map((item, idx) => (
                                <div key={idx} className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className={item.icon}></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">{item.number}</div>
                                        <div className="text">{item.text}</div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>

                <div className="card-wrapper width-35">
                    <div className="card-content">
                        <h3>Recent Activity (Static)</h3>
                        <div className="activity-wrapper">
                            {activities.map((a, i) => (
                                <div key={i} className="activity">
                                    <span className="icon">
                                        <i className={a.icon}></i>
                                    </span>
                                    <div className="details">
                                        {a.text}
                                        <span>2 minutes ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>




        </>
    );

}

export default Overview;