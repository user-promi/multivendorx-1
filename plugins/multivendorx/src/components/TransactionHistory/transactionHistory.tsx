/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import "../Announcements/announcements.scss";
import TransactionHistoryTable from './walletTransaction';
import TransactionDataTable from './transactionDataTable';
import { AdminBreadcrumbs, CalendarInput, getApiLink, SelectInput, CommonPopup, BasicInput, TextArea, ToggleSetting } from 'zyra';
import axios from 'axios';
import { formatCurrency } from '../../services/commonFunction';

export const TransactionHistory: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("wallet-transaction");
    const [allStores, setAllStores] = useState<any[]>([]);
    const [filteredStores, setFilteredStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [requestWithdrawal, setRequestWithdrawal] = useState(false);
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string>("");
    const [note, setNote] = useState<any | "">("");
    const [storeData, setStoreData] = useState<any>(null);
    const [optionList, setOptionList] = React.useState([]);
    const [paymentMethod, setPaymentMethod] = useState<any | "">("");
    const [validationErrors, setValidationErrors] = useState<{ amount?: string; paymentMethod?: string }>({});
    const [recentDebits, setRecentDebits] = useState<any[]>([]);

    const demoOptions = [
        {
            key: 'paypal',
            label: 'PayPal',
            value: 'paypal',
            icon: 'adminlib-bank',
        },
        {
            key: 'stripe',
            label: 'Stripe',
            value: 'stripe',
            icon: 'adminlib-bank',
        },
        {
            key: 'bank_transfer',
            label: 'Bank Transfer',
            value: 'bank_transfer',
            icon: 'adminlib-bank',
        },
    ];

    // 🔹 Fetch stores on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { options: true },
        })
            .then((response) => {
                if (response?.data?.length) {
                    const mappedStores = response.data.map((store: any) => ({
                        value: store.id,
                        label: store.store_name,
                    }));
                    setAllStores(mappedStores);
                    setFilteredStores(mappedStores.slice(0, 5));
                    setSelectedStore(mappedStores[0]);
                }
            })
            .catch((error) => {
                console.error("Error fetching stores:", error);
            });
    }, []);

    // 🔹 Fetch wallet/transaction overview whenever store changes
    useEffect(() => {
        if (!selectedStore) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `transaction/${selectedStore.value}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setData(response?.data || {});
            })

        axios({
            method: "GET",
            url: getApiLink(appLocalizer, `store/${selectedStore.value}`),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
        })
            .then((response) => {
                setStoreData(response.data || {});
            })

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: 1,
                row: 3,
                store_id: selectedStore.value,
                filter_status: 'Dr',
                transaction_type: 'Withdrawal',
                orderBy: 'created_at',
                order: 'DESC',
            },
        })
            .then((response) => {
                setRecentDebits(response.data.transaction || []);
                console.log("last 3", response.data.transaction)
            })
            .catch((error) => {
                console.error('Error fetching recent debit transactions:', error);
                setRecentDebits([]);
            });
    }, [selectedStore]);

    // useEffect(() => {
    //     if (!storeData) return;

    //     if (storeData.payment_method) {
    //         const defaultOption = {
    //             value: storeData.payment_method,
    //             label: `Store Default - ${storeData.payment_method}`,
    //         };
    //         setOptionList([defaultOption]);
    //         setPaymentMethod(storeData.payment_method);
    //         return;
    //     }

    //     const enabledMethods = Object.entries(appLocalizer.payout_payment_options)
    //         .filter(([key, value]: [string, any]) => value.enable)
    //         .map(([key, value]) => ({
    //             value: key,
    //             label: key.charAt(0).toUpperCase() + key.slice(1),
    //         }));

    //     setOptionList(enabledMethods);
    //     setPaymentMethod(enabledMethods[0]?.value || "");
    // }, [storeData]);

    useEffect(() => {
        if (!storeData) return;

        // 🔹 Define icon map for supported payment methods
        const paymentIcons: Record<string, string> = {
            paypal: 'adminlib-paypal',
            stripe: 'adminlib-stripe',
            razorpay: 'adminlib-razorpay',
            bank_transfer: 'adminlib-bank',
            wallet: 'adminlib-wallet',
            cod: 'adminlib-cash',
            direct: 'adminlib-direct-transaction',
        };

        // 🔹 Case 1: Store has a default method set
        if (storeData.payment_method) {
            const defaultIcon = paymentIcons[storeData.payment_method] || 'adminlib-wallet';
            const defaultOption = {
                key: storeData.payment_method,
                value: storeData.payment_method,
                label: `Store Default - ${storeData.payment_method}`,
                icon: defaultIcon,
            };
            setOptionList([defaultOption]);
            setPaymentMethod(storeData.payment_method);
            return;
        }

        // 🔹 Case 2: Build enabled methods from global settings
        const enabledMethods = Object.entries(appLocalizer.payout_payment_options)
            .filter(([key, value]: [string, any]) => value.enable)
            .map(([key, value]) => ({
                key,
                value: key,
                label: key.charAt(0).toUpperCase() + key.slice(1),
                icon: paymentIcons[key] || 'adminlib-wallet', // fallback icon
            }));

        setOptionList(enabledMethods);
        setPaymentMethod(enabledMethods[0]?.value || "");
    }, [storeData]);


    const handleAmountChange = (value: number) => {
        if (value > data.available_balance) {
            setError(`Amount cannot be greater than available balance (${data.available_balance})`);
        } else {
            setError(""); // clear error if valid
        }
        setAmount(value);
    };

    const handleSearch = (inputValue: string) => {
        if (!inputValue) {
            setFilteredStores(allStores.slice(0, 5));
        } else {
            const filtered = allStores.filter(store =>
                store.label?.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredStores(filtered);
        }
    };

    const handleWithdrawal = () => {
        // Clear all old errors first
        setValidationErrors({});

        const newErrors: { amount?: string; paymentMethod?: string } = {};

        // Amount validations
        if (!amount || amount <= 0) {
            newErrors.amount = "Please enter a valid amount.";
        } else if (amount > (data.available_balance ?? 0)) {
            newErrors.amount = `Amount cannot be greater than available balance (${formatCurrency(data.available_balance)})`;
        }

        // Payment method validation
        if (!paymentMethod) {
            newErrors.paymentMethod = "Please select a payment processor.";
        }

        // If any validation errors exist, show them and stop
        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        // Clear old generic error
        setError("");

        // ✅ Submit request
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `transaction/${selectedStore?.value}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                disbursement: true,
                amount,
                store_id: selectedStore?.value,
                method: paymentMethod,
                note,
            },
        })
            .then((res) => {
                if (res.data.success) {
                    setRequestWithdrawal(false);
                    resetWithdrawalForm();
                    setTimeout(() => {
                        window.location.reload();
                    }, 200);
                } else if (res.data?.message) {
                    setError(`Server: ${res.data.message}`);
                }
            })
            .catch((err) => {
                setError("Server: Failed to submit withdrawal. Please try again.");
                console.error(err);
            });
    };



    const tabs = [
        {
            id: "wallet-transaction",
            label: "Wallet transaction",
            icon: "adminlib-wallet",
            content: <TransactionHistoryTable storeId={selectedStore?.value} dateRange={dateRange} />
        },
        {
            id: "direct-ttransaction",
            label: "Direct transaction",
            icon: "adminlib-direct-transaction",
            content: <TransactionDataTable storeId={selectedStore?.value} dateRange={dateRange} />
        },
    ];

    const resetWithdrawalForm = () => {
        setAmount(0);
        setNote("");
        setError("");
        setValidationErrors({});
    };

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-book"
                tabTitle={
                    selectedStore
                        ? `Storewise Transaction History - ${selectedStore.label}`
                        : "Storewise Transaction History"
                }
                description={
                    selectedStore
                        ? `View and manage transactions for ${selectedStore.label} store`
                        : "View and manage storewise transactions"
                }
                customContent={
                    <>
                        <label><i className="adminlib-switch-store"></i>Switch store</label>
                        <SelectInput
                            name="store"
                            value={selectedStore?.value || ""}
                            options={filteredStores}
                            type="select"
                            onChange={(newValue: any) => setSelectedStore(newValue)}
                            onInputChange={(inputValue: string) => handleSearch(inputValue)}
                            size="12rem"
                        />
                    </>
                }
            />

            <div className="general-wrapper">
                {/* Tab Titles */}
                <div className="tab-titles hover">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`title ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <i className={`icon ${tab.icon}`}></i><p>{tab.label}</p>
                        </div>
                    ))}
                </div>
                {activeTab === "wallet-transaction" && (
                    <div className="row">
                        <div className="col">
                            <div className="data-card-wrapper">
                                <div className="data-card">
                                    <div className="title">Wallet balance</div>
                                    <div className="number">{formatCurrency(data.wallet_balance)} <i className="adminlib-wallet"></i></div>
                                </div>
                                {/* <div className="data-card">
                                    <div className="title">Reserve balance</div>
                                    <div className="number">{formatCurrency(data.reserve_balance)} <i className="adminlib-bank"></i></div>
                                </div> */}
                                <div className="data-card">
                                    <div className="title">Upcoming balance</div>
                                    <div className="number">{formatCurrency(data.locking_balance)} <i className="adminlib-cash "></i></div>
                                </div>
                            </div>

                            {recentDebits.length > 0 ? (
                                <div className="column debit-transactions">
                                    <div className="card-header">
                                        <div className="left">
                                            <div className="title">Recent Debit Transactions</div>
                                        </div>
                                    </div>
                                    <div className="debit-list">
                                        {recentDebits.map((txn) => {
                                            // Format payment method nicely (e.g., "stripe-connect" -> "Stripe Connect")
                                            const formattedPaymentMethod = txn.payment_method
                                                ? txn.payment_method
                                                    .replace(/[-_]/g, ' ')                // replace - and _ with spaces
                                                    .replace(/\b\w/g, char => char.toUpperCase()) // capitalize each word
                                                : 'N/A';

                                            return (
                                                <div key={txn.id} className="data-card">
                                                    <div className="title">
                                                        <div className="name">{formattedPaymentMethod}</div>
                                                        <div className="date">
                                                            {new Date(txn.date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "2-digit",
                                                                year: "numeric",
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`number ${parseFloat(txn.debit) < 0 ? 'negative' : 'positive'
                                                            }`}
                                                    >
                                                        {formatCurrency(txn.debit)}{" "}
                                                        {/* <span className="admin-badge green">({txn.status})</span> */}
                                                    </div>

                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="column">
                                    <div className="card-header">
                                        <div className="left">
                                            <div className="title">Recent payouts</div>
                                        </div>
                                    </div>
                                    <div className="des">
                                        No recent payouts transactions found.
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="column transaction">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Withdrawable balance
                                    </div>
                                </div>
                            </div>
                            <div className="payout-wrapper">
                                <div className="price">
                                    {formatCurrency(data.available_balance)}
                                </div>

                                {storeData?.request_withdrawal_amount ? (
                                    <>
                                        <div className="des">
                                            Last withdrawal request:
                                            {formatCurrency(storeData.request_withdrawal_amount)}, is <strong>Pending</strong>.
                                        </div>
                                        <div className="payout-notice">
                                            <i className="adminlib-error"></i>
                                            Please clear the pending request before disbursing new payments.
                                        </div>
                                        <div className="admin-btn btn-purple-bg disabled" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                            Disburse payment
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="des">
                                            Current available balance ready to transfer
                                            {data?.reserve_balance ? (
                                                <>,&nbsp;'Excluding Reserve Balance' {formatCurrency(data.reserve_balance)}</>
                                            ) : null}
                                        </div>
                                        <div className="admin-btn btn-purple-bg" onClick={() => setRequestWithdrawal(true)}>
                                            Disburse payment
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {requestWithdrawal && (
                    <CommonPopup
                        open={requestWithdrawal}
                        width="800px"
                        height="70%"
                        header={
                            <>
                                <div className="title">
                                    <i className="adminlib-wallet"></i>
                                    Disburse payment
                                </div>
                                <i
                                    className="icon adminlib-close"
                                    onClick={() => {
                                        setRequestWithdrawal(false);
                                        resetWithdrawalForm(); //reset form on close
                                    }}
                                ></i>
                            </>
                        }
                        footer={
                            <>
                                <div
                                    className="admin-btn btn-purple"
                                    onClick={() => handleWithdrawal()}
                                >
                                    Disburse
                                </div>

                            </>
                        }
                    >

                        <div className="content">
                            {/* start left section */}
                            <div className="form-group-wrapper">
                                <div className="available-balance">Available on transaction wallet balance is <span>$1253.25</span></div>

                                <div className="form-group">
                                    <label htmlFor="amount">Amount</label>
                                    <BasicInput
                                        type="number"
                                        name="amount"
                                        value={amount}
                                        onChange={(e) => handleAmountChange(Number(e.target.value))}
                                    />

                                    <div className="free-wrapper">
                                        <span>$852.25 Total</span>
                                        <span>$852.25 free</span>
                                    </div>

                                    {validationErrors.amount && (
                                        <div className="invalid-massage">{validationErrors.amount}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="payment_method">Payment Processor</label>
                                    <ToggleSetting
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        description={
                                            optionList.length > 0
                                                ? "Choose your preferred payment processor."
                                                : "No payment methods are available for this store."
                                        }
                                        options={demoOptions}
                                        value={paymentMethod || ""}
                                        onChange={(value) => setPaymentMethod(value)}
                                    />
                                    {validationErrors.paymentMethod && (
                                        <div className="invalid-massage">{validationErrors.paymentMethod}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="note">Note</label>
                                    <TextArea
                                        name="note"
                                        wrapperClass="setting-from-textarea"
                                        inputClass="textarea-input"
                                        descClass="settings-metabox-description"
                                        value={note}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CommonPopup>
                )}

                <div className="tab-content">
                    {tabs.map(
                        (tab) =>
                            activeTab === tab.id && (
                                <div key={tab.id} className="tab-panel">
                                    {tab.content}
                                </div>
                            )
                    )}
                </div>
                {/* <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left"> */}
                {/* <div className="tab-titles">
                                    {tabs.map((tab) => (
                                        <div
                                            key={tab.id}
                                            className={`title ${activeTab === tab.id ? "active" : ""}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            <p><i className="adminlib-cart"></i>{tab.label}</p>
                                        </div>
                                    ))}
                                </div> */}
                {/* </div>
                            <div className="right"> */}
                {/* <CalendarInput
                                    wrapperClass=""
                                    inputClass=""
                                    showLabel={true}
                                    onChange={(range: any) => {
                                        setDateRange({ startDate: range.startDate, endDate: range.endDate });
                                    }}
                                /> */}
                {/* </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </>
    );
};

export default TransactionHistory;