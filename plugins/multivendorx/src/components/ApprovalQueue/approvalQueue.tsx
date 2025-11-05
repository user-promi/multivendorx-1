import { AdminBreadcrumbs, getApiLink, useModules } from 'zyra';
import Products from './products';
import Coupons from './coupon';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Stores from './stores';
import ReportAbuseTable from './pendingAbuseReports';
import WithdrawalRequests from './withdrawalRequests';
import StoreOrders from './StoreOrders';

const ApprovalQueue = () => {
    const [productCount, setProductCount] = useState<number>(0);
    const [couponCount, setCouponCount] = useState<number>(0);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [storeCount, setStoreCount] = useState<number>(0);
    const [refundCount, setRefundCount] = useState(0);
    const { modules } = useModules.getState();
    const [activeTab, setActiveTab] = useState("");
    const settings = appLocalizer.settings_databases_value || {};

    const refreshCounts = () => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'pending' },
        }).then((response) => setStoreCount(response.data || 0));

        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/products`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending' }
        })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setProductCount(totalCount);
            });

        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending' }
        })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setCouponCount(totalCount);
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { pending_withdraw: true } //important: use this param
        })
            .then((response) => {
                const count = response.data.length || 0; // response.data is an array of stores with pending withdraw
                setTransactionCount(count);
            })
            .catch(() => setTransactionCount(0));
        // Fetch total orders count
        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/orders`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { meta_key: 'multivendorx_store_id', status: 'refund-requested' },
        })
            .then((response) => {
                const total = Number(response.headers['x-wp-total']) || 0;
                setRefundCount(total);
            })
            .catch(() => {
                setRefundCount(0);
            });
    };

    console.log(appLocalizer.settings_databases_value)
    const tabs = [
        {
            id: "stores",
            label: "Stores",
            icon: "adminlib-calendar yellow",
            count: 9,
            des: "Awaiting verification check",
            condition: settings?.general?.approve_store === "manually",
            content: <Stores onUpdated={refreshCounts} />
        },
        {
            id: "products",
            label: "Products",
            icon: "adminlib-calendar red",
            des: "Eager to join the marketplace",
            condition: settings?.["store-capability"]?.products?.includes("publish_products"), count: productCount,
            content: <Products onUpdated={refreshCounts} />
        },
        {
            id: "coupons",
            label: "Coupons",
            icon: "adminlib-calendar green",
            count: couponCount,
            condition: settings?.["store-capability"]?.coupons?.includes("publish_coupons"),
            des: "Requested deactivation",
            content: <Coupons onUpdated={refreshCounts} />
        },
        {
            id: "wholesale-customer",
            label: "Customers",
            icon: "adminlib-calendar yellow",
            module: "wholesale",
            des: "Ready to become wholesalers",
            count: 9,
            content: <h1>Upcoming Feature</h1>
        },
        {
            id: "refund-requests",
            label: "Refund Requests",
            module: "marketplace-refund",
            icon: "adminlib-calendar blue",
            des: "Need your decision",
            count: refundCount,
            content: <StoreOrders onUpdated={refreshCounts} />
        },
        {
            id: "report-abuse",
            label: "Product Abuse",
            module: "marketplace-compliance",
            icon: "adminlib-calendar blue",
            count: productCount,
            des: "Waiting to be published",
            content: <ReportAbuseTable onUpdated={refreshCounts} />
        },
        {
            id: "withdrawal",
            label: "Withdrawals",
            icon: "adminlib-calendar blue",
            des: "Queued for disbursement",
            condition: settings?.disbursement?.withdraw_type === "manually",
            count: transactionCount,
            content: <WithdrawalRequests onUpdated={refreshCounts} />
        },
    ].filter(
        (tab) =>
            //Show if:
            (!tab.module || modules.includes(tab.module)) && // module active or not required
            (tab.condition === undefined || tab.condition)   // condition true or not set
    );



    useEffect(() => {
        if (!tabs.find(tab => tab.id === activeTab)) {
            setActiveTab(tabs[0]?.id || "");
        }
    }, [tabs, activeTab]);

    // run once on mount
    useEffect(() => {
        refreshCounts();
    }, []);

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-bar-chart"
                tabTitle="Approval Queue"
                description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}
            />

            {/* Workboard Stats */}
            <div className="general-wrapper">
                <div className="row ">
                    {/* Tab Titles */}
                    <div className="overview-card-wrapper tab">
                        {tabs.map((tab) => (
                            <div className={`tab-action ${activeTab === tab.id ? "active" : ""}`} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                                <div className="details-wrapper">
                                    <i className={`${tab.icon}`}></i>
                                    <div className="title"><span>{tab.count} </span>{tab.label}</div>
                                </div>
                                <div className="description">
                                    {tab.des}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Tab Content */}
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
        </>
    );
};

export default ApprovalQueue;