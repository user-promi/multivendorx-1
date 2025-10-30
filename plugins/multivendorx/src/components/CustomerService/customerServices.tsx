import { AdminBreadcrumbs, getApiLink } from 'zyra';
import RefundRequest from './refundRequest';
import AbuseReports from './abuseReports';
import StoreReviews from './storeReviews ';
import './customerServices.scss';
import '../AdminDashboard/adminDashboard.scss';
import Qna from './qnaTable';
import { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerServices = () => {
    const [abuseCount, setAbuseCount] = useState(0);
    const [qnaCount, setQnaCount] = useState(0);
    const [refundCount, setRefundCount] = useState(0);
    const [storeCount, setStoreCount] = useState(0);
    const [activeTab, setActiveTab] = useState("products");

    // Fetch total count on mount
    useEffect(() => {
        axios
            .get(getApiLink(appLocalizer, 'report-abuse'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { count: true },
            })
            .then((res) => {
                const total = res.data || 0;
                setAbuseCount(total);
            })
            .catch(() => {
                console.error('Failed to load total rows');
            });
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'qna'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setQnaCount(response.data || 0);
            })
            .catch(() => {
                console.error('Failed to load total rows');
            });
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'refund'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setRefundCount(response.data || 0);
            })
            .catch(() => {
                console.error('Failed to load total rows');
            });
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { pending_withdraw: true } //important: use this param
        })
            .then((response) => {
                const count = response.data.length || 0; // response.data is an array of stores with pending withdraw
                setStoreCount(count);
            })
            .catch(() => setStoreCount(0));
    }, []);


    const tabs = [
        {
            id: "products", label: "Questions", icon: "adminlib-calendar red", des: "Waiting for your response", count: qnaCount, content:
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
                    <Qna /></>
        },
        {
            id: "review", label: "Store Reviews", icon: "adminlib-calendar green", count: 9, des: "Shared by customers", content:
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Store Reviews
                            </div>
                            <div className="des">Shared by customers</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <StoreReviews />
                </>
        },
        {
            id: "reports", label: "Products Reported", icon: "adminlib-calendar yellow", des: "Flagged for abuse review", count: abuseCount, content:
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Products Reported
                            </div>
                            <div className="des">Flagged for abuse review</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <AbuseReports />
                </>
        },
        {
            id: "refund-requests", label: "Refund Requests", icon: "adminlib-calendar blue", des: "Need your decision", count: refundCount, content:
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Refund Requests
                            </div>
                            <div className="des">Need your decision</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <RefundRequest />
                </>
        },
        // { id: "coupons", label: "Coupons", content: <Coupons onUpdated={refreshCounts} /> },
        // { id: "transactions", label: "Withdrawal", content: <Transactions onUpdated={refreshCounts} /> },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-customer-service"
                tabTitle="Customer Service"
                description={'Manage store reviews, support requests, financial transactions, and reported issues.'}
            />
            <div className="general-wrapper">
                <div className="row">
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

export default CustomerServices;
