import { AdminBreadcrumbs, getApiLink, Tabs, useModules } from 'zyra';
import Products from './products';
import Coupons from './coupon';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Stores from './stores';
import ReportAbuseTable from './pendingAbuseReports';
import WithdrawalRequests from './withdrawalRequests';
import StoreOrders from './StoreOrders';
import DeactivateRequests from './deactivateRequests';
import { useLocation, Link } from 'react-router-dom';

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
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'pending' },
        })
            .then((response) => {
                setStoreCount(response.data || 0);
            })
            .catch(() => { });

        axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending'
            },
        })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setProductCount(totalCount);
            })
            .catch(() => { });
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending' },
            })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setCouponCount(totalCount);
            })
            .catch(() => { });

        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/orders`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { meta_key: 'multivendorx_store_id', refund_status: 'refund_request', page: 1, per_page: 1 },
        })
            .then((response) => {
                const total = Number(response.headers['x-wp-total']) || 0;
                setRefundCount(total);
            })
            .catch(() => {
            });

        axios
            .get(getApiLink(appLocalizer, 'report-abuse'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { count: true },
            })
            .then((res) => {
                const total = res.data || 0;
                setReportAbuseCount(total);
            })
            .catch(() => {

            });
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, pending_withdraw: true },
        })
            .then((response) => {
                setWithdrawCount(response.data || 0);
            })
            .catch(() => {

            });
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, deactivate: true },
        })
            .then((response) => {
                setDeactivateCount(response.data || 0);
            })
            .catch(() => {

            });
    };
    const location = new URLSearchParams(useLocation().hash.substring(1));

    const tabData = [
        {
            type: 'file',
            content: {
                id: 'stores',
                name: 'Stores',
                desc: 'Eager to join the marketplace',
                icon: 'storefront yellow',
                count: storeCount,
            },
        },
        {
            type: 'file',
            content: {
                id: 'products',
                name: 'Products',
                desc: 'Pending your approval',
                icon: 'multi-product red',
                count: productCount,
            },
        },
        {
            type: 'file',
            content: {
                id: 'coupons',
                name: 'Coupons',
                desc: 'Need a quick review',
                icon: 'coupon green',
                count: couponCount,
            },
        },
        {
            type: 'file',
            content: {
                id: 'wholesale-customer',
                name: 'Customers',
                desc: 'Ready for your approval',
                icon: 'user-circle yellow',
                count: 9,
            },
        },
        {
            type: 'file',
            content: {
                id: 'refund-requests',
                name: 'Refunds',
                desc: 'Need your decision',
                icon: 'marketplace-refund blue',
                count: refundCount,
            },
        },
        {
            type: 'file',
            content: {
                id: 'report-abuse',
                name: 'Flagged',
                desc: 'Product reported for assessment',
                icon: 'product blue',
                count: reportAbuseCount,
            },
        },
        {
            type: 'file',
            content: {
                id: 'withdrawal',
                name: 'Withdrawals',
                desc: 'Queued for disbursement',
                icon: 'bank blue',
                count: withdrawCount,
            },
        },
        {
            type: 'file',
            content: {
                id: 'deactivate-requests',
                name: 'Deactivations',
                desc: 'Store-initiated permanent closure',
                icon: 'bank blue',
                count: deactivateCount,
            },
        },
    ]

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'stores':
                return <Stores onUpdated={refreshCounts} />;

            case 'products':
                return <Products onUpdated={refreshCounts} />;

            case 'coupons':
                return <Coupons onUpdated={refreshCounts} />;

            case 'wholesale-customer':
                return <h1>Upcoming Feature</h1>;

            case 'refund-requests':
                return <StoreOrders onUpdated={refreshCounts} />;

            case 'report-abuse':
                return <ReportAbuseTable onUpdated={refreshCounts} />;

            case 'withdrawal':
                return <WithdrawalRequests onUpdated={refreshCounts} />;

            case 'deactivate-requests':
                return <DeactivateRequests onUpdated={refreshCounts} />;

            default:
                return <div></div>;
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
            label: "Refunds",
            module: "marketplace-refund",
            icon: "adminlib-marketplace-refund blue",
            des: "Need your decision",
            count: refundCount,
            content: <StoreOrders onUpdated={refreshCounts} />
        },
        {
            id: "report-abuse",
            label: "Flagged",
            module: "marketplace-compliance",
            icon: "adminlib-product blue",
            count: reportAbuseCount,
            des: "Product reported for assessment",
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
            label: "Deactivations",
            icon: "adminlib-bank blue",
            des: "Store-initiated permanent closure",
            count: deactivateCount,
            content: <DeactivateRequests onUpdated={refreshCounts} />
        },
    ].filter(
        (tab) =>
            //Show if:
            (!tab.module || modules.includes(tab.module)) && // module active or not required
            (tab.condition === undefined || tab.condition)   // condition true or not set
    );

    // useEffect(() => {
    //     if (!tabs.find(tab => tab.id === activeTab)) {
    //         setActiveTab(tabs[0]?.id || "");
    //     }
    // }, [tabs, activeTab]);

    // // run once on mount
    // useEffect(() => {
    //     refreshCounts();
    // }, []);

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-approval"
                tabTitle="Approval Queue"
                description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}
            />
            <Tabs
                tabData={tabData}
                currentTab={location.get('subtab') as string}
                getForm={getForm}
                prepareUrl={(subTab: string) =>
                    `?page=multivendorx#&tab=approval-queue&subtab=${subTab}`
                }
                appLocalizer={appLocalizer}
                supprot={[]}
                Link={Link}
                hideTitle={true}
                hideBreadcrumb={true}
                template={'template-3'}
                premium={false}
                menuIcon={true}
                desc={true}
            />
            {/* Workboard Stats */}
            {/* <div className="general-wrapper">
                <div className="row ">
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

            </div> */}
        </>
    );
};

export default ApprovalQueue;