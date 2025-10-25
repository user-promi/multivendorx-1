/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import "../Announcements/announcements.scss";
import TransactionHistoryTable from './transactionHistoryTable';
import TransactionDataTable from './transactionDataTable';
import { AdminBreadcrumbs, CalendarInput, getApiLink, SelectInput, CommonPopup, BasicInput, TextArea, ToggleSetting } from 'zyra';
import axios from 'axios';
import disbursement from '../Settings/Finance/disbursement';


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

        const existingOptions = Object.values(appLocalizer.payout_payment_options);
        const defaultOption = {
            value: storeData.payment_method,
            label: 'Store Default - ' + storeData.payment_method
        };

        // Prepend default to the top
        const mergedOptions = [defaultOption, ...existingOptions];
        setOptionList(mergedOptions);
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
            label: "Wallet Transaction",
            content: <TransactionHistoryTable storeId={selectedStore?.value} dateRange={dateRange} />
        },
        {
            id: "stores",
            label: "Direct Transaction",
            content: <TransactionDataTable storeId={selectedStore?.value} dateRange={dateRange} />
        },
    ];


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
                        <div>Switch Store</div>
                        <SelectInput
                            name="store"
                            value={selectedStore?.value || ""}
                            options={filteredStores}
                            type="single-select"
                            onChange={(newValue: any) => setSelectedStore(newValue)}
                            onInputChange={(inputValue: string) => handleSearch(inputValue)}
                        />
                    </>
                }
            />

            <div className="admin-dashboard">
                <div className="row">
                     <div className="column">
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
                            <div className="des">Current available balance ready to transfer to stores.</div>
                            <div className="admin-btn btn-purple" onClick={() => setRequestWithdrawal(true)}>
                                Disburse payment
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Balance Breakdown
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="analytics-container">

                                <div className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className="adminlib-cart red"></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">{appLocalizer.currency_symbol}{Number(data.wallet_balance ?? 0).toFixed(2)}</div>
                                        <div className="text">Wallet Balance</div>
                                    </div>
                                </div>
                                <div className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className="adminlib-cart green"></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">{appLocalizer.currency_symbol}{Number(data.reserve_balance ?? 0).toFixed(2)}</div>
                                        <div className="text">Reserve Balance</div>
                                    </div>
                                </div>
                                <div className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className="adminlib-cart yellow"></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">{appLocalizer.currency_symbol}{Number(data.locking_balance ?? 0).toFixed(2)}</div>
                                        <div className="text">Locked Balance</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {requestWithdrawal && (
                    <CommonPopup
                        open={requestWithdrawal}
                        width="400px"
                        height="80%"
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
                                    {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="payment_method">Payment Processor</label>
                                    {/* <SelectInput
                                        name="payment_method"
                                        value={paymentMethod}
                                        options={optionList}
                                        type="single-select"
                                        onChange={(newValue) => {
                                            if (newValue && newValue.value) {
                                                setPaymentMethod(newValue.value);
                                            }
                                        }
                                        }
                                    /> */}
                                    <ToggleSetting
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        description="Choose your preferred payment processor."
                                        options={optionList}
                                        value={paymentMethod || ""}
                                        onChange={(value) => {
                                            setPaymentMethod(value)
                                        }}
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
                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="tab-titles">
                                    {tabs.map((tab) => (
                                        <div
                                            key={tab.id}
                                            className={`title ${activeTab === tab.id ? "active" : ""}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            <p><i className="adminlib-cart"></i>{tab.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="right">
                                <CalendarInput
                                    wrapperClass=""
                                    inputClass=""
                                    showLabel={true}
                                    onChange={(range: any) => {
                                        setDateRange({ startDate: range.startDate, endDate: range.endDate });
                                    }}
                                />
                            </div>
                        </div>

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
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionHistory;
