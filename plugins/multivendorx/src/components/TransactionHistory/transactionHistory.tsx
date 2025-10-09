/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import "../Announcements/announcements.scss";
import TransactionHistoryTable from './transactionHistoryTable';
import TransactionDataTable from './transactionDataTable';
import { AdminBreadcrumbs, CalendarInput, getApiLink, SelectInput } from 'zyra';
import axios from 'axios';


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
            .catch((error) => {
            });
    }, [selectedStore]);

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
                    <div className="header">
                        <div className="title-wrapper">

                        </div>
                        <div className="right">
                            <div className="analytics-container">
                                {/* Wallet Balance */}
                                <div className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className="adminlib-cart green"></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">
                                            {appLocalizer.currency_symbol}{Number(data.wallet_balance ?? 0).toFixed(2)}
                                        </div>
                                        <div className="text">Wallet Balance</div>
                                    </div>
                                </div>

                                {/* Reserve Balance */}
                                <div className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className="adminlib-star yellow"></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">
                                            {appLocalizer.currency_symbol}{Number(data.reserve_balance ?? 0).toFixed(2)}
                                        </div>
                                        <div className="text">Reserve Balance</div>
                                    </div>
                                </div>

                                {/* Locked Balance */}
                                <div className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className="adminlib-lock red"></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">
                                            {appLocalizer.currency_symbol}{Number(data.locking_balance ?? 0).toFixed(2)}
                                        </div>
                                        <div className="text">Locked Balance</div>
                                    </div>
                                </div>

                                {/* Available Balance */}
                                <div className="analytics-item">
                                    <div className="analytics-icon">
                                        <i className="adminlib-cash blue"></i>
                                    </div>
                                    <div className="details">
                                        <div className="number">
                                            {appLocalizer.currency_symbol}{Number(data.available_balance ?? 0).toFixed(2)}
                                        </div>
                                        <div className="text">Available Balance</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
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
                                    onChange={(range:any) => {
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
