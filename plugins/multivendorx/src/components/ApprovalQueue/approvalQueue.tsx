import { AdminBreadcrumbs, getApiLink } from 'zyra';
import Products from './products';
import Vendors from './vendors';
import Coupons from './coupon';
import Transactions from './transaction';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StoreOrders from './refundRequest';

const ApprovalQueue = () => {
    const [productCount, setProductCount] = useState<number>(0);
    const [couponCount, setCouponCount] = useState<number>(0);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [storeCount, setStoreCount] = useState<number>(0);
    const [refundCount, setRefundCount] = useState(0);

    const [activeTab, setActiveTab] = useState("");


    const refreshCounts = () => {
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
            params: { count: true, status: 'pending' },
        }).then((response) => setStoreCount(response.data || 0));

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
    const tabs = [
        ...(appLocalizer.settings_databases_value['general']['approve_store'] === "manually"
            ? [{
                id: "products",
                label: "Questions",
                icon: "adminlib-calendar red",
                des: "Eager to join the marketplace",
                count: storeCount,
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Questions
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Products onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        {
            id: "stores",
            label: "Stores",
            icon: "adminlib-calendar yellow",
            count: 9,
            des: "Awaiting verification check",
            content:
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Stores
                            </div>
                            <div className="des">Waiting for your response</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <Vendors onUpdated={refreshCounts} />
                </>
        },
        ...(Array.isArray(appLocalizer.settings_databases_value['privacy-settings']['enable_profile_deactivation_request'])
            && appLocalizer.settings_databases_value['privacy-settings']['enable_profile_deactivation_request'].includes("enable_profile_deactivation_request")
            ? [{
                id: "coupons",
                label: "Stores",
                icon: "adminlib-calendar green",
                count: 9,
                des: "Requested deactivation",
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Stores
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Coupons onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        ...(Array.isArray(appLocalizer.settings_databases_value['store-capability']['products'])
            && appLocalizer.settings_databases_value['store-capability']['products'].includes("publish_products")
            ? [{
                id: "product-approval",
                label: "Products",
                icon: "adminlib-calendar blue",
                count: productCount,
                des: "Waiting to be published",

                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Products
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Transactions onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        ...(Array.isArray(appLocalizer.settings_databases_value['store-capability']['coupons'])
            && appLocalizer.settings_databases_value['store-capability']['coupons'].includes("publish_coupons")
            ? [{
                id: "coupon-approval",
                label: "Coupons",
                icon: "adminlib-calendar red",
                des: "Need a quick approval",
                count: couponCount,
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Coupons
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Transactions onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        {
            id: "wholesale-customer",
            label: "Customers",
            icon: "adminlib-calendar yellow",
            des: "Ready to become wholesalers",

            count: 9,
            content:
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Customers
                            </div>
                            <div className="des">Ready to become wholesalers</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <Transactions onUpdated={refreshCounts} />
                </>
        },
        ...(appLocalizer.settings_databases_value['disbursement']['withdraw_type'] === "manual"
            ? [{
                id: "withdrawal",
                label: "Withdrawals",
                icon: "adminlib-calendar blue",
                des: "Queued for disbursement",
                count: transactionCount,
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Withdrawals
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Transactions onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        {
            id: "refund-requests",
            label: "Refund Requests",
            module: "marketplace-refund",
            icon: "adminlib-calendar blue",
            des: "Need your decision",
            count: refundCount,
            content: (
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">Refund Requests</div>
                            <div className="des">Need your decision</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <StoreOrders />
                </>
            ),
        },
    ];
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

                {/* <div className="row">
                    <div className="overview-card-wrapper tab">
                        {tabs.map((tab) => (
                            <div className={`tab-action ${activeTab === tab.id ? "active" : ""}`} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                                <div className="details-wrapper">
                                    <i className={tab.icon}></i>
                                    <div className="title">{tab.count} {tab.label}</div>
                                </div>
                                <div className="description">
                                    {tab.des}
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
                <div className="row ">
                    {/* Tab Titles */}
                    <div className="column admin-tab">
                        <div className="tab-titles">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className={`title ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <p>{tab.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
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
                </div>

            </div>
        </>
    );
};

export default ApprovalQueue;