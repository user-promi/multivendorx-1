import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, CommonPopup, BasicInput, SuccessNotice } from 'zyra';
import { formatCurrency, formatWcShortDate } from '../services/commonFunction';

const Withdrawls: React.FC = () => {
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
                    <div className="title">{__("Withdrawals", "multivendorx")}</div>
                    <div className="des">{__("View and keep track of your withdrawals.", "multivendorx")}</div>
                </div>
            </div>

            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-header">
                        <div className="left">
                            <div className="title">{__("Last Withdrawal", "multivendorx")}</div>
                        </div>
                    </div>

                    <div className="card-body">
                        {lastWithdraws && lastWithdraws.length > 0 ? (
                            lastWithdraws.map((item: any) => (
                                <div className="last-withdradal-wrapper" key={item.id}>
                                    <div className="left">
                                        <div className="price">{formatCurrency(item.amount)}</div>
                                        <div className="des">
                                            {item.payment_method === "stripe-connect" && __("Stripe", "multivendorx")}
                                            {item.payment_method === "bank-transfer" && __("Direct to Local Bank (INR)", "multivendorx")}
                                            {item.payment_method === "paypal-payout" && __("PayPal", "multivendorx")}
                                            {item.payment_method === "bank-transfer" ? __("Bank Transfer", "multivendorx") : ""}
                                        </div>
                                    </div>
                                    <div className="right">
                                        <div className="date">{formatWcShortDate(item.date)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">{__("No withdrawals found.", "multivendorx")}</div>
                        )}

                        <div className="buttons-wrapper">
                            <div
                                className="admin-btn btn-purple-bg"
                                onClick={() => (window.location.href = `${appLocalizer.site_url}/dashboard/wallet/transactions/`)}
                            >
                                <i className="adminlib-preview"></i>
                                {__("View transaction history", "multivendorx")}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-content">
                    <div className="card-body">
                        <div className="payout-wrapper">
                            <div className="payout-header">
                                <div className="price-wrapper">
                                    <div className="price-title">{__("Available balance", "multivendorx")}</div>
                                    <div className="price">
                                        {formatCurrency(data.available_balance)}{" "}
                                        <div className="admin-badge green">{__("Ready to withdraw", "multivendorx")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="small-text"><b>$25 (p)</b> {__("minimum required to withdraw", "multivendorx")}</div>

                            <div className="payout-card-wrapper">
                                <div className="payout-card">
                                    <div className="card-title">{__("Upcoming Balance", "multivendorx")}</div>
                                    <div className="card-price">{formatCurrency(data.reserve_balance)}</div>
                                    <div className="card-des">{__("Pending settlement. Released soon", "multivendorx")}</div>
                                </div>

                                <div className="payout-card">
                                    <div className="card-title">{__("Free Withdrawals", "multivendorx")}</div>
                                    <div className="card-price">
                                        {data.locking_day} {__("Days", "multivendorx")} <span>{__("Left", "multivendorx")}</span>
                                    </div>
                                    <div className="card-des">
                                        {__("Then", "multivendorx")} $5% (p) + $6(p) {__("fee", "multivendorx")}
                                    </div>
                                </div>
                            </div>

                            <div className="small-text">{__("Some funds locked during settlement", "multivendorx")}</div>
                            <div className="small-text">{__("Auto payouts run", "multivendorx")} 2-12-25 (p)</div>

                            <div className="buttons-wrapper">
                                <div className="admin-btn btn-purple-bg" onClick={() => setRequestWithdrawal(true)}>
                                    {__("Request Withdrawal", "multivendorx")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {requestWithdrawal && (
                <CommonPopup
                    open={requestWithdrawal}
                    width="31.25rem"
                    height="60%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-wallet"></i>
                                {__("Request Withdrawal", "multivendorx")}
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
                                className="admin-btn btn-purple-bg"
                                onClick={() => handleWithdrawal()}
                            >
                                {__("Publish", "multivendorx")}
                            </div>
                        </>
                    }
                >
                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="amount">{__("Amount", "multivendorx")}</label>
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

export default Withdrawls;