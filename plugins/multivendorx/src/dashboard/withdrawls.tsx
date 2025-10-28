import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, CommonPopup, BasicInput } from 'zyra';

const History: React.FC = () => {
    const [data, setData] = useState<any>([]);
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string>("");
    const [requestWithdrawal, setRequestWithdrawal] = useState(false);

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `transaction/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { id: appLocalizer.store_id }
        })
            .then((response) => {
                setData(response.data || []);
                console.log(response.data)
            })
    }, []);

    const analyticsData = [
        {
            icon: "adminlib-tools red",
            number: `${appLocalizer.currency_symbol}${Number(data.wallet_balance ?? 0).toFixed(2)}`,
            text: "Wallet Balance"
        },
        {
            icon: "adminlib-book green",
            number: `${appLocalizer.currency_symbol}${Number(data.reserve_balance ?? 0).toFixed(2)}`,
            text: "Reserve Balance"
        },
    ];
    const analyticsData2 = [
        {
            icon: "adminlib-global-community yellow",
            number: `${appLocalizer.currency_symbol}${Number(data.locking_balance ?? 0).toFixed(2)}`,
            text: "Locked"
        },
        {
            icon: "adminlib-global-community yellow",
            number: `${data.locking_day} Days`,
            text: "Locking Period"
        },

    ];

    const handleAmountChange = (value: number) => {
        if (value > data.available_balance) {
            setError(`Amount cannot be greater than available balance (${data.available_balance})`);
        } else {
            setError("");
        }
        setAmount(value);
    };

    const handleWithdrawal = () => {
        if (amount > data.available_balance) {
            setError(`Amount cannot be greater than available balance (${data.available_balance})`);
            setRequestWithdrawal(true);
            return;
        }

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
                                {appLocalizer.currency_symbol}{Number(data.available_balance ?? 0).toFixed(2)}
                            </div>
                            <div className="des">Current available balance ready for withdrawal</div>

                            <div className="notice"></div>
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
                                Balance Breakdown
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
                            {/* Show Frequency + Title only if NOT manual */}
                            {data?.payment_schedules !== "mannual" && (
                                <>
                                    <div className="des">
                                        Frequency
                                    </div>
                                    <div className="title">
                                        {data?.payment_schedules
                                            ? data.payment_schedules.charAt(0).toUpperCase() + data.payment_schedules.slice(1)
                                            : "N/A"}
                                    </div>
                                </>
                            )}

                            {/* Show threshold line only if > 0 */}
                            {Number(data?.thresold ?? 0) > 0 && (
                                <div className="withdrawl-notice">
                                    <i className="adminlib-info"></i>{" "}
                                    Withdrawal occurs only when your balance reaches {appLocalizer.currency_symbol}
                                    {Number(data.thresold).toFixed(2)} or more. View payment calendar
                                </div>
                            )}
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
                                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                                />
                                {error && <p className="error-message">{error}</p>}
                            </div>
                        </div>
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default History;