/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import "../Announcements/announcements.scss";
import TransactionHistoryTable from './transactionHistoryTable';
import TransactionDataTable from './transactionDataTable';
import { AdminBreadcrumbs, getApiLink, SelectInput } from 'zyra';
import axios from 'axios';

export const TransactionHistory: React.FC = () => {
    const [overview, setOverview] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("products");
    const [allStores, setAllStores] = useState<any[]>([]);
    const [filteredStores, setFilteredStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);

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
                const data = response?.data || {};
                const dynamicOverview = [
                    { id: 'total_balance', label: 'Total Balance', count: data.balance ?? 0, icon: 'adminlib-wallet' },
                    { id: 'pending', label: 'Pending', count: data.pending ?? 0, icon: 'adminlib-clock' },
                    { id: 'locked', label: 'Locked', count: data.locking_balance ?? 0, icon: 'adminlib-lock' },
                    { id: 'withdrawable', label: 'Withdrawable', count: data.withdrawable ?? 0, icon: 'adminlib-cash' },
                    { id: 'commission', label: 'Commission', count: data.commission ?? 0, icon: 'adminlib-star' },
                    { id: 'gateway_fees', label: 'Gateway Fees', count: data.gateway_fees ?? 0, icon: 'adminlib-credit-card' },
                ];
                setOverview(dynamicOverview);
            })
            .catch((error) => {
                setOverview([
                    { id: 'total_balance', label: 'Total Balance', count: 0, icon: 'adminlib-wallet' },
                    { id: 'pending', label: 'Pending', count: 0, icon: 'adminlib-clock' },
                    { id: 'locked', label: 'Locked', count: 0, icon: 'adminlib-lock' },
                    { id: 'withdrawable', label: 'Withdrawable', count: 0, icon: 'adminlib-cash' },
                    { id: 'commission', label: 'Commission', count: 0, icon: 'adminlib-star' },
                    { id: 'gateway_fees', label: 'Gateway Fees', count: 0, icon: 'adminlib-credit-card' },
                ]);
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
            content: <TransactionHistoryTable storeId={selectedStore?.value} />
        },
        {
            id: "stores",
            label: "Direct Transaction",
            content: <TransactionDataTable storeId={selectedStore?.value} />
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-book"
                tabTitle="Storewise Transaction History"
                description={"Build your knowledge base: add new guides or manage existing ones in one place."}
                customContent={
                    <div className="status-wrapper">
                        <SelectInput
                            name="store"
                            value={selectedStore?.value || ""}
                            options={filteredStores}
                            type="single-select"
                            onChange={(newValue: any) => setSelectedStore(newValue)}
                            onInputChange={(inputValue: string) => handleSearch(inputValue)}
                        />
                    </div>
                }
            />

            <div className="admin-dashboard">
                <div className="header">
                    <div className="title-wrapper">
                        <div className="title">
                            {selectedStore ? `You are viewing ${selectedStore.label}` : "Select a store"}
                        </div>
                        <div className="des">Here's what's happening with your marketplace today</div>
                    </div>
                </div>

                <div className="row">
                    <div className="overview-card-wrapper">
                        {overview.map((stat) => (
                            <div className="action" key={stat.id}>
                                <div className="title">
                                    {stat.count}
                                    <i className={stat.icon}></i>
                                </div>
                                <div className="description">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="column">
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
