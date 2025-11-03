import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink, SuccessNotice } from 'zyra';

interface OverviewProps {
  id: string | null;
  storeData?: any;
}

const Overview: React.FC<OverviewProps> = ({ id, storeData }) => {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    // const [storeData, setStoreData] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `transaction/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setData(response?.data || {});
            })

        // axios({
        //     method: "GET",
        //     url: getApiLink(appLocalizer, `store/${id}`),
        //     headers: { "X-WP-Nonce": appLocalizer.nonce },
        // })
        //     .then((response) => {
        //         setStoreData(response.data || {});
        //     })
    }, []);
    
    const overviewData = [
        { icon: "adminlib-tools green", number:  `${appLocalizer.currency_symbol}${Number(storeData.commission?.total_order_amount ?? 0).toFixed(2)}`, text: "Lifetime Earnings" },
        { icon: "adminlib-book red", number: `${appLocalizer.currency_symbol}${Number(data.wallet_balance ?? 0).toFixed(2)}`, text: "Available Balance" },
        { icon: "adminlib-global-community yellow", number: `${appLocalizer.currency_symbol}${Number(data.locking_balance ?? 0).toFixed(2)}`, text: "Pending Balance" },
        { icon: "adminlib-global-community blue", number: `${appLocalizer.currency_symbol}${Number(storeData.request_withdrawal_amount ?? 0).toFixed(2)}`, text: "Requested Payout" },
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
                                    <div
                                        className="sku"
                                        onClick={() => {navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=store-application`);
                                        }}
                                    >
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
                                        {storeData.create_time}
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
                                <i className="adminlib-external"
                                    onClick={() => {navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`)}}
                                ></i>
                                
                            </div>
                        </div>

                        <div className="store-owner-details owner">
                            <div className="profile">
                                <div className="avater">
                                    <span>JD</span>
                                </div>
                                <div className="details">
                                    <div className="name">{storeData.primary_owner_info?.name}</div>
                                    <div className="des">Owner</div>
                                </div>
                            </div>
                            <ul className="contact-details">
                                <li>
                                    <i className="adminlib-mail"></i>{storeData.primary_owner_info?.email}
                                </li>
                                {/* <li>
                                    <i className="adminlib-form-phone"></i> +1 (555) 987-6543
                                </li> */}
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