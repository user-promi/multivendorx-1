import { AdminBreadcrumbs, getApiLink, useModules } from 'zyra';
import RefundRequest from './refundRequest';
import AbuseReports from './abuseReports';
import './customerServices.scss';
import '../AdminDashboard/adminDashboard.scss';
import Qna from './qnaTable';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StoreReviews from './storeReviews ';

const CustomerServices = () => {
    const [abuseCount, setAbuseCount] = useState(0);
    const [qnaCount, setQnaCount] = useState(0);
    const [refundCount, setRefundCount] = useState(0);
    const [storeCount, setStoreCount] = useState(0);
    const [storeReviewCount, setStoreReviewCount] = useState(0);
    const [activeTab, setActiveTab] = useState("products");

    // Modules from global store

    const { modules } = useModules.getState();
    /**
     * Fetch counts on mount
     */
    useEffect(() => {
        axios
            .get(getApiLink(appLocalizer, 'report-abuse'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { count: true },
            })
            .then((res) => setAbuseCount(res.data || 0))
            .catch(() => console.error('Failed to load abuse count'));

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'qna'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => setQnaCount(response.data || 0))
            .catch(() => console.error('Failed to load qna count'));

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'refund'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => setRefundCount(response.data || 0))
            .catch(() => console.error('Failed to load refund count'));

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { pending_withdraw: true },
        })
            .then((response) => setStoreCount(response.data.length || 0))
            .catch(() => setStoreCount(0));
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'review'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => setStoreReviewCount(response.data || 0))
            .catch(() => setStoreReviewCount(0));
    }, []);

    /**
     * Tabs — only visible if related module is active
     */
    const tabs = [
        {
            id: "questions",
            label: "Questions",
            module: "question-answer", // required module name
            icon: "adminlib-calendar red",
            des: "Waiting for your response",
            count: qnaCount,
            content: (
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">Questions</div>
                            <div className="des">Waiting for your response</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <Qna />
                </>
            ),
        },
        {
            id: "review",
            label: "Store Reviews",
            module: "store-review",
            icon: "adminlib-calendar green",
            count: storeReviewCount,
            des: "Shared by customers",
            content: (
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">Store Reviews</div>
                            <div className="des">Shared by customers</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <StoreReviews />
                </>
            ),
        },
        {
            id: "reports",
            label: "Products Reported",
            module: "report-abuse",
            icon: "adminlib-calendar yellow",
            des: "Flagged for abuse review",
            count: abuseCount,
            content: (
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">Products Reported</div>
                            <div className="des">Flagged for abuse review</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <AbuseReports />
                </>
            ),
        },
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
                    <RefundRequest />
                </>
            ),
        },
    ].filter(tab => modules.includes(tab.module));
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
                            <div
                                key={tab.id}
                                className={`tab-action ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <div className="details-wrapper">
                                    <i className={tab.icon}></i>
                                    <div className="title">
                                        {tab.count} {tab.label}
                                    </div>
                                </div>
                                <div className="description">{tab.des}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="column">
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
