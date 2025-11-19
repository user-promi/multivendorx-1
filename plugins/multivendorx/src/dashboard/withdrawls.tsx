import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, CommonPopup, BasicInput, SuccessNotice } from 'zyra';
import { formatCurrency, formatWcShortDate } from '../services/commonFunction';

const History: React.FC = () => {
    const [data, setData] = useState<any>([]);
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [store, setStore] = useState<any>([]);
    const [lastWithdraws, setLastWithdraws] = useState<any>([]);

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
            })
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { id: appLocalizer.store_id }
        })
            .then((response) => {
                setStore(response.data);
            })

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: 1,
                row: 5,
                store_id: appLocalizer.store_id,
                transaction_type: 'Withdrawal',
                transaction_status: 'Completed',
                orderBy: 'created_at',
                order: 'DESC',
            },
        }).then((response) => {
            setLastWithdraws(response.data.transaction || []);
        })
            .catch(() => setData([]));


    }, []);

    const analyticsData = [
        data.wallet_balance != null && {
            icon: "adminlib-tools theme-color1",
            number: formatCurrency(data.wallet_balance),
            text: "Wallet Balance",
        },
        data.reserve_balance != null && {
            icon: "adminlib-book theme-color2",
            number: formatCurrency(data.reserve_balance),
            text: "Reserve Balance",
        },
    ].filter(Boolean); // removes null/undefined entries

    const analyticsData2 = [
        data.locking_balance != null && {
            icon: "adminlib-global-community theme-color3",
            number: formatCurrency(data.locking_balance),
            text: "Locked",
        },
        data.locking_day != null && {
            icon: "adminlib-global-community theme-color4",
            number: `${data.locking_day} Days`,
            text: "Locking Period",
        },
    ].filter(Boolean);


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
            setMessage(res.data.message);
        });
    };
    return (
        <>
            <SuccessNotice message={message} />
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Withdrawls</div>
                    <div className="des">View and keep track of your withdrawls.</div>
                </div>
            </div>

            <div className="row">
                <div className="column w-65">
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
                                {formatCurrency(data.available_balance)}
                            </div>
                            <div className="des">Current available balance ready for withdrawal</div>

                            <div className="notice"></div>
                            <div className="admin-btn btn-purple" onClick={() => setRequestWithdrawal(true)}>
                                Request Withdrawal
                            </div>
                        </div>
                    </div>
                </div>
                <div className="column w-35">
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Balance Breakdown
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="analytics-container small-card">
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
                                    Withdrawal occurs only when your balance reaches {formatCurrency(data.thresold)} or more. View payment calendar
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
                                {store.payment_method === "stripe-connect" && (
                                    <li>
                                        <div className="icon-wrapper">
                                            <i className="adminlib-form-stripe orange"></i>
                                        </div>
                                        <div className="details">
                                            <div className="notification-title">Stripe</div>
                                            <div className="des">Withdrawal request pending</div>
                                            <span>
                                                <a href={`${appLocalizer.site_url}/dashboard/settings/#subtab=payout`}>
                                                    Change
                                                </a>
                                            </span>
                                        </div>
                                    </li>
                                )}

                                {store.payment_method === "bank-transfer" && (
                                    <li>
                                        <div className="icon-wrapper">
                                            <i className="adminlib-form-bank blue"></i>
                                        </div>
                                        <div className="details">
                                            <div className="notification-title">Bank Transfer</div>
                                            <div className="des">Bank transfer setup pending</div>
                                            <span>
                                                <a href={`${appLocalizer.site_url}/dashboard/settings/#subtab=payout`}>
                                                    Change
                                                </a>
                                            </span>
                                        </div>
                                    </li>
                                )}

                                {store.payment_method === "paypal-payout" && (
                                    <li>
                                        <div className="icon-wrapper">
                                            <i className="adminlib-form-paypal yellow"></i>
                                        </div>
                                        <div className="details">
                                            <div className="notification-title">PayPal</div>
                                            <div className="des">PayPal setup pending</div>
                                            <span>
                                                <a href={`${appLocalizer.site_url}/dashboard/settings/#subtab=payout`}>
                                                    Change
                                                </a>
                                            </span>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* <div className="column">
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
                        <div className="admin-btn btn-purple" onClick={`${appLocalizer.site_url}/dashboard/wallet/transactions/`}>
                            <i className="adminlib-preview"></i>
                            View transaction history
                        </div>
                    </div>
                </div> */}

                <div className="column">
                    <div className="card-header">
                        <div className="left">
                            <div className="title">Last Withdrawal</div>
                        </div>
                    </div>

                    {lastWithdraws && lastWithdraws.length > 0 ? (
                        lastWithdraws.map((item: any) => (
                            <div className="last-withdradal-wrapper" key={item.id}>
                                <div className="left">
                                    <div className="price">{formatCurrency(item.amount)}</div>
                                    <div className="des">
                                        {item.payment_method === "stripe-connect" && "Stripe"}
                                        {item.payment_method === "bank-transfer" && "Direct to Local Bank (INR)"}
                                        {item.payment_method === "paypal-payout" && "PayPal"}
                                        {item.payment_method === "bank-transfer" ? `Bank Transfer` : ""}
                                    </div>
                                </div>
                                <div className="right">
                                    <div className="date">{formatWcShortDate(item.date)}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">No withdrawals found.</div>
                    )}

                    <div className="buttons-wrapper">
                        <div
                            className="admin-btn btn-purple"
                            onClick={() => (window.location.href = `${appLocalizer.site_url}/dashboard/wallet/transactions/`)}
                        >
                            <i className="adminlib-preview"></i>
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