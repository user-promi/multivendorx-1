/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import "../Announcements/announcements.scss";
import { AdminBreadcrumbs, getApiLink, SelectInput, Tabs } from 'zyra';
import axios from 'axios';
import TransactionHistoryTable from './walletTransaction';
import TransactionDataTable from './transactionDataTable';

export const TransactionHistory: React.FC = () => {
    const [allStores, setAllStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });


    // Fetch stores on mount
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
                    setSelectedStore(mappedStores[0]);
                }
            })
            .catch((error) => {
                console.error("Error fetching stores:", error);
            });
    }, []);


    const locationUrl = new URLSearchParams(useLocation().hash.substring(1));

    const tabData = [
        {
            type: 'file',
            content: {
                id: 'wallet-transaction',
                name: 'Marketplace',
                icon: 'marketplace-membership',
                hideTabHeader: true,
            },
        },
        {
            type: 'file',
            content: {
                id: 'direct-transaction',
                name: 'Direct transaction',
                icon: 'multi-product',
                hideTabHeader: true,
            },
        },
    ]

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'wallet-transaction':
                return <TransactionHistoryTable storeId={selectedStore?.value} dateRange={dateRange} />;
            case 'direct-transaction':
                return <TransactionDataTable storeId={selectedStore?.value}  />;

            default:
                return <div></div>;
        }
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
                            options={allStores}
                            type="select"
                            onChange={(newValue: any) => {
                                setSelectedStore(newValue)
                            }}
                            size="12rem"
                        />
                    </>
                }
            />

            <Tabs
                tabData={tabData}
                currentTab={locationUrl.get('subtab') as string}
                getForm={getForm}
                prepareUrl={(subTab: string) =>
                    `?page=multivendorx#&tab=transaction-history&subtab=${subTab}`
                }
                appLocalizer={appLocalizer}
                supprot={[]}
                Link={Link}
                hideTitle={true}
                hideBreadcrumb={true}
                template={'template-2'}
                premium={false}
                menuIcon={true}
            />
        </>
    );
};

export default TransactionHistory;