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
    const [activeTab, setActiveTab] = useState("products");
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
    }, [selectedStore]);

    useEffect(() => {
        if (!storeData) return;

        // Get all enabled payment methods from global options
        const enabledMethods = Object.entries(appLocalizer.payout_payment_options)
            .filter(([key, value]: [string, any]) => value.enable) // only enable=true
            .map(([key, value]) => ({
                value: key,
                label: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize
            }));

        // Store default option
        const defaultOption = {
            value: storeData.payment_method,
            label: `Store Default - ${storeData.payment_method}`
        };

        // Merge default with enabled options
        const mergedOptions = [defaultOption, ...enabledMethods];

        setOptionList(mergedOptions);

        // Set default selected value
        // If store default is enabled globally, use it; else fallback to first enabled method
        const defaultSelected = enabledMethods.find(opt => opt.value === storeData.payment_method)
            ? storeData.payment_method
            : (enabledMethods[0]?.value || storeData.payment_method);

        setPaymentMethod(defaultSelected);
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
        if (amount > data.availableBalance) {
            setError(`Amount cannot be greater than available balance (${data.availableBalance})`);
            setRequestWithdrawal(true);
            return;
        }

        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `transaction/${selectedStore?.value}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                disbursement: true,
                amount: amount,
                store_id: selectedStore?.value,
                method: paymentMethod,
                note: note
            },
        }).then((res) => {
            if (res.data.success) {
                setRequestWithdrawal(false);
            }
        });
    };

    const tabs = [
        {
            id: "products",
            label: "Wallet transaction",
            icon: "adminlib-dollar",
            content: <TransactionHistoryTable storeId={selectedStore?.value} dateRange={dateRange} />
        },
        {
            id: "stores",
            label: "Direct transaction",
            icon: "adminlib-calendar",
            content: <TransactionDataTable storeId={selectedStore?.value} dateRange={dateRange} />
        },
    ];

    console.log(storeData)
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
                <div className="tab-titles">
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
                {activeTab === "products" && (
                    <div className="row">
                        <div className="col w-35">
                            <div className="data-card-wrapper">
                                <div className="data-card">
                                    <div className="title">Available balance</div>
                                    <div className="number">{formatCurrency(data.wallet_balance)} <i className="adminlib-dollar"></i></div>
                                </div>
                                <div className="data-card">
                                    <div className="title">Reserve balance</div>
                                    <div className="number">{formatCurrency(data.reserve_balance)} <i className="adminlib-bank"></i></div>
                                </div>
                                <div className="data-card">
                                    <div className="title">Locked balance</div>
                                    <div className="number">{formatCurrency(data.locking_balance)} <i className="adminlib-home "></i></div>
                                </div>
                                <div className="data-card">
                                    <div className="title">Available balance</div>
                                    <div className="number">{formatCurrency(data.wallet_balance)} <i className="adminlib-cart blue"></i></div>
                                </div>
                            </div>
                        </div>
                        <div className="column w-65">
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
                                            <br />
                                            Please clear the pending request before disbursing new payments.
                                        </div>
                                        <div className="admin-btn btn-purple disabled" zz>
                                            Disburse payment
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="des">Current available balance ready to transfer to stores.</div>
                                        <div className="admin-btn btn-purple" onClick={() => setRequestWithdrawal(true)}>
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
                        width="400px"
                        height="80%"
                        header={
                            <>
                                <div className="title">
                                    <i className="adminlib-cart"></i>
                                    Disburse payment
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
                                    Disburse
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
                                <div className="form-group">
                                    <label htmlFor="payment_method">Payment Processor</label>
                                    <ToggleSetting
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        description="Choose your preferred payment processor."
                                        options={optionList}
                                        value={paymentMethod || ""}
                                        onChange={(value) => setPaymentMethod(value)}
                                    />

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
