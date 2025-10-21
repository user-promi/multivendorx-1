import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CommonPopup, BasicInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
};

const History: React.FC = () => {
    const [data, setData] = useState<any>([]);
    const [existing, setExisting] = useState<any[]>([]);
    const [amount, setAmount] = useState<number | "">("");

    const [requestWithdrawal, setRequestWithdrawal] = useState(false);

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `transaction/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setExisting(response?.data || {});
            })
    }, []);

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `reports/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setData(response.data || [])
            }).catch(() => {
                setData([]);
            })
    }, []);

    const analyticsData = [
        {
            icon: "adminlib-tools red",
            number: `${appLocalizer.currency_symbol}${Number(data.threshold_amount ?? 0).toFixed(2)}`,
            text: "Minimum Threshold"
        },
        {
            icon: "adminlib-book green",
            number: `${data.lock_period} Day`,
            text: "Lock Period"
        },
    ];
    const analyticsData2 = [
        {
            icon: "adminlib-global-community yellow",
            number: `${appLocalizer.currency_symbol}${(
                Number(data.locking_balance ?? 0) + Number(data.balance ?? 0)
            ).toFixed(2)}`,
            text: "Wallet Reserve"
        },
        {
            icon: "adminlib-global-community yellow",
            number: `${appLocalizer.currency_symbol}${Number(data.locking_balance ?? 0).toFixed(2)}`,
            text: "Pending"
        },
    ];

    const handleWithdrawal = () => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `transaction/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                amount: amount,
                store_id: appLocalizer.store_id
            },
        }).then((res) => {
            if (res.data.success) {
                setRequestWithdrawal(false);
            }
        });
    };

    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Withdrawls</div>
                    <div className="des">View and keep track of your withdrawls.</div>
                </div>
            </div>

            <div className="row">
                <div className="column theme-bg width-65">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Withdrawable Balance
                                </div>
                            </div>
                        </div>
                        <div className="payout-wrapper">
                            <div className="price">
                                {appLocalizer.currency_symbol}652 {Number(data.balance ?? 0).toFixed(2)}
                            </div>
                            <div className="des">Current available balance ready for withdrawal</div>

                            <div className="notice"></div>
                            <div className="settings-metabox-note"><i className="adminlib-info"></i><p>Confirm that you have access to johndoe@gmail.com in sender email settings.</p></div>
                            <div className="admin-btn btn-purple" onClick={() => setRequestWithdrawal(true)}>
                                Request Withdrawal
                            </div>
                        </div>
                    </div>
                </div>
                <div className="column width-35">
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Available for Payout
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="analytics-container">

                            {analyticsData.map((item, idx) => (
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
                        <div className="analytics-container">
                         {analyticsData2.map((item, idx) => (
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
            </div>

            <div className="row">
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Withdrawal Schedule
                                </div>

                            </div>
                        </div>
                        <div className="withdrawal-wrapper">
                            <div className="des">
                                Frequency
                            </div>
                            <div className="title">
                                Quarterly
                            </div>
                            <div className="withdrawl-notice">
                                <i className="adminlib-info"></i> Withdrawal occurs only when your balance reaches $1,000.00 or more. View payment calendar
                            </div>
                        </div>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Withdrawal Methods
                                </div>
                            </div>
                        </div>

                        <div className="notification-wrapper">
                            <ul>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email blue"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">PayPal</div>
                                        <div className="des">Withdrawal request pending</div>
                                        <span><a href="">Change</a></span>
                                    </div>

                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* <div className="no-data-found">
                        <i className="adminlib-info icon red"></i>
                        <div className="title">No Transaction Data Yet</div>
                        <div className="des">The Handmade store hasn't processed any transactions yet. Once sales start coming in, you'll see detailed analytics here.</div>
                        <div className="buttons-wrapper center">

                            <div className="admin-btn btn-purple">
                                <i className="adminlib-eye"></i>
                                View Store Settings
                            </div>

                            <div className="admin-btn">
                                <i className="adminlib-eye"></i>
                                Learn More
                            </div>
                        </div>
                    </div> */}
                </div>
                <div className="column">
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Last Withdrawal
                            </div>
                        </div>
                    </div>

                    <div className="last-withdradal-wrapper">
                        <div className="left">
                            <div className="price">$625.65</div>
                            <div className="des">Direct to Local Bank (INR)
                                Account ending in 4352</div>
                        </div>
                        <div className="right">
                            <div className="date">
                                April 17, 2021
                            </div>
                        </div>
                    </div>

                    <div className="last-withdradal-wrapper">
                        <div className="left">
                            <div className="price">$965.65</div>
                            <div className="des">Direct to Local Bank (INR)
                                Account ending in 4352</div>
                        </div>
                        <div className="right">
                            <div className="date">
                                April 17, 2021
                            </div>
                        </div>
                    </div>

                    <div className="buttons-wrapper">
                        <div className="admin-btn btn-purple">
                            <i className="adminlib-eye"></i>
                            View transaction history
                        </div>
                    </div>
                </div>
            </div>

            {requestWithdrawal && (
                <CommonPopup
                    open={requestWithdrawal}
                    width="300px"
                    height="50%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                Request Withdrawal
                            </div>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setRequestWithdrawal(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <div
                                className="admin-btn btn-purple"
                                onClick={() => handleWithdrawal()}
                            >
                                Publish
                                <i className="adminlib-check"></i>
                            </div>

                        </>
                    }
                >

                    <div className="content">
                        {/* start left section */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="amount">Amount</label>
                                <BasicInput
                                    type="number"
                                    name="amount"
                                    value={amount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setAmount(Number(e.target.value))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default History;