import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink, SuccessNotice } from 'zyra';

const Overview = ({ id }: { id: string | null }) => {
    const overviewData = [
        { icon: "adminlib-tools green", number: "$47,540.00", text: "Lifetime Earnings" },
        { icon: "adminlib-book red", number: "344", text: "Available Balance" },
        { icon: "adminlib-global-community yellow", number: "$42,786.00", text: "Pending Balance" },
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

            <div className="container-wrapper ">
                <div className="card-wrapper w-65">
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
                    <div className="row">
                        <div className="column">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Recent Payouts
                                    </div>
                                </div>
                                <div className="right">
                                    <i className="adminlib-external"></i>
                                </div>
                            </div>

                            <div className="store-owner-details">
                                <div className="profile">
                                    <div className="avater">
                                        <span className="adminlib-calendar"></span>
                                    </div>
                                    <div className="details">
                                        <div className="name">$5,420</div>
                                        <div className="des">Oct 15, 2024</div>
                                    </div>
                                </div>
                                <div className="right-details">
                                    {/* <div className="price">$356 .35</div>
                                <div className="div">Lorem, ipsum dolor.</div> */}
                                    <div className="admin-badge green">Completed</div>
                                </div>
                            </div>
                            <div className="store-owner-details">
                                <div className="profile">
                                    <div className="avater">
                                        <span className="adminlib-calendar"></span>
                                    </div>
                                    <div className="details">
                                        <div className="name">$5,420</div>
                                        <div className="des">Oct 15, 2024</div>
                                    </div>
                                </div>
                                <div className="right-details">
                                    {/* <div className="price">$356 .35</div>
                                <div className="div">Lorem, ipsum dolor.</div> */}
                                    <div className="admin-badge red">Pending</div>
                                </div>
                            </div>
                            <div className="store-owner-details">
                                <div className="profile">
                                    <div className="avater">
                                        <span className="adminlib-calendar"></span>
                                    </div>
                                    <div className="details">
                                        <div className="name">$5,420</div>
                                        <div className="des">Oct 15, 2024</div>
                                    </div>
                                </div>
                                <div className="right-details">
                                    {/* <div className="price">$356 .35</div>
                                <div className="div">Lorem, ipsum dolor.</div> */}
                                    <div className="admin-badge green">Completed</div>
                                </div>
                            </div>

                        </div>

                        <div className="column">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Store Hours
                                    </div>
                                    <div className="des">
                                        Manage your weekly schedule and special hours
                                    </div>
                                </div>
                                <div className="right">
                                    <i className="adminlib-external"></i>
                                </div>
                            </div>

                            {/* <div className="store-owner-details">
                            <div className="profile">
                                <div className="avater">
                                    <span className="adminlib-calendar"></span>
                                </div>
                                <div className="details">
                                    <div className="name">$5,420</div>
                                    <div className="des">Oct 15, 2024</div>
                                </div>
                            </div>
                            <div className="right-details">
                                <div className="price">$356 .35</div>
                                <div className="div">Lorem, ipsum dolor.</div>
                            </div>
                        </div> */}

                            <div className="store-time-wrapper">

                                <div className="row">
                                    <div className="time-wrapper">
                                        <div className="des">Current Status</div>
                                        <div className="time"><span className="admin-badge green">Open</span></div>
                                    </div>
                                    <div className="time-wrapper">
                                        <div className="des">Next Opening</div>
                                        <div className="time">Mon 9:00 AM</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="card-wrapper w-35">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Store information
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-external"></i>
                            </div>
                        </div>

                        <div className="overview-wrapper">
                            <div className="items">
                                <div className="title">
                                    View Application
                                </div>
                                <div className="details">
                                    <div className="sku">
                                        <i className="adminlib-external"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="items">
                                <div className="title">
                                    Created on
                                </div>
                                <div className="details">
                                    <div className="sku">
                                        10 jan 2005
                                    </div>
                                </div>
                            </div>
                            <div className="items">
                                <div className="title">
                                    Vacation Mode
                                </div>
                                <div className="details">
                                    <span className="admin-badge red">Inactive</span>
                                </div>
                            </div>
                        </div>
                        <div className="description-wrapper">
                            <div className="title">
                                <i className="adminlib-error"></i>
                                Gold Plan
                                <span className="admin-badge green">Active</span>
                            </div>
                            <div className="des">Renews on Dec 15, 2024</div>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Primary Owner
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-external"></i>
                            </div>
                        </div>

                        <div className="store-owner-details owner">
                            <div className="profile">
                                <div className="avater">
                                    <span>JD</span>
                                </div>
                                <div className="details">
                                    <div className="name">John Doe</div>
                                    <div className="des">Owner</div>
                                </div>
                            </div>
                            <ul className="contact-details">
                                <li>
                                    <i className="adminlib-mail"></i>john@example.com
                                </li>
                                <li>
                                    <i className="adminlib-form-phone"></i> +1 (555) 987-6543
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Repeating
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-external"></i>
                            </div>
                        </div>

                        <div className="store-owner-details">
                            <div className="profile">
                                <div className="avater">
                                    <span className="adminlib-form-recaptcha"></span>
                                </div>
                                <div className="details">
                                    <div className="name">Repeats every two weeks</div>
                                    <div className="des">Monday @ 9.00 - 11.00 Am</div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </>
    );

}

export default Overview;