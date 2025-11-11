import { AdminBreadcrumbs, getApiLink, useModules } from 'zyra';
import Products from './products';
import Coupons from './coupon';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Stores from './stores';
import ReportAbuseTable from './pendingAbuseReports';
import WithdrawalRequests from './withdrawalRequests';
import StoreOrders from './StoreOrders';
import DeactivateRequests from './deactivateRequests';

const ApprovalQueue = () => {
    const [storeCount, setStoreCount] = useState<number>(0);
    const [productCount, setProductCount] = useState<number>(0);
    const [couponCount, setCouponCount] = useState<number>(0);
    const [refundCount, setRefundCount] = useState<number>(0);
    const [reportAbuseCount, setReportAbuseCount] = useState<number>(0);
    const [withdrawCount, setWithdrawCount] = useState<number>(0);
    const [deactivateCount, setDeactivateCount] = useState<number>(0);

    const { modules } = useModules();
    const [activeTab, setActiveTab] = useState("");
    const settings = appLocalizer.settings_databases_value || {};

    const refreshCounts = async () => {
        try {
            const [storeRes, productRes, couponRes, refundRes, abuseRes, withdrawRes, deactivateRes] = await Promise.all([
                axios.get(getApiLink(appLocalizer, 'store'), { params: { count: true, status: 'pending' }, headers: { 'X-WP-Nonce': appLocalizer.nonce } }),
                axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, { params: { per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending' }, headers: { 'X-WP-Nonce': appLocalizer.nonce } }),
                axios.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, { params: { per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending' }, headers: { 'X-WP-Nonce': appLocalizer.nonce } }),
                axios.get(`${appLocalizer.apiUrl}/wc/v3/orders`, { params: { meta_key: 'multivendorx_store_id', status: 'refund-requested' }, headers: { 'X-WP-Nonce': appLocalizer.nonce } }),
                axios.get(getApiLink(appLocalizer, 'report-abuse'), { params: { count: true }, headers: { 'X-WP-Nonce': appLocalizer.nonce } }),
                axios.get(getApiLink(appLocalizer, 'store'), { params: { count: true, pending_withdraw: true }, headers: { 'X-WP-Nonce': appLocalizer.nonce } }),
                axios.get(getApiLink(appLocalizer, 'store'), { params: { count: true, deactivate: true }, headers: { 'X-WP-Nonce': appLocalizer.nonce } })

            ]);
    
            setStoreCount(storeRes.data || 0);
            setProductCount(parseInt(productRes.headers['x-wp-total'], 10) || 0);
            setCouponCount(parseInt(couponRes.headers['x-wp-total'], 10) || 0);
            setRefundCount(parseInt(refundRes.headers['x-wp-total'], 10) || 0);
            setReportAbuseCount(abuseRes.data || 0);
            setWithdrawCount(withdrawRes.data || 0);
            setDeactivateCount(deactivateRes.data || 0);
    
        } catch (err) {
            console.error(err);
        }
    };

    const tabs = [
        {
            id: "stores",
            label: "Stores",
            icon: "adminlib-storefront yellow",
            count: storeCount,
            des: "Eager to join the marketplace",
            condition: settings?.general?.approve_store === "manually",
            content: <Stores onUpdated={refreshCounts} />
        },
        {
            id: "products",
            label: "Products",
            icon: "adminlib-multi-product red",
            count: productCount,
            des: "Pending your approval",
            condition: settings?.["store-capability"]?.products?.includes("publish_products"), count: productCount,
            content: <Products onUpdated={refreshCounts} />
        },
        {
            id: "coupons",
            label: "Coupons",
            icon: "adminlib-coupon green",
            count: couponCount,
            condition: settings?.["store-capability"]?.coupons?.includes("publish_coupons"),
            des: "Need a quick review",
            content: <Coupons onUpdated={refreshCounts} />
        },
        {
            id: "wholesale-customer",
            label: "Customers",
            icon: "adminlib-user-circle yellow",
            module: "wholesale",
            des: "Ready for your approval",
            count: 9,
            content: <h1>Upcoming Feature</h1>
        },
        {
            id: "refund-requests",
            label: "Refund Requests",
            module: "marketplace-refund",
            icon: "adminlib-marketplace-refund blue",
            des: "Need your decision",
            count: refundCount,
            content: <StoreOrders onUpdated={refreshCounts} />
        },
        {
            id: "report-abuse",
            label: "Abused Product",
            module: "marketplace-compliance",
            icon: "adminlib-product blue",
            count: reportAbuseCount,
            des: "Reported for assessment",
            content: <ReportAbuseTable onUpdated={refreshCounts} />
        },
        {
            id: "withdrawal",
            label: "Withdrawals",
            icon: "adminlib-bank blue",
            des: "Queued for disbursement",
            condition: settings?.disbursement?.withdraw_type === "manual",
            count: withdrawCount,
            content: <WithdrawalRequests onUpdated={refreshCounts} />
        },
        {
            id: "deactivate-requests",
            label: "Deactivate Requests",
            icon: "adminlib-bank blue",
            des: "Queued for deactivated requests",
            count: deactivateCount,
            content: <DeactivateRequests onUpdated={refreshCounts} />
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
                activeTabIcon="adminlib-approval"
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