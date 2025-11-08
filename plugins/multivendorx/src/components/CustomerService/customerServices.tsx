import { AdminBreadcrumbs, getApiLink, useModules } from 'zyra';
import RefundRequest from './refundRequest';
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

    // Modules from global store

    const { modules } = useModules();
    /**
     * Fetch counts on mount
     */
    useEffect(() => {
        if (tabs.length > 0) {
            setActiveTab(tabs[0].id);
        }
    }, [modules]);

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
            module: "question-answer",
            icon: "adminlib-question",
            des: "Waiting for your response",
            count: qnaCount,
            content: <Qna />
        },
        {
            id: "review",
            label: "Store Reviews",
            module: "store-review",
            icon: "adminlib-store-review",
            count: storeReviewCount,
            des: "Shared by customers",
            content: <StoreReviews />
        },
        {
            id: "refund-requests",
            label: "Refund Requests",
            module: "marketplace-refund",
            icon: "adminlib-refund",
            des: "Need your decision",
            count: refundCount,
            content: <RefundRequest />
        },
        {
            id: "support-ticket",
            label: "Support Ticket",
            icon: "adminlib-vacation",
            module: 'customer-support',
            des: "Flagged for abuse review",
            count: abuseCount,
            content: <div className="row"><div className="column"><h1>Upcoming Feature</h1></div></div>,
        },
    ].filter(tab => !tab.module || modules.includes(tab.module));
    const [activeTab, setActiveTab] = useState(() => tabs?.[0]?.id ?? "");
    // Update URL hash when activeTab changes
    useEffect(() => {
        if (activeTab) {
            const baseHash = '#&tab=customer-support';
            window.location.hash = `${baseHash}&subtab=${activeTab}`;
        }
    }, [activeTab]);


    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-customer-service"
                tabTitle="Customer Service"
                description={'Manage store reviews, support requests, financial transactions, and reported issues.'}
            />
            <div className="general-wrapper">
                {tabs.length > 0 ? (
                    <>
                        <div className="tab-titles">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className={`title ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <i className={`icon ${tab.icon}`}></i>
                                    <p>{tab.label}</p>
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
                    </>
                ) : (
                    <div className="no-tabs">No module available</div>
                )}
            </div>
        </>
    );
};

export default CustomerServices;
